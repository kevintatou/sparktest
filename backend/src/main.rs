mod k8s;
mod validation;

#[cfg(test)]
mod k8s_tests;

use axum::{
    extract::{Path, State},
    routing::{get, post, put, patch, delete},
    Json, Router,
    http::StatusCode,
};
use chrono::Utc;
use k8s::{create_k8s_job, monitor_job_and_update_status, KubernetesClient, JobLogs};
use kube::Client;
use serde::{Deserialize, Serialize};
use sqlx::{postgres::PgPoolOptions, FromRow, PgPool};
use std::{net::SocketAddr};
use tokio::net::TcpListener;
use tower_http::cors::{Any, CorsLayer};
use uuid::Uuid;
use std::time::Duration;
use tempfile::TempDir;
use git2::Repository;
use std::fs;
use serde_json::Value;
use log;
use validation::{
    sanitize_name, sanitize_description, validate_docker_image, 
    sanitize_commands, sanitize_labels, validate_execution_mode
};

#[derive(Debug, Serialize, Deserialize, Clone, FromRow)]
struct TestExecutor {
    id: Uuid,
    name: String,
    image: String,
    default_command: String,    
    supported_file_types: Vec<String>,
    environment_variables: Vec<String>,
    description: Option<String>,
    icon: String
}

#[derive(Debug, Serialize, Deserialize, Clone, FromRow)]
struct TestDefinition {
    id: Uuid,
    name: String,
    description: Option<String>,
    image: String,
    commands: Vec<String>,
    created_at: Option<chrono::DateTime<chrono::Utc>>,
    executor_id: Option<Uuid>,
    source: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct CreateTestDefinitionRequest {
    name: String,
    description: Option<String>,
    image: String,
    commands: Vec<String>,
    executor_id: Option<Uuid>,
    source: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct PatchTestDefinitionRequest {
    name: Option<String>,
    description: Option<Option<String>>,
    image: Option<String>,
    commands: Option<Vec<String>>,
    executor_id: Option<Option<Uuid>>,
    source: Option<Option<String>>,
}

#[derive(Debug, Serialize, Deserialize, Clone, FromRow)]
struct TestRun {
    id: Uuid,
    name: String,
    image: String,
    command: Vec<String>,
    status: String,
    created_at: chrono::DateTime<chrono::Utc>,
    duration: Option<i32>,
    logs: Option<Vec<String>>,
    test_definition_id: Option<Uuid>,
    executor_id: Option<Uuid>,
}

#[derive(Debug, Serialize, Deserialize)]
struct CreateTestRunRequest {
    test_definition_id: Uuid,
    name: Option<String>,
    image: Option<String>,
    commands: Option<Vec<String>>,
}

#[derive(Debug, Serialize, Deserialize, Clone, FromRow)]
struct TestSuite {
    id: Uuid,
    name: String,
    description: Option<String>,
    execution_mode: String, // "sequential" or "parallel"
    labels: Vec<String>,
    test_definition_ids: Vec<Uuid>,
    created_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct PatchTestSuiteRequest {
    name: Option<String>,
    description: Option<Option<String>>,
    execution_mode: Option<String>,
    labels: Option<Vec<String>>,
    test_definition_ids: Option<Vec<Uuid>>,
}

// Health check
async fn root_handler() -> &'static str {
    "✅ SparkTest Rust backend is running"
}

async fn health_handler() -> Json<&'static str> {
    Json("OK")
}

// ---------------------- Executors ----------------------

async fn get_executors(State(pool): State<PgPool>) -> Result<Json<Vec<TestExecutor>>, StatusCode> {
    let rows = sqlx::query_as::<_, TestExecutor>("SELECT * FROM test_executors")
        .fetch_all(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(rows))
}

async fn get_executor(Path(id): Path<Uuid>, State(pool): State<PgPool>) -> Result<Json<TestExecutor>, StatusCode> {
    let row = sqlx::query_as::<_, TestExecutor>("SELECT * FROM test_executors WHERE id = $1")
        .bind(id)
        .fetch_one(&pool)
        .await
        .map_err(|_| StatusCode::NOT_FOUND)?;
    Ok(Json(row))
}

async fn create_executor(State(pool): State<PgPool>, Json(body): Json<TestExecutor>) -> Result<Json<&'static str>, StatusCode> {
    // Sanitize and validate inputs
    let name = sanitize_name(&body.name).map_err(|e| {
        log::error!("Invalid executor name: {}", e);
        StatusCode::BAD_REQUEST
    })?;
    
    let image = validate_docker_image(&body.image).map_err(|e| {
        log::error!("Invalid executor image: {}", e);
        StatusCode::BAD_REQUEST
    })?;
    
    let command = sanitize_commands(&[body.default_command.clone()]).map_err(|e| {
        log::error!("Invalid executor command: {}", e);
        StatusCode::BAD_REQUEST
    })?;
    
    let description = match &body.description {
        Some(desc) => Some(sanitize_description(desc).map_err(|e| {
            log::error!("Invalid executor description: {}", e);
            StatusCode::BAD_REQUEST
        })?),
        None => None,
    };
    
    sqlx::query("INSERT INTO test_executors (id, name, image, command, supported_file_types, env_vars, description) VALUES ($1, $2, $3, $4, $5, $6, $7)")
        .bind(&body.id)
        .bind(&name)
        .bind(&image)
        .bind(&command[0]) // Take first command after sanitization
        .bind(&body.supported_file_types)
        .bind(&body.environment_variables)
        .bind(&description)
        .bind(&body.icon)
        .execute(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json("Executor created"))
}

async fn delete_executor(Path(id): Path<Uuid>, State(pool): State<PgPool>) -> Result<Json<&'static str>, StatusCode> {
    sqlx::query("DELETE FROM test_executors WHERE id = $1")
        .bind(id)
        .execute(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json("Executor deleted"))
}

// ---------------------- Definitions ----------------------

async fn get_test_definitions(State(pool): State<PgPool>) -> Result<Json<Vec<TestDefinition>>, StatusCode> {
    let rows = sqlx::query_as::<_, TestDefinition>("SELECT * FROM test_definitions")
        .fetch_all(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(rows))
}

async fn get_test_definition(Path(id): Path<Uuid>, State(pool): State<PgPool>) -> Result<Json<TestDefinition>, StatusCode> {
    let row = sqlx::query_as::<_, TestDefinition>("SELECT * FROM test_definitions WHERE id = $1")
        .bind(id)
        .fetch_one(&pool)
        .await
        .map_err(|_| StatusCode::NOT_FOUND)?;
    Ok(Json(row))
}

async fn create_test_definition(State(pool): State<PgPool>, Json(body): Json<CreateTestDefinitionRequest>) -> Result<Json<TestDefinition>, StatusCode> {
    let id = Uuid::new_v4();
    let created_at = Utc::now();
    
    // Sanitize and validate inputs
    let name = sanitize_name(&body.name).map_err(|e| {
        log::error!("Invalid name: {}", e);
        StatusCode::BAD_REQUEST
    })?;
    
    let description = match &body.description {
        Some(desc) => Some(sanitize_description(desc).map_err(|e| {
            log::error!("Invalid description: {}", e);
            StatusCode::BAD_REQUEST
        })?),
        None => None,
    };
    
    let image = validate_docker_image(&body.image).map_err(|e| {
        log::error!("Invalid Docker image: {}", e);
        StatusCode::BAD_REQUEST
    })?;
    
    let commands = sanitize_commands(&body.commands).map_err(|e| {
        log::error!("Invalid commands: {}", e);
        StatusCode::BAD_REQUEST
    })?;
    
    sqlx::query("INSERT INTO test_definitions (id, name, description, image, commands, created_at, executor_id, source) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)")
        .bind(&id)
        .bind(&name)
        .bind(&description)
        .bind(&image)
        .bind(&commands)
        .bind(&created_at)
        .bind(&body.executor_id)
        .bind(&body.source)
        .execute(&pool)
        .await
        .map_err(|e| {
            log::error!("Failed to create test definition: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;
    
    let test_definition = TestDefinition {
        id,
        name,
        description,
        image,
        commands,
        created_at: Some(created_at),
        executor_id: body.executor_id,
        source: body.source,
    };
    
    log::info!("Created test definition '{}' with id {}", test_definition.name, test_definition.id);
    Ok(Json(test_definition))
}

async fn update_test_definition(Path(id): Path<Uuid>, State(pool): State<PgPool>, Json(body): Json<TestDefinition>) -> Result<Json<&'static str>, StatusCode> {
    // Sanitize and validate inputs
    let name = sanitize_name(&body.name).map_err(|e| {
        log::error!("Invalid name: {}", e);
        StatusCode::BAD_REQUEST
    })?;
    
    let description = match &body.description {
        Some(desc) => Some(sanitize_description(desc).map_err(|e| {
            log::error!("Invalid description: {}", e);
            StatusCode::BAD_REQUEST
        })?),
        None => None,
    };
    
    let image = validate_docker_image(&body.image).map_err(|e| {
        log::error!("Invalid Docker image: {}", e);
        StatusCode::BAD_REQUEST
    })?;
    
    let commands = sanitize_commands(&body.commands).map_err(|e| {
        log::error!("Invalid commands: {}", e);
        StatusCode::BAD_REQUEST
    })?;
    
    sqlx::query("UPDATE test_definitions SET name = $1, description = $2, image = $3, commands = $4, executor_id = $5, source = $6 WHERE id = $7")
        .bind(&name)
        .bind(&description)
        .bind(&image)
        .bind(&commands)
        .bind(&body.executor_id)
        .bind(&body.source)
        .bind(id)
        .execute(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json("Updated test definition"))
}

async fn patch_test_definition(Path(id): Path<Uuid>, State(pool): State<PgPool>, Json(body): Json<PatchTestDefinitionRequest>) -> Result<Json<TestDefinition>, StatusCode> {
    // First, get the current test definition
    let current = sqlx::query_as::<_, TestDefinition>("SELECT * FROM test_definitions WHERE id = $1")
        .bind(id)
        .fetch_one(&pool)
        .await
        .map_err(|_| StatusCode::NOT_FOUND)?;
    
    // Apply patch updates
    let updated_name = body.name.unwrap_or(current.name);
    let updated_description = body.description.unwrap_or(current.description);
    let updated_image = body.image.unwrap_or(current.image);
    let updated_commands = body.commands.unwrap_or(current.commands);
    let updated_executor_id = body.executor_id.unwrap_or(current.executor_id);
    let updated_source = body.source.unwrap_or(current.source);
    
    // Update the database
    sqlx::query("UPDATE test_definitions SET name = $1, description = $2, image = $3, commands = $4, executor_id = $5, source = $6 WHERE id = $7")
        .bind(&updated_name)
        .bind(&updated_description)
        .bind(&updated_image)
        .bind(&updated_commands)
        .bind(&updated_executor_id)
        .bind(&updated_source)
        .bind(id)
        .execute(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    // Return the updated test definition
    let updated_definition = TestDefinition {
        id,
        name: updated_name,
        description: updated_description,
        image: updated_image,
        commands: updated_commands,
        created_at: current.created_at,
        executor_id: updated_executor_id,
        source: updated_source,
    };
    
    Ok(Json(updated_definition))
}

async fn delete_test_definition(Path(id): Path<Uuid>, State(pool): State<PgPool>) -> Result<Json<&'static str>, StatusCode> {
    sqlx::query("DELETE FROM test_definitions WHERE id = $1")
        .bind(id)
        .execute(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json("Deleted test definition"))
}

// ---------------------- Runs ----------------------

async fn get_test_runs(State(pool): State<PgPool>) -> Result<Json<Vec<TestRun>>, StatusCode> {
    let rows = sqlx::query_as::<_, TestRun>("SELECT * FROM test_runs")
        .fetch_all(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(rows))
}

async fn create_test_run(
    State(pool): State<PgPool>,
    Json(payload): Json<CreateTestRunRequest>
) -> Result<Json<TestRun>, StatusCode> {
    let def = sqlx::query_as::<_, TestDefinition>("SELECT * FROM test_definitions WHERE id = $1")
        .bind(payload.test_definition_id)
        .fetch_one(&pool)
        .await
        .map_err(|_| StatusCode::NOT_FOUND)?;

    let run_id = Uuid::new_v4();
    
    // Sanitize name if provided
    let name = match &payload.name {
        Some(n) => sanitize_name(n).map_err(|e| {
            log::error!("Invalid run name: {}", e);
            StatusCode::BAD_REQUEST
        })?,
        None => def.name.clone(),
    };
    
    // Validate image if provided
    let image = match &payload.image {
        Some(img) => validate_docker_image(img).map_err(|e| {
            log::error!("Invalid run image: {}", e);
            StatusCode::BAD_REQUEST
        })?,
        None => def.image.clone(),
    };
    
    // Sanitize commands if provided
    let command = match &payload.commands {
        Some(cmds) => sanitize_commands(cmds).map_err(|e| {
            log::error!("Invalid run commands: {}", e);
            StatusCode::BAD_REQUEST
        })?,
        None => def.commands.clone(),
    };
    
    let job_name = format!("sparktest-job-{}", run_id.simple());

    sqlx::query("INSERT INTO test_runs (id, name, image, command, status, created_at, test_definition_id, executor_id, duration, logs) VALUES ($1, $2, $3, $4, 'running', $5, $6, $7, NULL, NULL)")
        .bind(run_id)
        .bind(&name)
        .bind(&image)
        .bind(&command)
        .bind(Utc::now())
        .bind(def.id)
        .bind(def.executor_id)
        .execute(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let client = Client::try_default().await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    create_k8s_job(&client, &job_name, &image, &command)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let pool_clone = pool.clone();
    tokio::spawn(async move {
        let _ = monitor_job_and_update_status(run_id, job_name, pool_clone).await;
    });

    // Fetch and return the created run
    let run: TestRun = sqlx::query_as::<_, TestRun>("SELECT * FROM test_runs WHERE id = $1")
        .bind(run_id)
        .fetch_one(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(run))
}

// --- GitHub Sync Task ---
async fn start_github_sync(pool: PgPool) {
    let repos = vec![
        // Add your public repos here
        "https://github.com/kevintatou/sparktest-demo-definitions.git",
    ];

    tokio::spawn(async move {
        loop {
            for repo_url in &repos {
                if let Err(e) = sync_repo(repo_url, &pool).await {
                    log::error!("Failed to sync repo {}: {:?}", repo_url, e);
                }
            }
            tokio::time::sleep(Duration::from_secs(3600)).await; // 1 hour
        }
    });
}

async fn sync_repo(repo_url: &str, pool: &PgPool) -> Result<(), Box<dyn std::error::Error>> {
    let tmp_dir = TempDir::new()?;
    let repo_path = tmp_dir.path().join("repo");
    log::info!("Cloning {} to {:?}", repo_url, repo_path);

    // Clone the repo and get branch name in a limited scope
    let branch_name = {
        let repo = Repository::clone(repo_url, &repo_path)?;
        let head = repo.head()?;
        head.shorthand().unwrap_or("main").to_string()
    };

    let tests_dir = repo_path.join("tests");
    if !tests_dir.exists() {
        log::warn!("No /tests directory in repo {}", repo_url);
        return Ok(());
    }

    for entry in fs::read_dir(&tests_dir)? {
        let entry = entry?;
        let path = entry.path();
        if path.extension().and_then(|s| s.to_str()) == Some("json") {
            let file_name = path.file_name().unwrap().to_str().unwrap();
            let file_path = format!("tests/{}", file_name);
            
            // Build the GitHub file URL
            let github_file_url = format!("{}/blob/{}/{}", repo_url, branch_name, file_path);
            
            let file_content = fs::read_to_string(&path)?;
            match serde_json::from_str::<Value>(&file_content) {
                Ok(json) => {
                    if let Err(e) = upsert_test_definition_from_json(json, &github_file_url, pool).await {
                        log::error!("Failed to upsert definition from {:?}: {:?}", path, e);
                    } else {
                        log::info!("Synced definition from {:?}", path);
                    }
                }
                Err(e) => log::error!("Invalid JSON in {:?}: {:?}", path, e),
            }
        }
    }
    Ok(())
}

async fn upsert_test_definition_from_json(json: Value, source_url: &str, pool: &PgPool) -> Result<(), sqlx::Error> {
    // Extract fields (adjust as needed)
    let raw_name = json.get("name").and_then(|v| v.as_str()).unwrap_or("Unnamed");
    let raw_image = json.get("image").and_then(|v| v.as_str()).unwrap_or("ubuntu:latest");
    let raw_commands = json.get("commands").and_then(|v| v.as_array())
        .map(|arr| arr.iter().filter_map(|v| v.as_str().map(|s| s.to_string())).collect::<Vec<_>>())
        .unwrap_or_else(|| vec!["echo Hello".to_string()]);
    let raw_description = json.get("description").and_then(|v| v.as_str());

    // Sanitize inputs
    let name = match sanitize_name(raw_name) {
        Ok(n) => n,
        Err(e) => {
            log::error!("Invalid name in GitHub sync: {}", e);
            return Err(sqlx::Error::Protocol("Invalid name in GitHub sync".to_string()));
        }
    };
    
    let image = match validate_docker_image(raw_image) {
        Ok(i) => i,
        Err(e) => {
            log::error!("Invalid image in GitHub sync: {}", e);
            return Err(sqlx::Error::Protocol("Invalid image in GitHub sync".to_string()));
        }
    };
    
    let commands = match sanitize_commands(&raw_commands) {
        Ok(c) => c,
        Err(e) => {
            log::error!("Invalid commands in GitHub sync: {}", e);
            return Err(sqlx::Error::Protocol("Invalid commands in GitHub sync".to_string()));
        }
    };
    
    let description = match raw_description {
        Some(desc) => Some(sanitize_description(desc).map_err(|e| {
            log::error!("Invalid description in GitHub sync: {}", e);
            sqlx::Error::Protocol("Invalid description in GitHub sync".to_string())
        })?),
        None => None,
    };

    // Use source field for tracking instead of name to avoid duplicates
    let existing = sqlx::query_scalar::<_, Uuid>("SELECT id FROM test_definitions WHERE source = $1")
        .bind(source_url)
        .fetch_optional(pool)
        .await?;

    if let Some(existing_id) = existing {
        sqlx::query("UPDATE test_definitions SET name = $1, image = $2, commands = $3, description = $4 WHERE id = $5")
            .bind(&name)
            .bind(&image)
            .bind(&commands)
            .bind(&description)
            .bind(existing_id)
            .execute(pool)
            .await?;
        log::info!("Updated test definition '{}' from source '{}'", name, source_url);
    } else {
        let id = uuid::Uuid::new_v4();
        sqlx::query("INSERT INTO test_definitions (id, name, image, commands, description, executor_id, source) VALUES ($1, $2, $3, $4, $5, $6, $7)")
            .bind(id)
            .bind(&name)
            .bind(&image)
            .bind(&commands)
            .bind(&description)
            .bind(None::<Uuid>) // No executor_id for GitHub sync definitions
            .bind(source_url)
            .execute(pool)
            .await?;
        log::info!("Inserted new test definition '{}' from source '{}'", name, source_url);
    }
    Ok(())
}

// ---------------------- Suites ----------------------

async fn get_test_suites(State(pool): State<PgPool>) -> Result<Json<Vec<TestSuite>>, StatusCode> {
    let rows = sqlx::query_as::<_, TestSuite>("SELECT * FROM test_suites")
        .fetch_all(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(rows))
}

async fn get_test_suite(Path(id): Path<Uuid>, State(pool): State<PgPool>) -> Result<Json<TestSuite>, StatusCode> {
    let row = sqlx::query_as::<_, TestSuite>("SELECT * FROM test_suites WHERE id = $1")
        .bind(id)
        .fetch_one(&pool)
        .await
        .map_err(|_| StatusCode::NOT_FOUND)?;
    Ok(Json(row))
}

async fn create_test_suite(State(pool): State<PgPool>, Json(mut body): Json<TestSuite>) -> Result<Json<&'static str>, StatusCode> {
    // Generate a new UUID for the suite if not provided
    let suite_id = if body.id == Uuid::nil() {
        Uuid::new_v4()
    } else {
        body.id
    };
    body.id = suite_id;
    
    // Sanitize and validate inputs
    let name = sanitize_name(&body.name).map_err(|e| {
        log::error!("Invalid suite name: {}", e);
        StatusCode::BAD_REQUEST
    })?;
    
    let description = match &body.description {
        Some(desc) => Some(sanitize_description(desc).map_err(|e| {
            log::error!("Invalid suite description: {}", e);
            StatusCode::BAD_REQUEST
        })?),
        None => None,
    };
    
    let execution_mode = validate_execution_mode(&body.execution_mode).map_err(|e| {
        log::error!("Invalid execution mode: {}", e);
        StatusCode::BAD_REQUEST
    })?;
    
    let labels = sanitize_labels(&body.labels).map_err(|e| {
        log::error!("Invalid labels: {}", e);
        StatusCode::BAD_REQUEST
    })?;
    
    sqlx::query("INSERT INTO test_suites (id, name, description, execution_mode, labels, test_definition_ids, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)")
        .bind(&suite_id)
        .bind(&name)
        .bind(&description)
        .bind(&execution_mode)
        .bind(&labels)
        .bind(&body.test_definition_ids)
        .bind(body.created_at)
        .execute(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json("Suite created"))
}

async fn update_test_suite(Path(id): Path<Uuid>, State(pool): State<PgPool>, Json(body): Json<TestSuite>) -> Result<Json<&'static str>, StatusCode> {
    // Sanitize and validate inputs
    let name = sanitize_name(&body.name).map_err(|e| {
        log::error!("Invalid suite name: {}", e);
        StatusCode::BAD_REQUEST
    })?;
    
    let description = match &body.description {
        Some(desc) => Some(sanitize_description(desc).map_err(|e| {
            log::error!("Invalid suite description: {}", e);
            StatusCode::BAD_REQUEST
        })?),
        None => None,
    };
    
    let execution_mode = validate_execution_mode(&body.execution_mode).map_err(|e| {
        log::error!("Invalid execution mode: {}", e);
        StatusCode::BAD_REQUEST
    })?;
    
    let labels = sanitize_labels(&body.labels).map_err(|e| {
        log::error!("Invalid labels: {}", e);
        StatusCode::BAD_REQUEST
    })?;
    
    sqlx::query("UPDATE test_suites SET name = $1, description = $2, execution_mode = $3, labels = $4, test_definition_ids = $5 WHERE id = $6")
        .bind(&name)
        .bind(&description)
        .bind(&execution_mode)
        .bind(&labels)
        .bind(&body.test_definition_ids)
        .bind(id)
        .execute(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json("Suite updated"))
}

async fn patch_test_suite(Path(id): Path<Uuid>, State(pool): State<PgPool>, Json(body): Json<PatchTestSuiteRequest>) -> Result<Json<TestSuite>, StatusCode> {
    // First, get the current test suite
    let current = sqlx::query_as::<_, TestSuite>("SELECT * FROM test_suites WHERE id = $1")
        .bind(id)
        .fetch_one(&pool)
        .await
        .map_err(|_| StatusCode::NOT_FOUND)?;
    
    // Apply patch updates
    let updated_name = body.name.unwrap_or(current.name);
    let updated_description = body.description.unwrap_or(current.description);
    let updated_execution_mode = body.execution_mode.unwrap_or(current.execution_mode);
    let updated_labels = body.labels.unwrap_or(current.labels);
    let updated_test_definition_ids = body.test_definition_ids.unwrap_or(current.test_definition_ids);
    
    // Update the database
    sqlx::query("UPDATE test_suites SET name = $1, description = $2, execution_mode = $3, labels = $4, test_definition_ids = $5 WHERE id = $6")
        .bind(&updated_name)
        .bind(&updated_description)
        .bind(&updated_execution_mode)
        .bind(&updated_labels)
        .bind(&updated_test_definition_ids)
        .bind(id)
        .execute(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    // Return the updated test suite
    let updated_suite = TestSuite {
        id,
        name: updated_name,
        description: updated_description,
        execution_mode: updated_execution_mode,
        labels: updated_labels,
        test_definition_ids: updated_test_definition_ids,
        created_at: current.created_at,
    };
    
    Ok(Json(updated_suite))
}

async fn delete_test_suite(Path(id): Path<Uuid>, State(pool): State<PgPool>) -> Result<Json<&'static str>, StatusCode> {
    sqlx::query("DELETE FROM test_suites WHERE id = $1")
        .bind(id)
        .execute(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json("Suite deleted"))
}

// ---------------------- Kubernetes Log Endpoints ----------------------

/// Get logs for a specific job by name
async fn get_job_logs(Path(job_name): Path<String>) -> Result<Json<JobLogs>, StatusCode> {
    let k8s_client = KubernetesClient::new().await
        .map_err(|e| {
            tracing::error!("Failed to create Kubernetes client: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    let logs = k8s_client.get_job_logs(&job_name).await
        .map_err(|e| {
            tracing::error!("Failed to get logs for job '{}': {}", job_name, e);
            StatusCode::NOT_FOUND
        })?;

    Ok(Json(logs))
}

/// Get logs for a test run by ID (maps to Kubernetes job)
async fn get_test_run_logs(Path(run_id): Path<Uuid>) -> Result<Json<JobLogs>, StatusCode> {
    let job_name = format!("sparktest-job-{}", run_id.simple());
    let k8s_client = KubernetesClient::new().await
        .map_err(|e| {
            tracing::error!("Failed to create Kubernetes client: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    let logs = k8s_client.get_job_logs(&job_name).await
        .map_err(|e| {
            tracing::error!("Failed to get logs for test run '{}': {}", run_id, e);
            StatusCode::NOT_FOUND
        })?;

    Ok(Json(logs))
}

/// Get status of a Kubernetes job
async fn get_job_status(Path(job_name): Path<String>) -> Result<Json<serde_json::Value>, StatusCode> {
    let k8s_client = KubernetesClient::new().await
        .map_err(|e| {
            tracing::error!("Failed to create Kubernetes client: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    let status = k8s_client.get_job_status(&job_name).await
        .map_err(|e| {
            tracing::error!("Failed to get status for job '{}': {}", job_name, e);
            StatusCode::NOT_FOUND
        })?;

    Ok(Json(serde_json::json!({
        "job_name": job_name,
        "status": status,
        "timestamp": Utc::now()
    })))
}

/// Health check for Kubernetes connectivity
async fn kubernetes_health() -> Result<Json<serde_json::Value>, StatusCode> {
    let k8s_client = KubernetesClient::new().await
        .map_err(|e| {
            tracing::error!("Failed to create Kubernetes client: {}", e);
            return StatusCode::SERVICE_UNAVAILABLE;
        })?;

    let is_healthy = k8s_client.health_check().await
        .unwrap_or(false);

    let status = if is_healthy { 
        StatusCode::OK 
    } else { 
        StatusCode::SERVICE_UNAVAILABLE 
    };

    let response = Json(serde_json::json!({
        "kubernetes_connected": is_healthy,
        "timestamp": Utc::now()
    }));

    match status {
        StatusCode::OK => Ok(response),
        _ => Err(StatusCode::SERVICE_UNAVAILABLE)
    }
}

/// Delete a Kubernetes job
async fn delete_job(Path(job_name): Path<String>) -> Result<Json<serde_json::Value>, StatusCode> {
    let k8s_client = KubernetesClient::new().await
        .map_err(|e| {
            tracing::error!("Failed to create Kubernetes client: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    k8s_client.delete_job(&job_name).await
        .map_err(|e| {
            tracing::error!("Failed to delete job '{}': {}", job_name, e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    Ok(Json(serde_json::json!({
        "message": format!("Job '{}' deleted successfully", job_name),
        "timestamp": Utc::now()
    })))
}

// ---------------------- Start App ----------------------

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    env_logger::init(); // Initialize logger

    let db_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await
        .expect("Failed to connect to DB");

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/", get(root_handler))
        .route("/api/health", get(health_handler))
        .route("/api/test-executors", get(get_executors).post(create_executor))
        .route("/api/test-executors/:id", get(get_executor).delete(delete_executor))
        .route("/api/test-definitions", get(get_test_definitions).post(create_test_definition))
        .route("/api/test-definitions/:id", get(get_test_definition).put(update_test_definition).patch(patch_test_definition).delete(delete_test_definition))
        .route("/api/test-runs", get(get_test_runs).post(create_test_run))
        .route("/api/test-suites", get(get_test_suites).post(create_test_suite))
        .route("/api/test-suites/:id", get(get_test_suite).put(update_test_suite).patch(patch_test_suite).delete(delete_test_suite))
        // Kubernetes endpoints
        .route("/api/k8s/health", get(kubernetes_health))
        .route("/api/k8s/jobs/:job_name/logs", get(get_job_logs))
        .route("/api/k8s/jobs/:job_name/status", get(get_job_status))
        .route("/api/k8s/jobs/:job_name", delete(delete_job))
        .route("/api/test-runs/:run_id/logs", get(get_test_run_logs))
        .with_state(pool.clone()) // Clone pool for Axum
        .layer(cors);

    let addr = SocketAddr::from(([127, 0, 0, 1], 3001));
    println!("🚀 SparkTest backend running at http://{}", addr);

    // Start GitHub sync task (clone pool)
    start_github_sync(pool.clone()).await;

    let listener = TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::{
        body::{to_bytes, Body},
        http::{Request, StatusCode},
    };
    use tower::ServiceExt;

    async fn create_test_app() -> Router {
        // Create a mock app for testing without real database
        Router::new()
            .route("/", get(root_handler))
            .route("/api/health", get(health_handler))
    }

    #[tokio::test]
    async fn test_root_handler() {
        let app = create_test_app().await;

        let response = app
            .oneshot(
                Request::builder()
                    .uri("/")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);

        let body = to_bytes(response.into_body(), usize::MAX).await.unwrap();
        let body_str = std::str::from_utf8(&body).unwrap();
        assert_eq!(body_str, "✅ SparkTest Rust backend is running");
    }

    #[tokio::test]
    async fn test_health_handler() {
        let app = create_test_app().await;

        let response = app
            .oneshot(
                Request::builder()
                    .uri("/api/health")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);

        let body = to_bytes(response.into_body(), usize::MAX).await.unwrap();
        let body_str = std::str::from_utf8(&body).unwrap();
        assert_eq!(body_str, r#""OK""#);
    }

    #[test]
    fn test_test_executor_serialization() {
        let executor = TestExecutor {
            id: Uuid::new_v4(),
            name: "Test Executor".to_string(),
            image: "test:latest".to_string(),
            default_command: "echo hello".to_string(),
            supported_file_types: vec!["js".to_string(), "ts".to_string()],
            environment_variables: vec!["NODE_ENV=test".to_string()],
            description: Some("A test executor".to_string()),
            icon: "code".to_string(),
        };

        let json = serde_json::to_string(&executor).unwrap();
        assert!(json.contains("Test Executor"));
        assert!(json.contains("test:latest"));
        assert!(json.contains("echo hello"));

        let deserialized: TestExecutor = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.name, executor.name);
        assert_eq!(deserialized.image, executor.image);
        assert_eq!(deserialized.default_command, executor.default_command);
    }

    #[test]
    fn test_test_definition_serialization() {
        let definition = TestDefinition {
            id: Uuid::new_v4(),
            name: "Test Definition".to_string(),
            description: Some("A test definition".to_string()),
            image: "nginx:latest".to_string(),
            commands: vec!["echo".to_string(), "hello".to_string()],
            created_at: Some(Utc::now()),
            executor_id: None,
            source: Some("https://github.com/test/repo/blob/main/tests/example.json".to_string()),
        };

        let json = serde_json::to_string(&definition).unwrap();
        assert!(json.contains("Test Definition"));
        assert!(json.contains("nginx:latest"));

        let deserialized: TestDefinition = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.name, definition.name);
        assert_eq!(deserialized.image, definition.image);
        assert_eq!(deserialized.commands, definition.commands);
        assert_eq!(deserialized.source, definition.source);
    }

    #[test]
    fn test_test_run_serialization() {
        let test_run = TestRun {
            id: Uuid::new_v4(),
            name: "Test Run".to_string(),
            image: "ubuntu:latest".to_string(),
            command: vec!["ls".to_string(), "-la".to_string()],
            status: "running".to_string(),
            created_at: Utc::now(),
            duration: Some(30),
            logs: Some(vec!["Starting test...".to_string()]),
            test_definition_id: Some(Uuid::new_v4()),
            executor_id: None,
        };

        let json = serde_json::to_string(&test_run).unwrap();
        assert!(json.contains("Test Run"));
        assert!(json.contains("ubuntu:latest"));
        assert!(json.contains("running"));

        let deserialized: TestRun = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.name, test_run.name);
        assert_eq!(deserialized.image, test_run.image);
        assert_eq!(deserialized.status, test_run.status);
    }

    #[test]
    fn test_create_test_run_request_serialization() {
        let request = CreateTestRunRequest {
            test_definition_id: Uuid::new_v4(),
            name: Some("Custom Run".to_string()),
            image: Some("custom:latest".to_string()),
            commands: Some(vec!["echo".to_string(), "test".to_string()]),
        };

        let json = serde_json::to_string(&request).unwrap();
        assert!(json.contains("Custom Run"));
        assert!(json.contains("custom:latest"));

        let deserialized: CreateTestRunRequest = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.name, request.name);
        assert_eq!(deserialized.image, request.image);
        assert_eq!(deserialized.commands, request.commands);
    }

    #[test]
    fn test_create_test_run_request_minimal() {
        let request = CreateTestRunRequest {
            test_definition_id: Uuid::new_v4(),
            name: None,
            image: None,
            commands: None,
        };

        let json = serde_json::to_string(&request).unwrap();
        let deserialized: CreateTestRunRequest = serde_json::from_str(&json).unwrap();
        
        assert_eq!(deserialized.test_definition_id, request.test_definition_id);
        assert_eq!(deserialized.name, None);
        assert_eq!(deserialized.image, None);
        assert_eq!(deserialized.commands, None);
    }

    #[test]
    fn test_uuid_generation() {
        let id1 = Uuid::new_v4();
        let id2 = Uuid::new_v4();
        
        assert_ne!(id1, id2);
        assert!(id1.to_string().len() > 0);
        assert!(id2.to_string().len() > 0);
    }

    #[test] 
    fn test_status_codes() {
        assert_eq!(StatusCode::OK.as_u16(), 200);
        assert_eq!(StatusCode::CREATED.as_u16(), 201);
        assert_eq!(StatusCode::NOT_FOUND.as_u16(), 404);
        assert_eq!(StatusCode::INTERNAL_SERVER_ERROR.as_u16(), 500);
    }

    #[test]
    fn test_create_test_definition_request_serialization() {
        let request = CreateTestDefinitionRequest {
            name: "Test Definition".to_string(),
            description: Some("A test definition".to_string()),
            image: "nginx:latest".to_string(),
            commands: vec!["echo".to_string(), "hello".to_string()],
            executor_id: None,
            source: None,
        };

        let json = serde_json::to_string(&request).unwrap();
        assert!(json.contains("Test Definition"));
        assert!(json.contains("nginx:latest"));
        assert!(!json.contains("\"id\"")); // Should not contain id field

        let deserialized: CreateTestDefinitionRequest = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.name, request.name);
        assert_eq!(deserialized.image, request.image);
        assert_eq!(deserialized.commands, request.commands);
    }

    #[test]
    fn test_create_test_definition_request_without_id() {
        // Test that we can deserialize frontend payload without id
        let frontend_payload = serde_json::json!({
            "name": "Frontend Test",
            "description": "From frontend",
            "image": "ubuntu:latest",
            "commands": ["npm", "test"]
        });

        let request: CreateTestDefinitionRequest = serde_json::from_value(frontend_payload).unwrap();
        assert_eq!(request.name, "Frontend Test");
        assert_eq!(request.description, Some("From frontend".to_string()));
        assert_eq!(request.image, "ubuntu:latest");
        assert_eq!(request.commands, vec!["npm", "test"]);
    }

    #[test]
    fn test_patch_test_definition_request_serialization() {
        let request = PatchTestDefinitionRequest {
            name: Some("Updated Test".to_string()),
            description: Some(Some("Updated description".to_string())),
            image: Some("updated:latest".to_string()),
            commands: Some(vec!["echo".to_string(), "updated".to_string()]),
            executor_id: Some(Some(Uuid::new_v4())),
            source: Some(Some("https://github.com/test/repo/blob/main/tests/updated.json".to_string())),
        };

        let json = serde_json::to_string(&request).unwrap();
        assert!(json.contains("Updated Test"));
        assert!(json.contains("updated:latest"));

        let deserialized: PatchTestDefinitionRequest = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.name, request.name);
        assert_eq!(deserialized.image, request.image);
        assert_eq!(deserialized.commands, request.commands);
    }

    #[test]
    fn test_patch_test_definition_request_minimal() {
        let request = PatchTestDefinitionRequest {
            name: Some("Only Name".to_string()),
            description: None,
            image: None,
            commands: None,
            executor_id: None,
            source: None,
        };

        let json = serde_json::to_string(&request).unwrap();
        let deserialized: PatchTestDefinitionRequest = serde_json::from_str(&json).unwrap();
        
        assert_eq!(deserialized.name, Some("Only Name".to_string()));
        assert_eq!(deserialized.description, None);
        assert_eq!(deserialized.image, None);
        assert_eq!(deserialized.commands, None);
        assert_eq!(deserialized.executor_id, None);
    }

    #[test]
    fn test_patch_test_definition_request_empty() {
        let request = PatchTestDefinitionRequest {
            name: None,
            description: None,
            image: None,
            commands: None,
            executor_id: None,
            source: None,
        };

        let json = serde_json::to_string(&request).unwrap();
        let deserialized: PatchTestDefinitionRequest = serde_json::from_str(&json).unwrap();
        
        assert_eq!(deserialized.name, None);
        assert_eq!(deserialized.description, None);
        assert_eq!(deserialized.image, None);
        assert_eq!(deserialized.commands, None);
        assert_eq!(deserialized.executor_id, None);
    }

    #[test]
    fn test_patch_test_suite_request_serialization() {
        let request = PatchTestSuiteRequest {
            name: Some("Updated Suite".to_string()),
            description: Some(Some("Updated suite description".to_string())),
            execution_mode: Some("parallel".to_string()),
            labels: Some(vec!["updated".to_string(), "test".to_string()]),
            test_definition_ids: Some(vec![Uuid::new_v4(), Uuid::new_v4()]),
        };

        let json = serde_json::to_string(&request).unwrap();
        assert!(json.contains("Updated Suite"));
        assert!(json.contains("parallel"));

        let deserialized: PatchTestSuiteRequest = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.name, request.name);
        assert_eq!(deserialized.execution_mode, request.execution_mode);
        assert_eq!(deserialized.labels, request.labels);
    }

    #[test]
    fn test_patch_test_suite_request_minimal() {
        let request = PatchTestSuiteRequest {
            name: Some("Only Name".to_string()),
            description: None,
            execution_mode: None,
            labels: None,
            test_definition_ids: None,
        };

        let json = serde_json::to_string(&request).unwrap();
        let deserialized: PatchTestSuiteRequest = serde_json::from_str(&json).unwrap();
        
        assert_eq!(deserialized.name, Some("Only Name".to_string()));
        assert_eq!(deserialized.description, None);
        assert_eq!(deserialized.execution_mode, None);
        assert_eq!(deserialized.labels, None);
        assert_eq!(deserialized.test_definition_ids, None);
    }

    #[test]
    fn test_patch_test_suite_request_empty() {
        let request = PatchTestSuiteRequest {
            name: None,
            description: None,
            execution_mode: None,
            labels: None,
            test_definition_ids: None,
        };

        let json = serde_json::to_string(&request).unwrap();
        let deserialized: PatchTestSuiteRequest = serde_json::from_str(&json).unwrap();
        
        assert_eq!(deserialized.name, None);
        assert_eq!(deserialized.description, None);
        assert_eq!(deserialized.execution_mode, None);
        assert_eq!(deserialized.labels, None);
        assert_eq!(deserialized.test_definition_ids, None);
    }

    #[test]
    fn test_patch_requests_with_empty_arrays() {
        let json = serde_json::json!({
            "commands": [],
            "labels": [],
            "test_definition_ids": []
        });

        let def_request: PatchTestDefinitionRequest = serde_json::from_value(json.clone()).unwrap();
        let suite_request: PatchTestSuiteRequest = serde_json::from_value(json).unwrap();

        assert_eq!(def_request.commands, Some(vec![]));
        assert_eq!(suite_request.labels, Some(vec![]));
        assert_eq!(suite_request.test_definition_ids, Some(vec![]));
    }
}

#[cfg(test)]
mod patch_tests {
    use super::*;
    use axum::{
        body::{to_bytes, Body},
        http::{Request, StatusCode, Method},
    };
    use tower::ServiceExt;
    use serde_json::json;

    // Create a mock app for testing PATCH routes without a real database
    async fn create_mock_app() -> Router {
        // This is a minimal mock that just tests the route structure
        Router::new()
            .route("/api/test-definitions/:id", patch(mock_patch_test_definition))
            .route("/api/test-suites/:id", patch(mock_patch_test_suite))
    }

    // Mock handler for test definitions
    async fn mock_patch_test_definition(
        Path(id): Path<Uuid>,
        Json(body): Json<PatchTestDefinitionRequest>,
    ) -> Result<Json<TestDefinition>, StatusCode> {
        // Mock implementation that returns a test definition
        let test_definition = TestDefinition {
            id,
            name: body.name.unwrap_or_else(|| "Test Definition".to_string()),
            description: body.description.unwrap_or_else(|| Some("Test description".to_string())),
            image: body.image.unwrap_or_else(|| "test:latest".to_string()),
            commands: body.commands.unwrap_or_else(|| vec!["echo".to_string(), "test".to_string()]),
            created_at: Some(chrono::Utc::now()),
            executor_id: body.executor_id.unwrap_or(None),
            source: body.source.unwrap_or(None),
        };
        Ok(Json(test_definition))
    }

    // Mock handler for test suites
    async fn mock_patch_test_suite(
        Path(id): Path<Uuid>,
        Json(body): Json<PatchTestSuiteRequest>,
    ) -> Result<Json<TestSuite>, StatusCode> {
        // Mock implementation that returns a test suite
        let test_suite = TestSuite {
            id,
            name: body.name.unwrap_or_else(|| "Test Suite".to_string()),
            description: body.description.unwrap_or_else(|| Some("Test suite description".to_string())),
            execution_mode: body.execution_mode.unwrap_or_else(|| "sequential".to_string()),
            labels: body.labels.unwrap_or_else(|| vec!["test".to_string()]),
            test_definition_ids: body.test_definition_ids.unwrap_or_else(|| vec![]),
            created_at: Some(chrono::Utc::now()),
        };
        Ok(Json(test_suite))
    }

    #[tokio::test]
    async fn test_patch_test_definition_route_exists() {
        let app = create_mock_app().await;
        let test_id = Uuid::new_v4();
        
        let patch_body = json!({
            "name": "Updated Test Definition"
        });

        let response = app
            .oneshot(
                Request::builder()
                    .method(Method::PATCH)
                    .uri(format!("/api/test-definitions/{}", test_id))
                    .header("content-type", "application/json")
                    .body(Body::from(patch_body.to_string()))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn test_patch_test_definition_with_all_fields() {
        let app = create_mock_app().await;
        let test_id = Uuid::new_v4();
        let executor_id = Uuid::new_v4();
        
        let patch_body = json!({
            "name": "Updated Test Definition",
            "description": "Updated description",
            "image": "updated:latest",
            "commands": ["echo", "updated"],
            "executor_id": executor_id
        });

        let response = app
            .oneshot(
                Request::builder()
                    .method(Method::PATCH)
                    .uri(format!("/api/test-definitions/{}", test_id))
                    .header("content-type", "application/json")
                    .body(Body::from(patch_body.to_string()))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
        
        let body = to_bytes(response.into_body(), usize::MAX).await.unwrap();
        let response_json: serde_json::Value = serde_json::from_slice(&body).unwrap();
        
        assert_eq!(response_json["name"], "Updated Test Definition");
        assert_eq!(response_json["description"], "Updated description");
        assert_eq!(response_json["image"], "updated:latest");
        assert_eq!(response_json["commands"], json!(["echo", "updated"]));
        assert_eq!(response_json["executor_id"], json!(executor_id));
    }

    #[tokio::test]
    async fn test_patch_test_definition_with_partial_fields() {
        let app = create_mock_app().await;
        let test_id = Uuid::new_v4();
        
        let patch_body = json!({
            "name": "Only Name Updated"
        });

        let response = app
            .oneshot(
                Request::builder()
                    .method(Method::PATCH)
                    .uri(format!("/api/test-definitions/{}", test_id))
                    .header("content-type", "application/json")
                    .body(Body::from(patch_body.to_string()))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
        
        let body = to_bytes(response.into_body(), usize::MAX).await.unwrap();
        let response_json: serde_json::Value = serde_json::from_slice(&body).unwrap();
        
        assert_eq!(response_json["name"], "Only Name Updated");
        // Other fields should have default values from the mock
        assert_eq!(response_json["image"], "test:latest");
    }

    #[tokio::test]
    async fn test_patch_test_definition_with_null_description() {
        let app = create_mock_app().await;
        let test_id = Uuid::new_v4();
        
        let patch_body = json!({
            "name": "Test with null description",
            "description": null
        });

        let response = app
            .oneshot(
                Request::builder()
                    .method(Method::PATCH)
                    .uri(format!("/api/test-definitions/{}", test_id))
                    .header("content-type", "application/json")
                    .body(Body::from(patch_body.to_string()))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn test_patch_test_definition_with_empty_body() {
        let app = create_mock_app().await;
        let test_id = Uuid::new_v4();
        
        let patch_body = json!({});

        let response = app
            .oneshot(
                Request::builder()
                    .method(Method::PATCH)
                    .uri(format!("/api/test-definitions/{}", test_id))
                    .header("content-type", "application/json")
                    .body(Body::from(patch_body.to_string()))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn test_patch_test_definition_with_invalid_json() {
        let app = create_mock_app().await;
        let test_id = Uuid::new_v4();
        
        let invalid_json = "{ invalid json }";

        let response = app
            .oneshot(
                Request::builder()
                    .method(Method::PATCH)
                    .uri(format!("/api/test-definitions/{}", test_id))
                    .header("content-type", "application/json")
                    .body(Body::from(invalid_json))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::BAD_REQUEST);
    }

    #[tokio::test]
    async fn test_patch_test_suite_route_exists() {
        let app = create_mock_app().await;
        let test_id = Uuid::new_v4();
        
        let patch_body = json!({
            "name": "Updated Test Suite"
        });

        let response = app
            .oneshot(
                Request::builder()
                    .method(Method::PATCH)
                    .uri(format!("/api/test-suites/{}", test_id))
                    .header("content-type", "application/json")
                    .body(Body::from(patch_body.to_string()))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn test_patch_test_suite_with_all_fields() {
        let app = create_mock_app().await;
        let test_id = Uuid::new_v4();
        let def_id1 = Uuid::new_v4();
        let def_id2 = Uuid::new_v4();
        
        let patch_body = json!({
            "name": "Updated Test Suite",
            "description": "Updated suite description",
            "execution_mode": "parallel",
            "labels": ["updated", "test"],
            "test_definition_ids": [def_id1, def_id2]
        });

        let response = app
            .oneshot(
                Request::builder()
                    .method(Method::PATCH)
                    .uri(format!("/api/test-suites/{}", test_id))
                    .header("content-type", "application/json")
                    .body(Body::from(patch_body.to_string()))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
        
        let body = to_bytes(response.into_body(), usize::MAX).await.unwrap();
        let response_json: serde_json::Value = serde_json::from_slice(&body).unwrap();
        
        assert_eq!(response_json["name"], "Updated Test Suite");
        assert_eq!(response_json["description"], "Updated suite description");
        assert_eq!(response_json["execution_mode"], "parallel");
        assert_eq!(response_json["labels"], json!(["updated", "test"]));
        assert_eq!(response_json["test_definition_ids"], json!([def_id1, def_id2]));
    }

    #[tokio::test]
    async fn test_patch_test_suite_with_partial_fields() {
        let app = create_mock_app().await;
        let test_id = Uuid::new_v4();
        
        let patch_body = json!({
            "execution_mode": "parallel"
        });

        let response = app
            .oneshot(
                Request::builder()
                    .method(Method::PATCH)
                    .uri(format!("/api/test-suites/{}", test_id))
                    .header("content-type", "application/json")
                    .body(Body::from(patch_body.to_string()))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
        
        let body = to_bytes(response.into_body(), usize::MAX).await.unwrap();
        let response_json: serde_json::Value = serde_json::from_slice(&body).unwrap();
        
        assert_eq!(response_json["execution_mode"], "parallel");
        // Other fields should have default values from the mock
        assert_eq!(response_json["name"], "Test Suite");
    }

    #[tokio::test]
    async fn test_patch_test_suite_with_empty_arrays() {
        let app = create_mock_app().await;
        let test_id = Uuid::new_v4();
        
        let patch_body = json!({
            "labels": [],
            "test_definition_ids": []
        });

        let response = app
            .oneshot(
                Request::builder()
                    .method(Method::PATCH)
                    .uri(format!("/api/test-suites/{}", test_id))
                    .header("content-type", "application/json")
                    .body(Body::from(patch_body.to_string()))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
        
        let body = to_bytes(response.into_body(), usize::MAX).await.unwrap();
        let response_json: serde_json::Value = serde_json::from_slice(&body).unwrap();
        
        assert_eq!(response_json["labels"], json!([]));
        assert_eq!(response_json["test_definition_ids"], json!([]));
    }

    #[tokio::test]
    async fn test_patch_test_suite_with_invalid_execution_mode() {
        let app = create_mock_app().await;
        let test_id = Uuid::new_v4();
        
        let patch_body = json!({
            "execution_mode": "invalid_mode"
        });

        let response = app
            .oneshot(
                Request::builder()
                    .method(Method::PATCH)
                    .uri(format!("/api/test-suites/{}", test_id))
                    .header("content-type", "application/json")
                    .body(Body::from(patch_body.to_string()))
                    .unwrap(),
            )
            .await
            .unwrap();

        // Should still accept the request, but validation could be added in the handler
        assert_eq!(response.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn test_patch_with_malformed_uuid() {
        let app = create_mock_app().await;
        
        let patch_body = json!({
            "name": "Test"
        });

        let response = app
            .oneshot(
                Request::builder()
                    .method(Method::PATCH)
                    .uri("/api/test-definitions/invalid-uuid")
                    .header("content-type", "application/json")
                    .body(Body::from(patch_body.to_string()))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::BAD_REQUEST);
    }

    #[tokio::test]
    async fn test_patch_test_definition_with_large_payload() {
        let app = create_mock_app().await;
        let test_id = Uuid::new_v4();
        
        // Create a large commands array
        let large_commands: Vec<String> = (0..1000).map(|i| format!("command-{}", i)).collect();
        
        let patch_body = json!({
            "commands": large_commands
        });

        let response = app
            .oneshot(
                Request::builder()
                    .method(Method::PATCH)
                    .uri(format!("/api/test-definitions/{}", test_id))
                    .header("content-type", "application/json")
                    .body(Body::from(patch_body.to_string()))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn test_patch_test_suite_with_many_test_definitions() {
        let app = create_mock_app().await;
        let test_id = Uuid::new_v4();
        
        // Create many test definition IDs
        let many_ids: Vec<Uuid> = (0..100).map(|_| Uuid::new_v4()).collect();
        
        let patch_body = json!({
            "test_definition_ids": many_ids
        });

        let response = app
            .oneshot(
                Request::builder()
                    .method(Method::PATCH)
                    .uri(format!("/api/test-suites/{}", test_id))
                    .header("content-type", "application/json")
                    .body(Body::from(patch_body.to_string()))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn test_patch_test_definition_with_special_characters() {
        let app = create_mock_app().await;
        let test_id = Uuid::new_v4();
        
        let patch_body = json!({
            "name": "Test with special chars: !@#$%^&*()_+-=[]{}|;':\",./<>?",
            "description": "Description with unicode: 🚀 émojis and 中文",
            "commands": ["echo 'Hello, world!'", "echo \"Double quotes\"", "echo `backticks`"]
        });

        let response = app
            .oneshot(
                Request::builder()
                    .method(Method::PATCH)
                    .uri(format!("/api/test-definitions/{}", test_id))
                    .header("content-type", "application/json")
                    .body(Body::from(patch_body.to_string()))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn test_patch_test_suite_with_duplicate_test_definition_ids() {
        let app = create_mock_app().await;
        let test_id = Uuid::new_v4();
        let def_id = Uuid::new_v4();
        
        let patch_body = json!({
            "test_definition_ids": [def_id, def_id, def_id]
        });

        let response = app
            .oneshot(
                Request::builder()
                    .method(Method::PATCH)
                    .uri(format!("/api/test-suites/{}", test_id))
                    .header("content-type", "application/json")
                    .body(Body::from(patch_body.to_string()))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn test_patch_with_content_type_variations() {
        let app = create_mock_app().await;
        let test_id = Uuid::new_v4();
        
        let patch_body = json!({
            "name": "Test"
        });

        // Test with different content types
        for content_type in ["application/json", "application/json; charset=utf-8"] {
            let response = app
                .clone()
                .oneshot(
                    Request::builder()
                        .method(Method::PATCH)
                        .uri(format!("/api/test-definitions/{}", test_id))
                        .header("content-type", content_type)
                        .body(Body::from(patch_body.to_string()))
                        .unwrap(),
                )
                .await
                .unwrap();

            assert_eq!(response.status(), StatusCode::OK);
        }
    }

    #[tokio::test]
    async fn test_patch_without_content_type() {
        let app = create_mock_app().await;
        let test_id = Uuid::new_v4();
        
        let patch_body = json!({
            "name": "Test"
        });

        let response = app
            .oneshot(
                Request::builder()
                    .method(Method::PATCH)
                    .uri(format!("/api/test-definitions/{}", test_id))
                    .body(Body::from(patch_body.to_string()))
                    .unwrap(),
            )
            .await
            .unwrap();

        // Should fail with missing content-type for JSON
        assert_eq!(response.status(), StatusCode::UNSUPPORTED_MEDIA_TYPE);
    }

    #[tokio::test]
    async fn test_patch_with_wrong_content_type() {
        let app = create_mock_app().await;
        let test_id = Uuid::new_v4();
        
        let patch_body = json!({
            "name": "Test"
        });

        let response = app
            .oneshot(
                Request::builder()
                    .method(Method::PATCH)
                    .uri(format!("/api/test-definitions/{}", test_id))
                    .header("content-type", "text/plain")
                    .body(Body::from(patch_body.to_string()))
                    .unwrap(),
            )
            .await
            .unwrap();

        // Should fail with wrong content type
        assert_eq!(response.status(), StatusCode::UNSUPPORTED_MEDIA_TYPE);
    }
}

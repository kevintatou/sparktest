mod k8s;

use axum::{
    extract::{Path, State},
    routing::{get},
    Json, Router,
    http::StatusCode,
};
use chrono::Utc;
use k8s::{create_k8s_job, monitor_job_and_update_status};
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
use log::{info, warn, error};

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
    sqlx::query("INSERT INTO test_executors (id, name, image, command, supported_file_types, env_vars, description) VALUES ($1, $2, $3, $4, $5, $6, $7)")
        .bind(&body.id)
        .bind(&body.name)
        .bind(&body.image)
        .bind(&body.default_command)
        .bind(&body.supported_file_types)
        .bind(&body.environment_variables)
        .bind(&body.description)
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

async fn create_test_definition(State(pool): State<PgPool>, Json(body): Json<TestDefinition>) -> Result<Json<TestDefinition>, StatusCode> {
    let result = sqlx::query_as::<_, TestDefinition>(
        "INSERT INTO test_definitions (id, name, description, image, commands, executor_id) 
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, name, description, image, commands, created_at, executor_id"
    )
    .bind(&body.id)
    .bind(&body.name)
    .bind(&body.description)
    .bind(&body.image)
    .bind(&body.commands)
    .bind(&body.executor_id)
    .fetch_one(&pool)
    .await
    .map_err(|e| {
        eprintln!("Error creating test definition: {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;
    
    Ok(Json(result))
}

async fn update_test_definition(Path(id): Path<Uuid>, State(pool): State<PgPool>, Json(body): Json<TestDefinition>) -> Result<Json<TestDefinition>, StatusCode> {
    let result = sqlx::query_as::<_, TestDefinition>(
        "UPDATE test_definitions 
         SET name = $1, description = $2, image = $3, commands = $4, executor_id = $5 
         WHERE id = $6
         RETURNING id, name, description, image, commands, created_at, executor_id"
    )
    .bind(&body.name)
    .bind(&body.description)
    .bind(&body.image)
    .bind(&body.commands)
    .bind(&body.executor_id)
    .bind(id)
    .fetch_one(&pool)
    .await
    .map_err(|e| {
        eprintln!("Error updating test definition: {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;
    
    Ok(Json(result))
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
    let name = payload.name.unwrap_or_else(|| def.name.clone());
    let image = payload.image.unwrap_or_else(|| def.image.clone());
    let command = payload.commands.unwrap_or_else(|| def.commands.clone());
    let job_name = format!("sparktest-job-{}", run_id.simple());

    sqlx::query("INSERT INTO test_runs (id, name, image, command, status, created_at, test_definition_id, duration, logs, executor_id) VALUES ($1, $2, $3, $4, 'running', $5, $6, NULL, NULL, $7)")
        .bind(run_id)
        .bind(&name)
        .bind(&image)
        .bind(&command)
        .bind(Utc::now())
        .bind(def.id)
        .bind(&def.executor_id)
        .execute(&pool)
        .await
        .map_err(|e| {
            eprintln!("Error creating test run: {:?}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

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

    // Clone the repo
    Repository::clone(repo_url, &repo_path)?;

    let tests_dir = repo_path.join("tests");
    if !tests_dir.exists() {
        log::warn!("No /tests directory in repo {}", repo_url);
        return Ok(());
    }

    for entry in fs::read_dir(&tests_dir)? {
        let entry = entry?;
        let path = entry.path();
        if path.extension().and_then(|s| s.to_str()) == Some("json") {
            let file_content = fs::read_to_string(&path)?;
            match serde_json::from_str::<Value>(&file_content) {
                Ok(json) => {
                    if let Err(e) = upsert_test_definition_from_json(json, pool).await {
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

async fn upsert_test_definition_from_json(json: Value, pool: &PgPool) -> Result<(), sqlx::Error> {
    // Extract fields (adjust as needed)
    let name = json.get("name").and_then(|v| v.as_str()).unwrap_or("Unnamed");
    let image = json.get("image").and_then(|v| v.as_str()).unwrap_or("ubuntu:latest");
    let commands = json.get("commands").and_then(|v| v.as_array())
        .map(|arr| arr.iter().filter_map(|v| v.as_str().map(|s| s.to_string())).collect::<Vec<_>>())
        .unwrap_or_else(|| vec!["echo Hello".to_string()]);
    let description = json.get("description").and_then(|v| v.as_str());

    // Upsert by name
    let existing = sqlx::query!("SELECT id FROM test_definitions WHERE name = $1", name)
        .fetch_optional(pool)
        .await?;

    if let Some(row) = existing {
        sqlx::query!("UPDATE test_definitions SET image = $1, commands = $2, description = $3 WHERE id = $4",
            image, &commands, description, row.id)
            .execute(pool)
            .await?;
        log::info!("Updated test definition '{}'", name);
    } else {
        let id = uuid::Uuid::new_v4();
        sqlx::query!("INSERT INTO test_definitions (id, name, image, commands, description) VALUES ($1, $2, $3, $4, $5)",
            id, name, image, &commands, description)
            .execute(pool)
            .await?;
        log::info!("Inserted new test definition '{}'", name);
    }
    Ok(())
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
        .route("/api/test-definitions/:id", get(get_test_definition).put(update_test_definition).delete(delete_test_definition))
        .route("/api/test-runs", get(get_test_runs).post(create_test_run))
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
        };

        let json = serde_json::to_string(&definition).unwrap();
        assert!(json.contains("Test Definition"));
        assert!(json.contains("nginx:latest"));

        let deserialized: TestDefinition = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.name, definition.name);
        assert_eq!(deserialized.image, definition.image);
        assert_eq!(deserialized.commands, definition.commands);
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
}

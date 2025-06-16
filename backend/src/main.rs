use axum::{
    Json, Router,
    extract::{Path, State},
    routing::{delete, get, post, put},
};
use chrono::Utc;
use k8s_openapi::api::batch::v1::Job;
use kube::api::PostParams;
use kube::{Api, Client, ResourceExt};
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, PgPool, postgres::PgPoolOptions};
use std::net::SocketAddr;
use tokio::net::TcpListener;
use tower_http::cors::{Any, CorsLayer};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone, FromRow)]
struct TestDefinition {
    id: Uuid,
    name: String,
    description: Option<String>,
    image: String,
    commands: Vec<String>,
    created_at: Option<chrono::DateTime<chrono::Utc>>,
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
}

#[derive(Debug, Serialize, Deserialize)]
struct CreateTestRunRequest {
    test_definition_id: Uuid,
    name: Option<String>,
    image: Option<String>,
    commands: Option<Vec<String>>,
}

use std::time::Duration;
use k8s_openapi::api::core::v1::Pod;
use kube::api::ListParams;

async fn monitor_job_and_update_status(
    run_id: Uuid,
    job_name: String,
    pool: PgPool,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let client = Client::try_default().await?;
    let jobs: Api<Job> = Api::namespaced(client.clone(), "default");
    let pods: Api<Pod> = Api::namespaced(client.clone(), "default");

    let mut attempt = 0;
    while attempt < 30 {
        let job = jobs.get(&job_name).await?;

        match job.status {
            Some(ref status) if status.succeeded.unwrap_or(0) >= 1 => {
                // Job succeeded, check pod exit code
                let selector = format!("job-name={}", job_name);
                if let Some(pod) = pods.list(&ListParams::default().labels(&selector)).await?.items.first() {
                    let exit_code = pod.status
                        .as_ref()
                        .and_then(|s| s.container_statuses.as_ref())
                        .and_then(|cs| cs.first())
                        .and_then(|c| c.state.as_ref())
                        .and_then(|s| s.terminated.as_ref())
                        .map(|t| t.exit_code);

                    if exit_code != Some(0) {
                        sqlx::query("UPDATE test_runs SET status = 'failed' WHERE id = $1")
                            .bind(run_id)
                            .execute(&pool)
                            .await?;
                        return Ok(());
                    }
                }

                sqlx::query("UPDATE test_runs SET status = 'completed' WHERE id = $1")
                    .bind(run_id)
                    .execute(&pool)
                    .await?;
                return Ok(());
            }

            Some(ref status) if status.failed.unwrap_or(0) >= 1 => {
                sqlx::query("UPDATE test_runs SET status = 'failed' WHERE id = $1")
                    .bind(run_id)
                    .execute(&pool)
                    .await?;
                return Ok(());
            }

            _ => {
                // Job still pending or running
                tokio::time::sleep(Duration::from_secs(5)).await;
                attempt += 1;
            }
        }
    }

    // Timed out
    sqlx::query("UPDATE test_runs SET status = 'failed' WHERE id = $1")
        .bind(run_id)
        .execute(&pool)
        .await?;

    Ok(())
}

async fn root_handler() -> &'static str {
    "✅ SparkTest Rust backend is running"
}

async fn health_handler() -> Json<&'static str> {
    Json("OK")
}

async fn get_test_definitions(
    State(pool): State<PgPool>,
) -> Result<Json<Vec<TestDefinition>>, (axum::http::StatusCode, String)> {
    let result = sqlx::query_as::<_, TestDefinition>("SELECT * FROM test_definitions")
        .fetch_all(&pool)
        .await
        .map_err(|e| (axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    Ok(Json(result))
}

async fn get_test_definition(
    Path(id): Path<Uuid>,
    State(pool): State<PgPool>,
) -> Result<Json<TestDefinition>, (axum::http::StatusCode, String)> {
    let result =
        sqlx::query_as::<_, TestDefinition>("SELECT * FROM test_definitions WHERE id = $1")
            .bind(id)
            .fetch_one(&pool)
            .await
            .map_err(|e| (axum::http::StatusCode::NOT_FOUND, e.to_string()))?;
    Ok(Json(result))
}

async fn create_test_definition(
    State(pool): State<PgPool>,
    Json(body): Json<TestDefinition>,
) -> Result<Json<&'static str>, (axum::http::StatusCode, String)> {
    sqlx::query(
        "INSERT INTO test_definitions (id, name, description, image, commands)
         VALUES ($1, $2, $3, $4, $5)",
    )
    .bind(&body.id)
    .bind(&body.name)
    .bind(&body.description)
    .bind(&body.image)
    .bind(&body.commands)
    .execute(&pool)
    .await
    .map_err(|e| (axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json("Created test definition"))
}

async fn update_test_definition(
    Path(id): Path<Uuid>,
    State(pool): State<PgPool>,
    Json(body): Json<TestDefinition>,
) -> Result<Json<&'static str>, (axum::http::StatusCode, String)> {
    sqlx::query(
        "UPDATE test_definitions SET name = $1, description = $2, image = $3, commands = $4 WHERE id = $5",
    )
    .bind(&body.name)
    .bind(&body.description)
    .bind(&body.image)
    .bind(&body.commands)
    .bind(id)
    .execute(&pool)
    .await
    .map_err(|e| (axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json("Updated test definition"))
}

async fn delete_test_definition(
    Path(id): Path<Uuid>,
    State(pool): State<PgPool>,
) -> Result<Json<&'static str>, (axum::http::StatusCode, String)> {
    sqlx::query("DELETE FROM test_definitions WHERE id = $1")
        .bind(id)
        .execute(&pool)
        .await
        .map_err(|e| (axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json("Deleted test definition"))
}

async fn get_test_runs(
    State(pool): State<PgPool>,
) -> Result<Json<Vec<TestRun>>, (axum::http::StatusCode, String)> {
    let result = sqlx::query_as::<_, TestRun>("SELECT * FROM test_runs")
        .fetch_all(&pool)
        .await
        .map_err(|e| (axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    Ok(Json(result))
}

async fn create_test_run(
    State(pool): State<PgPool>,
    Json(payload): Json<CreateTestRunRequest>,
) -> Result<Json<&'static str>, (axum::http::StatusCode, String)> {
    let definition = match sqlx::query_as::<_, TestDefinition>(
        "SELECT * FROM test_definitions WHERE id = $1",
    )
    .bind(payload.test_definition_id)
    .fetch_one(&pool)
    .await
    {
        Ok(def) => def,
        Err(e) => {
            eprintln!("❌ Failed to fetch test definition: {}", e);
            return Err((axum::http::StatusCode::NOT_FOUND, e.to_string()));
        }
    };

    let run_name = payload.name.clone().unwrap_or_else(|| definition.name.clone());
    let run_image = payload.image.clone().unwrap_or_else(|| definition.image.clone());
    let run_commands = payload.commands.clone().unwrap_or_else(|| definition.commands.clone());
    let run_id = Uuid::new_v4();
    let job_name = format!("sparktest-job-{}", run_id.simple());

    // First insert the test run
    sqlx::query(
        "INSERT INTO test_runs (id, name, image, command, status, created_at, test_definition_id, duration, logs)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)"
    )
    .bind(&run_id)
    .bind(&run_name)
    .bind(&run_image)
    .bind(&run_commands)
    .bind("running")
    .bind(Utc::now())
    .bind(definition.id)
    .bind(None::<i32>)
    .bind(None::<Vec<String>>)
    .execute(&pool)
    .await
    .map_err(|e| {
        eprintln!("❌ Failed to insert test run: {}", e);
        (axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
    })?;

    // Then create the Kubernetes job
    let client = Client::try_default().await.map_err(|e| {
        eprintln!("❌ Failed to initialize Kubernetes client: {}", e);
        (axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
    })?;

    let jobs: Api<Job> = Api::namespaced(client, "default");

    let job = Job {
        metadata: kube::core::ObjectMeta {
            name: Some(job_name.clone()),
            ..Default::default()
        },
        spec: Some(k8s_openapi::api::batch::v1::JobSpec {
            template: k8s_openapi::api::core::v1::PodTemplateSpec {
                metadata: None,
                spec: Some(k8s_openapi::api::core::v1::PodSpec {
                    restart_policy: Some("Never".into()),
                    containers: vec![k8s_openapi::api::core::v1::Container {
                        name: "runner".into(),
                        image: Some(run_image.clone()),
                        command: Some(run_commands.clone()),
                        ..Default::default()
                    }],
                    ..Default::default()
                }),
            },
            backoff_limit: Some(0),
            ..Default::default()
        }),
        ..Default::default()
    };

    let create_result = jobs.create(&PostParams::default(), &job).await;

    if let Err(e) = create_result {
        eprintln!("❌ Failed to create job in Kubernetes: {}", e);
        let _ = sqlx::query("UPDATE test_runs SET status = 'failed' WHERE id = $1")
            .bind(run_id)
            .execute(&pool)
            .await;

        return Err((axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string()));
    }

    println!("✅ Kubernetes job {} created", job_name);

    let pool_clone = pool.clone();
    tokio::spawn(async move {
        if let Err(e) = monitor_job_and_update_status(run_id, job_name.clone(), pool_clone).await {
            eprintln!("❌ Monitoring error: {}", e);
        } else {
            println!("✅ Monitoring complete for job {}", job_name);
        }
    });

    Ok(Json("Kubernetes job created"))
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

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
        .route(
            "/api/test-definitions",
            get(get_test_definitions).post(create_test_definition),
        )
        .route(
            "/api/test-definitions/:id",
            get(get_test_definition)
                .put(update_test_definition)
                .delete(delete_test_definition),
        )
        .route("/api/test-runs", get(get_test_runs).post(create_test_run))
        .with_state(pool)
        .layer(cors);

    let addr = SocketAddr::from(([127, 0, 0, 1], 3001));
    println!("🚀 SparkTest backend running at http://{}", addr);

    let listener = TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

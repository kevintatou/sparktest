mod k8s;

use axum::{
    extract::{Path, State},
    routing::{delete, get, post, put},
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

#[derive(Debug, Serialize, Deserialize, Clone, FromRow)]
struct Executor {
    id: Uuid,
    name: String,
    image: String,
    command: Vec<String>,
    supported_file_types: Vec<String>,
    env_vars: Vec<String>,
    description: Option<String>,
}

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

// Health check
async fn root_handler() -> &'static str {
    "✅ SparkTest Rust backend is running"
}

async fn health_handler() -> Json<&'static str> {
    Json("OK")
}

// ---------------------- Executors ----------------------

async fn get_executors(State(pool): State<PgPool>) -> Result<Json<Vec<Executor>>, StatusCode> {
    let rows = sqlx::query_as::<_, Executor>("SELECT * FROM executors")
        .fetch_all(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(rows))
}

async fn get_executor(Path(id): Path<Uuid>, State(pool): State<PgPool>) -> Result<Json<Executor>, StatusCode> {
    let row = sqlx::query_as::<_, Executor>("SELECT * FROM executors WHERE id = $1")
        .bind(id)
        .fetch_one(&pool)
        .await
        .map_err(|_| StatusCode::NOT_FOUND)?;
    Ok(Json(row))
}

async fn create_executor(State(pool): State<PgPool>, Json(body): Json<Executor>) -> Result<Json<&'static str>, StatusCode> {
    sqlx::query("INSERT INTO executors (id, name, image, command, supported_file_types, env_vars, description) VALUES ($1, $2, $3, $4, $5, $6, $7)")
        .bind(&body.id)
        .bind(&body.name)
        .bind(&body.image)
        .bind(&body.command)
        .bind(&body.supported_file_types)
        .bind(&body.env_vars)
        .bind(&body.description)
        .execute(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json("Executor created"))
}

async fn delete_executor(Path(id): Path<Uuid>, State(pool): State<PgPool>) -> Result<Json<&'static str>, StatusCode> {
    sqlx::query("DELETE FROM executors WHERE id = $1")
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

async fn create_test_definition(State(pool): State<PgPool>, Json(body): Json<TestDefinition>) -> Result<Json<&'static str>, StatusCode> {
    sqlx::query("INSERT INTO test_definitions (id, name, description, image, commands) VALUES ($1, $2, $3, $4, $5)")
        .bind(&body.id)
        .bind(&body.name)
        .bind(&body.description)
        .bind(&body.image)
        .bind(&body.commands)
        .execute(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json("Created test definition"))
}

async fn update_test_definition(Path(id): Path<Uuid>, State(pool): State<PgPool>, Json(body): Json<TestDefinition>) -> Result<Json<&'static str>, StatusCode> {
    sqlx::query("UPDATE test_definitions SET name = $1, description = $2, image = $3, commands = $4 WHERE id = $5")
        .bind(&body.name)
        .bind(&body.description)
        .bind(&body.image)
        .bind(&body.commands)
        .bind(id)
        .execute(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json("Updated test definition"))
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

async fn create_test_run(State(pool): State<PgPool>, Json(payload): Json<CreateTestRunRequest>) -> Result<Json<&'static str>, StatusCode> {
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

    sqlx::query("INSERT INTO test_runs (id, name, image, command, status, created_at, test_definition_id, duration, logs) VALUES ($1, $2, $3, $4, 'running', $5, $6, NULL, NULL)")
        .bind(run_id)
        .bind(&name)
        .bind(&image)
        .bind(&command)
        .bind(Utc::now())
        .bind(def.id)
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

    Ok(Json("Kubernetes job created"))
}

// ---------------------- Start App ----------------------

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
        .route("/api/executors", get(get_executors).post(create_executor))
        .route("/api/executors/:id", get(get_executor).delete(delete_executor))
        .route("/api/test-definitions", get(get_test_definitions).post(create_test_definition))
        .route("/api/test-definitions/:id", get(get_test_definition).put(update_test_definition).delete(delete_test_definition))
        .route("/api/test-runs", get(get_test_runs).post(create_test_run))
        .with_state(pool)
        .layer(cors);

    let addr = SocketAddr::from(([127, 0, 0, 1], 3001));
    println!("🚀 SparkTest backend running at http://{}", addr);

    let listener = TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

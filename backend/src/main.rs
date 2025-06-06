use axum::{
    extract::State,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use sqlx::{postgres::PgPoolOptions, PgPool, FromRow};
use std::{collections::HashMap, net::SocketAddr};
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
}

async fn root_handler() -> &'static str {
    "✅ SparkTest Rust backend is running"
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
        .allow_origin(Any) // Or: .allow_origin("http://localhost:3000".parse().unwrap())
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/", get(root_handler))
        .route(
            "/api/test-definitions",
            get(get_test_definitions).post(create_test_definition),
        )
        .with_state(pool)
        .layer(cors);

    let addr = SocketAddr::from(([127, 0, 0, 1], 3001));
    println!("🚀 SparkTest backend running at http://{}", addr);

    let listener = TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

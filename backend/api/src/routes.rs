use crate::handlers::*;
use axum::{
    routing::{delete, get},
    Router,
};
use tower_http::cors::CorsLayer;

pub fn create_app() -> Router {
    let api_routes = Router::new()
        .route("/health", get(health_check))
        .route("/runs", get(get_runs).post(create_run))
        .route("/runs/:id", get(get_run).delete(delete_run))
        .route("/test-runs", get(get_runs).post(create_run))
        .route("/test-runs/:id", get(get_run).delete(delete_run))
        .route("/test-definitions", get(get_definitions))
        .route("/test-executors", get(get_executors))
        .route("/test-suites", get(get_suites))
        .route("/k8s/health", get(k8s_health))
        .route("/k8s/logs/:job_name", get(get_job_logs))
        .route("/k8s/status/:job_name", get(get_job_status))
        .route("/k8s/jobs/:job_name", delete(delete_job));

    Router::new()
        .nest("/api", api_routes)
        .layer(CorsLayer::permissive())
}

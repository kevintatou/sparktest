use axum::{
    routing::{get, post, delete},
    Router,
};
use tower_http::cors::CorsLayer;
use crate::handlers::*;

pub fn create_app() -> Router {
    Router::new()
        .route("/health", get(health_check))
        .route("/runs", get(get_runs).post(create_run))
        .route("/runs/:id", get(get_run).delete(delete_run))
        .route("/k8s/health", get(k8s_health))
        .route("/k8s/logs/:job_name", get(get_job_logs))
        .route("/k8s/status/:job_name", get(get_job_status))
        .route("/k8s/jobs/:job_name", delete(delete_job))
        .layer(CorsLayer::permissive())
}
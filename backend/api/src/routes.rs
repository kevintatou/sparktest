use crate::handlers::*;
use axum::{
    routing::{delete, get, post},
    Extension, Router,
};
use sqlx::PgPool;
use tower_http::cors::CorsLayer;

pub fn create_app(pool: PgPool) -> Router {
    let api_routes = Router::new()
        .route("/health", get(health_check))
        .route("/runs", get(get_runs).post(create_run))
        .route("/runs/:id", get(get_run).delete(delete_run))
        .route("/test-runs", get(get_runs).post(create_run))
        .route("/test-runs/:id", get(get_run).delete(delete_run))
        .route(
            "/test-definitions",
            get(get_definitions).post(create_definition),
        )
        .route(
            "/test-definitions/:id",
            get(get_definition)
                .put(update_definition)
                .delete(delete_definition),
        )
        .route("/test-definitions/:id/run", post(run_definition))
        .route("/test-executors", get(get_executors).post(create_executor))
        .route(
            "/test-executors/:id",
            get(get_executor)
                .put(update_executor)
                .delete(delete_executor),
        )
        .route("/test-suites", get(get_suites).post(create_suite))
        .route(
            "/test-suites/:id",
            get(get_suite).put(update_suite).delete(delete_suite),
        )
        .route("/test-suites/:id/run", post(run_suite))
        .route("/k8s/health", get(k8s_health))
        .route("/k8s/logs/:job_name", get(get_job_logs))
        .route("/k8s/status/:job_name", get(get_job_status))
        .route("/k8s/jobs", get(list_jobs))
        .route("/k8s/jobs/:job_name", delete(delete_job));

    Router::new()
        .nest("/api", api_routes)
        .layer(Extension(pool))
        .layer(CorsLayer::permissive())
}

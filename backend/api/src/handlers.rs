use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::Json,
    Json as JsonBody,
};
use serde::{Deserialize, Serialize};
use sparktest_core::*;
use uuid::Uuid;
use crate::k8s::{KubernetesClient, JobLogs};
use std::sync::Arc;

#[derive(Serialize)]
pub struct HealthResponse {
    pub status: String,
    pub timestamp: String,
}

#[derive(Deserialize)]
pub struct CreateRunRequest {
    pub name: String,
    pub image: String,
    pub commands: Vec<String>,
}

pub async fn health_check() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "healthy".to_string(),
        timestamp: chrono::Utc::now().to_rfc3339(),
    })
}

pub async fn get_runs() -> Result<Json<Vec<TestRun>>, StatusCode> {
    // In a real implementation, this would fetch from database
    Ok(Json(vec![]))
}

pub async fn create_run(
    JsonBody(req): JsonBody<CreateRunRequest>,
) -> Result<Json<TestRun>, StatusCode> {
    // In a real implementation, this would create a run in the database
    let run = TestRun {
        id: Uuid::new_v4(),
        name: req.name,
        image: req.image,
        commands: req.commands,
        status: "pending".to_string(),
        created_at: chrono::Utc::now(),
        definition_id: None,
        executor_id: None,
        suite_id: None,
        variables: None,
        artifacts: None,
        duration: None,
        retries: None,
        logs: None,
        k8s_job_name: None,
        pod_scheduled: None,
        container_created: None,
        container_started: None,
        completed: None,
        failed: None,
    };

    Ok(Json(run))
}

pub async fn get_run(Path(id): Path<Uuid>) -> Result<Json<TestRun>, StatusCode> {
    // In a real implementation, this would fetch from database
    Err(StatusCode::NOT_FOUND)
}

pub async fn delete_run(Path(id): Path<Uuid>) -> Result<StatusCode, StatusCode> {
    // In a real implementation, this would delete from database
    Ok(StatusCode::NO_CONTENT)
}

pub async fn k8s_health() -> Json<serde_json::Value> {
    // Try to create a Kubernetes client and check connectivity
    match KubernetesClient::new().await {
        Ok(client) => {
            match client.health_check().await {
                Ok(is_connected) => {
                    Json(serde_json::json!({
                        "kubernetes_connected": is_connected,
                        "timestamp": chrono::Utc::now().to_rfc3339()
                    }))
                }
                Err(e) => {
                    tracing::warn!("Kubernetes health check failed: {}", e);
                    Json(serde_json::json!({
                        "kubernetes_connected": false,
                        "error": e.to_string(),
                        "timestamp": chrono::Utc::now().to_rfc3339()
                    }))
                }
            }
        }
        Err(e) => {
            tracing::warn!("Failed to create Kubernetes client: {}", e);
            Json(serde_json::json!({
                "kubernetes_connected": false,
                "error": e.to_string(),
                "timestamp": chrono::Utc::now().to_rfc3339()
            }))
        }
    }
}

pub async fn get_job_logs(Path(job_name): Path<String>) -> Result<Json<JobLogs>, StatusCode> {
    match KubernetesClient::new().await {
        Ok(client) => {
            match client.get_job_logs(&job_name).await {
                Ok(logs) => Ok(Json(logs)),
                Err(e) => {
                    tracing::error!("Failed to get job logs for {}: {}", job_name, e);
                    Err(StatusCode::NOT_FOUND)
                }
            }
        }
        Err(e) => {
            tracing::error!("Failed to create Kubernetes client: {}", e);
            Err(StatusCode::SERVICE_UNAVAILABLE)
        }
    }
}

pub async fn get_job_status(Path(job_name): Path<String>) -> Result<Json<serde_json::Value>, StatusCode> {
    match KubernetesClient::new().await {
        Ok(client) => {
            match client.get_job_status(&job_name).await {
                Ok(status) => Ok(Json(serde_json::json!({
                    "job_name": job_name,
                    "status": status,
                    "timestamp": chrono::Utc::now().to_rfc3339()
                }))),
                Err(e) => {
                    tracing::error!("Failed to get job status for {}: {}", job_name, e);
                    Err(StatusCode::NOT_FOUND)
                }
            }
        }
        Err(e) => {
            tracing::error!("Failed to create Kubernetes client: {}", e);
            Err(StatusCode::SERVICE_UNAVAILABLE)
        }
    }
}

pub async fn delete_job(Path(job_name): Path<String>) -> Result<Json<serde_json::Value>, StatusCode> {
    match KubernetesClient::new().await {
        Ok(client) => {
            match client.delete_job(&job_name).await {
                Ok(_) => Ok(Json(serde_json::json!({
                    "message": format!("Job {} deleted successfully", job_name),
                    "timestamp": chrono::Utc::now().to_rfc3339()
                }))),
                Err(e) => {
                    tracing::error!("Failed to delete job {}: {}", job_name, e);
                    Err(StatusCode::INTERNAL_SERVER_ERROR)
                }
            }
        }
        Err(e) => {
            tracing::error!("Failed to create Kubernetes client: {}", e);
            Err(StatusCode::SERVICE_UNAVAILABLE)
        }
    }
}

/// List all Kubernetes jobs with SparkTest labels
pub async fn list_k8s_jobs() -> Result<Json<serde_json::Value>, StatusCode> {
    match KubernetesClient::new().await {
        Ok(client) => {
            match client.list_sparktest_jobs().await {
                Ok(jobs) => Ok(Json(serde_json::json!({
                    "jobs": jobs,
                    "timestamp": chrono::Utc::now().to_rfc3339()
                }))),
                Err(e) => {
                    tracing::error!("Failed to list Kubernetes jobs: {}", e);
                    Err(StatusCode::INTERNAL_SERVER_ERROR)
                }
            }
        }
        Err(e) => {
            tracing::error!("Failed to create Kubernetes client: {}", e);
            Err(StatusCode::SERVICE_UNAVAILABLE)
        }
    }
}
use axum::{extract::Path, http::StatusCode, response::Json, Json as JsonBody};
use serde::{Deserialize, Serialize};
use sparktest_core::*;
use uuid::Uuid;

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

pub async fn get_run(Path(_id): Path<Uuid>) -> Result<Json<TestRun>, StatusCode> {
    // In a real implementation, this would fetch from database
    Err(StatusCode::NOT_FOUND)
}

pub async fn delete_run(Path(_id): Path<Uuid>) -> Result<StatusCode, StatusCode> {
    // In a real implementation, this would delete from database
    Ok(StatusCode::NO_CONTENT)
}

pub async fn k8s_health() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "kubernetes_connected": true,
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}

pub async fn get_job_logs(Path(job_name): Path<String>) -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "job_name": job_name,
        "pod_name": format!("pod-{}", job_name),
        "logs": "Sample log output",
        "timestamp": chrono::Utc::now().to_rfc3339(),
        "status": "completed"
    }))
}

pub async fn get_job_status(Path(job_name): Path<String>) -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "job_name": job_name,
        "status": "completed",
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}

pub async fn delete_job(Path(job_name): Path<String>) -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "message": format!("Job {} deleted successfully", job_name),
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::Json as JsonBody;

    #[tokio::test]
    async fn test_health_check() {
        let response = health_check().await;
        assert_eq!(response.0.status, "healthy");
        assert!(!response.0.timestamp.is_empty());
    }

    #[tokio::test]
    async fn test_get_runs() {
        let result = get_runs().await;
        assert!(result.is_ok());
        let runs = result.unwrap().0;
        assert_eq!(runs.len(), 0);
    }

    #[tokio::test]
    async fn test_create_run() {
        let request = CreateRunRequest {
            name: "Test Run".to_string(),
            image: "test:latest".to_string(),
            commands: vec!["echo".to_string(), "hello".to_string()],
        };

        let result = create_run(JsonBody(request)).await;
        assert!(result.is_ok());

        let run = result.unwrap().0;
        assert_eq!(run.name, "Test Run");
        assert_eq!(run.image, "test:latest");
        assert_eq!(run.status, "pending");
        assert_eq!(run.commands.len(), 2);
    }

    #[tokio::test]
    async fn test_get_run() {
        let id = Uuid::new_v4();
        let result = get_run(Path(id)).await;
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), StatusCode::NOT_FOUND);
    }

    #[tokio::test]
    async fn test_delete_run() {
        let id = Uuid::new_v4();
        let result = delete_run(Path(id)).await;
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), StatusCode::NO_CONTENT);
    }

    #[tokio::test]
    async fn test_k8s_health() {
        let response = k8s_health().await;
        let value = response.0;
        assert_eq!(value["kubernetes_connected"], true);
        assert!(value["timestamp"].is_string());
    }

    #[tokio::test]
    async fn test_get_job_logs() {
        let job_name = "test-job".to_string();
        let response = get_job_logs(Path(job_name.clone())).await;
        let value = response.0;
        assert_eq!(value["job_name"], job_name);
        assert_eq!(value["pod_name"], format!("pod-{}", job_name));
        assert_eq!(value["logs"], "Sample log output");
        assert_eq!(value["status"], "completed");
    }

    #[tokio::test]
    async fn test_get_job_status() {
        let job_name = "test-job".to_string();
        let response = get_job_status(Path(job_name.clone())).await;
        let value = response.0;
        assert_eq!(value["job_name"], job_name);
        assert_eq!(value["status"], "completed");
    }

    #[tokio::test]
    async fn test_delete_job() {
        let job_name = "test-job".to_string();
        let response = delete_job(Path(job_name.clone())).await;
        let value = response.0;
        assert_eq!(
            value["message"],
            format!("Job {} deleted successfully", job_name)
        );
    }
}

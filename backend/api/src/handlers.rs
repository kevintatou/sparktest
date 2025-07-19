use axum::{
    extract::Path,
    http::StatusCode,
    response::Json,
    Json as JsonBody,
};
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

pub async fn get_run(Path(id): Path<Uuid>) -> Result<Json<TestRun>, StatusCode> {
    // In a real implementation, this would fetch from database
    Err(StatusCode::NOT_FOUND)
}

pub async fn delete_run(Path(id): Path<Uuid>) -> Result<StatusCode, StatusCode> {
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
    use axum::{
        body::Body,
        http::{self, Request, StatusCode},
        Router,
    };
    use serde_json::Value;
    use tower::ServiceExt;

    fn app() -> Router {
        use axum::routing::{delete, get, post};
        
        Router::new()
            .route("/health", get(health_check))
            .route("/runs", get(get_runs))
            .route("/runs", post(create_run))
            .route("/runs/:id", get(get_run))
            .route("/runs/:id", delete(delete_run))
            .route("/k8s/health", get(k8s_health))
            .route("/k8s/jobs/:name/logs", get(get_job_logs))
            .route("/k8s/jobs/:name/status", get(get_job_status))
            .route("/k8s/jobs/:name", delete(delete_job))
    }

    #[tokio::test]
    async fn test_health_check() {
        let app = app();
        
        let response = app
            .oneshot(Request::builder().uri("/health").body(Body::empty()).unwrap())
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
        
        let body = axum::body::to_bytes(response.into_body(), usize::MAX).await.unwrap();
        let json: Value = serde_json::from_slice(&body).unwrap();
        
        assert_eq!(json["status"], "healthy");
        assert!(json["timestamp"].is_string());
    }

    #[tokio::test]
    async fn test_get_runs() {
        let app = app();
        
        let response = app
            .oneshot(Request::builder().uri("/runs").body(Body::empty()).unwrap())
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
        
        let body = axum::body::to_bytes(response.into_body(), usize::MAX).await.unwrap();
        let json: Value = serde_json::from_slice(&body).unwrap();
        
        assert!(json.is_array());
        assert_eq!(json.as_array().unwrap().len(), 0);
    }

    #[tokio::test]
    async fn test_create_run() {
        let app = app();
        
        let create_request = serde_json::json!({
            "name": "Test Run",
            "image": "test-image:latest",
            "commands": ["echo hello"]
        });
        
        let response = app
            .oneshot(
                Request::builder()
                    .method(http::Method::POST)
                    .uri("/runs")
                    .header(http::header::CONTENT_TYPE, "application/json")
                    .body(Body::from(serde_json::to_vec(&create_request).unwrap()))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
        
        let body = axum::body::to_bytes(response.into_body(), usize::MAX).await.unwrap();
        let json: Value = serde_json::from_slice(&body).unwrap();
        
        assert_eq!(json["name"], "Test Run");
        assert_eq!(json["image"], "test-image:latest");
        assert_eq!(json["commands"], serde_json::json!(["echo hello"]));
        assert_eq!(json["status"], "pending");
        assert!(json["id"].is_string());
        assert!(json["created_at"].is_string());
    }

    #[tokio::test]
    async fn test_get_run_not_found() {
        let app = app();
        let test_id = Uuid::new_v4();
        
        let response = app
            .oneshot(
                Request::builder()
                    .uri(&format!("/runs/{}", test_id))
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::NOT_FOUND);
    }

    #[tokio::test]
    async fn test_delete_run() {
        let app = app();
        let test_id = Uuid::new_v4();
        
        let response = app
            .oneshot(
                Request::builder()
                    .method(http::Method::DELETE)
                    .uri(&format!("/runs/{}", test_id))
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::NO_CONTENT);
    }

    #[tokio::test]
    async fn test_k8s_health() {
        let app = app();
        
        let response = app
            .oneshot(Request::builder().uri("/k8s/health").body(Body::empty()).unwrap())
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
        
        let body = axum::body::to_bytes(response.into_body(), usize::MAX).await.unwrap();
        let json: Value = serde_json::from_slice(&body).unwrap();
        
        assert_eq!(json["kubernetes_connected"], true);
        assert!(json["timestamp"].is_string());
    }

    #[tokio::test]
    async fn test_get_job_logs() {
        let app = app();
        let job_name = "test-job-123";
        
        let response = app
            .oneshot(
                Request::builder()
                    .uri(&format!("/k8s/jobs/{}/logs", job_name))
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
        
        let body = axum::body::to_bytes(response.into_body(), usize::MAX).await.unwrap();
        let json: Value = serde_json::from_slice(&body).unwrap();
        
        assert_eq!(json["job_name"], job_name);
        assert_eq!(json["pod_name"], format!("pod-{}", job_name));
        assert_eq!(json["logs"], "Sample log output");
        assert_eq!(json["status"], "completed");
        assert!(json["timestamp"].is_string());
    }

    #[tokio::test]
    async fn test_get_job_status() {
        let app = app();
        let job_name = "test-job-456";
        
        let response = app
            .oneshot(
                Request::builder()
                    .uri(&format!("/k8s/jobs/{}/status", job_name))
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
        
        let body = axum::body::to_bytes(response.into_body(), usize::MAX).await.unwrap();
        let json: Value = serde_json::from_slice(&body).unwrap();
        
        assert_eq!(json["job_name"], job_name);
        assert_eq!(json["status"], "completed");
        assert!(json["timestamp"].is_string());
    }

    #[tokio::test]
    async fn test_delete_job() {
        let app = app();
        let job_name = "test-job-789";
        
        let response = app
            .oneshot(
                Request::builder()
                    .method(http::Method::DELETE)
                    .uri(&format!("/k8s/jobs/{}", job_name))
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
        
        let body = axum::body::to_bytes(response.into_body(), usize::MAX).await.unwrap();
        let json: Value = serde_json::from_slice(&body).unwrap();
        
        assert_eq!(json["message"], format!("Job {} deleted successfully", job_name));
        assert!(json["timestamp"].is_string());
    }

    #[tokio::test]
    async fn test_create_run_with_invalid_json() {
        let app = app();
        
        let response = app
            .oneshot(
                Request::builder()
                    .method(http::Method::POST)
                    .uri("/runs")
                    .header(http::header::CONTENT_TYPE, "application/json")
                    .body(Body::from("invalid json"))
                    .unwrap(),
            )
            .await
            .unwrap();

        // Should return 400 Bad Request for invalid JSON
        assert_eq!(response.status(), StatusCode::BAD_REQUEST);
    }

    #[tokio::test] 
    async fn test_create_request_validation() {
        let request = CreateRunRequest {
            name: "Test Request".to_string(),
            image: "nginx:latest".to_string(),
            commands: vec!["echo test".to_string(), "ls -la".to_string()],
        };

        assert_eq!(request.name, "Test Request");
        assert_eq!(request.image, "nginx:latest");
        assert_eq!(request.commands.len(), 2);
        assert_eq!(request.commands[0], "echo test");
        assert_eq!(request.commands[1], "ls -la");
    }

    #[tokio::test]
    async fn test_health_response_structure() {
        let response = HealthResponse {
            status: "healthy".to_string(),
            timestamp: chrono::Utc::now().to_rfc3339(),
        };

        assert_eq!(response.status, "healthy");
        assert!(!response.timestamp.is_empty());
        
        // Test serialization
        let json = serde_json::to_string(&response).unwrap();
        assert!(json.contains("healthy"));
        assert!(json.contains("timestamp"));
    }
}
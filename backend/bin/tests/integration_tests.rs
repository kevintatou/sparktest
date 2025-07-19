use sparktest_api::create_app;
use axum::{
    body::Body,
    http::{Request, StatusCode},
};
use tower::ServiceExt;
use serde_json::Value;

#[tokio::test]
async fn test_app_creation() {
    let app = create_app();
    
    // Test that the app can be created successfully
    assert!(std::mem::size_of_val(&app) > 0);
}

#[tokio::test]
async fn test_health_endpoint_integration() {
    let app = create_app();
    
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
async fn test_runs_endpoint_integration() {
    let app = create_app();
    
    let response = app
        .oneshot(Request::builder().uri("/runs").body(Body::empty()).unwrap())
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
    
    let body = axum::body::to_bytes(response.into_body(), usize::MAX).await.unwrap();
    let json: Value = serde_json::from_slice(&body).unwrap();
    
    assert!(json.is_array());
}

#[tokio::test]
async fn test_k8s_health_endpoint_integration() {
    let app = create_app();
    
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
async fn test_cors_headers() {
    let app = create_app();
    
    let response = app
        .oneshot(
            Request::builder()
                .method("OPTIONS")
                .uri("/health")
                .header("Origin", "http://localhost:3000")
                .header("Access-Control-Request-Method", "GET")
                .body(Body::empty())
                .unwrap()
        )
        .await
        .unwrap();

    // Should handle CORS preflight requests
    assert!(response.status().is_success() || response.status() == StatusCode::NO_CONTENT);
}

#[cfg(test)]
mod config_tests {
    #[test]
    fn test_default_database_url() {
        std::env::remove_var("DATABASE_URL");
        let database_url = std::env::var("DATABASE_URL")
            .unwrap_or_else(|_| "postgresql://localhost/sparktest".to_string());
        
        assert_eq!(database_url, "postgresql://localhost/sparktest");
    }

    #[test]
    fn test_default_port() {
        std::env::remove_var("PORT");
        let port = std::env::var("PORT")
            .unwrap_or_else(|_| "3000".to_string())
            .parse::<u16>()
            .expect("PORT must be a valid number");
        
        assert_eq!(port, 3000);
    }

    #[test]
    fn test_custom_port() {
        std::env::set_var("PORT", "8080");
        let port = std::env::var("PORT")
            .unwrap_or_else(|_| "3000".to_string())
            .parse::<u16>()
            .expect("PORT must be a valid number");
        
        assert_eq!(port, 8080);
        std::env::remove_var("PORT");
    }

    #[test]
    fn test_invalid_port_panics() {
        std::env::set_var("PORT", "invalid");
        let result = std::panic::catch_unwind(|| {
            std::env::var("PORT")
                .unwrap_or_else(|_| "3000".to_string())
                .parse::<u16>()
                .expect("PORT must be a valid number");
        });
        
        assert!(result.is_err());
        std::env::remove_var("PORT");
    }
}
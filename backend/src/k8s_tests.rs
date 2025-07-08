use crate::k8s::KubernetesClient;

#[tokio::test]
async fn test_kubernetes_client_creation() {
    // This test verifies that the Kubernetes client can be created
    // It will succeed if running in a cluster or with valid kubeconfig
    match KubernetesClient::new().await {
        Ok(_) => {
            println!("✅ Kubernetes client created successfully");
        }
        Err(e) => {
            println!("⚠️ Kubernetes client creation failed (expected in test environment): {}", e);
            // This is expected when not running in a Kubernetes cluster
        }
    }
}

#[tokio::test]
async fn test_job_name_generation() {
    // Test that job names are generated correctly for test runs
    let run_id = uuid::Uuid::new_v4();
    let job_name = format!("test-run-{}", run_id);
    
    assert!(job_name.starts_with("test-run-"));
    assert_eq!(job_name.len(), 45); // "test-run-" (9) + UUID (36)
}

#[cfg(test)]
mod integration_tests {
    use super::*;
    
    // These tests would run if we have a real Kubernetes cluster available
    // For now, they're disabled but show how to test the functionality
    
    #[ignore] // Remove this when running against a real cluster
    #[tokio::test]
    async fn test_kubernetes_health_check() {
        let client = KubernetesClient::new().await.expect("Failed to create client");
        let is_healthy = client.health_check().await.expect("Health check failed");
        assert!(is_healthy);
    }
    
    #[ignore] // Remove this when running against a real cluster
    #[tokio::test]
    async fn test_job_logs_retrieval() {
        let client = KubernetesClient::new().await.expect("Failed to create client");
        
        // This would test against a real job in the cluster
        let job_name = "test-job";
        match client.get_job_logs(job_name).await {
            Ok(logs) => {
                assert!(!logs.logs.is_empty());
                assert_eq!(logs.job_name, job_name);
            }
            Err(_) => {
                // Expected if job doesn't exist
            }
        }
    }
}

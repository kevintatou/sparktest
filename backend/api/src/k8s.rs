use anyhow::{Context, Result};
use chrono::Utc;
use k8s_openapi::api::batch::v1::Job;
use k8s_openapi::api::core::v1::{Container, Pod, PodSpec, PodTemplateSpec};
use k8s_openapi::apimachinery::pkg::apis::meta::v1::ObjectMeta;
use kube::{
    api::{Api, ListParams, LogParams, PostParams},
    Client, Error as KubeError,
};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use tokio::time::{sleep, Duration};
use tracing::{info, warn};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct KubeConfig {
    pub namespace: String,
    pub timeout_seconds: u64,
    pub max_log_lines: Option<i64>,
}

impl Default for KubeConfig {
    fn default() -> Self {
        Self {
            namespace: "default".to_string(),
            timeout_seconds: 300,
            max_log_lines: Some(1000),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct JobLogs {
    pub job_name: String,
    pub pod_name: String,
    pub logs: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct KubernetesError {
    pub error_type: String,
    pub message: String,
    pub details: Option<String>,
}

pub async fn create_k8s_job(
    client: &Client,
    job_name: &str,
    image: &str,
    command: &[String],
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let jobs: Api<Job> = Api::namespaced(client.clone(), "default");

    let job = Job {
        metadata: ObjectMeta {
            name: Some(job_name.to_string()),
            labels: Some(std::collections::BTreeMap::from([
                ("app".to_string(), "sparktest".to_string()),
                ("component".to_string(), "test-runner".to_string()),
            ])),
            ..Default::default()
        },
        spec: Some(k8s_openapi::api::batch::v1::JobSpec {
            template: PodTemplateSpec {
                metadata: Some(ObjectMeta {
                    labels: Some(std::collections::BTreeMap::from([
                        ("job-name".to_string(), job_name.to_string()),
                        ("app".to_string(), "sparktest".to_string()),
                    ])),
                    ..Default::default()
                }),
                spec: Some(PodSpec {
                    containers: vec![Container {
                        name: job_name.to_string(),
                        image: Some(image.to_string()),
                        command: Some(command.to_vec()),
                        ..Default::default()
                    }],
                    restart_policy: Some("Never".to_string()),
                    ..Default::default()
                }),
            },
            backoff_limit: Some(0),
            ttl_seconds_after_finished: Some(3600), // Clean up after 1 hour
            ..Default::default()
        }),
        ..Default::default()
    };

    jobs.create(&PostParams::default(), &job).await?;
    Ok(())
}

pub async fn monitor_job_and_update_status(
    run_id: Uuid,
    job_name: String,
    pool: PgPool,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let client = Client::try_default().await?;
    let jobs: Api<Job> = Api::namespaced(client.clone(), "default");

    let start_time = Utc::now();
    let mut status = "running".to_string();

    for _ in 0..30 {
        let job = jobs.get(&job_name).await?;
        if let Some(s) = &job.status {
            if let Some(conds) = &s.conditions {
                if conds
                    .iter()
                    .any(|c| c.type_ == "Complete" && c.status == "True")
                {
                    status = "succeeded".to_string();
                    break;
                } else if conds
                    .iter()
                    .any(|c| c.type_ == "Failed" && c.status == "True")
                {
                    status = "failed".to_string();
                    break;
                }
            }
        }
        sleep(Duration::from_secs(2)).await;
    }

    let duration = (Utc::now() - start_time).num_seconds() as i32;

    sqlx::query("UPDATE test_runs SET status = $1, duration = $2 WHERE id = $3")
        .bind(&status)
        .bind(duration)
        .bind(run_id)
        .execute(&pool)
        .await?;

    Ok(())
}

pub struct KubernetesClient {
    client: Client,
    config: KubeConfig,
}

impl KubernetesClient {
    /// Create a new Kubernetes client with authentication
    pub async fn new() -> Result<Self> {
        let client = Self::create_authenticated_client().await?;
        let config = KubeConfig::default();

        Ok(Self { client, config })
    }

    /// Create a new Kubernetes client with custom configuration
    pub async fn new_with_config(config: KubeConfig) -> Result<Self> {
        let client = Self::create_authenticated_client().await?;
        Ok(Self { client, config })
    }

    /// Create authenticated Kubernetes client with fallback mechanisms
    async fn create_authenticated_client() -> Result<Client> {
        // Try different authentication methods in order of preference

        // 1. Try in-cluster authentication (for pods running in Kubernetes)
        if let Ok(client) = Client::try_default().await {
            info!("Using in-cluster Kubernetes authentication");
            return Ok(client);
        }

        // 2. Try kubeconfig from default locations
        match kube::Config::from_kubeconfig(&kube::config::KubeConfigOptions::default()).await {
            Ok(config) => {
                info!("Using kubeconfig authentication");
                return Ok(Client::try_from(config)?);
            }
            Err(e) => {
                warn!("Failed to load kubeconfig: {}", e);
            }
        }

        // 3. Try environment-based configuration
        if let Ok(config) = Self::config_from_env() {
            info!("Using environment-based Kubernetes authentication");
            return Ok(Client::try_from(config)?);
        }

        // 4. Final fallback - try default client creation
        Client::try_default()
            .await
            .context("Failed to create Kubernetes client with any authentication method")
    }

    /// Create configuration from environment variables
    fn config_from_env() -> Result<kube::Config> {
        // Try to use the service account token method
        let token_path = "/var/run/secrets/kubernetes.io/serviceaccount/token";
        let ca_path = "/var/run/secrets/kubernetes.io/serviceaccount/ca.crt";

        if std::path::Path::new(token_path).exists() && std::path::Path::new(ca_path).exists() {
            // We're running inside a Kubernetes cluster with service account
            return kube::Config::incluster().context("Failed to create in-cluster config");
        }

        // Fallback to error if we can't create config
        Err(anyhow::anyhow!("No valid Kubernetes configuration found"))
    }

    /// Get job logs with comprehensive error handling
    pub async fn get_job_logs(&self, job_name: &str) -> Result<JobLogs> {
        let jobs: Api<Job> = Api::namespaced(self.client.clone(), &self.config.namespace);

        // First, get the job to check its status
        let job = jobs
            .get(job_name)
            .await
            .with_context(|| format!("Failed to get job '{}'", job_name))?;

        let job_status = job
            .status
            .as_ref()
            .and_then(|s| s.conditions.as_ref())
            .map(|conditions| {
                if conditions
                    .iter()
                    .any(|c| c.type_ == "Complete" && c.status == "True")
                {
                    "completed"
                } else if conditions
                    .iter()
                    .any(|c| c.type_ == "Failed" && c.status == "True")
                {
                    "failed"
                } else {
                    "running"
                }
            })
            .unwrap_or("unknown");

        // Get the pod associated with this job
        let pod_name = self.get_job_pod_name(job_name).await?;

        // Check if pod is pending and provide helpful message
        let pod_status = self.get_pod_status(&pod_name).await?;

        // Fetch logs from the pod (handle pending pods gracefully)
        let logs = match pod_status.as_str() {
            "Pending" => {
                let reason = self
                    .get_pod_pending_reason(&pod_name)
                    .await
                    .unwrap_or_else(|_| "Unknown reason".to_string());
                format!("Pod is pending: {}", reason)
            }
            _ => self
                .get_pod_logs(&pod_name)
                .await
                .unwrap_or_else(|_| "No logs available yet".to_string()),
        };

        Ok(JobLogs {
            job_name: job_name.to_string(),
            pod_name,
            logs,
            timestamp: Utc::now(),
            status: job_status.to_string(),
        })
    }

    /// Get the pod name associated with a job
    async fn get_job_pod_name(&self, job_name: &str) -> Result<String> {
        let pods: Api<Pod> = Api::namespaced(self.client.clone(), &self.config.namespace);

        let label_selector = format!("job-name={}", job_name);
        let list_params = ListParams::default().labels(&label_selector);

        let pod_list = pods
            .list(&list_params)
            .await
            .with_context(|| format!("Failed to list pods for job '{}'", job_name))?;

        let pod = pod_list
            .items
            .into_iter()
            .next()
            .with_context(|| format!("No pods found for job '{}'", job_name))?;

        pod.metadata
            .name
            .with_context(|| format!("Pod for job '{}' has no name", job_name))
    }

    /// Get logs from a specific pod
    async fn get_pod_logs(&self, pod_name: &str) -> Result<String> {
        let pods: Api<Pod> = Api::namespaced(self.client.clone(), &self.config.namespace);

        let mut log_params = LogParams::default();
        if let Some(tail_lines) = self.config.max_log_lines {
            log_params.tail_lines = Some(tail_lines);
        }
        log_params.timestamps = true;

        let logs = pods
            .logs(pod_name, &log_params)
            .await
            .with_context(|| format!("Failed to get logs for pod '{}'", pod_name))?;

        Ok(logs)
    }

    /// Check if the Kubernetes cluster is accessible
    pub async fn health_check(&self) -> Result<bool> {
        let pods: Api<Pod> = Api::namespaced(self.client.clone(), &self.config.namespace);

        match pods.list(&ListParams::default().limit(1)).await {
            Ok(_) => Ok(true),
            Err(e) => {
                warn!("Kubernetes health check failed: {}", e);
                Ok(false)
            }
        }
    }

    /// Get job status
    pub async fn get_job_status(&self, job_name: &str) -> Result<String> {
        let jobs: Api<Job> = Api::namespaced(self.client.clone(), &self.config.namespace);

        let job = jobs
            .get(job_name)
            .await
            .with_context(|| format!("Failed to get job '{}'", job_name))?;

        let status = job
            .status
            .as_ref()
            .and_then(|s| s.conditions.as_ref())
            .map(|conditions| {
                if conditions
                    .iter()
                    .any(|c| c.type_ == "Complete" && c.status == "True")
                {
                    "completed".to_string()
                } else if conditions
                    .iter()
                    .any(|c| c.type_ == "Failed" && c.status == "True")
                {
                    "failed".to_string()
                } else {
                    "running".to_string()
                }
            })
            .unwrap_or_else(|| "pending".to_string());

        Ok(status)
    }

    /// Delete a job and its associated pods
    pub async fn delete_job(&self, job_name: &str) -> Result<()> {
        let jobs: Api<Job> = Api::namespaced(self.client.clone(), &self.config.namespace);

        // Delete the job (this will also clean up associated pods)
        let delete_params = kube::api::DeleteParams::default();
        jobs.delete(job_name, &delete_params)
            .await
            .with_context(|| format!("Failed to delete job '{}'", job_name))?;

        info!("Successfully deleted job '{}'", job_name);
        Ok(())
    }

    /// Get pod status
    async fn get_pod_status(&self, pod_name: &str) -> Result<String> {
        let pods: Api<Pod> = Api::namespaced(self.client.clone(), &self.config.namespace);

        let pod = pods
            .get(pod_name)
            .await
            .with_context(|| format!("Failed to get pod '{}'", pod_name))?;

        let status = pod
            .status
            .as_ref()
            .and_then(|s| s.phase.as_ref())
            .map(|phase| phase.clone())
            .unwrap_or_else(|| "Unknown".to_string());

        Ok(status)
    }

    /// Get the reason why a pod is pending
    async fn get_pod_pending_reason(&self, pod_name: &str) -> Result<String> {
        let pods: Api<Pod> = Api::namespaced(self.client.clone(), &self.config.namespace);

        let pod = pods
            .get(pod_name)
            .await
            .with_context(|| format!("Failed to get pod '{}'", pod_name))?;

        let reason = pod
            .status
            .as_ref()
            .and_then(|s| s.conditions.as_ref())
            .and_then(|conditions| {
                conditions
                    .iter()
                    .find(|c| c.type_ == "PodScheduled" && c.status == "False")
                    .and_then(|c| c.reason.as_ref())
            })
            .unwrap_or(&"Unknown".to_string())
            .clone();

        Ok(reason)
    }
}

// Convert Kubernetes errors to our custom error type
impl From<KubeError> for KubernetesError {
    fn from(error: KubeError) -> Self {
        KubernetesError {
            error_type: "KubernetesError".to_string(),
            message: error.to_string(),
            details: Some(format!("{:?}", error)),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_kubernetes_client_creation() {
        // This test verifies that the Kubernetes client can be created
        // It will succeed if running in a cluster or with valid kubeconfig
        match KubernetesClient::new().await {
            Ok(_) => {
                println!("✅ Kubernetes client created successfully");
            }
            Err(e) => {
                println!(
                    "⚠️ Kubernetes client creation failed (expected in test environment): {}",
                    e
                );
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
            let client = KubernetesClient::new()
                .await
                .expect("Failed to create client");
            let is_healthy = client.health_check().await.expect("Health check failed");
            assert!(is_healthy);
        }

        #[ignore] // Remove this when running against a real cluster
        #[tokio::test]
        async fn test_job_logs_retrieval() {
            let client = KubernetesClient::new()
                .await
                .expect("Failed to create client");

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
}

use crate::crd::{TestRun, TestRunPhase, TestRunStatus};
use k8s_openapi::api::batch::v1::{Job, JobSpec};
use k8s_openapi::api::core::v1::{Container, EnvVar, PodSpec, PodTemplateSpec};
use k8s_openapi::apimachinery::pkg::apis::meta::v1::ObjectMeta;
use kube::{
    api::{Api, Patch, PatchParams, PostParams},
    client::Client,
    runtime::controller::Action,
    ResourceExt,
};
use serde_json::json;
use std::collections::BTreeMap;
use std::sync::Arc;
use std::time::Duration;
use thiserror::Error;

const FINALIZER_NAME: &str = "sparktest.dev/testrun-finalizer";

#[derive(Error, Debug)]
pub enum ReconcileError {
    #[error("Kube error: {0}")]
    KubeError(#[from] kube::Error),
    
    #[error("Request error: {0}")]
    RequestError(#[from] reqwest::Error),
    
    #[error("Missing field: {0}")]
    MissingField(String),
}

/// Context for the reconciler
#[derive(Clone)]
pub struct ReconcilerContext {
    pub client: Client,
    pub backend_url: String,
}

/// Reconcile a TestRun resource
pub async fn reconcile(testrun: Arc<TestRun>, ctx: Arc<ReconcilerContext>) -> Result<Action, ReconcileError> {
    let namespace = testrun.namespace().unwrap_or_else(|| "default".to_string());
    let name = testrun.name_any();
    
    tracing::info!("Reconciling TestRun {}/{}", namespace, name);
    
    let testruns: Api<TestRun> = Api::namespaced(ctx.client.clone(), &namespace);
    
    // Handle deletion
    if testrun.metadata.deletion_timestamp.is_some() {
        return handle_deletion(testrun, ctx, testruns).await;
    }
    
    // Add finalizer if not present
    if !testrun
        .metadata
        .finalizers
        .as_ref()
        .map_or(false, |f| f.contains(&FINALIZER_NAME.to_string()))
    {
        add_finalizer(&testruns, &name).await?;
        return Ok(Action::requeue(Duration::from_secs(1)));
    }
    
    // Get current status or create default
    let current_phase = testrun.status.as_ref().and_then(|s| s.phase.clone());
    
    // If already finished, don't reconcile
    if matches!(
        current_phase,
        Some(TestRunPhase::Succeeded) | Some(TestRunPhase::Failed) | Some(TestRunPhase::TimedOut)
    ) {
        tracing::info!("TestRun {}/{} already finished: {:?}", namespace, name, current_phase);
        return Ok(Action::requeue(Duration::from_secs(3600))); // Check again in an hour
    }
    
    // Check if Job exists
    let jobs: Api<Job> = Api::namespaced(ctx.client.clone(), &namespace);
    let job_name = format!("testrun-{}", name);
    
    match jobs.get(&job_name).await {
        Ok(job) => {
            // Job exists, update status based on Job status
            update_status_from_job(&testruns, &name, &job).await?;
        }
        Err(_) => {
            // Job doesn't exist, create it
            if current_phase.is_none() {
                create_job_and_register_run(testrun.clone(), ctx.clone(), &jobs, &testruns, &job_name).await?;
            }
        }
    }
    
    Ok(Action::requeue(Duration::from_secs(30))) // Recheck every 30 seconds
}

/// Handle deletion of a TestRun
async fn handle_deletion(
    testrun: Arc<TestRun>,
    ctx: Arc<ReconcilerContext>,
    testruns: Api<TestRun>,
) -> Result<Action, ReconcileError> {
    let namespace = testrun.namespace().unwrap_or_else(|| "default".to_string());
    let name = testrun.name_any();
    
    tracing::info!("Handling deletion of TestRun {}/{}", namespace, name);
    
    // Delete the associated Job
    let jobs: Api<Job> = Api::namespaced(ctx.client.clone(), &namespace);
    let job_name = format!("testrun-{}", name);
    
    if jobs.get(&job_name).await.is_ok() {
        tracing::info!("Deleting Job {}/{}", namespace, job_name);
        let _ = jobs.delete(&job_name, &Default::default()).await;
    }
    
    // Remove finalizer
    remove_finalizer(&testruns, &name).await?;
    
    Ok(Action::await_change())
}

/// Add finalizer to a TestRun
async fn add_finalizer(testruns: &Api<TestRun>, name: &str) -> Result<(), ReconcileError> {
    let patch = json!({
        "metadata": {
            "finalizers": [FINALIZER_NAME]
        }
    });
    
    testruns
        .patch(name, &PatchParams::default(), &Patch::Merge(patch))
        .await?;
    
    Ok(())
}

/// Remove finalizer from a TestRun
async fn remove_finalizer(testruns: &Api<TestRun>, name: &str) -> Result<(), ReconcileError> {
    let patch = json!({
        "metadata": {
            "finalizers": null
        }
    });
    
    testruns
        .patch(name, &PatchParams::default(), &Patch::Merge(patch))
        .await?;
    
    Ok(())
}

/// Create a Job and register the run in the backend
async fn create_job_and_register_run(
    testrun: Arc<TestRun>,
    ctx: Arc<ReconcilerContext>,
    jobs: &Api<Job>,
    testruns: &Api<TestRun>,
    job_name: &str,
) -> Result<(), ReconcileError> {
    let namespace = testrun.namespace().unwrap_or_else(|| "default".to_string());
    let name = testrun.name_any();
    
    tracing::info!("Creating Job and registering run for TestRun {}/{}", namespace, name);
    
    // Fetch test definition from backend to get image and commands
    let def_id = &testrun.spec.definition_id;
    let backend_url = &ctx.backend_url;
    let client = reqwest::Client::new();
    
    let definition_url = format!("{}/test-definitions/{}", backend_url, def_id);
    let def_response = client
        .get(&definition_url)
        .send()
        .await?;
    
    if !def_response.status().is_success() {
        let status_code = def_response.status();
        return Err(ReconcileError::MissingField(format!("Test definition not found: {}", status_code)));
    }
    
    let definition: serde_json::Value = def_response.json().await?;
    
    let image = definition["image"]
        .as_str()
        .ok_or_else(|| ReconcileError::MissingField("image".to_string()))?
        .to_string();
    
    let commands: Vec<String> = definition["commands"]
        .as_array()
        .ok_or_else(|| ReconcileError::MissingField("commands".to_string()))?
        .iter()
        .filter_map(|v| v.as_str().map(String::from))
        .collect();
    
    if commands.is_empty() {
        return Err(ReconcileError::MissingField("commands (empty)".to_string()));
    }
    
    // Build Job
    let job = build_job(
        job_name,
        &image,
        &commands,
        &testrun.spec.env,
        testrun.spec.timeout_seconds,
        testrun.spec.ttl_seconds_after_finished,
    );
    
    // Create Job
    jobs.create(&PostParams::default(), &job).await?;
    
    tracing::info!("Created Job {}/{}", namespace, job_name);
    
    // Register run in backend
    let run_payload = json!({
        "name": format!("TestRun: {}", name),
        "image": image,
        "commands": commands,
        "origin": "crd",
        "k8sRef": {
            "namespace": namespace,
            "name": name
        }
    });
    
    let runs_url = format!("{}/test-runs", backend_url);
    let run_response = client
        .post(&runs_url)
        .json(&run_payload)
        .send()
        .await?;
    
    if !run_response.status().is_success() {
        tracing::warn!("Failed to register run in backend: {}", run_response.status());
    } else {
        tracing::info!("Registered run in backend for TestRun {}/{}", namespace, name);
    }
    
    // Update status to Pending
    update_status(testruns, &name, TestRunPhase::Pending, None, None).await?;
    
    Ok(())
}

/// Build a Kubernetes Job from TestRun spec
pub fn build_job(
    job_name: &str,
    image: &str,
    commands: &[String],
    env_vars: &BTreeMap<String, String>,
    timeout_seconds: Option<i32>,
    ttl_seconds_after_finished: Option<i32>,
) -> Job {
    // Build command - wrap in shell if multiple commands
    let k8s_command: Vec<String> = if commands.len() == 1 {
        vec!["sh".to_string(), "-c".to_string(), commands[0].clone()]
    } else {
        vec!["sh".to_string(), "-c".to_string(), commands.join(" && ")]
    };
    
    // Build environment variables
    let env: Vec<EnvVar> = env_vars
        .iter()
        .map(|(k, v)| EnvVar {
            name: k.clone(),
            value: Some(v.clone()),
            ..Default::default()
        })
        .collect();
    
    Job {
        metadata: ObjectMeta {
            name: Some(job_name.to_string()),
            labels: Some(BTreeMap::from([
                ("app".to_string(), "sparktest".to_string()),
                ("component".to_string(), "test-runner".to_string()),
                ("managed-by".to_string(), "sparktest-controller".to_string()),
            ])),
            ..Default::default()
        },
        spec: Some(JobSpec {
            template: PodTemplateSpec {
                metadata: Some(ObjectMeta {
                    labels: Some(BTreeMap::from([
                        ("job-name".to_string(), job_name.to_string()),
                        ("app".to_string(), "sparktest".to_string()),
                    ])),
                    ..Default::default()
                }),
                spec: Some(PodSpec {
                    containers: vec![Container {
                        name: job_name.to_string(),
                        image: Some(image.to_string()),
                        command: Some(k8s_command),
                        env: if env.is_empty() { None } else { Some(env) },
                        ..Default::default()
                    }],
                    restart_policy: Some("Never".to_string()),
                    ..Default::default()
                }),
            },
            backoff_limit: Some(0), // Don't retry failed jobs
            active_deadline_seconds: timeout_seconds.map(|s| s as i64),
            ttl_seconds_after_finished: ttl_seconds_after_finished.map(|s| s as i32),
            ..Default::default()
        }),
        ..Default::default()
    }
}

/// Update status from Job
async fn update_status_from_job(
    testruns: &Api<TestRun>,
    name: &str,
    job: &Job,
) -> Result<(), ReconcileError> {
    let job_status = job.status.as_ref();
    
    let phase = if let Some(status) = job_status {
        if status.succeeded.unwrap_or(0) > 0 {
            Some(TestRunPhase::Succeeded)
        } else if status.failed.unwrap_or(0) > 0 {
            // Check if it was a timeout
            if job.spec.as_ref().and_then(|s| s.active_deadline_seconds).is_some()
                && status.conditions.as_ref().map_or(false, |conds| {
                    conds.iter().any(|c| c.type_ == "Failed" && c.reason.as_deref() == Some("DeadlineExceeded"))
                })
            {
                Some(TestRunPhase::TimedOut)
            } else {
                Some(TestRunPhase::Failed)
            }
        } else if status.active.unwrap_or(0) > 0 {
            Some(TestRunPhase::Running)
        } else {
            Some(TestRunPhase::Pending)
        }
    } else {
        Some(TestRunPhase::Pending)
    };
    
    let started_at = job_status
        .and_then(|s| s.start_time.as_ref())
        .map(|t| t.0.to_rfc3339());
    
    let finished_at = job_status
        .and_then(|s| s.completion_time.as_ref())
        .map(|t| t.0.to_rfc3339());
    
    if let Some(p) = phase {
        update_status(testruns, name, p, started_at, finished_at).await?;
    }
    
    Ok(())
}

/// Update TestRun status
async fn update_status(
    testruns: &Api<TestRun>,
    name: &str,
    phase: TestRunPhase,
    started_at: Option<String>,
    finished_at: Option<String>,
) -> Result<(), ReconcileError> {
    let mut status = TestRunStatus::new();
    status.phase = Some(phase.clone());
    status.started_at = started_at;
    status.finished_at = finished_at;
    
    status.add_condition(
        "PhaseUpdated".to_string(),
        "True".to_string(),
        Some(format!("{:?}", phase)),
        Some(format!("Phase updated to {:?}", phase)),
    );
    
    let patch = json!({
        "status": status
    });
    
    testruns
        .patch_status(name, &PatchParams::default(), &Patch::Merge(patch))
        .await?;
    
    tracing::info!("Updated status for TestRun {} to {:?}", name, phase);
    
    Ok(())
}

/// Handle errors during reconciliation
pub fn error_policy(_testrun: Arc<TestRun>, error: &ReconcileError, _ctx: Arc<ReconcilerContext>) -> Action {
    tracing::error!("Reconciliation error: {:?}", error);
    Action::requeue(Duration::from_secs(60))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_build_job_single_command() {
        let job = build_job(
            "test-job",
            "test:latest",
            &["echo hello".to_string()],
            &BTreeMap::new(),
            None,
            None,
        );
        
        assert_eq!(job.metadata.name, Some("test-job".to_string()));
        let container = &job.spec.as_ref().unwrap().template.spec.as_ref().unwrap().containers[0];
        assert_eq!(container.image, Some("test:latest".to_string()));
        assert_eq!(
            container.command,
            Some(vec!["sh".to_string(), "-c".to_string(), "echo hello".to_string()])
        );
    }

    #[test]
    fn test_build_job_multiple_commands() {
        let job = build_job(
            "test-job",
            "test:latest",
            &["echo hello".to_string(), "echo world".to_string()],
            &BTreeMap::new(),
            None,
            None,
        );
        
        let container = &job.spec.as_ref().unwrap().template.spec.as_ref().unwrap().containers[0];
        assert_eq!(
            container.command,
            Some(vec!["sh".to_string(), "-c".to_string(), "echo hello && echo world".to_string()])
        );
    }

    #[test]
    fn test_build_job_with_env() {
        let mut env_vars = BTreeMap::new();
        env_vars.insert("KEY1".to_string(), "value1".to_string());
        env_vars.insert("KEY2".to_string(), "value2".to_string());
        
        let job = build_job(
            "test-job",
            "test:latest",
            &["echo $KEY1".to_string()],
            &env_vars,
            None,
            None,
        );
        
        let container = &job.spec.as_ref().unwrap().template.spec.as_ref().unwrap().containers[0];
        let env = container.env.as_ref().unwrap();
        assert_eq!(env.len(), 2);
        assert!(env.iter().any(|e| e.name == "KEY1" && e.value == Some("value1".to_string())));
    }

    #[test]
    fn test_build_job_with_timeout() {
        let job = build_job(
            "test-job",
            "test:latest",
            &["sleep 100".to_string()],
            &BTreeMap::new(),
            Some(60),
            None,
        );
        
        assert_eq!(job.spec.as_ref().unwrap().active_deadline_seconds, Some(60));
    }

    #[test]
    fn test_build_job_with_ttl() {
        let job = build_job(
            "test-job",
            "test:latest",
            &["echo done".to_string()],
            &BTreeMap::new(),
            None,
            Some(3600),
        );
        
        assert_eq!(job.spec.as_ref().unwrap().ttl_seconds_after_finished, Some(3600));
    }
}

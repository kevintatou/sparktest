use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestRun {
    pub id: Uuid,
    pub name: String,
    pub image: String,
    pub commands: Vec<String>,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub definition_id: Option<Uuid>,
    pub executor_id: Option<String>,
    pub suite_id: Option<Uuid>,
    pub variables: Option<serde_json::Value>,
    pub artifacts: Option<Vec<String>>,
    pub duration: Option<i32>,
    pub retries: Option<i32>,
    pub logs: Option<Vec<String>>,
    pub k8s_job_name: Option<String>,
    pub pod_scheduled: Option<DateTime<Utc>>,
    pub container_created: Option<DateTime<Utc>>,
    pub container_started: Option<DateTime<Utc>>,
    pub completed: Option<DateTime<Utc>>,
    pub failed: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestDefinition {
    pub id: Uuid,
    pub name: String,
    pub description: String,
    pub image: String,
    pub commands: Vec<String>,
    pub created_at: DateTime<Utc>,
    pub executor_id: Option<String>,
    pub variables: Option<serde_json::Value>,
    pub labels: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Executor {
    pub id: String,
    pub name: String,
    pub image: String,
    pub description: Option<String>,
    pub command: Option<Vec<String>>,
    pub supported_file_types: Option<Vec<String>>,
    pub env: Option<serde_json::Value>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestSuite {
    pub id: Uuid,
    pub name: String,
    pub description: String,
    pub test_definition_ids: Vec<Uuid>,
    pub created_at: DateTime<Utc>,
    pub execution_mode: String,
    pub labels: Option<Vec<String>>,
}

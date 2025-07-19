use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

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

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Utc;
    use uuid::Uuid;

    #[test]
    fn test_test_run_creation() {
        let test_run = TestRun {
            id: Uuid::new_v4(),
            name: "Test Run".to_string(),
            image: "test-image:latest".to_string(),
            commands: vec!["echo 'hello'".to_string()],
            status: "pending".to_string(),
            created_at: Utc::now(),
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

        assert_eq!(test_run.name, "Test Run");
        assert_eq!(test_run.image, "test-image:latest");
        assert_eq!(test_run.commands.len(), 1);
        assert_eq!(test_run.status, "pending");
    }

    #[test]
    fn test_test_definition_creation() {
        let test_def = TestDefinition {
            id: Uuid::new_v4(),
            name: "Sample Test".to_string(),
            description: "A sample test definition".to_string(),
            image: "test-runner:latest".to_string(),
            commands: vec!["npm test".to_string()],
            created_at: Utc::now(),
            executor_id: Some("nodejs".to_string()),
            variables: None,
            labels: Some(vec!["unit".to_string(), "frontend".to_string()]),
        };

        assert_eq!(test_def.name, "Sample Test");
        assert_eq!(test_def.description, "A sample test definition");
        assert_eq!(test_def.image, "test-runner:latest");
        assert_eq!(test_def.commands.len(), 1);
        assert_eq!(test_def.executor_id, Some("nodejs".to_string()));
        assert_eq!(test_def.labels, Some(vec!["unit".to_string(), "frontend".to_string()]));
    }

    #[test]
    fn test_executor_creation() {
        let executor = Executor {
            id: "nodejs".to_string(),
            name: "Node.js Executor".to_string(),
            image: "node:18".to_string(),
            description: Some("Node.js test runner".to_string()),
            command: Some(vec!["npm".to_string(), "test".to_string()]),
            supported_file_types: Some(vec!["js".to_string(), "ts".to_string()]),
            env: Some(serde_json::json!({"NODE_ENV": "test"})),
            created_at: Utc::now(),
        };

        assert_eq!(executor.id, "nodejs");
        assert_eq!(executor.name, "Node.js Executor");
        assert_eq!(executor.image, "node:18");
        assert_eq!(executor.description, Some("Node.js test runner".to_string()));
        assert_eq!(executor.command, Some(vec!["npm".to_string(), "test".to_string()]));
        assert_eq!(executor.supported_file_types, Some(vec!["js".to_string(), "ts".to_string()]));
    }

    #[test]
    fn test_test_suite_creation() {
        let suite_id = Uuid::new_v4();
        let def_id1 = Uuid::new_v4();
        let def_id2 = Uuid::new_v4();

        let test_suite = TestSuite {
            id: suite_id,
            name: "Integration Suite".to_string(),
            description: "Full integration test suite".to_string(),
            test_definition_ids: vec![def_id1, def_id2],
            created_at: Utc::now(),
            execution_mode: "parallel".to_string(),
            labels: Some(vec!["integration".to_string()]),
        };

        assert_eq!(test_suite.id, suite_id);
        assert_eq!(test_suite.name, "Integration Suite");
        assert_eq!(test_suite.description, "Full integration test suite");
        assert_eq!(test_suite.test_definition_ids.len(), 2);
        assert_eq!(test_suite.execution_mode, "parallel");
        assert_eq!(test_suite.labels, Some(vec!["integration".to_string()]));
    }

    #[test]
    fn test_serialization() {
        let test_run = TestRun {
            id: Uuid::new_v4(),
            name: "Serialization Test".to_string(),
            image: "test:latest".to_string(),
            commands: vec!["echo test".to_string()],
            status: "completed".to_string(),
            created_at: Utc::now(),
            definition_id: None,
            executor_id: None,
            suite_id: None,
            variables: Some(serde_json::json!({"VAR1": "value1"})),
            artifacts: Some(vec!["test-results.xml".to_string()]),
            duration: Some(300),
            retries: Some(0),
            logs: Some(vec!["Log line 1".to_string(), "Log line 2".to_string()]),
            k8s_job_name: Some("test-job-123".to_string()),
            pod_scheduled: None,
            container_created: None,
            container_started: None,
            completed: Some(Utc::now()),
            failed: None,
        };

        // Test serialization
        let json = serde_json::to_string(&test_run).unwrap();
        assert!(!json.is_empty());

        // Test deserialization
        let deserialized: TestRun = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.name, test_run.name);
        assert_eq!(deserialized.image, test_run.image);
        assert_eq!(deserialized.status, test_run.status);
        assert_eq!(deserialized.duration, test_run.duration);
        assert_eq!(deserialized.artifacts, test_run.artifacts);
        assert_eq!(deserialized.k8s_job_name, test_run.k8s_job_name);
    }
}
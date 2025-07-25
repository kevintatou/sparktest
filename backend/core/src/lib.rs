pub mod db;
pub mod models;

pub use db::*;
pub use models::*;

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Utc;
    use uuid::Uuid;

    #[tokio::test]
    async fn test_test_run_creation() {
        let test_run = TestRun {
            id: Uuid::new_v4(),
            name: "Test Run".to_string(),
            image: "test:latest".to_string(),
            commands: vec!["echo".to_string(), "hello".to_string()],
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
        assert_eq!(test_run.status, "pending");
        assert!(!test_run.commands.is_empty());
    }

    #[test]
    fn test_test_definition_creation() {
        let definition = TestDefinition {
            id: Uuid::new_v4(),
            name: "Test Definition".to_string(),
            description: "A test definition".to_string(),
            image: "test:latest".to_string(),
            commands: vec!["echo".to_string(), "hello".to_string()],
            created_at: Utc::now(),
            executor_id: Some("executor-1".to_string()),
            labels: Some(vec!["test".to_string()]),
            variables: None,
        };

        assert_eq!(definition.name, "Test Definition");
        assert_eq!(definition.description, "A test definition");
        assert!(!definition.commands.is_empty());
    }

    #[test]
    fn test_executor_creation() {
        let executor = Executor {
            id: "executor-1".to_string(),
            name: "Test Executor".to_string(),
            description: Some("A test executor".to_string()),
            image: "test:latest".to_string(),
            command: Some(vec!["echo".to_string()]),
            supported_file_types: Some(vec!["json".to_string()]),
            env: None,
            created_at: Utc::now(),
        };

        assert_eq!(executor.name, "Test Executor");
        assert!(executor.description.is_some());
        assert_eq!(executor.image, "test:latest");
    }
}

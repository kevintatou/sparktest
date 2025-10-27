use kube::CustomResource;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

/// TestRun is a custom resource that represents a test run in SparkTest
#[derive(CustomResource, Debug, Clone, Deserialize, Serialize, JsonSchema)]
#[kube(
    group = "sparktest.dev",
    version = "v1alpha1",
    kind = "TestRun",
    plural = "testruns",
    shortname = "strun",
    status = "TestRunStatus",
    namespaced
)]
#[serde(rename_all = "camelCase")]
pub struct TestRunSpec {
    /// UUID of the test definition to run
    pub definition_id: String,

    /// Environment variables to inject into the test run
    #[serde(default)]
    pub env: BTreeMap<String, String>,

    /// Maximum duration in seconds before timing out the test
    #[serde(skip_serializing_if = "Option::is_none")]
    pub timeout_seconds: Option<i32>,

    /// Seconds to keep the Job after it finishes before cleanup
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ttl_seconds_after_finished: Option<i32>,
}

/// Status of the TestRun
#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct TestRunStatus {
    /// Current phase of the test run
    #[serde(skip_serializing_if = "Option::is_none")]
    pub phase: Option<TestRunPhase>,

    /// Timestamp when the test run started
    #[serde(skip_serializing_if = "Option::is_none")]
    pub started_at: Option<String>,

    /// Timestamp when the test run finished
    #[serde(skip_serializing_if = "Option::is_none")]
    pub finished_at: Option<String>,

    /// List of status conditions
    #[serde(default)]
    pub conditions: Vec<TestRunCondition>,
}

/// Phase of the test run
#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema, PartialEq)]
pub enum TestRunPhase {
    Pending,
    Running,
    Succeeded,
    Failed,
    TimedOut,
}

/// Condition in the TestRun status
#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct TestRunCondition {
    /// Type of condition
    #[serde(rename = "type")]
    pub type_: String,

    /// Status of the condition (True, False, Unknown)
    pub status: String,

    /// Machine-readable reason
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reason: Option<String>,

    /// Human-readable message
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,

    /// Last time the condition transitioned
    pub last_transition_time: String,
}

impl TestRunStatus {
    /// Create a new empty status
    pub fn new() -> Self {
        Self {
            phase: None,
            started_at: None,
            finished_at: None,
            conditions: Vec::new(),
        }
    }

    /// Add a condition to the status
    pub fn add_condition(
        &mut self,
        type_: String,
        status: String,
        reason: Option<String>,
        message: Option<String>,
    ) {
        let now = chrono::Utc::now().to_rfc3339();
        self.conditions.push(TestRunCondition {
            type_,
            status,
            reason,
            message,
            last_transition_time: now,
        });
    }
}

impl Default for TestRunStatus {
    fn default() -> Self {
        Self::new()
    }
}

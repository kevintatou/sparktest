use crate::k8s::{monitor_job_and_update_status, KubernetesClient};
use axum::{extract::Path, http::StatusCode, response::Json, Extension, Json as JsonBody};
use chrono;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
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
    #[serde(default)]
    pub origin: Option<String>,
    #[serde(rename = "k8sRef")]
    pub k8s_ref: Option<K8sRefInput>,
}

#[derive(Deserialize, Serialize)]
pub struct K8sRefInput {
    pub namespace: String,
    pub name: String,
}

pub async fn health_check() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "healthy".to_string(),
        timestamp: chrono::Utc::now().to_rfc3339(),
    })
}

pub async fn get_runs(
    Extension(pool): Extension<PgPool>,
) -> Result<Json<Vec<serde_json::Value>>, StatusCode> {
    match sqlx::query_as::<_, (Uuid, String, String, Vec<String>, String, chrono::DateTime<chrono::Utc>, Option<i32>, Option<Vec<String>>, Option<Uuid>, Option<Uuid>, Option<String>, Option<String>, Option<String>)>(
        "SELECT id, name, image, command, status, created_at, duration, logs, test_definition_id, executor_id, origin::text, k8s_ref_namespace, k8s_ref_name FROM test_runs ORDER BY created_at DESC"
    )
    .fetch_all(&pool)
    .await
    {
        Ok(rows) => {
            let runs: Vec<serde_json::Value> = rows
                .into_iter()
                .map(|(id, name, image, command, status, created_at, duration, logs, test_definition_id, executor_id, origin, k8s_ref_namespace, k8s_ref_name)| {
                    let mut run_json = serde_json::json!({
                        "id": id,
                        "name": name,
                        "image": image,
                        "command": command,
                        "status": status,
                        "createdAt": created_at,
                        "duration": duration,
                        "logs": logs,
                        "testDefinitionId": test_definition_id,
                        "executorId": executor_id,
                        "origin": origin.unwrap_or_else(|| "api".to_string())
                    });

                    // Add k8sRef if both namespace and name are present
                    if let (Some(ns), Some(n)) = (k8s_ref_namespace, k8s_ref_name) {
                        run_json["k8sRef"] = serde_json::json!({
                            "namespace": ns,
                            "name": n
                        });
                    }

                    run_json
                })
                .collect();
            Ok(Json(runs))
        }
        Err(e) => {
            tracing::error!("Failed to fetch test runs: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn create_run(
    Extension(pool): Extension<PgPool>,
    JsonBody(req): JsonBody<CreateRunRequest>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let run_uuid = Uuid::new_v4();
    let now = chrono::Utc::now();

    // Determine origin (default to "api" if not provided)
    let origin = req.origin.as_deref().unwrap_or("api");

    // Extract k8s_ref fields if provided
    let (k8s_ref_namespace, k8s_ref_name) = match &req.k8s_ref {
        Some(k8s_ref) => (Some(k8s_ref.namespace.clone()), Some(k8s_ref.name.clone())),
        None => (None, None),
    };

    // Insert the run first with status 'running', including origin and k8s_ref
    if let Err(e) = sqlx::query(
        "INSERT INTO test_runs (id, name, image, command, status, created_at, origin, k8s_ref_namespace, k8s_ref_name) VALUES ($1, $2, $3, $4, $5, $6, $7::run_origin, $8, $9)"
    )
    .bind(run_uuid)
    .bind(&req.name)
    .bind(&req.image)
    .bind(&req.commands) // TEXT[]
    .bind("running")
    .bind(now)
    .bind(origin)
    .bind(&k8s_ref_namespace)
    .bind(&k8s_ref_name)
    .execute(&pool)
    .await {
        tracing::error!("Failed to insert test run: {}", e);
        return Err(StatusCode::INTERNAL_SERVER_ERROR);
    }

    // Derive a Kubernetes job name from the run id
    let job_name = format!("test-run-{run_uuid}");

    // Build a shell command to run sequential commands if multiple provided
    let k8s_command: Vec<String> = if req.commands.len() == 1 {
        // Use the single command directly under sh -c for consistency
        vec!["sh".into(), "-c".into(), req.commands[0].clone()]
    } else {
        vec!["sh".into(), "-c".into(), req.commands.join(" && ")]
    };

    // Attempt to create the Kubernetes job (build client per request)
    match KubernetesClient::new().await {
        Ok(client) => {
            if let Err(e) = client.submit_job(&job_name, &req.image, &k8s_command).await {
                tracing::error!(
                    "Failed to create Kubernetes job for run {}: {}",
                    run_uuid,
                    e
                );
                // Mark run as failed immediately
                if let Err(upd_err) = sqlx::query("UPDATE test_runs SET status = $1 WHERE id = $2")
                    .bind("failed")
                    .bind(run_uuid)
                    .execute(&pool)
                    .await
                {
                    tracing::error!(
                        "Failed to update run status after job creation failure: {}",
                        upd_err
                    );
                }
                // Build response with jobCreated=false
                let run = serde_json::json!({
                    "id": run_uuid,
                    "name": req.name,
                    "image": req.image,
                    "command": req.commands,
                    "status": "failed",
                    "createdAt": now.to_rfc3339(),
                    "jobName": job_name,
                    "jobCreated": false
                });
                return Ok(Json(run));
            }
        }
        Err(e) => {
            tracing::error!("Failed to initialize Kubernetes client: {}", e);
            let run = serde_json::json!({
                "id": run_uuid,
                "name": req.name,
                "image": req.image,
                "command": req.commands,
                "status": "failed",
                "createdAt": now.to_rfc3339(),
                "jobName": job_name,
                "jobCreated": false
            });
            return Ok(Json(run));
        }
    }

    // Spawn background monitor task on success
    let pool_clone = pool.clone();
    let job_name_clone = job_name.clone();
    tokio::spawn(async move {
        if let Err(e) = monitor_job_and_update_status(run_uuid, job_name_clone, pool_clone).await {
            tracing::error!("Job monitor failed for run {}: {}", run_uuid, e);
        }
    });
    let run = serde_json::json!({
        "id": run_uuid,
        "name": req.name,
        "image": req.image,
        "command": req.commands,
        "status": "running",
        "createdAt": now.to_rfc3339(),
        "jobName": job_name,
        "jobCreated": true
    });
    Ok(Json(run))
}

pub async fn get_run(
    Path(id): Path<Uuid>,
    Extension(pool): Extension<PgPool>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    match sqlx::query_as::<_, (Uuid, String, String, Vec<String>, String, Option<Uuid>, chrono::DateTime<chrono::Utc>, Option<i32>, Option<Vec<String>>, Option<Uuid>, Option<String>, Option<String>, Option<String>)>(
        "SELECT id, name, image, command, status, test_definition_id, created_at, duration, logs, executor_id, origin::text, k8s_ref_namespace, k8s_ref_name FROM test_runs WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(&pool)
    .await
    {
        Ok(Some((id, name, image, command, status, test_definition_id, created_at, duration, logs, executor_id, origin, k8s_ref_namespace, k8s_ref_name))) => {
            let mut run = serde_json::json!({
                "id": id,
                "name": name,
                "image": image,
                "command": command,
                "status": status,
                "testDefinitionId": test_definition_id,
                "createdAt": created_at,
                "duration": duration,
                "logs": logs,
                "executorId": executor_id,
                "origin": origin.unwrap_or_else(|| "api".to_string())
            });

            // Add k8sRef if both namespace and name are present
            if let (Some(ns), Some(n)) = (k8s_ref_namespace, k8s_ref_name) {
                run["k8sRef"] = serde_json::json!({
                    "namespace": ns,
                    "name": n
                });
            }

            Ok(Json(run))
        }
        Ok(None) => Err(StatusCode::NOT_FOUND),
        Err(e) => {
            tracing::error!("Failed to fetch test run {}: {}", id, e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn delete_run(
    Path(id): Path<Uuid>,
    Extension(pool): Extension<PgPool>,
) -> Result<StatusCode, StatusCode> {
    match sqlx::query("DELETE FROM test_runs WHERE id = $1")
        .bind(id.to_string())
        .execute(&pool)
        .await
    {
        Ok(result) => {
            if result.rows_affected() > 0 {
                Ok(StatusCode::NO_CONTENT)
            } else {
                Err(StatusCode::NOT_FOUND)
            }
        }
        Err(e) => {
            tracing::error!("Failed to delete test run {}: {}", id, e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn k8s_health() -> Json<serde_json::Value> {
    // Attempt to create Kubernetes client and check health
    match KubernetesClient::new().await {
        Ok(client) => match client.health_check().await {
            Ok(is_healthy) => Json(serde_json::json!({
                "kubernetes_connected": is_healthy,
                "timestamp": chrono::Utc::now().to_rfc3339()
            })),
            Err(_) => Json(serde_json::json!({
                "kubernetes_connected": false,
                "timestamp": chrono::Utc::now().to_rfc3339(),
                "error": "Kubernetes health check failed"
            })),
        },
        Err(_) => Json(serde_json::json!({
            "kubernetes_connected": false,
            "timestamp": chrono::Utc::now().to_rfc3339(),
            "error": "Could not create Kubernetes client"
        })),
    }
}

pub async fn get_job_logs(Path(job_name): Path<String>) -> Json<serde_json::Value> {
    // Attempt to get real job logs from Kubernetes
    match KubernetesClient::new().await {
        Ok(client) => match client.get_job_logs(&job_name).await {
            Ok(job_logs) => Json(serde_json::json!({
                "job_name": job_logs.job_name,
                "pod_name": job_logs.pod_name,
                "logs": job_logs.logs,
                "timestamp": job_logs.timestamp.to_rfc3339(),
                "status": job_logs.status
            })),
            Err(e) => Json(serde_json::json!({
                "job_name": job_name,
                "error": format!("Failed to get job logs: {}", e),
                "timestamp": chrono::Utc::now().to_rfc3339(),
                "status": "error"
            })),
        },
        Err(_) => Json(serde_json::json!({
            "job_name": job_name,
            "error": "Kubernetes client unavailable",
            "timestamp": chrono::Utc::now().to_rfc3339(),
            "status": "error"
        })),
    }
}

pub async fn get_job_status(Path(job_name): Path<String>) -> Json<serde_json::Value> {
    // Attempt to get real job status from Kubernetes
    match KubernetesClient::new().await {
        Ok(client) => match client.get_job_status(&job_name).await {
            Ok(status) => Json(serde_json::json!({
                "job_name": job_name,
                "status": status,
                "timestamp": chrono::Utc::now().to_rfc3339()
            })),
            Err(e) => Json(serde_json::json!({
                "job_name": job_name,
                "status": "error",
                "error": format!("Failed to get job status: {}", e),
                "timestamp": chrono::Utc::now().to_rfc3339()
            })),
        },
        Err(_) => Json(serde_json::json!({
            "job_name": job_name,
            "status": "error",
            "error": "Kubernetes client unavailable",
            "timestamp": chrono::Utc::now().to_rfc3339()
        })),
    }
}

pub async fn delete_job(Path(job_name): Path<String>) -> Json<serde_json::Value> {
    // Attempt to delete real job from Kubernetes
    match KubernetesClient::new().await {
        Ok(client) => match client.delete_job(&job_name).await {
            Ok(_) => Json(serde_json::json!({
                "message": format!("Job {} deleted successfully", job_name),
                "timestamp": chrono::Utc::now().to_rfc3339()
            })),
            Err(e) => Json(serde_json::json!({
                "error": format!("Failed to delete job {}: {}", job_name, e),
                "timestamp": chrono::Utc::now().to_rfc3339()
            })),
        },
        Err(_) => Json(serde_json::json!({
            "error": format!("Kubernetes client unavailable - cannot delete job {}", job_name),
            "timestamp": chrono::Utc::now().to_rfc3339()
        })),
    }
}

pub async fn list_jobs() -> Json<serde_json::Value> {
    match KubernetesClient::new().await {
        Ok(client) => match client.list_jobs().await {
            Ok(names) => Json(serde_json::json!({
                "jobs": names,
                "count": names.len(),
                "timestamp": chrono::Utc::now().to_rfc3339()
            })),
            Err(e) => Json(serde_json::json!({
                "error": format!("Failed to list jobs: {}", e),
                "timestamp": chrono::Utc::now().to_rfc3339()
            })),
        },
        Err(e) => Json(serde_json::json!({
            "error": format!("Kubernetes client unavailable: {}", e),
            "timestamp": chrono::Utc::now().to_rfc3339()
        })),
    }
}

pub async fn get_definitions(
    Extension(pool): Extension<PgPool>,
) -> Result<Json<Vec<serde_json::Value>>, StatusCode> {
    match sqlx::query_as::<_, (Uuid, String, String, Vec<String>, Option<String>, chrono::DateTime<chrono::Utc>)>(
        "SELECT id, name, image, commands, description, created_at FROM test_definitions ORDER BY created_at DESC"
    )
    .fetch_all(&pool)
    .await
    {
        Ok(rows) => {
            let definitions: Vec<serde_json::Value> = rows
                .into_iter()
                .map(|(id, name, image, commands, description, created_at)| {
                    serde_json::json!({
                        "id": id,
                        "name": name,
                        "image": image,
                        "commands": commands,
                        "description": description,
                        "createdAt": created_at
                    })
                })
                .collect();
            Ok(Json(definitions))
        }
        Err(e) => {
            tracing::error!("Failed to fetch test definitions: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn get_executors(
    Extension(pool): Extension<PgPool>,
) -> Result<Json<Vec<serde_json::Value>>, StatusCode> {
    match sqlx::query_as::<_, (Uuid, String, Option<String>, String, String, Vec<String>, Vec<String>, Option<String>)>(
        "SELECT id, name, description, image, default_command, supported_file_types, environment_variables, icon FROM test_executors ORDER BY name"
    )
    .fetch_all(&pool)
    .await
    {
        Ok(rows) => {
            let executors: Vec<serde_json::Value> = rows
                .into_iter()
                .map(|(id, name, description, image, default_command, supported_file_types, environment_variables, icon)| {
                    serde_json::json!({
                        "id": id,
                        "name": name,
                        "description": description,
                        "image": image,
                        "defaultCommand": default_command,
                        "supportedFileTypes": supported_file_types,
                        "environmentVariables": environment_variables,
                        "icon": icon
                    })
                })
                .collect();
            Ok(Json(executors))
        }
        Err(e) => {
            tracing::error!("Failed to fetch test executors: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn get_suites(
    Extension(pool): Extension<PgPool>,
) -> Result<Json<Vec<serde_json::Value>>, StatusCode> {
    match sqlx::query_as::<_, (Uuid, String, Option<String>, String, Vec<String>, Vec<Uuid>, chrono::DateTime<chrono::Utc>)>(
        "SELECT id, name, description, execution_mode, labels, test_definition_ids, created_at FROM test_suites ORDER BY created_at DESC"
    )
    .fetch_all(&pool)
    .await
    {
        Ok(rows) => {
            let suites: Vec<serde_json::Value> = rows
                .into_iter()
                .map(|(id, name, description, execution_mode, labels, test_definition_ids, created_at)| {
                    serde_json::json!({
                        "id": id,
                        "name": name,
                        "description": description,
                        "executionMode": execution_mode,
                        "labels": labels,
                        "testDefinitionIds": test_definition_ids,
                        "createdAt": created_at
                    })
                })
                .collect();
            Ok(Json(suites))
        }
        Err(e) => {
            tracing::error!("Failed to fetch test suites: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn run_suite(
    Path(suite_id): Path<String>,
    Extension(pool): Extension<PgPool>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    // Parse the suite_id as UUID
    let suite_uuid = match Uuid::parse_str(&suite_id) {
        Ok(uuid) => uuid,
        Err(_) => return Err(StatusCode::BAD_REQUEST),
    };

    // First, get the suite details
    let suite = match sqlx::query_as::<_, (Uuid, String, Option<String>, String, Vec<String>, Vec<Uuid>, chrono::DateTime<chrono::Utc>)>(
        "SELECT id, name, description, execution_mode, labels, test_definition_ids, created_at FROM test_suites WHERE id = $1"
    )
    .bind(suite_uuid)
    .fetch_optional(&pool)
    .await
    {
        Ok(Some(suite)) => suite,
        Ok(None) => return Err(StatusCode::NOT_FOUND),
        Err(e) => {
            tracing::error!("Failed to fetch suite {}: {}", suite_id, e);
            return Err(StatusCode::INTERNAL_SERVER_ERROR);
        }
    };

    let (
        suite_uuid,
        suite_name,
        _description,
        execution_mode,
        _labels,
        test_definition_ids,
        _created_at,
    ) = suite;

    // Get all test definitions for this suite
    let definitions = match get_suite_definitions(&pool, &test_definition_ids).await {
        Ok(defs) => defs,
        Err(e) => {
            tracing::error!("Failed to get definitions for suite {}: {}", suite_id, e);
            return Err(StatusCode::INTERNAL_SERVER_ERROR);
        }
    };

    if definitions.is_empty() {
        return Ok(Json(serde_json::json!({
            "error": "No test definitions found for this suite",
            "suiteId": suite_uuid,
            "suiteName": suite_name
        })));
    }

    // Create runs for each definition
    let mut created_runs = Vec::new();

    for def in definitions {
        let run_uuid = Uuid::new_v4();
        let now = chrono::Utc::now();
        let run_name = format!("{} - {}", suite_name, def.name);

        // Insert the run
        if let Err(e) = sqlx::query(
            "INSERT INTO test_runs (id, name, image, command, status, created_at, test_definition_id) VALUES ($1, $2, $3, $4, $5, $6, $7)"
        )
        .bind(run_uuid)
        .bind(&run_name)
        .bind(&def.image)
        .bind(&def.commands)
        .bind("running")
        .bind(now)
        .bind(def.id)
        .execute(&pool)
        .await {
            tracing::error!("Failed to insert test run for definition {}: {}", def.id, e);
            continue;
        }

        // Create Kubernetes job
        let job_name = format!("test-run-{run_uuid}");
        let k8s_command: Vec<String> = if def.commands.len() == 1 {
            vec!["sh".into(), "-c".into(), def.commands[0].clone()]
        } else {
            vec!["sh".into(), "-c".into(), def.commands.join(" && ")]
        };

        let mut job_created = false;
        if let Ok(client) = KubernetesClient::new().await {
            if client
                .submit_job(&job_name, &def.image, &k8s_command)
                .await
                .is_ok()
            {
                job_created = true;
                // Spawn monitor task
                let pool_clone = pool.clone();
                let job_name_clone = job_name.clone();
                tokio::spawn(async move {
                    if let Err(e) =
                        monitor_job_and_update_status(run_uuid, job_name_clone, pool_clone).await
                    {
                        tracing::error!("Job monitor failed for run {}: {}", run_uuid, e);
                    }
                });
            } else {
                // Mark as failed
                sqlx::query("UPDATE test_runs SET status = $1 WHERE id = $2")
                    .bind("failed")
                    .bind(run_uuid)
                    .execute(&pool)
                    .await
                    .ok();
            }
        }

        created_runs.push(serde_json::json!({
            "id": run_uuid,
            "name": run_name,
            "image": def.image,
            "command": def.commands,
            "status": if job_created { "running" } else { "failed" },
            "createdAt": now.to_rfc3339(),
            "jobName": job_name,
            "jobCreated": job_created,
            "definitionId": def.id
        }));

        // If sequential mode, we could add delays or wait for completion here
        // For now, we'll create all jobs in parallel regardless of execution_mode
    }

    Ok(Json(serde_json::json!({
        "suiteId": suite_uuid,
        "suiteName": suite_name,
        "executionMode": execution_mode,
        "runs": created_runs,
        "message": format!("Created {} test runs for suite {}", created_runs.len(), suite_name)
    })))
}

async fn get_suite_definitions(
    pool: &PgPool,
    definition_ids: &[Uuid],
) -> Result<Vec<TestDefinition>, sqlx::Error> {
    let mut definitions = Vec::new();

    for &def_id in definition_ids {
        if let Some(def) = sqlx::query_as::<_, (Uuid, String, String, Vec<String>)>(
            "SELECT id, name, image, commands FROM test_definitions WHERE id = $1",
        )
        .bind(def_id)
        .fetch_optional(pool)
        .await?
        {
            definitions.push(TestDefinition {
                id: def.0,
                name: def.1,
                image: def.2,
                commands: def.3,
            });
        }
    }

    Ok(definitions)
}

#[derive(Debug)]
struct TestDefinition {
    id: Uuid,
    name: String,
    image: String,
    commands: Vec<String>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_health_check() {
        let response = health_check().await;
        assert_eq!(response.0.status, "healthy");
        assert!(!response.0.timestamp.is_empty());
    }

    // Tests disabled until database pool can be properly mocked
    // #[tokio::test]
    // async fn test_get_runs() {
    //     let result = get_runs().await;
    //     assert!(result.is_ok());
    //     let runs = result.unwrap().0;
    //     assert_eq!(runs.len(), 0);
    // }

    // #[tokio::test]
    // async fn test_create_run() {
    //     let request = CreateRunRequest {
    //         name: "Test Run".to_string(),
    //         image: "test:latest".to_string(),
    //         commands: vec!["echo".to_string(), "hello".to_string()],
    //     };

    //     let result = create_run(JsonBody(request)).await;
    //     assert!(result.is_ok());

    //     let run = result.unwrap().0;
    //     assert_eq!(run["name"], "Test Run");
    //     assert_eq!(run["image"], "test:latest");
    //     assert_eq!(run["status"], "running");
    // }

    // Tests disabled until database pool can be properly mocked
    // #[tokio::test]
    // async fn test_get_run() {
    //     let id = Uuid::new_v4();
    //     let result = get_run(Path(id), Extension(pool)).await;
    //     assert!(result.is_err());
    //     assert_eq!(result.unwrap_err(), StatusCode::NOT_FOUND);
    // }

    // #[tokio::test]
    // async fn test_delete_run() {
    //     let id = Uuid::new_v4();
    //     let result = delete_run(Path(id), Extension(pool)).await;
    //     assert!(result.is_ok());
    //     assert_eq!(result.unwrap(), StatusCode::NO_CONTENT);
    // }

    #[tokio::test]
    async fn test_k8s_health() {
        let response = k8s_health().await;
        let value = response.0;
        // In test environment, Kubernetes is typically not available
        assert_eq!(value["kubernetes_connected"], false);
        assert!(value["timestamp"].is_string());
        assert!(value["error"].is_string());
    }

    #[tokio::test]
    async fn test_get_job_logs() {
        let job_name = "test-job".to_string();
        let response = get_job_logs(Path(job_name.clone())).await;
        let value = response.0;
        assert_eq!(value["job_name"], job_name);
        // In test environment, Kubernetes is not available, so expect error
        assert_eq!(value["status"], "error");
        assert!(value["error"].is_string());
        assert!(value["timestamp"].is_string());
    }

    #[tokio::test]
    async fn test_get_job_status() {
        let job_name = "test-job".to_string();
        let response = get_job_status(Path(job_name.clone())).await;
        let value = response.0;
        assert_eq!(value["job_name"], job_name);
        // In test environment, Kubernetes is not available, so expect error
        assert_eq!(value["status"], "error");
        assert!(value["error"].is_string());
        assert!(value["timestamp"].is_string());
    }

    #[tokio::test]
    async fn test_delete_job() {
        let job_name = "test-job".to_string();
        let response = delete_job(Path(job_name.clone())).await;
        let value = response.0;
        // In test environment, Kubernetes is not available, so expect error
        assert!(value["error"].is_string());
        assert!(value["timestamp"].is_string());
        let error_msg = value["error"].as_str().unwrap();
        assert!(error_msg.contains("Kubernetes client unavailable"));
    }
}

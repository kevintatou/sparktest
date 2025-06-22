use kube::{api::{Api, PostParams}, Client, ResourceExt};
use k8s_openapi::api::batch::v1::Job;
use k8s_openapi::api::core::v1::{Container, PodSpec, PodTemplateSpec};
use k8s_openapi::apimachinery::pkg::apis::meta::v1::ObjectMeta;
use sqlx::PgPool;
use uuid::Uuid;
use tokio::time::{sleep, Duration};
use chrono::Utc;

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
            ..Default::default()
        },
        spec: Some(k8s_openapi::api::batch::v1::JobSpec {
            template: PodTemplateSpec {
                metadata: Some(ObjectMeta {
                    labels: Some(std::collections::BTreeMap::from([
                        ("job-name".to_string(), job_name.to_string())
                    ])),
                    ..Default::default()
                }),
                spec: Some(PodSpec {
                    containers: vec![
                        Container {
                            name: job_name.to_string(),
                            image: Some(image.to_string()),
                            command: Some(command.to_vec()),
                            ..Default::default()
                        }
                    ],
                    restart_policy: Some("Never".to_string()),
                    ..Default::default()
                }),
            },
            backoff_limit: Some(0),
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
                if conds.iter().any(|c| c.type_ == "Complete" && c.status == "True") {
                    status = "succeeded".to_string();
                    break;
                } else if conds.iter().any(|c| c.type_ == "Failed" && c.status == "True") {
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

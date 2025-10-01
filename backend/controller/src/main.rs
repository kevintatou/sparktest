use anyhow::Result;
use kube::{Client, ResourceExt};
use sparktest_controller::{
    reconciler::{reconcile, ReconcilerContext, ReconcileError},
    TestRun,
};
use std::sync::Arc;
use tokio::time::Duration;
use tracing::{info, error};
use futures::StreamExt;
use kube::runtime::controller::{Action, Controller};
use kube::runtime::watcher::Config;

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize tracing
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new("info")),
        )
        .init();

    info!("Starting SparkTest Controller");

    // Create Kubernetes client
    let client = Client::try_default().await?;
    info!("Connected to Kubernetes cluster");

    // Get backend URL from environment
    let backend_url = std::env::var("SPARKTEST_BACKEND_URL")
        .unwrap_or_else(|_| "http://sparktest-backend-service:8080/api".to_string());
    info!("Backend URL: {}", backend_url);

    // Create controller context
    let context = Arc::new(ReconcilerContext {
        client: client.clone(),
        backend_url,
    });

    // Set up the controller
    Controller::new(
        kube::Api::<TestRun>::all(client.clone()),
        Config::default(),
    )
    .run(
        |testrun, ctx| async move {
            let name = testrun.name_any();
            let namespace = testrun.namespace().unwrap_or_else(|| "default".to_string());
            
            info!("Reconciling TestRun {}/{}", namespace, name);
            
            match reconcile(testrun, ctx).await {
                Ok(action) => {
                    info!("Reconciled TestRun {}/{} successfully", namespace, name);
                    Ok(action)
                }
                Err(e) => {
                    error!("Failed to reconcile TestRun {}/{}: {:?}", namespace, name, e);
                    Ok(Action::requeue(Duration::from_secs(60)))
                }
            }
        },
        |_testrun, error: &ReconcileError, _ctx| {
            error!("Reconciliation error: {:?}", error);
            Action::requeue(Duration::from_secs(60))
        },
        context,
    )
    .for_each(|res| async move {
        match res {
            Ok(o) => info!("Reconciled: {:?}", o),
            Err(e) => error!("Reconciliation error: {:?}", e),
        }
    })
    .await;

    Ok(())
}

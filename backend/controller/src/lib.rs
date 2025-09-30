pub mod crd;
pub mod reconciler;

pub use crd::TestRun;
pub use reconciler::{reconcile, error_policy, ReconcilerContext, build_job};

use futures::StreamExt;
use kube::{
    runtime::{controller::Controller, watcher::Config},
    Client,
};
use std::sync::Arc;

/// Start the TestRun controller
pub async fn start_controller(backend_url: String) {
    tracing::info!("Starting TestRun controller");
    
    let client = match Client::try_default().await {
        Ok(c) => c,
        Err(e) => {
            tracing::error!("Failed to create Kubernetes client: {}", e);
            return;
        }
    };
    
    let context = Arc::new(ReconcilerContext {
        client: client.clone(),
        backend_url,
    });
    
    let testruns = kube::Api::<TestRun>::all(client.clone());
    
    Controller::new(testruns, Config::default())
        .run(reconcile, error_policy, context)
        .for_each(|res| async move {
            match res {
                Ok((_obj_ref, _action)) => {
                    tracing::info!("Reconciliation successful");
                }
                Err(err) => {
                    tracing::error!("Reconciliation error: {:?}", err);
                }
            }
        })
        .await;
}

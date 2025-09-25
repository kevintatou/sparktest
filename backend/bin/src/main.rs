use sparktest_api::create_app;
use sqlx::postgres::PgPoolOptions;
use std::net::SocketAddr;
use tokio::net::TcpListener;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG")
                .unwrap_or_else(|_| "sparktest_bin=debug,tower_http=debug".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Load environment variables
    dotenvy::dotenv().ok();

    // Get database URL from environment - PostgreSQL only
    let database_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgresql://sparktest:sparktest_dev_password@localhost:5432/sparktest".to_string());

    tracing::info!("Connecting to PostgreSQL database: {}", database_url);

    // Connect to PostgreSQL database
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("Failed to connect to PostgreSQL database");

    // Run PostgreSQL migrations
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("Failed to run PostgreSQL migrations");

    let app = create_app(pool);

    // Get port from environment
    let port = std::env::var("PORT")
        .unwrap_or_else(|_| "8080".to_string())
        .parse::<u16>()
        .expect("PORT must be a valid number");

    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    let listener = TcpListener::bind(addr).await?;

    tracing::info!("Server starting on {}", addr);

    // Start the server
    axum::serve(listener, app)
        .await
        .expect("Server failed to start");

    Ok(())
}

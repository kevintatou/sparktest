use sparktest_api::create_app;
use sparktest_core::Database;
use sqlx::{postgres::PgPoolOptions, sqlite::SqlitePoolOptions, AnyPool, Pool, Sqlite, Postgres};
use std::net::SocketAddr;
use tokio::net::TcpListener;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

enum DatabasePool {
    Postgres(Pool<Postgres>),
    Sqlite(Pool<Sqlite>),
}

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

    // Get database URL from environment
    let database_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "sqlite:///data/sparktest.db".to_string());

    tracing::info!("Connecting to database: {}", database_url);

    // Connect to database based on URL scheme
    let pool = if database_url.starts_with("postgresql://") || database_url.starts_with("postgres://") {
        tracing::info!("Using PostgreSQL database");
        let pg_pool = PgPoolOptions::new()
            .max_connections(5)
            .connect(&database_url)
            .await
            .expect("Failed to connect to PostgreSQL database");
        
        // Run PostgreSQL migrations
        sqlx::migrate!("./migrations")
            .run(&pg_pool)
            .await
            .expect("Failed to run PostgreSQL migrations");
        
        DatabasePool::Postgres(pg_pool)
    } else {
        tracing::info!("Using SQLite database");
        // Create data directory if it doesn't exist
        std::fs::create_dir_all("/data").ok();
        
        let sqlite_pool = SqlitePoolOptions::new()
            .max_connections(5)
            .connect(&database_url)
            .await
            .expect("Failed to connect to SQLite database");
        
        // For now, skip migrations for SQLite as we'd need separate migration files
        // In a real implementation, you'd have separate migration directories
        tracing::warn!("SQLite migrations not implemented - using in-memory state");
        
        DatabasePool::Sqlite(sqlite_pool)
    };

    // Create the application
    let app = create_app();

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

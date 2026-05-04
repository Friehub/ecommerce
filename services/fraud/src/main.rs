mod rules;
mod db;
mod handlers;

use std::sync::Arc;
use axum::{routing::{get, post}, Router};
use std::net::SocketAddr;
use crate::db::FraudDb;
use crate::handlers::{check_transaction_handler, health_handler};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use sqlx::postgres::PgPoolOptions;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "fraud=debug,tower_http=debug".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Initialize Database
    let db_url = std::env::var("DATABASE_URL").unwrap_or_else(|_| "postgres://postgres:postgres@localhost/jumia".into());
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await?;
    let db = Arc::new(FraudDb::new(pool));

    // Build router
    let app = Router::new()
        .route("/health", get(health_handler))
        .route("/check", post(check_transaction_handler))
        .layer(tower_http::cors::CorsLayer::permissive())
        .with_state(db);

    // Start server
    let addr = SocketAddr::from(([0, 0, 0, 0], 3004));
    tracing::info!("Fraud service listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

mod index;
mod handlers;

use std::sync::Arc;
use axum::{routing::{get, post}, Router};
use std::net::SocketAddr;
use crate::index::SearchIndex;
use crate::handlers::{search_handler, health_handler, upsert_handler, bulk_upsert_handler};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "search=debug,tower_http=debug".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Initialize Search Index
    let index_path = std::env::var("INDEX_PATH").unwrap_or_else(|_| "./data/index".into());
    let search_index = Arc::new(SearchIndex::new(&index_path)?);

    // Build router
    let app = Router::new()
        .route("/health", get(health_handler))
        .route("/search", get(search_handler))
        .route("/upsert", post(upsert_handler))
        .route("/bulk_upsert", post(bulk_upsert_handler))
        .layer(tower_http::cors::CorsLayer::permissive())
        .with_state(search_index);

    // Start server
    let addr = SocketAddr::from(([0, 0, 0, 0], 3001));
    tracing::info!("Search service listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await?;
    
    let shutdown_index = search_index.clone();
    axum::serve(listener, app)
        .with_graceful_shutdown(async move {
            tokio::signal::ctrl_c()
                .await
                .expect("failed to install CTRL+C handler");
            tracing::info!("Shutdown signal received. Committing search index...");
            let mut writer = shutdown_index.writer.lock().await;
            if let Err(e) = writer.commit() {
                tracing::error!("Failed to commit search index on shutdown: {}", e);
            }
            tracing::info!("Search index committed. Exiting.");
        })
        .await?;

    Ok(())
}

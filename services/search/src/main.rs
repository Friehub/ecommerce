mod index;
mod handlers;

use std::sync::Arc;
use axum::{routing::get, Router};
use std::net::SocketAddr;
use crate::index::SearchIndex;
use crate::handlers::{search_handler, health_handler};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize tracing
    let filter = std::env::var("RUST_LOG").unwrap_or_else(|_| "search=debug,tower_http=debug".into());
    let format = std::env::var("LOG_FORMAT").unwrap_or_else(|_| "text".into());
    let registry = tracing_subscriber::registry().with(tracing_subscriber::EnvFilter::new(filter));
    if format == "json" {
        registry.with(tracing_subscriber::fmt::layer().json()).init();
    } else {
        registry.with(tracing_subscriber::fmt::layer()).init();
    }


    // Initialize Search Index
    let index_path = std::env::var("INDEX_PATH").unwrap_or_else(|_| "./data/index".into());
    let search_index = Arc::new(SearchIndex::new(&index_path)?);

    // Build router
    let app = Router::new()
        .route("/health", get(health_handler))
        .route("/search", get(search_handler))
        .route("/upsert", axum::routing::post(crate::handlers::upsert_handler))
        .layer(tower_http::cors::CorsLayer::permissive())
        .with_state(search_index);

    // Start server
    let addr = SocketAddr::from(([0, 0, 0, 0], 3001));
    tracing::info!("Search service listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

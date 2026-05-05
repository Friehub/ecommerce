mod redis_client;
mod handlers;

use std::sync::Arc;
use axum::{routing::{get, post}, Router, http::{HeaderValue, Method}};
use std::net::SocketAddr;
use crate::redis_client::InventoryRedis;
use crate::handlers::{reserve_handler, confirm_handler, health_handler};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "inventory=debug,tower_http=debug".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Initialize Redis
    let redis_url = std::env::var("REDIS_URL").unwrap_or_else(|_| "redis://127.0.0.1/".into());
    let redis = Arc::new(InventoryRedis::new(&redis_url)?);

    // Build router
    let app = Router::new()
        .route("/health", get(health_handler))
        .route("/reserve", post(reserve_handler))
        .route("/confirm", post(confirm_handler))
        .layer(
            tower_http::cors::CorsLayer::new()
                .allow_origin("http://localhost:4000".parse::<HeaderValue>().unwrap())
                .allow_methods([Method::GET, Method::POST])
        )
        .with_state(redis);

    // Start server
    let addr = SocketAddr::from(([0, 0, 0, 0], 3002));
    tracing::info!("Inventory service listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

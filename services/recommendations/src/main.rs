mod engine;
mod service;
mod handlers;

use std::sync::Arc;
use axum::{routing::get, Router, http::{HeaderValue, Method}};
use std::net::SocketAddr;
use crate::service::RecommendationService;
use crate::handlers::{product_recommendations_handler, user_recommendations_handler, health_handler};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use sqlx::postgres::PgPoolOptions;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "recommendations=debug,tower_http=debug".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Initialize Database
    let db_url = std::env::var("DATABASE_URL").unwrap_or_else(|_| "postgres://postgres:postgres@localhost/jumia".into());
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await?;
    let service = Arc::new(RecommendationService::new(pool));

    // Build router
    let app = Router::new()
        .route("/health", get(health_handler))
        .route("/product/:id", get(product_recommendations_handler))
        .route("/user/:id", get(user_recommendations_handler))
        .layer(
            tower_http::cors::CorsLayer::new()
                .allow_origin("http://localhost:4000".parse::<HeaderValue>().unwrap())
                .allow_methods([Method::GET, Method::POST])
        )
        .with_state(service);

    // Start server
    let addr = SocketAddr::from(([0, 0, 0, 0], 3005));
    tracing::info!("Recommendations service listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

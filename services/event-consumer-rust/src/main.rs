use std::net::SocketAddr;
use std::sync::Arc;
use axum::{routing::get, Router};
use redis::AsyncCommands;
use tokio::time::{sleep, Duration};
use tracing::{info, error};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "event_consumer_rust=debug,tower_http=debug".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    info!("🚀 Rust Event Consumer starting...");

    // Redis client
    let redis_url = std::env::var("REDIS_URL").unwrap_or_else(|_| "redis://127.0.0.1/".into());
    let client = redis::Client::open(redis_url)?;
    let client = Arc::new(client);

    // Start health check server
    let app = Router::new()
        .route("/health", get(|| async { "ok" }));

    let addr = SocketAddr::from(([0, 0, 0, 0], 3007));
    info!("Health check listening on {}", addr);

    let health_task = tokio::spawn(async move {
        let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
        axum::serve(listener, app).await.unwrap();
    });

    // Start event consumer loop
    let consumer_client = Arc::clone(&client);
    let consumer_task = tokio::spawn(async move {
        let mut conn = match consumer_client.get_multiplexed_async_connection().await {
            Ok(c) => c,
            Err(e) => {
                error!("Failed to connect to Redis: {}", e);
                return;
            }
        };

        info!("Consumer loop started. Listening for events on 'system-events'...");

        loop {
            // LPOP from 'system-events'
            let event: Option<String> = match conn.lpop("system-events", None).await {
                Ok(v) => v,
                Err(e) => {
                    error!("Redis error: {}", e);
                    sleep(Duration::from_secs(5)).await;
                    continue;
                }
            };

            if let Some(event_str) = event {
                info!("Processing event: {}", event_str);
                // In a real app, we would parse JSON and dispatch to handlers
            } else {
                // Wait a bit before polling again
                sleep(Duration::from_millis(500)).await;
            }
        }
    });

    tokio::select! {
        _ = health_task => info!("Health server stopped"),
        _ = consumer_task => info!("Consumer task stopped"),
    }

    Ok(())
}

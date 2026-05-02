mod engine;
mod grpc_service;

use std::sync::Arc;
use tonic::transport::Server;
use axum::{routing::get, Router};
use std::net::SocketAddr;
use crate::engine::AuctionEngine;
use crate::grpc_service::{MyAuction, proto::auction_server::AuctionServer};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "auction=debug".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Initialize Auction Engine
    let engine = Arc::new(AuctionEngine::new());

    // Initialize gRPC Service
    let auction_service = MyAuction { engine };

    // Start Axum for health check
    let app = Router::new()
        .route("/health", get(|| async { "ok" }));
    
    let health_addr = SocketAddr::from(([0, 0, 0, 0], 3003));
    tracing::info!("Auction health check listening on {}", health_addr);
    
    let health_listener = tokio::net::TcpListener::bind(health_addr).await?;
    let health_task = tokio::spawn(async move {
        axum::serve(health_listener, app).await.unwrap();
    });

    let addr = "0.0.0.0:50051".parse()?;
    tracing::info!("Auction gRPC service listening on {}", addr);

    let grpc_task = Server::builder()
        .add_service(AuctionServer::new(auction_service))
        .serve(addr);

    tokio::select! {
        _ = health_task => {},
        res = grpc_task => {
            res?;
        }
    }

    Ok(())
}

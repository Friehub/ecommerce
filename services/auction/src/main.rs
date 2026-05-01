mod engine;
mod grpc_service;

use std::sync::Arc;
use tonic::transport::Server;
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

    let addr = "0.0.0.0:50051".parse()?;
    tracing::info!("Auction gRPC service listening on {}", addr);

    Server::builder()
        .add_service(AuctionServer::new(auction_service))
        .serve(addr)
        .await?;

    Ok(())
}

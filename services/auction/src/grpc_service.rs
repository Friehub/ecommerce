use tonic::{Request, Response, Status};
use crate::engine::AuctionEngine;
use std::sync::Arc;
use rust_decimal::prelude::ToPrimitive;

// Include the generated proto code
pub mod proto {
    tonic::include_proto!("auction");
}

use proto::auction_server::Auction;
pub use proto::{ResolveAuctionRequest, ResolveAuctionResponse, AdPlacement};

pub struct MyAuction {
    pub engine: Arc<AuctionEngine>,
}

#[tonic::async_trait]
impl Auction for MyAuction {
    async fn resolve_auction(
        &self,
        request: Request<ResolveAuctionRequest>,
    ) -> Result<Response<ResolveAuctionResponse>, Status> {
        let req = request.into_inner();
        
        tracing::debug!("Resolving auction for keywords: {:?}", req.keywords);

        let winners = self.engine.resolve_auction(&req.keywords, &req.category);

        let placements = winners.into_iter().enumerate().map(|(i, c)| {
            AdPlacement {
                campaign_id: c.id,
                product_id: c.product_id,
                slot_id: format!("slot_{}", i + 1),
                ad_type: "SPONSORED_PRODUCT".to_string(),
                bid_amount: c.bid_amount.to_f64().unwrap_or(0.0),
            }
        }).collect();

        Ok(Response::new(ResolveAuctionResponse { placements }))
    }
}

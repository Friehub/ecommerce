use axum::{extract::{State, Path}, Json, http::StatusCode};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use crate::redis_client::InventoryRedis;

#[derive(Deserialize)]
pub struct ReserveRequest {
    pub sku: String,
    pub qty: u32,
}

#[derive(Serialize)]
pub struct ReserveResponse {
    pub reservation_id: String,
}

pub async fn reserve_handler(
    State(redis): State<Arc<InventoryRedis>>,
    Json(payload): Json<ReserveRequest>,
) -> Result<Json<ReserveResponse>, (StatusCode, String)> {
    match redis.reserve_stock(&payload.sku, payload.qty, 300).await {
        Ok(Some(id)) => Ok(Json(ReserveResponse { reservation_id: id })),
        Ok(None) => Err((StatusCode::CONFLICT, "Out of stock".to_string())),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

pub async fn confirm_handler(
    State(redis): State<Arc<InventoryRedis>>,
    Path(id): Path<String>,
) -> Result<StatusCode, (StatusCode, String)> {
    match redis.confirm_reservation(&id).await {
        Ok(true) => Ok(StatusCode::OK),
        Ok(false) => Err((StatusCode::NOT_FOUND, "Reservation not found or expired".to_string())),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

pub async fn health_handler() -> &'static str {
    "OK"
}

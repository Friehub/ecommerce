use axum::{extract::{State, Path}, Json, http::StatusCode};
use std::sync::Arc;
use crate::service::RecommendationService;
use crate::engine::RecommendedProduct;

pub async fn product_recommendations_handler(
    State(service): State<Arc<RecommendationService>>,
    Path(id): Path<String>,
) -> Result<Json<Vec<RecommendedProduct>>, (StatusCode, String)> {
    match service.get_product_recommendations(&id).await {
        Ok(recs) => Ok(Json(recs)),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

pub async fn user_recommendations_handler(
    State(service): State<Arc<RecommendationService>>,
    Path(id): Path<String>,
) -> Result<Json<Vec<RecommendedProduct>>, (StatusCode, String)> {
    match service.get_user_recommendations(&id).await {
        Ok(recs) => Ok(Json(recs)),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

pub async fn health_handler() -> &'static str {
    "OK"
}

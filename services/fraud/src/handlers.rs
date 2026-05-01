use axum::{extract::State, Json, http::StatusCode};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use crate::rules::{FraudRules, TransactionData};
use crate::db::FraudDb;

#[derive(Serialize)]
pub struct FraudCheckResponse {
    pub risk_score: u32,
    pub recommendation: String, // "ALLOW", "REVIEW", "BLOCK"
}

pub async fn check_transaction_handler(
    State(db): State<Arc<FraudDb>>,
    Json(payload): Json<TransactionData>,
) -> Result<Json<FraudCheckResponse>, (StatusCode, String)> {
    let (history_count, avg_amount) = db.get_user_history(&payload.user_id).await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let score = FraudRules::calculate_score(&payload, history_count, avg_amount);

    let recommendation = if score >= 70 {
        "BLOCK".to_string()
    } else if score >= 30 {
        "REVIEW".to_string()
    } else {
        "ALLOW".to_string()
    };

    Ok(Json(FraudCheckResponse {
        risk_score: score,
        recommendation,
    }))
}

pub async fn health_handler() -> &'static str {
    "OK"
}

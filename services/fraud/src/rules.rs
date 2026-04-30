use serde::{Deserialize, Serialize};
use rust_decimal::Decimal;
use rust_decimal_macros::dec;

#[derive(Debug, Serialize, Deserialize)]
pub struct TransactionData {
    pub user_id: String,
    pub amount: Decimal,
    pub currency: String,
    pub ip_address: String,
    pub shipping_country: String,
    pub device_id: String,
}

pub struct FraudRules;

impl FraudRules {
    pub fn calculate_score(data: &TransactionData, history_count: i64, avg_amount: Decimal) -> u32 {
        let mut score = 0;

        // Rule 1: High transaction amount
        if data.amount > dec!(5000) {
            score += 30;
        }

        // Rule 2: Amount significantly higher than average (e.g. > 5x)
        if avg_amount > dec!(0) && data.amount > avg_amount * dec!(5) {
            score += 40;
        }

        // Rule 3: Velocity (many transactions for a new user)
        if history_count < 5 && data.amount > dec!(1000) {
            score += 20;
        }

        // Rule 4: Potential Geo-mismatch (simplified IP-to-Country check placeholder)
        // In reality, use a GeoIP database here
        if data.shipping_country == "NG" && !data.ip_address.starts_with("102.") {
             // Mock condition for Nigeria IPs
             score += 10;
        }

        score.min(100)
    }
}

use serde::{Deserialize, Serialize};
use rust_decimal::Decimal;
use rust_decimal_macros::dec;
use rust_decimal::prelude::ToPrimitive;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Campaign {
    pub id: String,
    pub product_id: String,
    pub bid_amount: Decimal,
    pub quality_score: f64,
    pub keywords: Vec<String>,
    pub category: String,
}

pub struct AuctionEngine {
    // In-memory campaign store (mocked for now)
    pub campaigns: Vec<Campaign>,
}

impl AuctionEngine {
    pub fn new() -> Self {
        // Mock data
        let campaigns = vec![
            Campaign {
                id: "camp_1".into(),
                product_id: "prod_123".into(),
                bid_amount: dec!(0.50),
                quality_score: 0.9,
                keywords: vec!["phone".into(), "iphone".into()],
                category: "electronics".into(),
            },
            Campaign {
                id: "camp_2".into(),
                product_id: "prod_456".into(),
                bid_amount: dec!(0.75),
                quality_score: 0.8,
                keywords: vec!["phone".into(), "samsung".into()],
                category: "electronics".into(),
            },
        ];

        Self { campaigns }
    }

    pub fn resolve_auction(&self, keywords: &[String], category: &str) -> Vec<Campaign> {
        let mut candidates: Vec<_> = self.campaigns.iter()
            .filter(|c| {
                c.category == category || keywords.iter().any(|k| c.keywords.contains(k))
            })
            .collect();

        // Score = Bid * Quality Score
        candidates.sort_by(|a, b| {
            let score_a = a.bid_amount.to_f64().unwrap_or(0.0) * a.quality_score;
            let score_b = b.bid_amount.to_f64().unwrap_or(0.0) * b.quality_score;
            score_b.partial_cmp(&score_a).unwrap_or(std::cmp::Ordering::Equal)
        });

        candidates.into_iter().cloned().collect()
    }
}

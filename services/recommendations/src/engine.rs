use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecommendedProduct {
    pub id: String,
    pub score: f64,
    pub reason: String,
}

pub struct RecommendationEngine;

impl RecommendationEngine {
    pub fn get_similar_items(&self, product_id: &str) -> Vec<RecommendedProduct> {
        // Mock logic: Find items frequently bought with product_id
        vec![
            RecommendedProduct {
                id: format!("{}_acc_1", product_id),
                score: 0.95,
                reason: "Frequently bought together".into(),
            },
            RecommendedProduct {
                id: format!("{}_acc_2", product_id),
                score: 0.85,
                reason: "Related accessory".into(),
            },
        ]
    }

    pub fn get_user_recommendations(&self, user_id: &str) -> Vec<RecommendedProduct> {
        // Mock logic: Based on user_id history
        vec![
            RecommendedProduct {
                id: "prod_electronics_1".into(),
                score: 0.9,
                reason: "Because you bought a phone".into(),
            },
            RecommendedProduct {
                id: "prod_fashion_1".into(),
                score: 0.7,
                reason: "Top trending in your area".into(),
            },
        ]
    }
}

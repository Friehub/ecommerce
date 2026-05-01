use sqlx::PgPool;
use moka::future::Cache;
use anyhow::Result;
use std::sync::Arc;
use crate::engine::{RecommendationEngine, RecommendedProduct};

pub struct RecommendationService {
    db: PgPool,
    engine: RecommendationEngine,
    cache: Cache<String, Vec<RecommendedProduct>>,
}

impl RecommendationService {
    pub fn new(db: PgPool) -> Self {
        let cache = Cache::builder()
            .max_capacity(1000)
            .time_to_live(std::time::Duration::from_secs(3600))
            .build();

        Self {
            db,
            engine: RecommendationEngine,
            cache,
        }
    }

    pub async fn get_product_recommendations(&self, product_id: &str) -> Result<Vec<RecommendedProduct>> {
        if let Some(cached) = self.cache.get(product_id).await {
            return Ok(cached);
        }

        // In reality, fetch from DB or run complex algorithm
        let recs = self.engine.get_similar_items(product_id);
        
        self.cache.insert(product_id.to_string(), recs.clone()).await;
        Ok(recs)
    }

    pub async fn get_user_recommendations(&self, user_id: &str) -> Result<Vec<RecommendedProduct>> {
        let cache_key = format!("user:{}", user_id);
        if let Some(cached) = self.cache.get(&cache_key).await {
            return Ok(cached);
        }

        let recs = self.engine.get_user_recommendations(user_id);
        
        self.cache.insert(cache_key, recs.clone()).await;
        Ok(recs)
    }
}

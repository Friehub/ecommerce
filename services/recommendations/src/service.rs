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

        // R07: Fetch real similar items from DB based on category
        // Find the category of the given product first
        let cat_row: Option<(String,)> = sqlx::query_as("SELECT category_id FROM products p JOIN product_variants pv ON p.id = pv.product_id WHERE pv.id = $1")
            .bind(product_id)
            .fetch_optional(&self.db)
            .await?;

        let recs = if let Some((cat_id,)) = cat_row {
            let rows: Vec<(String, f64)> = sqlx::query_as(
                "SELECT pv.id, p.rating FROM product_variants pv 
                 JOIN products p ON p.id = pv.product_id 
                 WHERE p.category_id = $1 AND pv.id != $2 AND p.is_active = true 
                 ORDER BY p.rating DESC LIMIT 5"
            )
            .bind(cat_id)
            .bind(product_id)
            .fetch_all(&self.db)
            .await?;

            rows.into_iter().map(|(id, rating)| RecommendedProduct {
                id,
                score: rating / 5.0,
                reason: "Top rated in this category".into(),
            }).collect()
        } else {
            self.engine.get_similar_items(product_id)
        };
        
        self.cache.insert(product_id.to_string(), recs.clone()).await;
        Ok(recs)
    }

    pub async fn get_user_recommendations(&self, user_id: &str) -> Result<Vec<RecommendedProduct>> {
        let cache_key = format!("user:{}", user_id);
        if let Some(cached) = self.cache.get(&cache_key).await {
            return Ok(cached);
        }

        // R07: Fetch real recommendations based on user's last bought category
        let last_cat_row: Option<(String,)> = sqlx::query_as(
            "SELECT p.category_id FROM orders o 
             JOIN order_lines ol ON o.id = ol.order_id 
             JOIN product_variants pv ON ol.variant_id = pv.id 
             JOIN products p ON pv.product_id = p.id 
             WHERE o.user_id = $1 ORDER BY o.created_at DESC LIMIT 1"
        )
        .bind(user_id)
        .fetch_optional(&self.db)
        .await?;

        let recs = if let Some((cat_id,)) = last_cat_row {
            let rows: Vec<(String, f64)> = sqlx::query_as(
                "SELECT pv.id, p.rating FROM product_variants pv 
                 JOIN products p ON p.id = pv.product_id 
                 WHERE p.category_id = $1 AND p.is_active = true 
                 ORDER BY p.rating DESC LIMIT 5"
            )
            .bind(cat_id)
            .fetch_all(&self.db)
            .await?;

            rows.into_iter().map(|(id, rating)| RecommendedProduct {
                id,
                score: rating / 5.0,
                reason: "Based on your recent purchase".into(),
            }).collect()
        } else {
            self.engine.get_user_recommendations(user_id)
        };
        
        self.cache.insert(cache_key, recs.clone()).await;
        Ok(recs)
    }
}

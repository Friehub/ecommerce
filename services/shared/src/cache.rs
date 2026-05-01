// jumia-clone Service Cache
// Adapted from taas-gateway/rust/crates/gateway-cache/src/lib.rs

use moka::future::Cache;
use serde_json::Value;
use std::collections::BTreeMap;
use std::sync::Arc;
use std::time::Duration;
use thiserror::Error;
use tokio::sync::{broadcast, Mutex};
use tracing::{debug, warn};

#[derive(Error, Debug)]
pub enum CacheError {
    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),
    #[error("Inflight request failed")]
    InflightFailed,
}

pub enum CacheResult<T> {
    Hit(T),
    FetchNeeded,
    WaitLeader(broadcast::Receiver<T>),
}

#[derive(Clone)]
pub struct ServiceCache {
    l1: Cache<String, Value>,
    inflight: Arc<Mutex<BTreeMap<String, broadcast::Sender<Value>>>>,
}

impl ServiceCache {
    /// Initializes the Service L1 cache system pool.
    pub fn new(max_entries: u64, ttl_secs: u64) -> Self {
        let l1 = Cache::builder()
            .max_capacity(max_entries)
            .time_to_live(Duration::from_secs(ttl_secs))
            .build();

        Self {
            l1,
            inflight: Arc::new(Mutex::new(BTreeMap::new())),
        }
    }

    /// Check L1 cache, and coordinate inflight requests (Request Collapsing).
    pub async fn check(&self, key: &str) -> CacheResult<Value> {
        // 1. Interrogate L1 Cache (In-Memory)
        if let Some(val) = self.l1.get(key).await {
            debug!(key = %key, "L1 Cache Hit");
            return CacheResult::Hit(val);
        }

        // 2. Request Collapsing (Thundering Herd Protection)
        let mut inflight_guard = self.inflight.lock().await;
        if let Some(tx) = inflight_guard.get(key) {
            debug!(key = %key, "Request Collapsed - waiting for leader");
            return CacheResult::WaitLeader(tx.subscribe());
        }

        // 3. We are the leader, we must fetch
        let (tx, _) = broadcast::channel(1);
        inflight_guard.insert(key.to_string(), tx);
        CacheResult::FetchNeeded
    }

    /// Complete a fetch, populating caches and broadcasting to followers.
    pub async fn complete(&self, key: &str, value: Option<Value>) {
        if let Some(v) = value {
            // Populate L1
            self.l1.insert(key.to_string(), v.clone()).await;

            // Notify followers
            let mut inflight_guard = self.inflight.lock().await;
            if let Some(tx) = inflight_guard.remove(key) {
                if tx.send(v).is_err() {
                    warn!("Failed to notify cache WaitLeader: channel closed");
                }
            }
        } else {
            let mut inflight_guard = self.inflight.lock().await;
            inflight_guard.remove(key);
        }
    }

    /// Fetch failed, clear inflight block so others can try
    pub async fn clear_inflight(&self, key: &str) {
        let mut inflight_guard = self.inflight.lock().await;
        inflight_guard.remove(key);
    }
}

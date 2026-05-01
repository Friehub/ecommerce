use redis::{AsyncCommands, Client, Script};
use anyhow::Result;
use std::sync::Arc;

pub struct InventoryRedis {
    client: Client,
}

impl InventoryRedis {
    pub fn new(redis_url: &str) -> Result<Self> {
        let client = Client::open(redis_url)?;
        Ok(Self { client })
    }

    pub async fn reserve_stock(&self, sku: &str, qty: u32, ttl_secs: u64) -> Result<Option<String>> {
        let mut conn = self.client.get_async_connection().await?;
        
        // Lua script to atomically:
        // 1. Check if stock exists (sku_key)
        // 2. Decrement stock if >= qty
        // 3. Create reservation record (res_key) with TTL
        let script = Script::new(r#"
            local stock = tonumber(redis.call('GET', KEYS[1]))
            if stock and stock >= tonumber(ARGV[1]) then
                redis.call('DECRBY', KEYS[1], ARGV[1])
                local res_id = ARGV[2]
                redis.call('SETEX', KEYS[2], ARGV[3], ARGV[1])
                return res_id
            else
                return nil
            end
        "#);

        let reservation_id = uuid::Uuid::new_v4().to_string();
        let sku_key = format!("stock:{}", sku);
        let res_key = format!("res:{}", reservation_id);

        let result: Option<String> = script
            .key(sku_key)
            .key(res_key)
            .arg(qty)
            .arg(&reservation_id)
            .arg(ttl_secs)
            .invoke_async(&mut conn)
            .await?;

        Ok(result)
    }

    pub async fn confirm_reservation(&self, reservation_id: &str) -> Result<bool> {
        let mut conn = self.client.get_async_connection().await?;
        let res_key = format!("res:{}", reservation_id);
        
        // If reservation exists, delete it (committing it)
        let deleted: u32 = conn.del(res_key).await?;
        Ok(deleted > 0)
    }

    pub async fn release_reservation(&self, sku: &str, reservation_id: &str) -> Result<bool> {
        let mut conn = self.client.get_async_connection().await?;
        let res_key = format!("res:{}", reservation_id);
        
        // Lua script to release:
        // 1. Get qty from reservation
        // 2. Increment stock back
        // 3. Delete reservation
        let script = Script::new(r#"
            local qty = redis.call('GET', KEYS[2])
            if qty then
                redis.call('INCRBY', KEYS[1], qty)
                redis.call('DEL', KEYS[2])
                return 1
            else
                return 0
            end
        "#);

        let sku_key = format!("stock:{}", sku);
        let result: u32 = script
            .key(sku_key)
            .key(res_key)
            .invoke_async(&mut conn)
            .await?;

        Ok(result > 0)
    }
}

use sqlx::PgPool;
use anyhow::Result;
use rust_decimal::Decimal;
use rust_decimal_macros::dec;

pub struct FraudDb {
    pool: PgPool,
}

impl FraudDb {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn get_user_history(&self, user_id: &str) -> Result<(i64, Decimal)> {
        let row: (i64, Option<Decimal>) = sqlx::query_as(
            "SELECT COUNT(*), AVG(amount) FROM orders WHERE user_id = $1 AND status = 'COMPLETED'"
        )
        .bind(user_id)
        .fetch_one(&self.pool)
        .await?;

        Ok((row.0, row.1.unwrap_or(dec!(0))))
    }
}

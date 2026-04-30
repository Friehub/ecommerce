// jumia-clone Service Error
// Adapted from taas-gateway/rust/shared/src/error.rs

use thiserror::Error;

/// Extension trait for automatic error observability.
pub trait ErrorExt {
    /// Records the error in the monitoring system (Prometheus).
    fn record(&self);
}

/// Centralized Service Error that bridges internal failures with HTTP/gRPC responses.
#[derive(Debug, Error)]
pub enum ServiceError {
    #[error("Internal error: {0}")]
    Internal(String),

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Out of stock: {0}")]
    OutOfStock(String),

    #[error("Unauthorized: {0}")]
    Unauthorized(String),

    #[error("Invalid input: {0}")]
    InvalidInput(String),

    #[error("Conflict: {0}")]
    Conflict(String),

    #[error("Payment failed: {0}")]
    PaymentFailed(String),

    #[error("Rate limited")]
    RateLimited,
}

impl ErrorExt for ServiceError {
    fn record(&self) {
        let code = match self {
            Self::Internal(_)      => "INTERNAL",
            Self::NotFound(_)      => "NOT_FOUND",
            Self::OutOfStock(_)    => "OUT_OF_STOCK",
            Self::Unauthorized(_)  => "UNAUTHORIZED",
            Self::InvalidInput(_)  => "INVALID_INPUT",
            Self::Conflict(_)      => "CONFLICT",
            Self::PaymentFailed(_) => "PAYMENT_FAILED",
            Self::RateLimited      => "RATE_LIMITED",
        };
        metrics::counter!("ecom_errors_total", "code" => code).increment(1);
    }
}

/// Helper to wrap string errors into Internal ServiceError.
impl From<String> for ServiceError {
    fn from(s: String) -> Self {
        Self::Internal(s)
    }
}

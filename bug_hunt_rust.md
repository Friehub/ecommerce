# Bug Hunt — Rust Microservices Audit
**Date:** 2026-05-05
**Services:** fraud, inventory, search, recommendations, image-processor, shared

---

## Summary Table

| ID | Service | File | Severity | Category | Description |
|----|---------|------|----------|----------|-------------|
| R01 | fraud | `db.rs` | CRITICAL | Logic | Fraud DB query is entirely commented out — always returns mock `(10, 150.00)` for every user |
| R02 | inventory | `redis_client.rs` vs `inventory-service.ts` | CRITICAL | Architecture | Rust inventory (Redis `stock:` keys) and Node.js inventory (Postgres `StockLevel`) are completely disconnected dual-systems |
| R03 | inventory | `handlers.rs:8` | CRITICAL | Logic | `ReserveRequest` expects `qty` but `RustClient` sends `quantity` — serde silently defaults `qty=0`, all reservations succeed but decrement nothing |
| R04 | search | `handlers.rs` | HIGH | Logic | `min_price`, `max_price`, `category_id`, and `brand` filter params are declared in `SearchParams` but never applied to the query — silently ignored |
| R05 | search | `handlers.rs` | HIGH | Logic | Search never filters `is_active=1` or `is_in_stock=1` — deleted, inactive, and out-of-stock products appear in all search results |
| R06 | search | `handlers.rs:upsert_handler` | HIGH | Reliability | New `IndexWriter` acquired on every upsert request — Tantivy writer holds a file lock, so concurrent upserts fail with a lock error |
| R07 | recommendations | `engine.rs` | HIGH | Logic | `get_similar_items` and `get_user_recommendations` return hardcoded mock product IDs — `db: PgPool` is never queried |
| R08 | image-processor | `handlers.rs` | HIGH | Security | No file size limit on multipart upload — attacker can POST a multi-GB file and OOM the process |
| R09 | All | `main.rs` (all) | HIGH | Security | All 6 services use `CorsLayer::permissive()` and bind to `0.0.0.0` — no auth middleware, exposed on all interfaces |
| R10 | fraud | `rules.rs:47` | MEDIUM | Logic | Geo-mismatch rule is a fake placeholder (`starts_with("102.")`) — adds +10 score for virtually every non-Nigerian IP in the world |
| R11 | search | `handlers.rs` | MEDIUM | Logic | `SearchResponse.total` is always hardcoded to `0` — pagination metadata is permanently broken |
| R12 | image-processor | `handlers.rs` | MEDIUM | Security | No MIME type validation before processing — any binary file accepted by multipart |
| R13 | inventory | `redis_client.rs:confirm_reservation` | MEDIUM | Logic | `confirm_reservation` only deletes the reservation key — does not restore stock to Postgres, no feedback to the DB layer |
| R14 | fraud | `rules.rs:30` | LOW | Logic | Rule 3 velocity check never fires — mocked `history_count=10` is always `>= 5`, so new user high-value transactions never get flagged |

---

## Detailed Findings

---

### R01 — Fraud DB Query Is Entirely Commented Out (All Users Return Same History)
**File:** `services/fraud/src/db.rs`
**Severity:** CRITICAL

```rust
pub async fn get_user_history(&self, user_id: &str) -> Result<(i64, Decimal)> {
    /*
    let row: (i64, Option<Decimal>) = sqlx::query_as(
        "SELECT COUNT(*), AVG(amount) FROM orders WHERE user_id = $1 AND status = 'COMPLETED'"
    )
    .bind(user_id)
    .fetch_one(&self.pool)
    .await?;
    */

    // Returning mock values for now
    Ok((10, dec!(150.00)))  // ← Every user on earth has history_count=10, avg=150
}
```

Every transaction evaluated by the fraud service uses the same fake history. The consequences:
- **Rule 2 (5x average):** Any order over ₦750 gets +40 risk score — this incorrectly flags most Nigerian consumer purchases.
- **Rule 3 (new user velocity):** `history_count=10 >= 5` always, so new users with no order history are never flagged.
- The `db: PgPool` connection is established at startup but never used.

**Fix:** Uncomment and implement the real query. Add a `user_id` index on the `orders` table for this query's performance.

---

### R02 — Dual Inventory Systems Are Completely Disconnected
**Files:** `services/inventory/src/redis_client.rs`, `packages/api/modules/inventory/services/inventory-service.ts`
**Severity:** CRITICAL

The platform has two entirely separate inventory management systems that never communicate:

| System | Storage | Operations |
|--------|---------|-----------|
| Rust service | Redis `stock:{sku}` keys | `reserve_stock`, `confirm_reservation`, `release_reservation` |
| Node.js service | Postgres `StockLevel` + `StockReservation` tables | `reserveStock`, `confirmStock`, `releaseStockByOrderId` |

The Node.js `RustClient.inventory.reserve()` is defined but is **never called anywhere in the Node.js codebase** — `inventoryService.ts` goes directly to Prisma. The Rust inventory service Redis keys are never seeded from Postgres, so `stock:{sku}` keys don't exist — every Rust reservation attempt gets `stock=nil` and returns `None` (out of stock). The Rust service is completely idle while the Node.js service does all the work against Postgres.

This means the Redis-based atomic reservation Lua script (the primary protection against overselling) is never actually used.

**Fix:** Either remove the Rust inventory service and use only Postgres (which is what's happening in practice), or establish a sync mechanism where Postgres stock levels are mirrored to Redis at startup and kept in sync via events.

---

### R03 — `ReserveRequest` Field Name Mismatch (All Reservations Decrement by Zero)
**Files:** `services/inventory/src/handlers.rs:8`, `packages/api/rust-client.ts`
**Severity:** CRITICAL

```rust
// Rust expects:
pub struct ReserveRequest {
    pub sku: String,
    pub qty: u32,      // ← field name: "qty"
}
```

```typescript
// Node.js sends:
reserve: (sku: string, quantity: number, userId: string) =>
    this.request(SERVICES.INVENTORY, '/reserve', {
        body: JSON.stringify({ sku, quantity, user_id: userId }), // ← field name: "quantity"
    }),
```

`serde_json` ignores unknown fields by default. When `{ sku, quantity, user_id }` is deserialized into `ReserveRequest { sku, qty }`:
- `sku` maps correctly.
- `quantity` is silently dropped.
- `qty` defaults to `0` (Rust default for `u32`).

The Lua script then executes `DECRBY stock:{sku} 0` — which always succeeds (0 <= any stock level) and creates a reservation record for 0 items. Every reservation call returns a `reservation_id` and a 200 OK, but no stock is ever actually held.

**Fix:** Rename `qty` to `quantity` in the Rust struct, or rename `quantity` to `qty` in `RustClient`.

---

### R04/R05 — Search Ignores All Filter Parameters and Shows Inactive Products
**File:** `services/search/src/handlers.rs`
**Severity:** HIGH

```rust
pub struct SearchParams {
    pub q: String,
    pub min_price: Option<f64>,   // ← Declared
    pub max_price: Option<f64>,   // ← Declared
    pub category_id: Option<String>, // ← Declared
    pub brand: Option<String>,    // ← Declared
    pub sort_by: Option<String>,
}

pub async fn search_handler(...) {
    let base_query = query_parser.parse_query(&params.q)?;
    // ← No RangeQuery for price, no TermQuery for category_id/brand
    // ← No filter for is_active=1 or is_in_stock=1
}
```

All filter parameters (`min_price`, `max_price`, `category_id`, `brand`) are parsed from the request but never applied to the search query. A buyer filtering "Samsung phones under ₦50,000" gets all Samsung products regardless of price.

Additionally, there is no `is_active = 1` or `is_in_stock = 1` filter, so `DELETED`, `DRAFT`, and out-of-stock products all appear in search results.

**Fix:**
```rust
// Build boolean query combining text + filters
let mut subqueries: Vec<(Occur, Box<dyn Query>)> = vec![
    (Occur::Must, base_query),
];

// Active products only
subqueries.push((Occur::Must, Box::new(TermQuery::new(
    Term::from_field_u64(index.fields.is_active, 1),
    IndexRecordOption::Basic,
))));

if let (Some(min), Some(max)) = (params.min_price, params.max_price) {
    subqueries.push((Occur::Must, Box::new(RangeQuery::new_f64(
        index.fields.price, min..=max,
    ))));
}
// etc.

let final_query = BooleanQuery::new(subqueries);
```

---

### R06 — Search `upsert_handler` Creates a New `IndexWriter` Per Request (Lock Contention)
**File:** `services/search/src/handlers.rs:upsert_handler`
**Severity:** HIGH

```rust
pub async fn upsert_handler(State(index): State<Arc<SearchIndex>>, ...) {
    let mut writer = index.get_writer(50_000_000)?;  // ← 50MB budget + file lock per request
    // ...
    writer.commit()?;  // ← Commits after every single document
}
```

Tantivy's `IndexWriter` acquires an exclusive file lock (`meta.lock`) on the index directory. Acquiring a new writer on every HTTP request means:
- **Concurrent upserts fail:** Two simultaneous calls will race for the lock; the second returns a `LockBusy` error.
- **Performance:** Each `commit()` on a single document flushes to disk — extremely slow at nightly sync scale (50,000 documents = 50,000 individual commits).
- **Memory:** 50MB is allocated and released for every request.

**Fix:** Store the `IndexWriter` as a long-lived, `Arc<Mutex<IndexWriter>>` in `SearchIndex`. Batch commits periodically (e.g., every 1,000 documents or every 5 seconds) rather than per-upsert.

---

### R07 — Recommendations Engine Returns Hardcoded Mock Data (DB Never Queried)
**File:** `services/recommendations/src/engine.rs`
**Severity:** HIGH

```rust
pub fn get_similar_items(&self, product_id: &str) -> Vec<RecommendedProduct> {
    vec![
        RecommendedProduct { id: format!("{}_acc_1", product_id), score: 0.95, ... },
        RecommendedProduct { id: format!("{}_acc_2", product_id), score: 0.85, ... },
    ]
}

pub fn get_user_recommendations(&self, user_id: &str) -> Vec<RecommendedProduct> {
    vec![
        RecommendedProduct { id: "prod_electronics_1".into(), score: 0.9, ... },
        RecommendedProduct { id: "prod_fashion_1".into(), score: 0.7, ... },
    ]
}
```

Every user sees the exact same two recommendations: `"prod_electronics_1"` and `"prod_fashion_1"` — these are placeholder IDs that do not exist in the database. `RecommendationService.db: PgPool` is initialized but never used. The `moka` cache correctly caches these fake results, making them persistent.

---

### R08 — Image Processor Has No Upload Size Limit (OOM Attack Vector)
**File:** `services/image-processor/src/handlers.rs`
**Severity:** HIGH

```rust
pub async fn process_image_handler(mut multipart: Multipart, ...) {
    if let Some(field) = multipart.next_field().await? {
        let data = field.bytes().await?;  // ← Reads entire file into memory — no size cap
        let processed = ImageProcessor::process_buffer(&data, width, height)?;
    }
}
```

Axum's `Multipart` has no default size limit. A single POST with a 4GB file is read entirely into memory before any processing. Combined with the fact the service binds to `0.0.0.0` with no auth, this is a trivial OOM/DoS vector.

**Fix:**
```rust
// In main.rs, add body size limit:
use axum::extract::DefaultBodyLimit;

let app = Router::new()
    .route("/process", post(process_image_handler))
    .layer(DefaultBodyLimit::max(10 * 1024 * 1024)); // 10MB cap
```

---

### R09 — All Services Use `CorsLayer::permissive()` and Bind to `0.0.0.0`
**Files:** All `services/*/src/main.rs`
**Severity:** HIGH

```rust
// Every service — verbatim
let app = Router::new()
    .layer(tower_http::cors::CorsLayer::permissive())  // Any origin allowed
    .with_state(/* ... */);

let addr = SocketAddr::from(([0, 0, 0, 0], 300X));  // All interfaces
```

`CorsLayer::permissive()` sets `Access-Control-Allow-Origin: *`. Combined with `0.0.0.0` binding and no auth middleware, all internal services (fraud check, search upsert, image processing) are:
- Directly callable from any web browser visiting any domain.
- Accessible on all network interfaces (not just loopback/internal Docker network).

**Fix:**
```rust
// Restrict CORS to internal origins only
let cors = CorsLayer::new()
    .allow_origin("http://localhost:4000".parse::<HeaderValue>().unwrap())
    .allow_methods([Method::GET, Method::POST]);

// Bind to loopback for inter-service communication
let addr = SocketAddr::from(([127, 0, 0, 1], 300X));
```
Or use Docker internal networking and bind only on the container's internal interface.

---

### R10 — Geo-Mismatch Rule Is a Non-Functional Placeholder
**File:** `services/fraud/src/rules.rs:47`
**Severity:** MEDIUM

```rust
// Rule 4: Potential Geo-mismatch (simplified IP-to-Country check placeholder)
if data.shipping_country == "NG" && !data.ip_address.starts_with("102.") {
    score += 10;  // Adds +10 for virtually every IP address on earth
}
```

`102.x.x.x` is a tiny slice of the IPv4 space (AFRINIC block for some Nigerian ISPs). Any non-Nigerian IP, including all of Europe, US, and Asia, gets +10 added. Conversely, any Nigerian IP not in `102.x.x.x` also gets +10 (Airtel Nigeria uses `41.x.x.x`, MTN uses `197.x.x.x`, etc.). This rule is counterproductive — it adds noise to the score for legitimate Nigerian users and VPN users alike.

**Fix:** Integrate a real GeoIP database (e.g., MaxMind GeoLite2) or remove the rule until it can be properly implemented.

---

### R11 — Search `total` Is Always `0`
**File:** `services/search/src/handlers.rs`
**Severity:** MEDIUM

```rust
Ok(Json(SearchResponse {
    results,
    total: 0,   // ← Hardcoded
    facets: serde_json::json!({}),
}))
```

The `Count` collector is imported (`use tantivy::collector::Count`) but never used. Pagination UI on the frontend always shows 0 total results.

**Fix:**
```rust
let (total, top_docs) = searcher.search(&query, &(Count, top_docs_collector))?;
Ok(Json(SearchResponse { results, total, facets: json!({}) }))
```

---

## Cross-Service Risk Summary

```
Fraud Service
  R01: Mocked DB → wrong scores for all users
  R10: Geo rule broken → noise added for all Nigerian users
  R14: Velocity rule dead → new-user fraud never flagged

Inventory Service
  R02: Dual disconnected inventory systems → Rust service is idle
  R03: qty vs quantity mismatch → all reservations decrement nothing

Search Service
  R04/R05: Filters silently ignored, inactive products shown
  R06: IndexWriter per request → concurrent upserts fail
  R11: total always 0 → pagination broken

Recommendations
  R07: Hardcoded mock IDs → real recommendations never served

Image Processor
  R08: No size limit → OOM DoS attack vector
  R12: No MIME check → arbitrary binary passed to image decoder

All Services
  R09: permissive CORS + 0.0.0.0 bind + no auth → fully open internal API surface
```

# Rust Services: Where and Why

## The Decision Framework

Not everything needs Rust. Node.js handles I/O-bound work fine because it is async. The bottleneck in most ecommerce operations is the database, not the CPU.

Rust is the right tool when the service is:

| Criterion | Explanation |
|---|---|
| **CPU-intensive** | Computation that blocks threads (ML inference, scoring, bidding) |
| **High-frequency + latency-sensitive** | Must respond in < 5ms under thousands of concurrent requests |
| **High-contention writes** | Many writers competing for the same resource simultaneously (flash sale stock) |
| **Memory-critical** | Processing large data sets without a garbage collector pause |

I/O-bound services (CRUD, CMS, Seller Hub forms) stay in TypeScript. They spend 95% of their time waiting on the database — Rust adds no benefit there.

---

## Services That Get Rewritten in Rust

### 1. Search Service

**Why Rust:** Search is queried on every page load, every keystroke in autocomplete. At 10,000 concurrent users, even a 50ms overhead becomes catastrophic. Rust's `Tantivy` (a Lucene-equivalent search library) delivers sub-10ms full-text search queries with zero garbage collector pauses.

**Stack:** Axum + Tantivy
**Interface:** REST API (called by the Next.js module layer)

**What it does:**
- Full-text indexing of product titles, descriptions, and attributes.
- Faceted search (filter by price range, brand, rating).
- Fuzzy matching and typo correction.
- Personalized result boosting (multiplying relevance score by user affinity signals).
- Autocomplete suggestions from a prefix trie.

```
Next.js modules/search → HTTP → Rust Search Service (Axum + Tantivy)
                                       ↓
                              Product index (in-memory + disk)
```

---

### 2. Ad Auction Engine

**Why Rust:** Every search result page renders in real time. Before results are returned, the platform must run an auction: collect all active bids for matching keywords, compute ad rank scores, select winners, and deduplicate. This must complete in under 3ms. Node.js with GC pauses cannot reliably guarantee this.

**Stack:** Axum + in-memory auction state
**Interface:** gRPC (called synchronously during search result generation)

**What it does:**
- Receives a query context: `{ keywords, category, userId, deviceType }`.
- Finds all active campaigns bidding on matching keywords.
- Computes Ad Rank: `bid × quality_score` for each candidate.
- Returns ranked sponsored product slots and banner placements.
- Logs impression events asynchronously to PostgreSQL.

```
Search request arrives
  → Next.js calls Rust Auction Engine (gRPC, < 3ms)
  → Auction returns [sponsoredSlot1, sponsoredSlot2, bannerAd]
  → Search results are assembled with ads injected
  → Response sent to client
```

---

### 3. Inventory Reservation Service

**Why Rust:** Flash sales create a **thundering herd problem**. When Jumia runs a flash sale on an iPhone at 10 AM, 50,000 users hit "Add to Cart" within the first second. The inventory service must:
1. Accept all requests concurrently.
2. Reserve stock atomically — no two users can reserve the same last unit.
3. Return success/failure in < 10ms.
4. Release reservations that expire (user abandoned checkout).

Node.js cannot handle 50,000 concurrent write operations on a shared counter without either dropping requests or introducing race conditions. Rust with `tokio` async runtime and atomic operations handles this natively.

**Stack:** Axum + Redis (atomic `DECR`) + PostgreSQL
**Interface:** REST API

**What it does:**
- `POST /reserve` → Atomically decrement Redis counter for the SKU. If counter ≥ 1: reserve and return a reservation token. If 0: return out-of-stock.
- `DELETE /reserve/:token` → Release reservation (checkout abandoned or expired).
- `POST /confirm/:token` → Convert reservation to a committed stock deduction on payment confirmation.
- Background job: Sweep expired reservations every 30 seconds.

```
Flash sale starts
  50,000 users → Rust Inventory Service (Axum)
                        ↓
              Redis DECR (atomic, < 1ms)
                   ↓           ↓
              [200 OK]    [409 Out of Stock]
```

---

### 4. Fraud Detection Service

**Why Rust:** Every order placement triggers a real-time risk score. The scoring model evaluates 30+ signals (IP reputation, velocity, behavioral patterns, device fingerprint, payment history). This must complete before the payment is authorized — adding even 200ms to checkout is a conversion killer.

**Stack:** Axum + Candle (Rust ML framework)
**Interface:** REST API (synchronous, called at checkout)

**What it does:**
- Receives order context: `{ userId, cartTotal, ipAddress, deviceFingerprint, paymentMethod }`.
- Runs a pre-trained gradient boosting model to generate a risk score (0.0 → 1.0).
- Returns: `{ riskScore, action: "ALLOW" | "REVIEW" | "BLOCK", reasons[] }`.
- High-risk orders are flagged and routed to the human review queue.
- Low-risk orders proceed to payment authorization immediately.

---

### 5. Recommendation Engine

**Why Rust:** Collaborative filtering (computing similarity between millions of user-product interaction vectors) is a matrix operation. This is pure CPU work. A nightly batch job computes recommendation vectors; a real-time inference service returns personalized recommendations on request.

**Stack:** Axum + nalgebra (linear algebra) + Qdrant (vector DB, also written in Rust)
**Interface:** REST API

**What it does:**
- **Batch job (nightly)**: Trains an ALS (Alternating Least Squares) model on user-product interaction data. Outputs user embedding vectors and product embedding vectors. Stores them in Qdrant.
- **Real-time inference**: Receives `{ userId }`. Fetches the user's embedding vector. Queries Qdrant for the nearest product vectors (cosine similarity). Returns top-N recommended product IDs.
- Also handles: "Frequently Bought Together" (market basket analysis), "Similar Products" (product-to-product similarity).

---

### 6. Image Processing Service

**Why Rust:** Every product upload triggers image resizing into 6 variants (thumbnail, small, medium, large, zoom, banner). Doing this in Node.js with `sharp` is acceptable at low volume but becomes a CPU bottleneck at scale. In Rust, the `image` crate processes images with no runtime overhead.

**Stack:** Axum + `image` crate + Cloudflare R2
**Interface:** Internal REST API (called by the media module after upload)

**What it does:**
- Receives raw image upload.
- Validates format and minimum resolution.
- Generates 6 size variants.
- Converts to WebP for web delivery.
- Uploads all variants to R2.
- Returns a manifest of CDN URLs for each variant.

---

## Services That Stay in TypeScript (Node.js / Next.js)

| Service | Reason It Stays in TypeScript |
|---|---|
| Catalog CRUD | 95% database I/O. Rust adds no benefit. |
| Order Management (OMS) | Business logic + database writes. I/O-bound. |
| Seller Hub | Low-traffic admin interface. |
| Payments | Delegates to Paystack/Stripe SDK. I/O-bound. |
| Dispute Resolution | Human-in-the-loop workflow. Low volume. |
| Notifications | I/O-bound: email/SMS/push API calls. |
| CMS | Very low traffic. |
| Auth (IAM) | Bcrypt/JWT are well-optimized in Node.js. |
| Analytics Ingestion | Events go into a queue; async processing handles load. |

---

## Inter-Service Communication

Rust services are internal microservices. The Next.js application calls them over HTTP/gRPC. They are not exposed to the public internet.

```
┌─────────────────────────────────────────────────────┐
│                Next.js (TypeScript)                  │
│           modules/ business logic layer              │
└──────┬───────────┬───────────┬──────────┬───────────┘
       │ REST      │ gRPC      │ REST      │ REST
       ▼           ▼           ▼           ▼
  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌──────────────┐
  │ Search  │ │   Ad    │ │Inventory │ │    Fraud     │
  │ Service │ │ Auction │ │Reserv.   │ │  Detection   │
  │ (Rust)  │ │ (Rust)  │ │ (Rust)   │ │   (Rust)     │
  └─────────┘ └─────────┘ └──────────┘ └──────────────┘
                                │
                        ┌───────────────┐
                        │Recommendation │
                        │  Engine       │
                        │   (Rust)      │
                        └───────────────┘
```

**Protocol choices:**

| From → To | Protocol | Why |
|---|---|---|
| Next.js → Search | REST (JSON) | Simple, flexible, easy to debug |
| Next.js → Ad Auction | gRPC (Protocol Buffers) | Called synchronously in the request path, needs the lowest overhead |
| Next.js → Inventory | REST (JSON) | Simple request/response |
| Next.js → Fraud | REST (JSON) | Simple request/response |
| Next.js → Recommendations | REST (JSON) | Pre-computed results, not latency-critical |

---

## Rust Service Scaffold

Every Rust service follows this structure:

```
services/
├── search/
│   ├── src/
│   │   ├── main.rs           # Axum server, route registration
│   │   ├── routes/           # HTTP handlers (thin — call domain functions)
│   │   ├── domain/           # Core search logic
│   │   ├── index/            # Tantivy index management
│   │   └── config.rs         # Environment configuration
│   ├── Cargo.toml
│   └── Dockerfile
│
├── auction/
│   ├── src/
│   │   ├── main.rs
│   │   ├── routes/
│   │   ├── domain/
│   │   ├── proto/            # gRPC protobuf definitions
│   │   └── config.rs
│   ├── Cargo.toml
│   └── Dockerfile
│
├── inventory/
├── fraud/
├── recommendations/
└── image-processor/
```

**Shared Cargo workspace** so all Rust services share common dependencies (serde, tokio, tracing) without duplication.

```toml
# Cargo.toml (workspace root)
[workspace]
members = [
  "services/search",
  "services/auction",
  "services/inventory",
  "services/fraud",
  "services/recommendations",
  "services/image-processor",
]

[workspace.dependencies]
axum = "0.7"
tokio = { version = "1", features = ["full"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
tracing = "0.1"
tracing-subscriber = "0.3"
sqlx = { version = "0.7", features = ["postgres", "runtime-tokio"] }
```

---

## Updated Repository Structure

```
/
├── apps/
│   ├── web/                  # Next.js web app
│   └── mobile/               # React Native / Expo
│
├── services/                 # Rust microservices
│   ├── search/
│   ├── auction/
│   ├── inventory/
│   ├── fraud/
│   ├── recommendations/
│   └── image-processor/
│
└── packages/                 # Shared TypeScript packages
    ├── api/                  # tRPC routers
    ├── types/                # Shared types + Zod schemas
    ├── config/               # Shared configs
    └── db/                   # Prisma client
```

---

## Summary

| Service | Language | Reason |
|---|---|---|
| All CRUD, OMS, Seller Hub, Auth, CMS | TypeScript / Next.js | I/O-bound, database is the bottleneck |
| **Search** | **Rust (Axum + Tantivy)** | Sub-10ms full-text queries at scale |
| **Ad Auction** | **Rust (Axum + gRPC)** | Real-time bidding in < 3ms |
| **Inventory Reservation** | **Rust (Axum + Redis)** | Thundering herd on flash sales |
| **Fraud Detection** | **Rust (Axum + Candle)** | Real-time ML inference at checkout |
| **Recommendations** | **Rust (Axum + Qdrant)** | Vector similarity computation |
| **Image Processing** | **Rust (Axum + image crate)** | CPU-intensive batch resizing |

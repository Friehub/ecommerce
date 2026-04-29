# 11 - ML Recommendations

**Status:** Lower Priority — rule-based fallback first.

---

## Surfaces That Need Recommendations

| Surface | Algorithm |
|---|---|
| Homepage "Top Picks for You" | Collaborative Filtering (user-based) |
| PDP "Frequently Bought Together" | Market Basket Analysis (item-based) |
| Cart "You Might Also Need" | Category-based cross-sell |
| Post-purchase "Buy Again" | Replenishment timing model |
| Search "Related Searches" | Query co-occurrence |

---

## Phase 1: Rule-Based (Build First)

No ML required. Good enough to launch.

| Surface | Rule |
|---|---|
| Top Picks | Bestsellers in buyer's most-purchased categories |
| Frequently Bought Together | Manually curated bundles + same-category top sellers |
| You Might Also Need | Top 4 products in the same category, different sellers |
| Buy Again | Orders > 30 days ago in consumable categories (Beauty, Grocery) |

---

## Phase 2: ALS Collaborative Filtering (Production)

**Input data:** User × Product interaction matrix (views, add-to-cart, purchases).

**Model:** Alternating Least Squares (ALS) — implicit feedback variant.
- Library: `implicit` (Python, for training) → export embeddings
- Inference: Rust service queries Qdrant vector DB

**Pipeline:**
```
Nightly cron:
  1. Export interaction events from PostgreSQL (ProductView, OrderLine) → Parquet
  2. Train ALS model (Python script on a worker machine)
  3. Export user embedding vectors + product embedding vectors
  4. Upload to Qdrant (upsert)

Real-time inference:
  GET /recommendations?userId=X
  → Fetch user vector from Qdrant
  → KNN search: find 50 nearest product vectors
  → Filter out already-purchased products
  → Return top 20 product IDs
  → Next.js fetches product details from catalog module
```

---

## Phase 2: Market Basket Analysis

**Input data:** `OrderLine` table — which products appear in the same order.

**Algorithm:** Apriori / FP-Growth (support + confidence thresholds).

**Output:** `ProductAssociation` table:
| product_a_id | product_b_id | confidence | support |
|---|---|---|---|

This table is queried directly by the catalog module for "Frequently Bought Together".
Rebuilt weekly from the last 90 days of order data.

---

## Cold Start Handling

New users (no history):
- Show bestsellers in their selected city's popular categories.
- After first purchase: shift to personalized recommendations.

New products (no interactions):
- Boost with `is_new` flag for 7 days.
- Use content-based similarity (category + attributes) as a proxy.

# 09 - Search Index Schema

**Status:** Research
**Blocks:** Rust Search Service (Tantivy), catalog indexing pipeline.

---

## Index Design

The search index is separate from the database. It is a denormalized, read-optimized representation of product data built for fast retrieval.

The index is rebuilt from the database nightly (full reindex) and updated in near-real-time via change events (incremental updates on product create/update/delete).

---

## Document Schema (per indexed product)

Each document in the Tantivy index represents one `ProductVariant` (the purchasable unit), enriched with parent product and seller data.

| Field | Type | Indexed As | Purpose |
|---|---|---|---|
| `variant_id` | string | Stored, not searchable | Primary identifier |
| `product_id` | string | Stored | Link back to DB |
| `title` | string | Full-text + Stored | Main search target |
| `description` | string | Full-text | Secondary search target |
| `brand_name` | string | Full-text + Keyword | Filter + search |
| `category_id` | string | Keyword | Facet filter |
| `category_name` | string | Stored | Display |
| `seller_id` | string | Keyword | Seller store page filter |
| `seller_name` | string | Stored | Display |
| `price` | f64 | Numeric (range filter) | Price range filter |
| `compare_price` | f64 | Numeric | Discount calculation |
| `discount_pct` | f64 | Numeric | Filter "On Sale" |
| `rating` | f64 | Numeric | Filter + sort |
| `review_count` | i64 | Numeric | Sort by popularity |
| `sales_velocity` | f64 | Numeric | Ranking boost signal |
| `is_active` | bool | Keyword | Exclude inactive |
| `is_in_stock` | bool | Keyword | Filter out-of-stock |
| `is_flash_sale` | bool | Keyword | Filter flash sale |
| `is_official_store` | bool | Keyword | Filter official brands |
| `shipping_days` | i64 | Numeric | Filter by delivery speed |
| `attributes` | JSON string | Stored | Category-specific specs (RAM, storage, color) |
| `image_url` | string | Stored | Display |
| `created_at` | i64 (unix) | Numeric | Sort by newest |

---

## Facets (Filterable Fields)

| Facet | Field | UI Display |
|---|---|---|
| Category | `category_id` | Left sidebar tree |
| Brand | `brand_name` | Checkbox list |
| Price Range | `price` | Slider |
| Rating | `rating` | Star selector (min 3★, 4★, etc.) |
| Availability | `is_in_stock` | Toggle |
| Flash Sale | `is_flash_sale` | Toggle |
| Official Store | `is_official_store` | Toggle |
| Delivery Speed | `shipping_days` | Dropdown |

---

## Ranking Algorithm

Score for each result = `relevance_score × boost_factors`

### Relevance Score (Tantivy BM25)
- Matches on `title` field weighted 3×
- Matches on `brand_name` weighted 2×
- Matches on `description` weighted 1×

### Boost Factors

| Factor | Boost |
|---|---|
| Sponsored product (ad auction winner) | Injected at top, separate from organic |
| `is_official_store = true` | × 1.3 |
| `rating >= 4.0` | × 1.2 |
| `sales_velocity` (normalized 0–1) | × (1 + sales_velocity) |
| `is_in_stock = false` | × 0 (excluded) |
| `is_active = false` | × 0 (excluded) |

---

## Indexing Pipeline

### Full Reindex (Nightly, 2 AM)

```
1. Rust Search Service reads all active ProductVariants from PostgreSQL
2. Enriches with seller, brand, category, stock, and flash sale data
3. Writes to a new index (shadow index pattern — zero downtime)
4. Atomically swaps the active index pointer
5. Old index deleted
```

### Incremental Update (Real-time via Events)

| Event | Index Action |
|---|---|
| `product.created` | Add document |
| `product.updated` | Update document |
| `product.deactivated` | Update `is_active = false` |
| `stock.reserved` (qty reaches 0) | Update `is_in_stock = false` |
| `stock.released` | Update `is_in_stock = true` |
| `flashsale.started` | Update `is_flash_sale = true`, update `price` |
| `flashsale.ended` | Update `is_flash_sale = false`, restore `price` |

---

## Autocomplete

Separate lightweight prefix index (trie structure in Redis).

- Populated from: product titles, brand names, category names, popular search queries.
- Returns top 8 suggestions for any prefix (≥ 2 characters).
- Updated on each full reindex cycle.

---

## Zero-Result Handling

If a query returns 0 results:
1. Broaden: Remove least-important tokens and retry.
2. Synonyms: Expand query with synonym map (e.g. "phone" → "smartphone", "mobile").
3. Spell correction: Tantivy fuzzy match (edit distance 1).
4. If still 0: Return trending products in the inferred category.

# 01 - Database Schema Design

**Status:** Research
**Blocks:** Everything. No module can be built without this.

---

## Domain Ownership

Each domain owns its tables. A module's repository only queries its own tables.
Cross-domain data is accessed through the public module API, not raw SQL joins.

---

## IAM Domain

| Table | Key Fields |
|---|---|
| `User` | id, email, password_hash, role (BUYER/SELLER/AGENT/MODERATOR/ADMIN), is_active |
| `Session` | id, user_id, token_hash, expires_at |
| `UserAddress` | id, user_id, label, line1, city, state, country, is_default |
| `OAuthAccount` | id, user_id, provider, provider_account_id |

---

## Catalog Domain

| Table | Key Fields |
|---|---|
| `Category` | id, name, slug, parent_id (self-ref), commission_rate, attribute_schema (JSON) |
| `Brand` | id, name, slug, logo_url, is_verified |
| `Product` | id, title, slug, description, brand_id, category_id, seller_id, status |
| `ProductVariant` | id, product_id, sku, attributes (JSON), price, compare_price, weight_grams |
| `ProductMedia` | id, product_id, variant_id (nullable), url, type (IMAGE/VIDEO), position |

**Key design decision:** A Product is the canonical listing. A ProductVariant is the purchasable unit (with its own SKU, price, and stock).

---

## Inventory Domain

| Table | Key Fields |
|---|---|
| `Warehouse` | id, name, address, type (SELLER_MANAGED/JUMIA_HUB) |
| `StockLevel` | id, variant_id, seller_id, warehouse_id, qty_on_hand, qty_reserved |
| `StockReservation` | id, variant_id, order_id, quantity, expires_at, status (ACTIVE/CONFIRMED/RELEASED) |

**Key design decision:** `qty_available = qty_on_hand - qty_reserved`. Never read `qty_on_hand` alone.

---

## Cart & Order Domain

| Table | Key Fields |
|---|---|
| `Cart` | id, user_id (nullable), session_id, updated_at |
| `CartItem` | id, cart_id, variant_id, seller_id, quantity, price_snapshot |
| `Order` | id, user_id, status, subtotal, shipping_fee, discount, total, payment_method |
| `OrderPackage` | id, order_id, seller_id, status, tracking_number, estimated_delivery |
| `OrderLine` | id, package_id, variant_id, quantity, unit_price, discount_applied |

**Key design decision:** One Order can contain multiple OrderPackages (one per seller). Each Package has its own status and tracking.

Order statuses: `PENDING_PAYMENT → PAID → PROCESSING → SHIPPED → DELIVERED → COMPLETED → CANCELLED → RETURN_REQUESTED → RETURNED`

---

## Payment Domain

| Table | Key Fields |
|---|---|
| `Payment` | id, order_id, user_id, amount, currency, method, status, provider_ref |
| `Wallet` | id, user_id, balance, currency |
| `WalletTransaction` | id, wallet_id, type (CREDIT/DEBIT), amount, reference, description |
| `Refund` | id, payment_id, order_id, amount, status, reason |

**Key design decision:** Funds are held in escrow (status=HELD) until 7 days post-delivery, then auto-released to the seller ledger.

---

## Seller Domain

| Table | Key Fields |
|---|---|
| `Seller` | id, user_id, business_name, tier (STANDARD/EXPRESS/BRAND), status, rating |
| `SellerDocument` | id, seller_id, type (ID/CAC/BANK), url, status (PENDING/APPROVED/REJECTED) |

---

## Seller Finance Domain

| Table | Key Fields |
|---|---|
| `SellerLedgerEntry` | id, seller_id, order_line_id, type (SALE/COMMISSION/AD_SPEND/PENALTY/REFUND), amount |
| `SellerStatement` | id, seller_id, period_start, period_end, gross, commission, ad_spend, penalties, net, status |
| `Payout` | id, seller_id, statement_id, amount, status, bank_ref |

---

## Logistics Domain

| Table | Key Fields |
|---|---|
| `DeliveryAgent` | id, user_id, zone, status (ACTIVE/INACTIVE/ON_LEAVE) |
| `Shipment` | id, package_id, agent_id, pickup_station_id (nullable), status, proof_url |
| `ShipmentEvent` | id, shipment_id, status, note, location, created_at |
| `PickupStation` | id, name, address, city, state, lat, lng, is_active |
| `ReturnShipment` | id, order_line_id, reason, status, qc_result (PASS/FAIL), refund_triggered |

---

## Advertising Domain

| Table | Key Fields |
|---|---|
| `AdCampaign` | id, seller_id, name, type (SPONSORED/BANNER/TAKEOVER), status, budget, spent |
| `AdGroup` | id, campaign_id, product_id, targeting (MANUAL/AUTO) |
| `AdKeyword` | id, ad_group_id, keyword, match_type (EXACT/BROAD), bid |
| `AdImpression` | id, campaign_id, product_id, user_id, search_query, created_at |
| `AdClick` | id, impression_id, user_id, created_at |
| `AdConversion` | id, click_id, order_line_id, revenue, created_at |

---

## Promotions Domain

| Table | Key Fields |
|---|---|
| `Promotion` | id, name, type (PERCENT/FIXED/BOGO/FREE_SHIP), value, min_order, max_uses, seller_id (nullable) |
| `Coupon` | id, promotion_id, code, is_single_use, used_by_user_id |
| `FlashSale` | id, variant_id, seller_id, discount_pct, stock_limit, start_at, end_at |

---

## Affiliate Domain

| Table | Key Fields |
|---|---|
| `AffiliateAgent` | id, user_id, tier (BRONZE/SILVER/GOLD), commission_rate, status |
| `ReferralLink` | id, agent_id, target_type (PRODUCT/CATEGORY/HOME), target_id, slug |
| `ReferralClick` | id, link_id, session_id, ip, created_at |
| `Commission` | id, agent_id, order_id, amount, status (PENDING/CONFIRMED/PAID) |

---

## Dispute Domain

| Table | Key Fields |
|---|---|
| `Dispute` | id, order_line_id, buyer_id, seller_id, reason, status, resolved_at |
| `DisputeMessage` | id, dispute_id, sender_id, content, created_at |
| `DisputeEvidence` | id, dispute_id, uploader_id, url, type (PHOTO/DOC) |
| `DisputeResolution` | id, dispute_id, moderator_id, ruling (BUYER/SELLER/SPLIT), notes |

---

## Review Domain

| Table | Key Fields |
|---|---|
| `Review` | id, product_id, user_id, order_line_id, rating (1-5), title, body, is_verified |
| `ReviewMedia` | id, review_id, url |

---

## CMS Domain

| Table | Key Fields |
|---|---|
| `Banner` | id, image_url, link_url, placement, start_at, end_at, priority, is_active |
| `Page` | id, slug, title, content (markdown), is_published |

---

## Notification Domain

| Table | Key Fields |
|---|---|
| `NotificationPreference` | id, user_id, channel (EMAIL/SMS/PUSH), event_type, is_enabled |
| `NotificationLog` | id, user_id, channel, event_type, status (SENT/FAILED), sent_at |

---

## Indexing Strategy

| Table | Indexes |
|---|---|
| `Product` | category_id, brand_id, seller_id, status, created_at |
| `OrderLine` | package_id, variant_id |
| `StockLevel` | variant_id + seller_id (composite unique) |
| `AdImpression` | campaign_id, created_at |
| `ReferralClick` | link_id, created_at |
| `ShipmentEvent` | shipment_id, created_at |

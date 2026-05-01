# Platform Implementation Status Report
**Generated:** 2026-04-30 | **Based on:** Full doc + code audit

---

## Legend
- `[DONE]` — Fully implemented and type-checked
- `[STUB]` — Code exists but key logic is hardcoded/simulated
- `[MISSING]` — Documented requirement with zero code
- `[BUG]` — Code exists but has a schema/logic mismatch

---

## TypeScript API Modules (`packages/api/modules/`)

| Module | Service | Router | Status | Notes |
|---|---|---|---|---|
| IAM | `user-service.ts`, `seller-service.ts` | `router/index.ts` | `[DONE]` | Auth, seller registration complete |
| Catalog | `catalog-service.ts` | `router/index.ts` | `[DONE]` | Products, categories, brands |
| Cart | `cart-service.ts` | `router/index.ts` | `[DONE]` | Session merge, price snapshot |
| Order | `order-service.ts`, `package-service.ts` | `router/index.ts` | `[DONE]` | State machine enforced, SLA workers wired |
| Inventory | `inventory-service.ts` | `router/index.ts` | `[DONE]` | Atomic reserve/release, stock confirmation |
| Payment | `payment-service.ts` | `router/index.ts` | `[STUB]` | See stubs section |
| Logistics | `logistics-service.ts` | `router/index.ts` | `[DONE]` | State machine enforced, delivery events |
| Revenue / Ledger | `ledger-service.ts`, `revenue-service.ts` | `router/index.ts` | `[DONE]` | Hardened: aggregate balance, dispute-aware escrow, withdrawal flow, statement gen |
| Promotions | `promo-service.ts` | `router/index.ts` | `[DONE]` | Coupon validation, flash sales |
| Returns | `return-service.ts` | `router/index.ts` | `[BUG]` | See bugs section |
| Reviews | `review-service.ts` | `router/index.ts` | `[STUB]` | Purchase verification works; `images` field mismatch |
| Seller Hub | `seller-dashboard-service.ts` | `router/index.ts` | `[STUB]` | Performance score hardcoded |
| Ops / Admin | `ops-service.ts` | `router/index.ts` | `[STUB]` | Active sessions hardcoded |
| Media | `media-service.ts` | — | `[STUB]` | S3 upload works, no router wired |
| Content / CMS | `content-service.ts` | `router/index.ts` | `[DONE]` | Banners, pages |
| **Advertising** | — | — | `[MISSING]` | Campaigns, ad groups, keywords, impressions |
| **Affiliate** | — | — | `[MISSING]` | Agents, referral links, attribution |
| **Dispute** | — | — | `[MISSING]` | Dispute thread, evidence, resolution, moderator ruling |
| **Notification** | — | — | `[MISSING]` | Email/SMS/Push for all state transitions |
| **Admin** | — | — | `[MISSING]` | Admin portal procedures (approve seller, fraud queue, manual refund, metrics) |

---

## Rust Services (`services/`)

| Service | Port | Status | Notes |
|---|---|---|---|
| `shared` | — | `[DONE]` | Cache, error, macros, utils — compiles cleanly |
| `search` | 3001 | `[DONE]` | Tantivy 0.22 APIs fixed; incremental index updates not wired to events yet |
| `inventory` | 3002 | `[DONE]` | Redis reservation; deprecated `get_async_connection` warning (non-breaking) |
| `auction` | 3003 | `[STUB]` | Ad auction service; gRPC interface defined, logic needs verification |
| `fraud` | 3004 | `[STUB]` | Rule-based scoring wired to payment-service; ML model is Phase 2 |
| `recommendations` | 3005 | `[STUB]` | Rule-based fallback; ALS/Qdrant is Phase 2 |
| `image-processor` | 3006 | `[STUB]` | Sharp/WebP pipeline; verify Rust ↔ TS handoff |

---

## Database Schema (`packages/db/prisma/schema/`)

| Schema File | Status | Notes |
|---|---|---|
| `iam.prisma` | `[DONE]` | User, Session, UserAddress, OAuthAccount |
| `catalog.prisma` | `[DONE]` | Category, Brand, Product, ProductVariant, ProductMedia |
| `inventory.prisma` | `[DONE]` | Warehouse, StockLevel, StockReservation |
| `order.prisma` | `[DONE]` | Order, OrderPackage (with OUT_FOR_DELIVERY), OrderLine, Cart, CartItem |
| `payment.prisma` | `[DONE]` | Payment, Wallet, WalletTransaction, Refund |
| `seller.prisma` | `[DONE]` | Seller, SellerLedgerEntry (+ WITHDRAWAL type), SellerStatement, Payout (statementId optional) |
| `logistics.prisma` | `[DONE]` | DeliveryAgent, Shipment, ShipmentEvent, PickupStation, ReturnShipment |
| `dispute.prisma` | `[DONE]` | Dispute, DisputeMessage, DisputeEvidence, DisputeResolution |
| `review.prisma` | `[DONE]` | Review (comment nullable), ReviewMedia |
| `advertising.prisma` | `[DONE]` | Schema exists; no TypeScript module to consume it |
| `affiliate.prisma` | `[DONE]` | Schema exists; no TypeScript module to consume it |
| `promotions.prisma` | `[DONE]` | Promotion, Coupon, FlashSale |
| `notifications.prisma` | `[DONE]` | NotificationPreference, NotificationLog |
| `cms.prisma` | `[DONE]` | Banner, Page |
| `audit.prisma` | `[DONE]` | AuditLog |

> All schemas exist. The gap is purely at the TypeScript service layer.

---

## Stubs That Need Real Implementation

### 1. Payment — Webhook HMAC Verification `[SECURITY GAP]`
**File:** `payment/services/payment-service.ts` → `handleWebhook()`
**Issue:** No HMAC-SHA512 signature verification of the `x-paystack-signature` header.
**Fix:** Add `crypto.createHmac('sha512', PAYSTACK_WEBHOOK_SECRET).update(rawBody).digest('hex')` comparison before processing.

### 2. Payment — userId vs email in Payment record `[BUG]`
**File:** `payment-service.ts` L65
**Issue:** `userId: email` — the `Payment.userId` field should store the actual user ID, not their email.
**Fix:** Pass `userId` as a parameter to `initializePaystack`, store it properly.

### 3. Seller Payout — Simulated Paystack Transfer `[STUB]`
**File:** `revenue-service.ts` → `approvePayout()`
**Issue:** Generates a fake `SIM-XXXXX` bank reference. No real Paystack Transfer API call.
**Fix:** Implement `POST https://api.paystack.co/transfer` with the seller's saved `transferRecipientCode`.

### 4. Seller Dashboard — Hardcoded Performance Score `[STUB]`
**File:** `seller-dashboard-service.ts` L38
**Issue:** `performanceScore: 4.8` is hardcoded.
**Fix:** Compute from: review average (50%), on-time ship rate (25%), cancellation rate (15%), dispute loss rate (10%) per doc `06-COMMISSION_LOGIC.md`.

### 5. Ops Service — Hardcoded Active Sessions `[STUB]`
**File:** `ops-service.ts` L19
**Issue:** `activeSessions: 142` is a placeholder.
**Fix:** Track active sessions in Redis (increment on login, decrement on logout/expiry).

### 6. Return Service — Wrong Model Name `[BUG]`
**File:** `return-service.ts`
**Issue:** Code calls `prisma.returnRequest` but the Prisma schema defines the model as `ReturnShipment`.
**Fix:** Replace all `prisma.returnRequest` → `prisma.returnShipment`. Also align `status` field values with the `ReturnShipment` schema.

### 7. Review Service — Field Mismatch `[BUG]`
**File:** `review-service.ts` L23
**Issue:** Creates review with `comment` (correct per schema) but also passes `images` — schema uses `ReviewMedia` (separate table), not an `images` array on `Review`.
**Fix:** After creating the review, create `ReviewMedia` records for each image URL using `prisma.reviewMedia.createMany`.

### 8. Ledger Service — Empty statementId `[STUB]`
**File:** `ledger-service.ts` → `withdrawFunds()`
**Issue:** Passes `statementId: ''` (empty string) for direct withdrawals. Payout schema now accepts nullable statementId but an empty string is still stored.
**Fix:** Pass `statementId: null` (not `''`) or make the Payout creation explicitly set `statementId: undefined`.

---

## Missing Event Types in `@ecom/shared`

The `EventType` union in `packages/shared/src/events/types.ts` is missing:

| Missing Event | Required By |
|---|---|
| `payment.confirmed` | `order-service`, `payment-service`, `event-consumer` |
| `order.completed` | Escrow release, affiliate commission confirmation |
| `refund.processed` | Return flow, wallet credit |
| `stock.low` | Inventory worker |
| `stock.reserved` | Inventory service |
| `stock.released` | Inventory service |
| `dispute.opened` | Dispute module |
| `dispute.resolved` | Payment/escrow release |
| `referral.clicked` | Affiliate module |
| `commission.earned` | Affiliate module |
| `ad.impression` | Advertising module |
| `ad.click` | Advertising / ledger (AD_SPEND) |
| `ad.conversion` | Advertising / ledger |
| `user.registered` | Notification module |
| `seller.approved` | Notification module |

---

## Missing Background Jobs / Crons

| Job | Purpose | Status |
|---|---|---|
| Weekly `SellerStatement` generation | Every Monday 00:00 UTC — aggregate ledger entries | `[MISSING]` — function exists in `ledger-service.ts` but no cron schedules it |
| `releaseMatureEscrow` cron | Daily sweep — release PENDING entries past their `availableAt` | `[MISSING]` — function exists but never scheduled |
| Nightly search reindex | Full Tantivy reindex at 2 AM | `[MISSING]` — Rust service exists but pipeline not wired |
| SLA breach detector | Check PAID orders not processed in 24h; PROCESSING not shipped in 48h | `[PARTIAL]` — BullMQ job added for payment timeout; SLA penalty application missing |
| Fraud review queue processor | Process REVIEW-flagged orders | `[MISSING]` |
| Autocomplete trie rebuild | Rebuild Redis prefix trie after reindex | `[MISSING]` |

---

## Priority Implementation Order

### P0 — Blocking Core Flows
1. Fix `returnService` → `ReturnShipment` model name
2. Fix `reviewService` → `ReviewMedia` separate table
3. Fix `paymentService` → store real `userId` not email
4. Add Paystack webhook HMAC-SHA512 verification
5. Add missing event types to `EventType` union (`payment.confirmed`, `order.completed`, `refund.processed`, `stock.*`)

### P1 — Settlement & Finance Integrity
6. Schedule `releaseMatureEscrow` as a daily cron in `scripts/run-workers.ts`
7. Schedule `generateStatement` every Monday via BullMQ cron
8. Replace simulated payout (`SIM-`) with real Paystack Transfer API call
9. Fix `withdrawFunds` to pass `statementId: null` not `''`

### P2 — Missing Core Modules
10. **Dispute module** — Router + service (`openDispute`, `respondToDispute`, `uploadEvidence`, `resolveDispute`) — schema already exists
11. **Notification module** — Router + service + email/SMS templates (Resend for email, Termii for SMS) — schema already exists
12. **Admin module** — tRPC procedures for seller KYC approval, fraud queue, manual refund, GMV metrics

### P3 — Revenue Modules
13. **Advertising module** — Campaign CRUD, impression/click recording, `AD_SPEND` ledger entry on click
14. **Affiliate module** — Referral link generation, click attribution, `commission.earned` event

### P4 — Infrastructure Polish
15. Compute real `performanceScore` in seller dashboard
16. Real-time active session tracking in Redis for ops metrics
17. Wire search incremental index updates to `product.created/updated` events
18. Nightly full reindex cron job for Rust search service
19. Autocomplete Redis trie builder

---

## Web App Route Status (`apps/web/src/app/`)

| Route Group | Status |
|---|---|
| `(auth)` — Login, Register | Exists |
| `(buyer)` — Homepage, Product, Cart, Checkout, Orders | Exists |
| `(seller)` — Seller Hub dashboard, listings | Exists |
| `(admin)` — Admin portal | Exists (basic) |
| `search` — Search results page | Exists |
| Dispute center | `[MISSING]` |
| Notifications inbox | `[MISSING]` |
| Affiliate portal | `[MISSING]` |

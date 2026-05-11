# Jumia Clone — Quick Reference: Critical Issues

## 🔴 CRITICAL BUG — 12 Issues Blocking Production

### Build Broken — Type Errors
- **All 20 tRPC modules fail to compile** — "of type 'unknown'" across admin, advertising, affiliate, cart, catalog, content, dispute, iam, inventory, logistics, media, notification, ops, order, payment, promo, return, revenue, review, seller
- **350+ TypeScript errors** in `build_errors.txt`
- **[FIX]** Resolve service import chain and type definitions

### Logic Bugs — Runtime Failures
1. **Dispute resolution crashes** — Code uses `REJECTED` status, schema only has `RESOLVED`/`ESCALATED`
   - [File: admin-service.ts](packages/api/modules/admin/services/admin-service.ts)
   
2. **All Paystack payouts fail** — Wrong field passed: `payout.id` instead of `payout.seller.transferRecipientCode`
   - [File: revenue-service.ts](packages/api/modules/revenue/services/revenue-service.ts#L76)
   
3. **Seller revenue doubled** — Ledger records SALE twice: when order→PAID and on escrow-release
   - [File: order-worker.ts](packages/api/modules/order/workers/order-worker.ts)
   
4. **Images show wrong MIME type** — Sets ContentType by extension but converts all to WebP
   - [File: media-service.ts](packages/api/modules/media/services/media-service.ts)
   
5. **Staging payouts get fake codes** — Even with real Paystack key, generates SIM- reference if `NODE_ENV !== 'production'`
   - [File: seller-service.ts](packages/api/modules/iam/services/seller-service.ts)
   
6. **Return state never saved** — `approveReturn` doesn't set `returnedAt` timestamp on OrderLine
   - [File: return-service.ts](packages/api/modules/return/services/return-service.ts#L51)
   
7. **Review moderation ignored** — Code queries review but never calls update(); status never persists
   - [File: wishlist-service.ts](packages/api/modules/catalog/services/wishlist-service.ts#L91)
   
8. **Product ratings always 0** — Aggregates seller-level average only, never updates per-product `averageRating`
   - [File: catalog-service.ts](packages/api/modules/catalog/services/catalog-service.ts#L109)
   
9. **Webhook bypasses order state machine** — Payment webhook updates status from ANY state to PAID
   - [File: payment-service.ts](packages/api/modules/payment/services/payment-service.ts#L40)
   
10. **Wallet payment same bypass** — Skips state validation like webhook
    - [File: payment-service.ts](packages/api/modules/payment/services/payment-service.ts#L91)
    
11. **Coupons bypass validation** — No expiry or min-order checks
    - [File: promo-service.ts](packages/api/modules/promo/services/promo-service.ts)
    
12. **Webhook signature not validated** — Vulnerable to replay attacks
    - [File: paystack webhook route](apps/web/src/app/api/webhooks/paystack/route.ts#L16)

---

## 🚫 MISSING SERVICE — 5 Features With Zero Code

1. **Operations Dashboard** — No service implementation; router exists but all methods unresolved
   - [packages/api/modules/ops/](packages/api/modules/ops/)
   
2. **ML Recommendations Fetch** — No call to Rust service; always returns null
   - [packages/api/modules/content/router/index.ts](packages/api/modules/content/router/index.ts#L12)
   
3. **Affiliate Commission Confirmation Job** — Service exists but never scheduled
   - No cron; commissions stay PENDING forever
   
4. **Escrow Release Job** — Service exists but never scheduled
   - Seller payments stuck in escrow permanently
   
5. **Seller KYC Upload Portal** — Service works but no frontend/router to reach it
   - Missing [apps/web/src/app/account/seller/kyc](apps/web/src/app/account/seller/kyc)

---

## ⚙️ STUB/INCOMPLETE — 18 Issues

**Services With Placeholders:**
- `inventory.syncAll()` — Returns `{success: true}` without syncing anything
- `revenue-service.ts` — Falls back to fake `SIM-XXXXX` bank reference (hardcoded placeholder)
- `notification-service.ts` — Uses `re_placeholder` for Resend API key
- `seller-dashboard-service.ts` — Same `sk_test_placeholder` fallback

**Services With Type Errors:**
- `affiliate-service.ts` — Dynamic import fails TypeScript compilation
- `catalog-service.ts` — Multiple dynamic imports same error
- `logistics-service.ts` — Missing Service type definition
- `order-service.ts` — Cannot find `@ecom/types` import

**Services With Dead Code:**
- `order-worker.ts` — 6 handler functions never called; diverge from real implementations

**Frontend Stubs:**
- Affiliate portal — Placeholder only; missing registration, referral links, commission table
- Flash sales page — Fake countdown, no backend
- Wishlist button — No-op click handler
- Saved items page — Doesn't query backend
- Product search filters — Listen but don't update query
- Category filters — Same as above
- Review upload — TODO comment; image upload incomplete
- Admin returns portal — Missing Page; procedures exist

---

## 📡 UPGRADE NEEDED — Missing API Routes

| Route | Status | Required For |
|-------|--------|--------------|
| `POST /api/webhooks/flutterwave` | ❌ Missing | Payment via Flutterwave |
| `POST /api/webhooks/monnify` | ❌ Missing | Payment via Monnify |
| `POST /trpc/payment.initializePayment` | ⚠️ Only Paystack | Generic provider selection |
| `POST /trpc/seller.uploadDocument` | ❌ Missing | KYC upload |
| `POST /trpc/admin.reviewDocument` | ❌ Missing | KYC approval |

---

## 📊 Quick Stats

| Metric | Count |
|--------|-------|
| Build Errors | 350+ |
| Critical Bugs | 12 |
| Missing Services | 5 |
| Incomplete Stubs | 18 |
| Total Issues | 78 |
| Compilable Modules | 0/20 |
| Test Files Broken | 0 (can't run build) |

---

## 🎯 Fix Priority

### TODAY (Before Any Demo)
1. Fix tRPC type chain — resolve service imports
2. Fix dispute status enum: `REJECTED` → `ESCALATED`
3. Fix payout recipient field
4. Remove double ledger entry
5. Guard placeholder keys

### THIS WEEK
1. Complete KYC upload wiring
2. Add Flutterwave/Monnify webhooks
3. Fix inventory syncAll
4. Fix review moderation persistence
5. Add affiliate commission confirmation job

### NEXT TWO WEEKS
1. Complete UI stubs (affiliate portal, filters, etc)
2. Add event publishing for status changes
3. Fix webhook state machine bypass
4. Remove dead code from order-worker
5. Add failed shipment escalation

---

## 📁 Report Files

- **[Detailed Report](./THOROUGH_SCAN_REPORT.md)** — Full 300+ line breakdown with code references
- **[Session Notes](../../memories/session/scan_results.md)** — Quick findings saved to memory

**Generated:** May 11, 2026 using comprehensive repository audit

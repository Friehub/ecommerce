# Jumia Clone — Seller & Admin Wiring Audit

**Date**: 2026-05-14  
**Scope**: Every seller-facing and admin-facing page.  
**Method**: Read each page file, map every `api.*` call to its backend procedure, check for hardcoding, simulation code, architectural gaps, and security issues.

---

## Seller Summary

| Status | Count |
| --- | --- |
| Fully wired | 11 |
| Partially wired | 1 |
| Broken — fake/simulated | 1 |
| Duplicate / redundant | 1 |

## Admin Summary

| Status | Count |
| --- | --- |
| Fully wired | 11 |
| Broken — bypasses API layer | 1 |
| Duplicate page | 1 |
| Security gap | 1 |

---

# SELLER JOURNEY

---

## S1. Seller Dashboard (`/seller/dashboard`)

**Status: Fully wired.**

- Key metrics (revenue, orders, products) → `api.seller.getDashboardMetrics` ✓
- Recent orders preview → `api.order.listSellerPackages` with `limit: 5` ✓

No issues.

---

## S2. Orders (`/seller/orders`)

**Status: Fully wired.**

- All seller packages (order line items grouped by seller) → `api.order.listSellerPackages` ✓
- Update package status (PROCESSING → SHIPPED) → `api.order.updatePackageStatus` ✓

No issues.

---

## S3. Inventory List (`/seller/inventory`)

**Status: Fully wired.**

- Product list → `api.seller.listMyProducts` ✓
- Delete product → `api.catalog.deleteProduct` ✓

No issues.

---

## S4. Add New Product (`/seller/inventory/new`)

**Status: Fully wired.**

- Category dropdown → `api.catalog.getCategories` ✓
- Brand dropdown → `api.catalog.getBrands` ✓
- Create product with variants → `api.catalog.createProduct` ✓

No issues.

---

## S5. Bulk Upload (`/seller/inventory/bulk`)

**Status: BROKEN — upload is completely simulated.**

The bulk upload page has a file picker and a progress animation, but the submit handler does this:

```ts
// apps/web/src/app/(seller)/seller/inventory/bulk/page.tsx
setUploading(true);
// Simulate parse & network upload
setTimeout(() => {
  setUploading(false);
  setSuccess(true);
  setFile(null);
}, 2000);
```

No file is sent anywhere. No API call is made. The success message is fake.

The backend procedure `api.catalog.bulkImport` exists and is already used correctly in the **Products** page (`/seller/products`). It just was not wired up here.

**Fix needed**: Replace the `setTimeout` simulation with `api.catalog.bulkImport.useMutation()` and pass the parsed CSV rows to it.

---

## S6. Products (CSV Import) (`/seller/products`)

**Status: Fully wired.**

- Product list → `api.seller.listMyProducts` with `limit: 50` ✓
- Bulk CSV import → `api.catalog.bulkImport` ✓

No issues. This page duplicates some functionality with S3 (inventory list). Both show the same product list from the same API call. Worth merging into one page post-launch.

---

## S7. Finance (`/seller/finance`)

**Status: Fully wired — most complete page in the codebase.**

- Revenue stats → `api.revenue.getMyStats` ✓
- Payout history → `api.revenue.listMyPayouts` ✓
- Payout bank account → `api.revenue.getPayoutAccount` ✓
- Transaction ledger → `api.revenue.getLedger` with cursor pagination ✓
- CSV export → `api.revenue.exportLedger` (lazy query, triggered on button click) ✓
- Request payout → `api.revenue.requestPayout` ✓
- Update bank account → `api.revenue.updatePayoutAccount` ✓

No issues.

---

## S8. Insights / Analytics (`/seller/insights`)

**Status: Partially wired — charts have no time-series data.**

The page fetches summary metrics correctly:

- Dashboard metrics (total revenue, orders, products) → `api.seller.getDashboardMetrics` ✓

However, the charts (revenue over time, orders per day) have no data source. The `ops.getTimeSeries` endpoint exists but is restricted to `adminProcedure`, meaning sellers cannot call it. The charts either render with empty data or with hardcoded static arrays depending on how the chart library handles null.

**Fix needed**: Add a `seller.getTimeSeries` procedure (or make a seller-scoped version) so the trend charts have real data. Without it, a seller sees their total revenue but cannot tell if they are trending up or down.

---

## S9. KYC / Verification (`/seller/kyc`)

**Status: Fully wired.**

- Seller profile and current document status → `api.seller.getProfile` ✓
- Upload document (NIN, bank statement, CAC, utility bill) → `api.seller.uploadDocument` ✓
- Get presigned S3 URL for file upload → `api.media.getUploadUrl` ✓

No issues. The flow correctly uploads the file to S3 first, then submits the resulting URL to the backend.

---

## S10. Disputes List (`/seller/disputes`)

**Status: Fully wired.**

- Dispute list → `api.dispute.listMyDisputes` ✓

Note: `listMyDisputes` returns disputes for both buyers and sellers (filtered by `userId`). The same procedure is used on the buyer disputes page — this is correct behaviour.

---

## S11. Dispute Thread (`/seller/disputes/[id]`)

**Status: Fully wired.**

- Dispute thread messages → `api.dispute.getThread` ✓
- Post reply → `api.dispute.respond` ✓

No issues.

---

## S12. Returns (`/seller/returns`)

**Status: Fully wired.**

- Returns assigned to this seller → `api.return.listForSeller` ✓

No issues.

---

## S13. Advertising (`/seller/advertising`)

**Status: Fully wired.**

- Campaign list → `api.advertising.getCampaigns` ✓

No issues.

---

## S14. Create Campaign (`/seller/advertising/create`)

**Status: Fully wired.**

- Create campaign → `api.advertising.createCampaign` ✓

No issues.

---

# ADMIN JOURNEY

---

## A1. Admin Dashboard (`/dashboard`)

**Status: Fully wired.**

- Global platform metrics → `api.ops.getGlobalMetrics` ✓
- Pending seller KYC approvals → `api.admin.getPendingSellers` ✓
- Open dispute queue → `api.admin.getDisputeQueue` ✓
- Approve seller inline → `api.admin.approveSeller` ✓

No issues.

---

## A2. Users (`/admin/users`)

**Status: Fully wired.**

- All registered users → `api.admin.listAllUsers` ✓
- Activate / suspend user → `api.admin.updateUserStatus` ✓

No issues.

---

## A3. KYC Queue — Page 1 (`/admin/kyc`)

**Status: Fully wired.**

- Pending seller approvals → `api.admin.getPendingSellers` ✓
- Approve seller → `api.admin.approveSeller` ✓
- Update seller status → `api.admin.updateSellerStatus` ✓

---

## A4. KYC Queue — Page 2 (`/kyc`) ⚠

**Status: Duplicate page — causes confusion.**

There are two separate admin KYC pages at two different routes:

- `/admin/kyc` — uses `api.admin.getPendingSellers`
- `/kyc` — uses `api.admin.getPendingKYCQueue` and `api.admin.reviewDocument`

The `/kyc` page is the more complete one — it lets admins approve/reject individual documents, not just the whole seller account. The `/admin/kyc` page is a simpler version doing the same job.

Both are linked from the admin sidebar. A reviewer can act on the same seller from both pages, which can cause race conditions (e.g., one admin approves from `/admin/kyc` while another reviews a document from `/kyc`).

**Fix needed**: Remove `/admin/kyc` and direct all KYC review traffic to `/kyc`. Update the admin sidebar link.

---

## A5. All Sellers (`/sellers`)

**Status: Fully wired.**

- All seller accounts → `api.admin.listAllSellers` ✓
- Update seller status → `api.admin.updateSellerStatus` ✓
- Approve KYC → `api.admin.approveSeller` ✓

No issues.

---

## A6. Analytics (`/admin/analytics`)

**Status: Fully wired.**

- Platform summary metrics → `api.ops.getGlobalMetrics` ✓
- Time-series data for charts → `api.ops.getTimeSeries` ✓

No issues.

---

## A7. Banners (`/admin/banners`)

**Status: Fully wired.**

- Banner list → `api.admin.listBanners` ✓
- Create banner → `api.admin.createBanner` ✓
- Update banner → `api.admin.updateBanner` ✓
- Delete banner → `api.admin.deleteBanner` ✓

This is what also powers the `HeroCarousel` on the homepage via `api.content.getHeroBanners`. The admin creates banners here and they appear live on the homepage. The chain is complete.

---

## A8. Flash Sales (`/admin/flash-sales`)

**Status: Fully wired.**

- Flash sale list → `api.admin.listFlashSales` ✓
- Product variants for selection → `api.admin.listAllVariants` ✓
- Create flash sale → `api.admin.createFlashSale` ✓
- Delete flash sale → `api.admin.deleteFlashSale` ✓

No issues.

---

## A9. Disputes (`/admin/disputes`)

**Status: Fully wired — but has a security gap.**

The admin disputes page delegates entirely to the moderator disputes component (`/moderator/disputes/page.tsx`). That component calls:

- All disputes → `api.dispute.listAllDisputes` ✓
- Resolve dispute → `api.dispute.resolveDispute` ✓

**Security gap**: Both `listAllDisputes` and `resolveDispute` are registered as `protectedProcedure` in the dispute router, not `adminProcedure`. This means any authenticated user — including a buyer or seller — can call these procedures directly via the tRPC endpoint if they know the procedure name. They do not have a UI for it, but the backend does not reject them.

**Fix needed**: Change `listAllDisputes` and `resolveDispute` to use `adminProcedure` in `packages/api/modules/dispute/router/index.ts`.

---

## A10. Fraud Queue (`/fraud`)

**Status: Fully wired.**

- Orders flagged for fraud review → `api.admin.getFraudQueue` ✓
- Allow or block flagged order → `api.admin.resolveFraudReview` ✓

No issues.

---

## A11. Inventory (`/inventory`)

**Status: Bypasses the API layer — architectural inconsistency.**

This is the only page in the entire application that queries the database directly using Prisma inside a Next.js server component, instead of going through tRPC:

```ts
// apps/web/src/app/(admin)/inventory/page.tsx
const stockLevels = await prisma.stockLevel.findMany({
  include: { variant: { include: { product: true } }, warehouse: true },
  orderBy: { qtyOnHand: 'asc' },
});
```

This works in development but creates two problems:

1. **No authorisation check** — there is no session check on this page. Anyone who can access the route can read all stock levels. The admin layout wraps it but the data fetch itself is unprotected.
2. **Breaks the API contract** — if this data is ever needed by the mobile app or any other consumer, there is no tRPC procedure to call. The data schema is also not typed through the shared `AppRouter`.

**Fix needed**: Add `api.inventory.listStockLevels` as an `adminProcedure` to the inventory router, and convert the page to a client component that calls it.

---

## A12. Logistics (`/logistics`)

**Status: Fully wired.**

- All shipments → `api.logistics.listAllShipments` ✓
- Delivery agents → `api.logistics.listAgents` ✓
- Assign agent to shipment → `api.logistics.assignAgent` ✓

No issues.

---

## A13. Payouts (`/payouts`)

**Status: Fully wired.**

- All pending seller payouts → `api.revenue.listAllPayouts` ✓
- Approve payout → `api.revenue.approvePayout` ✓

No issues.

---

## A14. Returns (`/returns`)

**Status: Fully wired — minor redundancy.**

- Pending returns → `api.return.listPending` (called twice in the same component — once for the data and once for `orders`. The second call is unused.) ✓
- Approve return → `api.return.approve` ✓
- Reject return → `api.return.reject` ✓

**Minor fix**: Remove the duplicate `api.return.listPending` call. The page queries it twice and aliases the second result as `orders`, but the variable is never referenced in the JSX.

---

# Fix Priority

| Priority | Area | Fix |
| --- | --- | --- |
| Critical | Admin Disputes | Change `listAllDisputes` and `resolveDispute` to `adminProcedure` |
| High | Admin Inventory | Replace direct Prisma call with a tRPC `adminProcedure` + add auth check |
| High | Seller Bulk Upload | Wire `catalog.bulkImport` mutation to replace the `setTimeout` simulation |
| Medium | Admin KYC Duplicate | Remove `/admin/kyc` page, redirect sidebar link to `/kyc` |
| Medium | Seller Insights | Add `seller.getTimeSeries` procedure so trend charts show real data |
| Low | Admin Returns | Remove duplicate `api.return.listPending` call |
| Low | Seller Products + Inventory | Consider merging the two overlapping product list pages |

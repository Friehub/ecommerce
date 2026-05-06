# Bug Hunt Report — Jumia Clone Codebase
**Date:** 2026-05-05
**Scope:** All service and router modules under `packages/api/modules/`

---

## Summary Table

| ID | Module | File | Severity | Category | Description |
|----|--------|------|----------|----------|-------------|
| B01 | Return | `return-service.ts:32` | CRITICAL | Logic | `fundWallet` called inside a Prisma `$transaction` — causes deadlock / non-atomic rollback |
| B02 | Return | `return-service.ts:13` | HIGH | Logic | Return eligibility checks `package.status` but package is not always synced when Order is DELIVERED |
| B03 | Return | `return-service.ts` | HIGH | Missing Logic | No `Refund` record created — refunds are untraceable in the DB |
| B04 | Dispute/Admin | `admin-service.ts:109` | HIGH | Logic | `fundWallet` called outside `$transaction` in `resolveDispute` — can desync on rollback |
| B05 | Ledger | `ledger-service.ts:80` | HIGH | Logic | `releaseMatureEscrow` has no double-release guard — concurrent calls release the same entries twice |
| B06 | Ledger | `ledger-service.ts:126` | HIGH | Logic | `withdrawFunds` is vulnerable to TOCTOU race — two concurrent requests can overdraft seller balance |
| B07 | Revenue | `revenue-service.ts:114` | MEDIUM | Logic | `approvePayout` simulation fallback runs even when a real Paystack key fails in production |
| B08 | Advertising | `advertising-service.ts:83` | MEDIUM | Logic | Budget check runs after click is recorded — campaign overspends by exactly one click |
| B09 | Catalog | `catalog-service.ts:52` | MEDIUM | Data | `warehouseId: 'main-wh'` is hardcoded — FK violation on any non-seeded environment |
| B10 | Catalog | `catalog-service.ts:216` | MEDIUM | Logic | `r.variant_id[0]` treats a string as an array — search results are always empty |
| B11 | Logistics | `logistics-service.ts:66` | MEDIUM | Logic | Direct `orderPackage.update` bypasses `packageService.syncOrderWithPackages` — Order status never updated |
| B12 | Review | `review-service.ts:47` | MEDIUM | Logic | Seller rating update is silently swallowed in `catch` block; stale `product.findUnique` adds a redundant query |
| B13 | Dispute | `dispute-service.ts:140` | MEDIUM | Data | Fallback `'NON_EXISTENT'` string used as `sellerId` in OR clause when user has no seller profile |
| B14 | Flash Sale | `promo-service.ts` / schema | MEDIUM | Logic | `FlashSale.qtySold` is never incremented — quantity limits are never enforced |

---

## Detailed Bug Reports

---

### B01 — `fundWallet` Called Inside `$transaction` (Non-Atomic Rollback)
**File:** `packages/api/modules/return/services/return-service.ts:32`
**Severity:** CRITICAL

**Problem:**
```typescript
const result = await prisma.$transaction(async (tx) => {
  await tx.returnShipment.update({ ... });
  await paymentService.fundWallet(userId, amount); // Opens a NEW prisma.$transaction internally
  await tx.orderLine.update({ ... });
});
```
`paymentService.fundWallet` calls `prisma.wallet.upsert` on the global `prisma` client — not `tx`. If the outer transaction rolls back after `fundWallet` succeeds, the buyer has been credited with funds but the return is not recorded. The wallet credit is permanent and cannot be rolled back.

**Suggested Fix:**
Accept an optional transaction client in `fundWallet`:
```typescript
async fundWallet(userId: string, amount: number, tx?: any) {
  const db = tx || prisma;
  return db.wallet.upsert({ ... });
}

// In return-service.ts:
await paymentService.fundWallet(userId, refundAmount.toNumber(), tx); // pass tx
```
Apply the same fix to `adminService.resolveDispute` (B04) and `adminService.manualRefund`.

---

### B02 — Return Eligibility Tied to Package Status, Not Order Status
**File:** `packages/api/modules/return/services/return-service.ts:13`
**Severity:** HIGH

**Problem:**
```typescript
if (line.package.status !== 'DELIVERED') throw new Error('NOT_DELIVERED');
```
`OrderPackage.status` is only updated by `packageService` or `logisticsService`. If `Order.status = 'DELIVERED'` but the logistics agent never called the final update, `OrderPackage.status` may still be `'OUT_FOR_DELIVERY'`. The buyer is blocked from returning a package that is factually delivered.

**Suggested Fix:**
```typescript
const isDelivered = line.package.status === 'DELIVERED' ||
                    line.package.order.status === 'DELIVERED';
if (!isDelivered) throw new Error('NOT_DELIVERED');
```

---

### B03 — No `Refund` Record Created on Return Approval
**File:** `packages/api/modules/return/services/return-service.ts`
**Severity:** HIGH

**Problem:**
`approveReturn` calls `fundWallet` and marks the line as returned but never creates a row in the `Refund` table. All refund history for returns is invisible to admin, finance, and buyer-facing "my refunds" views.

**Suggested Fix:**
Inside the transaction, after crediting the wallet:
```typescript
const payment = await tx.payment.findFirst({
  where: { orderId: request.orderLine.package.order.id, status: 'SUCCESS' }
});
if (payment) {
  await tx.refund.create({
    data: {
      paymentId: payment.id,
      orderId: request.orderLine.package.order.id,
      amount: refundAmount,
      status: 'PROCESSED',
      reason: request.reason,
    }
  });
}
```

---

### B04 — Dispute Refund Not Atomic
**File:** `packages/api/modules/admin/services/admin-service.ts:107`
**Severity:** HIGH

**Problem:**
```typescript
return prisma.$transaction(async (tx) => {
  await tx.dispute.update({ ... });
  await tx.disputeResolution.create({ ... });

  // fundWallet is NOT using tx — wallet update is outside the transaction
  await paymentService.fundWallet(dispute.buyerId, refundAmount);
});
```
Same root cause as B01. If the DB transaction rolls back after `fundWallet`, the buyer gets a refund but the dispute is not marked as resolved. The same issue exists in `adminService.manualRefund`.

**Suggested Fix:** Pass `tx` to `fundWallet`.

---

### B05 — Escrow Release Has No Idempotency Guard
**File:** `packages/api/modules/revenue/services/ledger-service.ts:80`
**Severity:** HIGH

**Problem:**
```typescript
const matureEntries = await prisma.sellerLedgerEntry.findMany({
  where: { status: LedgerStatus.PENDING, availableAt: { lte: now } }
});
// ...
await prisma.sellerLedgerEntry.updateMany({ where: { id: { in: eligibleEntryIds } }, data: { status: AVAILABLE } });
```
This is a two-step read-then-write. If the background job queue fires duplicate executions (common after a restart or crash), both reads return the same entries before either write commits. Both jobs then release the same entries, potentially doubling seller balances.

**Suggested Fix:** Collapse into a single atomic `updateMany` that filters inline:
```typescript
const result = await prisma.sellerLedgerEntry.updateMany({
  where: {
    status: LedgerStatus.PENDING,
    availableAt: { lte: now },
    orderLineId: { not: null },
    orderLine: {
      disputes: { none: { status: { in: ['OPEN', 'UNDER_REVIEW'] } } }
    }
  },
  data: { status: LedgerStatus.AVAILABLE }
});
```

---

### B06 — `withdrawFunds` Balance Check Is Susceptible to Race Condition
**File:** `packages/api/modules/revenue/services/ledger-service.ts:126`
**Severity:** HIGH

**Problem:**
```typescript
return await prisma.$transaction(async (tx) => {
  const availableBalance = await this.getSellerBalance(sellerId, LedgerStatus.AVAILABLE, tx);
  if (availableBalance.lessThan(decimalAmount)) throw new Error('INSUFFICIENT_FUNDS');
  // ... create ledger entry ...
});
```
Two concurrent withdrawal requests for the same seller both read the same available balance before either commits. Both pass the `lessThan` check and both create debit ledger entries, causing the seller to overdraw.

**Suggested Fix:** Debit first, then re-check the resulting balance and rollback if negative:
```typescript
return await prisma.$transaction(async (tx) => {
  // Create the debit entry first
  await tx.sellerLedgerEntry.create({
    data: { sellerId, type: WITHDRAWAL, amount: decimalAmount.negated(), status: AVAILABLE }
  });

  // Recompute balance — if now negative, roll back
  const newBalance = await this.getSellerBalance(sellerId, LedgerStatus.AVAILABLE, tx);
  if (newBalance.lessThan(0)) throw new Error('INSUFFICIENT_FUNDS');

  // If balance is still non-negative, create the payout record
  return tx.payout.create({ ... });
});
```

---

### B07 — Payout Simulation Bypasses Production Safety
**File:** `packages/api/modules/revenue/services/revenue-service.ts:103-127`
**Severity:** MEDIUM

**Problem:**
```typescript
} catch (err) {
  return await prisma.payout.update({ data: { status: 'FAILED', bankRef: `ERR-...` } });
}
// ...then falls through to:
return await prisma.payout.update({ data: { status: 'SUCCESS', bankRef: `SIM-...` } });
```
When the Paystack API call throws an exception (e.g., revoked key, network failure), the `catch` block marks the payout as `FAILED` — but the function then continues and hits the simulation block which marks it `SUCCESS` with a fake bank reference. In production with a real but failing key, real seller payouts are silently faked.

**Suggested Fix:** The simulation block must be guarded by a non-production check and placed at the top as an early return:
```typescript
if (process.env.NODE_ENV !== 'production') {
  return prisma.payout.update({ data: { status: 'SUCCESS', bankRef: `SIM-...` } });
}
// Production: real API only, throw on any failure
```

---

### B08 — Ad Budget Check Allows One Over-Spend Click
**File:** `packages/api/modules/advertising/services/advertising-service.ts:83`
**Severity:** MEDIUM

**Problem:**
The click is recorded and the spend is deducted _before_ the budget is checked. This means when a campaign's spend reaches exactly its budget on the current click, it is paused — but the budget is already exceeded by that click's cost. A campaign with a ₦10,000 budget may spend ₦10,100 before being paused.

**Suggested Fix:** Check the budget _before_ recording the click:
```typescript
const priorSpend = await tx.adClick.aggregate({
  where: { adGroup: { campaignId: adGroup.campaignId } },
  _sum: { cost: true }
});
if ((priorSpend._sum.cost || new Decimal(0)).gte(adGroup.campaign.budget)) {
  await tx.adCampaign.update({ data: { status: 'OUT_OF_BUDGET' } });
  return null; // Discard click, campaign is already exhausted
}
// Now record the click
```

---

### B09 — Hardcoded `warehouseId: 'main-wh'` is a FK Violation
**File:** `packages/api/modules/catalog/services/catalog-service.ts:52`
**Severity:** MEDIUM

**Problem:**
```typescript
await prisma.stockLevel.create({
  data: { variantId: variant.id, sellerId, warehouseId: 'main-wh', ... }
});
```
`warehouseId` is a FK to `Warehouse.id`. The seed likely creates a warehouse with a CUID as its ID. `'main-wh'` will never match any real ID, causing every product creation to fail with a foreign key constraint error on any fresh environment.

**Suggested Fix:**
```typescript
const defaultWarehouse = await prisma.warehouse.findFirst({
  orderBy: { name: 'asc' }
});
if (!defaultWarehouse) throw new Error('NO_WAREHOUSE_CONFIGURED');

await prisma.stockLevel.create({
  data: { variantId: variant.id, sellerId, warehouseId: defaultWarehouse.id, ... }
});
```

---

### B10 — Search Result `variant_id` Parsed Incorrectly
**File:** `packages/api/modules/catalog/services/catalog-service.ts:216`
**Severity:** MEDIUM

**Problem:**
```typescript
const variantIds = searchResponse.results.map((r: any) => r.variant_id[0]);
```
If `r.variant_id` is a CUID string (e.g., `"clx1abc2def"`), then `r.variant_id[0]` is the character `'c'`. Every variant lookup will use `'c'` as the ID, returning zero products from `prisma.productVariant.findMany`. Search always returns empty.

**Suggested Fix:**
```typescript
const variantIds = searchResponse.results.map((r: any) => r.variant_id);
```

---

### B11 — Logistics Status Update Bypasses Order Status Sync
**File:** `packages/api/modules/logistics/services/logistics-service.ts:66`
**Severity:** MEDIUM

**Problem:**
```typescript
await prisma.orderPackage.update({
  where: { id: shipment.packageId },
  data: { status: status as any } // Direct write — skips packageService
});
```
`packageService.updateStatus` calls `syncOrderWithPackages` which propagates the delivery state to the parent `Order`. This direct write bypasses that sync. When the logistics agent marks delivery, `OrderPackage.status` becomes `DELIVERED` but `Order.status` remains `PROCESSING`. Escrow release is never triggered.

**Suggested Fix:**
```typescript
// After updating shipment, sync package status via the authoritative path
const { packageService } = await import('../../order/services/package-service');
await packageService.syncOrderWithPackages(shipment.package.orderId);
```

---

### B12 — Review Rating Update Has Redundant Query and Silent Error Suppression
**File:** `packages/api/modules/review/services/review-service.ts:47`
**Severity:** MEDIUM

**Problem:**
1. `prisma.product.update(...)` updates the product rating. The function then immediately calls `prisma.product.findUnique(...)` to get the `sellerId` — this is available from the review's `productId` context without a second DB query.
2. The entire block is wrapped in `try/catch` with `console.warn`. If the seller rating update fails, the product rating is updated but the seller rating is stale — silently.

**Suggested Fix:**
- Pass `productId` to a single include when fetching the product initially, or use a `select` in the `update` return value to get `sellerId`:
```typescript
const updatedProduct = await prisma.product.update({
  where: { id: productId },
  data: { averageRating: ..., reviewCount: ... },
  select: { sellerId: true } // Get sellerId from the update result — no extra query
});
// Use updatedProduct.sellerId
```
- Separate product and seller rating updates into distinct try/catch blocks so one failure doesn't mask the other.

---

### B13 — `getMyDisputes` Uses Nonsense Fallback String in DB Query
**File:** `packages/api/modules/dispute/services/dispute-service.ts:140`
**Severity:** MEDIUM

**Problem:**
```typescript
const seller = await prisma.seller.findUnique({ where: { userId } });
return prisma.dispute.findMany({
  where: {
    OR: [
      { buyerId: userId },
      { sellerId: seller?.id || 'NON_EXISTENT' } // ❌
    ]
  }
});
```
If the seller lookup times out or returns null, `'NON_EXISTENT'` is used as a literal `sellerId`. This is fragile and can cause invisible bugs if the seller lookup fails transiently.

**Suggested Fix:**
```typescript
const seller = await prisma.seller.findUnique({ where: { userId } });
const orClauses = [{ buyerId: userId }];
if (seller) orClauses.push({ sellerId: seller.id });

return prisma.dispute.findMany({ where: { OR: orClauses } });
```

---

### B14 — Flash Sale `qtySold` Never Incremented
**File:** `packages/db/prisma/schema/promotions.prisma` + `promo-service.ts`
**Severity:** MEDIUM

**Problem:**
`FlashSale.qtyLimit` and `FlashSale.qtySold` exist in the schema but `qtySold` is never incremented anywhere in the codebase. `getFlashSaleForVariant` only checks time windows. A flash sale with `qtyLimit: 10` can sell thousands of units at the discounted price.

**Suggested Fix:**
In `orderService.createFromCart`, inside the transaction loop, after the stock reservation:
```typescript
const now = new Date();
const flashSale = await tx.flashSale.findFirst({
  where: {
    variantId: item.variantId,
    startTime: { lte: now },
    endTime: { gte: now }
  }
});

if (flashSale) {
  if (flashSale.qtySold + item.quantity > flashSale.qtyLimit) {
    throw new Error(`FLASH_SALE_EXHAUSTED:${item.variantId}`);
  }
  await tx.flashSale.update({
    where: { id: flashSale.id },
    data: { qtySold: { increment: item.quantity } }
  });
}
```

---

## Cross-Module Risk Map

```
Return Approval
  B01: fundWallet outside tx → wallet credit not rolled back on failure
  B03: No Refund record → finance blind spot

Dispute Resolution (Admin)
  B04: fundWallet outside tx → same double-credit risk

Seller Payouts
  B05: releaseMatureEscrow race → double-release possible
  B06: withdrawFunds TOCTOU → overdraft possible
  B07: simulation fallback in prod → fake SUCCESS payouts

Orders & Flash Sales
  B14: qtySold never updated → flash sale quantity limits unenforced

Catalog & Search
  B09: warehouseId hardcoded → product creation breaks on fresh DB
  B10: variant_id[0] bug → search always returns empty

Logistics to Order
  B11: direct package update → Order.status stuck at PROCESSING after delivery
```

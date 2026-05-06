# Targeted Bug Hunt — Critical Infrastructure
**Date:** 2026-05-05
**Scope:** Auth layer, tRPC middleware, queue workers, routers, cart, promo, bulk import

---

## Summary Table

| ID | Area | File | Severity | Category | Description |
|----|------|------|----------|----------|-------------|
| C01 | Auth/Context | `context.ts:51` | CRITICAL | Security | Session cookie lookup uses raw token as `tokenHash` — sessions are never found via cookie |
| C02 | Auth/Context | `context.ts:26` | HIGH | Security | JWT authentication path does not check `user.isActive` — suspended users retain access |
| C03 | Queue / Workers | `event-consumer/src/index.ts:54` | HIGH | Infrastructure | Duplicate BullMQ worker registered on the `orders` queue — jobs split unpredictably, handlers may be skipped |
| C04 | Order Router | `order/router/index.ts:46` | HIGH | Logic | `listSellerPackages` passes `userId` where `sellerId` is expected — always returns empty results |
| C05 | Order Router | `order/router/index.ts:55` | HIGH | Security | `updatePackageStatus` has no ownership check — any seller can update another seller's package (IDOR) |
| C06 | Payment Router | `payment/router/index.ts:13` | HIGH | Security | Payment amount taken directly from client input, not validated against DB order total — amount tampering possible |
| C07 | Promo Service | `promo-service.ts:20` | HIGH | Logic | Coupon `usedCount` is never incremented — usage limits are completely unenforced |
| C08 | Admin Router | `admin/router/index.ts:50` | MEDIUM | Logic | `resolveFraudReview` updates order status directly, bypassing `orderService.updateStatus` — state machine and side effects skipped |
| C09 | tRPC | `trpc.ts:44` | MEDIUM | Security | Rate limiter uses non-atomic `INCR` then `EXPIRE` — TTL is never set if process crashes between commands, permanently blocking IPs |
| C10 | Queue Workers | `order-worker.ts:76` | MEDIUM | Logic | `releaseMatureEscrow()` called globally inside a per-order job — N concurrent escrow-release jobs call it N times, amplifying B05 race |
| C11 | Cart Service | `cart-service.ts:106` | MEDIUM | Logic | `mergeCart` may delete the authenticated user's active cart if guest and user share the same session ID |
| C12 | Bulk Import | `bulk-import-worker.ts:94` | MEDIUM | Data | `warehouseId: 'main-wh'` hardcoded in bulk import worker — FK violation on all bulk-imported products |

---

## Detailed Findings

---

### C01 — Session Cookie Never Resolves (Sessions Always Unauthenticated via Cookie)
**File:** `apps/api-server/src/context.ts:51`
**Severity:** CRITICAL

**Problem:**
```typescript
const dbSession = await prisma.session.findUnique({
  where: { tokenHash: sessionToken }, // ❌ sessionToken is the RAW cookie value, not a hash
});
```
NextAuth stores a **hash** of the session token in the DB for security. The actual cookie value is the raw token. The Prisma query uses `tokenHash: sessionToken`, meaning it compares the DB hash column against the plain-text token. These will never match. Every browser-based user will be treated as unauthenticated, forcing all traffic through JWT (mobile path) or returning `session: null`. All web-based protected routes are effectively broken.

**Suggested Fix:**
Hash the token before querying, matching how NextAuth stores it:
```typescript
import crypto from 'crypto';

const hashedToken = crypto.createHash('sha256').update(sessionToken).digest('hex');

const dbSession = await prisma.session.findUnique({
  where: { tokenHash: hashedToken },
  include: { user: { select: { ... } } }
});
```

---

### C02 — JWT Auth Path Does Not Check `user.isActive`
**File:** `apps/api-server/src/context.ts:26`
**Severity:** HIGH

**Problem:**
```typescript
const user = await prisma.user.findUnique({
  where: { id: payload.sub },
  select: { id: true, email: true, role: true, firstName: true, lastName: true },
});
if (user) {
  return { session: { user }, ... }; // ❌ No isActive check
}
```
`userService.validateCredentials` correctly checks `if (!user.isActive) throw new Error('ACCOUNT_SUSPENDED')`. The JWT context path does not. An admin can suspend a user account, but if the user has a valid JWT (even one issued before suspension), they retain full API access until the token expires. For a typical 24h JWT, the user has up to 24 hours of post-suspension access.

**Suggested Fix:**
```typescript
select: { id: true, email: true, role: true, firstName: true, lastName: true, isActive: true },
...
if (user && user.isActive) { // ✅ Only return session for active users
  return { session: { user }, ... };
}
```

---

### C03 — Duplicate BullMQ Worker Registered on `orders` Queue
**File:** `services/event-consumer/src/index.ts:54` + `packages/api/modules/order/workers/order-worker.ts:7`
**Severity:** HIGH

**Problem:**
Two separate BullMQ `Worker` instances are registered on the same `'orders'` queue:
1. `order-worker.ts`: Handles `sla-payment-timeout`, `escrow-release`, `sla-shipment-timeout`, `fraud-review`, `dispute-auto-escalate`
2. `event-consumer/src/index.ts`: Only handles `escrow-release`

BullMQ distributes jobs across all workers on the same queue. Each job is processed by exactly **one** worker. This means:
- A `dispute-auto-escalate` job may be picked up by the event consumer worker, which has no handler for it — the job silently completes without executing anything.
- A `sla-payment-timeout` job may also be silently swallowed.
- `escrow-release` jobs are split between two workers with slightly different logic — the event consumer advances no order status, while `order-worker` does.

**Suggested Fix:**
Remove the `orders` queue Worker from `event-consumer/src/index.ts` entirely. The event consumer should only process the `system-events` queue. All order job handling belongs in `order-worker.ts`:
```typescript
// event-consumer/src/index.ts: DELETE the orderWorker registration
// Keep only: eventWorker on 'system-events'
```

---

### C04 — `listSellerPackages` Passes `userId` Instead of `sellerId`
**File:** `packages/api/modules/order/router/index.ts:46`
**Severity:** HIGH

**Problem:**
```typescript
// Router
listSellerPackages: sellerProcedure.query(async ({ ctx, input }) => {
  return await orderService.listSellerPackages(ctx.session.user.id, input.limit, input.offset);
  //                                           ^^^ userId passed
}),

// Service
async listSellerPackages(sellerId: string, ...) {
  return prisma.orderPackage.findMany({
    where: { sellerId }, // Queries by sellerId, but receives userId
  });
}
```
`ctx.session.user.id` is the `User.id`. The `OrderPackage.sellerId` is the `Seller.id` (a different model). These are never equal. Every seller gets an empty list of their own orders.

**Suggested Fix:**
```typescript
listSellerPackages: sellerProcedure.query(async ({ ctx, input }) => {
  const seller = await prisma.seller.findUnique({ where: { userId: ctx.session.user.id } });
  if (!seller) throw new TRPCError({ code: 'NOT_FOUND', message: 'Seller profile not found' });
  return await orderService.listSellerPackages(seller.id, input.limit, input.offset);
}),
```

---

### C05 — `updatePackageStatus` Has No Ownership Verification (IDOR)
**File:** `packages/api/modules/order/router/index.ts:55`
**Severity:** HIGH

**Problem:**
```typescript
updatePackageStatus: sellerProcedure
  .input(z.object({ packageId: z.string(), status: z.nativeEnum(PackageStatus), ... }))
  .mutation(async ({ input }) => {  // ❌ ctx is not even used
    return await packageService.updateStatus(input.packageId, input.status, input.trackingNumber);
  }),
```
Any authenticated seller can call this endpoint with any `packageId`, including packages belonging to other sellers. There is no check that the authenticated seller owns the package. This is a direct IDOR (Insecure Direct Object Reference) vulnerability.

**Suggested Fix:**
```typescript
.mutation(async ({ ctx, input }) => {
  const seller = await prisma.seller.findUnique({ where: { userId: ctx.session.user.id } });
  if (!seller) throw new TRPCError({ code: 'FORBIDDEN' });

  const pkg = await prisma.orderPackage.findUnique({ where: { id: input.packageId } });
  if (!pkg || pkg.sellerId !== seller.id) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Package does not belong to this seller' });
  }

  return await packageService.updateStatus(input.packageId, input.status, input.trackingNumber);
}),
```

---

### C06 — Payment Amount Is Not Validated Against Order Total
**File:** `packages/api/modules/payment/router/index.ts:13`
**Severity:** HIGH

**Problem:**
```typescript
initializePaystack: protectedProcedure
  .input(z.object({ orderId: z.string(), amount: z.number().positive() }))
  .mutation(async ({ ctx, input }) => {
    return await paymentService.initializePaystack(
      input.orderId,
      ctx.session.user.id,
      ctx.session.user.email!,
      input.amount  // ❌ Taken directly from the client with no verification
    );
  }),
```
A malicious client can submit `amount: 0.01` to initialize a Paystack transaction for any order value. Paystack will process a ₦0.01 payment, and if the webhook confirms it, `handleWebhook` will mark the full order as `PAID`.

**Suggested Fix:**
```typescript
.mutation(async ({ ctx, input }) => {
  const order = await prisma.order.findUnique({
    where: { id: input.orderId, userId: ctx.session.user.id }
  });
  if (!order) throw new TRPCError({ code: 'NOT_FOUND' });
  if (order.status !== 'PENDING_PAYMENT') throw new TRPCError({ code: 'BAD_REQUEST', message: 'Order not awaiting payment' });

  // Use the actual order total, not the client-provided amount
  return await paymentService.initializePaystack(
    input.orderId,
    ctx.session.user.id,
    ctx.session.user.email!,
    order.total.toNumber() // ✅ Server-authoritative amount
  );
}),
```

---

### C07 — Coupon `usedCount` Never Incremented
**File:** `packages/api/modules/promo/services/promo-service.ts:20`
**Severity:** HIGH

**Problem:**
```typescript
async validateCoupon(code: string, userId?: string, orderTotal?: number) {
  // ...
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new Error('COUPON_EXHAUSTED');
  }
  // ...
  return promo; // ❌ usedCount is NEVER incremented
}
```
The check works correctly but `usedCount` is always 0 because it is never incremented anywhere in the codebase. Every coupon is perpetually valid regardless of its configured `usageLimit`. A limited 50-use coupon can be applied by thousands of users.

**Suggested Fix:**
Validate and atomically increment in the same transaction at the point of order creation:
```typescript
async validateAndApplyCoupon(code: string, tx?: any) {
  const db = tx || prisma;
  // Atomic increment with a check
  const coupon = await db.coupon.update({
    where: { code },
    data: { usedCount: { increment: 1 } },
    include: { promotion: true }
  });

  // Validate AFTER incrementing — rollback handles the failure case
  if (coupon.usageLimit && coupon.usedCount > coupon.usageLimit) {
    throw new Error('COUPON_EXHAUSTED');
  }
  // ... other checks
  return coupon.promotion;
}
```

---

### C08 — Fraud Review Resolution Bypasses State Machine
**File:** `packages/api/modules/admin/router/index.ts:48`
**Severity:** MEDIUM

**Problem:**
```typescript
resolveFraudReview: adminProcedure
  .mutation(async ({ input }) => {
    const status = input.action === 'ALLOW' ? 'PAID' : 'CANCELLED';
    return prisma.order.update({     // ❌ Direct DB write
      where: { id: input.orderId },
      data: { status }
    });
  }),
```
When an admin resolves a fraud review as `ALLOW`, the order is set to `PAID` via a direct Prisma write. This bypasses `orderService.updateStatus`, which means:
- `inventoryService.confirmStock` is never called — stock remains reserved indefinitely.
- Ledger entries are never recorded — the sale is invisible to the financial system.
- The order is stuck at `PAID` (does not advance to `PROCESSING`).

**Suggested Fix:**
```typescript
.mutation(async ({ input }) => {
  if (input.action === 'ALLOW') {
    await orderService.updateStatus(input.orderId, 'PAID'); // ✅ State machine path
  } else {
    await orderService.updateStatus(input.orderId, 'CANCELLED');
  }
}),
```

---

### C09 — Rate Limiter Uses Non-Atomic `INCR` + `EXPIRE` (Potential Permanent IP Block)
**File:** `packages/api/trpc.ts:44`
**Severity:** MEDIUM

**Problem:**
```typescript
const current = await ctx.redis.incr(key);  // Step 1
if (current === 1) {
  await ctx.redis.expire(key, window);        // Step 2 — separate command
}
```
These are two separate Redis commands, not an atomic operation. If the process crashes, is restarted, or Redis times out between the `INCR` and `EXPIRE`, the key exists in Redis with no TTL — it persists permanently. That IP/path combination is rate-limited forever with no automatic recovery. Additionally, `protectedProcedure` does not inherit from `rateLimitProcedure`, so authenticated protected routes have no rate limiting at all.

**Suggested Fix:**
Use `SET ... EX ... NX` or a pipeline to make it atomic:
```typescript
const pipeline = ctx.redis.pipeline();
pipeline.incr(key);
pipeline.expire(key, window);
const results = await pipeline.exec();
const current = results[0][1] as number;
```

---

### C10 — `releaseMatureEscrow` Called Per-Order Job (N Concurrent Calls Amplify Race)
**File:** `packages/api/modules/order/workers/order-worker.ts:76`
**Severity:** MEDIUM

**Problem:**
```typescript
async function handleEscrowRelease(orderId: string) {
  if (order && order.status === 'DELIVERED') {
    await ledgerService.releaseMatureEscrow(); // Global — releases ALL mature entries
    await orderService.updateStatus(orderId, 'COMPLETED');
  }
}
```
`releaseMatureEscrow` is a global operation — it releases all mature entries across all sellers, regardless of which order triggered it. If 50 orders' escrow-release jobs fire simultaneously (e.g., all ordered on the same day), `releaseMatureEscrow()` is called 50 times concurrently. Each call races against the others to read-then-update the same PENDING entries, directly amplifying the B05 double-release bug.

**Suggested Fix:**
Scope `releaseMatureEscrow` to the specific order, not globally:
```typescript
async function handleEscrowRelease(orderId: string) {
  if (order && order.status === 'DELIVERED') {
    // Only release escrow for THIS order's line items
    const lines = await prisma.orderLine.findMany({ where: { package: { orderId } } });
    const lineIds = lines.map(l => l.id);

    await prisma.sellerLedgerEntry.updateMany({
      where: {
        orderLineId: { in: lineIds },
        status: 'PENDING',
        availableAt: { lte: new Date() },
        orderLine: { disputes: { none: { status: { in: ['OPEN', 'UNDER_REVIEW'] } } } }
      },
      data: { status: 'AVAILABLE' }
    });

    await orderService.updateStatus(orderId, 'COMPLETED');
  }
}
```

---

### C11 — `mergeCart` May Delete the User's Own Active Cart
**File:** `packages/api/modules/cart/services/cart-service.ts:106`
**Severity:** MEDIUM

**Problem:**
```typescript
async mergeCart(guestSessionId: string, userId: string) {
  const guestCart = await prisma.cart.findUnique({ where: { sessionId: guestSessionId } });
  // ...
  const userCart = await this.getCart(guestSessionId, userId); // ← passes guestSessionId

  for (const item of guestCart.items) { ... }

  await prisma.cart.delete({ where: { id: guestCart.id } }); // ← deletes guestCart
}
```
`this.getCart(guestSessionId, userId)` first looks for a `userId`-owned cart, then upserts one for `guestSessionId`. If the user had previously been associated with the guest session (e.g., logging in on the same browser), `guestCart.id` and `userCart.id` could be the same record. Deleting `guestCart` would delete the user's primary cart.

**Suggested Fix:**
Guard the delete with an ID equality check:
```typescript
if (guestCart.id !== userCart.id) {
  await prisma.cart.delete({ where: { id: guestCart.id } });
}
```

---

### C12 — Hardcoded `'main-wh'` in Bulk Import Worker
**File:** `packages/api/modules/catalog/workers/bulk-import-worker.ts:94`
**Severity:** MEDIUM

**Problem:**
```typescript
await prisma.stockLevel.create({
  data: {
    variantId: variant.id,
    sellerId,
    warehouseId: warehouseId || 'main-wh', // ❌ Same hardcoded FK issue as B09
    ...
  }
});
```
Even though the worker accepts `warehouseId` from job data, it falls back to `'main-wh'` if not provided. This is the same FK violation as B09. Additionally, the worker has no guard against **duplicate SKU imports** — re-running the same CSV file creates duplicate products silently.

**Suggested Fix:**
```typescript
let resolvedWarehouseId = warehouseId;
if (!resolvedWarehouseId) {
  const defaultWarehouse = await prisma.warehouse.findFirst({ orderBy: { name: 'asc' } });
  if (!defaultWarehouse) throw new Error('NO_DEFAULT_WAREHOUSE');
  resolvedWarehouseId = defaultWarehouse.id;
}
```
For duplicate SKU protection, add a check before creating:
```typescript
const existingVariant = await prisma.productVariant.findFirst({ where: { sku } });
if (existingVariant) {
  console.warn(`[BulkImportWorker] SKU ${sku} already exists. Skipping.`);
  continue;
}
```

---

## Cross-Cutting Risk Summary

```
Authentication
  C01: Cookie sessions never resolve → all web users are unauthenticated
  C02: Suspended users bypass ban if they have a valid JWT

Authorization (IDOR / Missing Checks)
  C05: Any seller can update any package status
  C06: Payment amount sourced from client → price tampering

Queue Infrastructure
  C03: Duplicate worker on 'orders' queue → silent job loss for sla/dispute jobs
  C10: Per-order escrow job calls global release → N concurrent calls race

State Machine
  C08: Fraud review resolution bypasses updateStatus → stock/ledger side effects lost

Logic Errors
  C04: Seller package list always empty (userId ≠ sellerId)
  C07: Coupon usedCount never incremented → limits never enforced
  C11: mergeCart can delete user's own cart
  C09: Rate limiter can permanently block IPs on crash
  C12: Bulk import uses hardcoded warehouseId fallback
```

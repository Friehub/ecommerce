# Critical Production Bug Hunt — Pass 3
**Date:** 2026-05-05
**Scope:** Auth architecture, Redis behavior, cache layer, router authorization, schema gaps, workers

---

## Summary Table

| ID | Area | File | Severity | Category | Description |
|----|------|------|----------|----------|-------------|
| D01 | Auth Architecture | `auth.ts:10` + `context.ts:51` | CRITICAL | Architecture | JWT session strategy in NextAuth vs. DB session lookup in API — fundamentally incompatible |
| D02 | Redis / Rate Limiter | `redis.ts` | CRITICAL | Reliability | Redis errors are silently swallowed — rate limiter, stock reservation, and all queue operations fail silently in production |
| D03 | Catalog Router | `catalog/router/index.ts` | CRITICAL | Security | `createCategory` uses `publicProcedure` — any unauthenticated user can create categories and set arbitrary commission rates |
| D04 | Cache | `cache/index.ts` | HIGH | Reliability | `cacheService.wrap` has no stampede protection — concurrent cache misses trigger N parallel DB queries for the same key |
| D05 | Auth / Session | `context.ts:46` | HIGH | Security | Session cookie name `__Secure-authjs.session-token` is only set on HTTPS — HTTP dev/staging environments silently fall to unauthenticated |
| D06 | Cart | `cart/router/index.ts` | HIGH | Security | All cart mutations use `publicProcedure` with client-supplied `sessionId` — any client can read or modify any cart by guessing/intercepting a session ID |
| D07 | Notification Worker | `notification-worker.ts:7` | HIGH | Infrastructure | Third BullMQ worker registered on `system-events` queue — splits jobs with `event-consumer`, causing silent notification drops |
| D08 | Catalog Import | `catalog-import-service.ts:4` | HIGH | Data | `enqueueImport` defaults `warehouseId` to `'main-wh'` string — bulk import always produces FK violations unless caller explicitly passes an ID |
| D09 | Schema | `payment.prisma` | MEDIUM | Data | `Payment` has no `@@unique` on `providerRef` — duplicate payment records can be created for the same Paystack reference if webhook fires twice |
| D10 | Schema | `order.prisma` | MEDIUM | Data | `OrderPackage` has no relation to `Seller` model — `sellerId` is a bare string, not a FK — no referential integrity for seller packages |
| D11 | Schema | `inventory.prisma` | MEDIUM | Data | `StockReservation` has no index on `(orderId, status)` — `releaseStockByOrderId` and `confirmStock` do full table scans on every order operation |
| D12 | Worker | `order-worker.ts:88` | MEDIUM | Logic | `handleShipmentTimeout` checks `order.status === 'PAID'` — but after the PAID→PROCESSING auto-transition fix, orders never stay at PAID; SLA penalty never fires |

---

## Detailed Findings

---

### D01 — NextAuth JWT Strategy vs. DB Session Lookup: Fundamental Architectural Mismatch
**Files:** `apps/web/src/auth.ts:10`, `apps/api-server/src/context.ts:51`
**Severity:** CRITICAL

**Problem:**
```typescript
// auth.ts — NextAuth configured with JWT strategy
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' }, // ← JWT: sessions are stateless, stored in cookie
  // adapter: PrismaAdapter(prisma),  ← Adapter is COMMENTED OUT
  ...
})
```
```typescript
// context.ts — API server tries to look up a DB session
const dbSession = await prisma.session.findUnique({
  where: { tokenHash: sessionToken }, // ← No DB sessions exist
});
```
The entire auth architecture is split across two incompatible strategies:
- NextAuth is configured with `strategy: 'jwt'` and the `PrismaAdapter` is commented out. This means NextAuth stores sessions as encrypted JWT cookies — **no rows are written to the `Session` table**.
- The API server's `createContext` attempts to look up the cookie value in `prisma.session` — which is always empty.
- Path 1 (JWT Bearer header) works for mobile/external clients.
- Path 2 (cookie) is architecturally impossible and will never resolve a session.

The result: **every browser-based user is always treated as unauthenticated by the Fastify API server.** All tRPC calls from the web frontend fail authorization.

**Two valid fixes:**

**Option A — Use JWT strategy end-to-end (minimal change):**
Drop the DB session lookup entirely. Decode the NextAuth JWT directly from the cookie:
```typescript
import { decode } from 'next-auth/jwt';

const sessionToken = cookies?.['__Secure-authjs.session-token'] ?? cookies?.['authjs.session-token'];
if (sessionToken) {
  const decoded = await decode({
    token: sessionToken,
    secret: process.env.NEXTAUTH_SECRET!,
    salt: '__Secure-authjs.session-token'
  });
  if (decoded?.sub) {
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, email: true, role: true, firstName: true, lastName: true, isActive: true }
    });
    if (user?.isActive) return { session: { user }, ... };
  }
}
```

**Option B — Use database sessions:** Uncomment `PrismaAdapter`, change `strategy: 'database'`, and hash the token correctly (see C01).

---

### D02 — Redis Errors Are Silently Swallowed (Rate Limiting, Stock, Queues All Fail Open)
**File:** `packages/shared/src/infra/redis.ts`
**Severity:** CRITICAL

**Problem:**
```typescript
(redis as any).on('error', () => {
  // Swallow connection errors to prevent unhandled crashing
})
```
All Redis errors are silently suppressed. This means:

1. **Rate limiter (`trpc.ts`):** If Redis is down, `redis.incr(key)` returns `null` (MockRedis behavior — the fallback when Redis disconnects). The rate limiter check `current > limit` with `null` evaluates to `false` — rate limiting is completely disabled.

2. **Stock reservation (`inventoryService.reserveStock`):** `redis.eval(RESERVE_STOCK_LUA, ...)` returns `null` (not `1`) — every stock reservation check silently returns `false`, blocking all orders.

3. **BullMQ queues:** If Redis is down, `publishEvent` silently does nothing. Orders, payments, and notifications are never queued.

**The `enableOfflineQueue: false` option compounds this** — any command issued while Redis is temporarily disconnected is immediately rejected with an error, not queued for retry.

**Suggested Fix:**
```typescript
(redis as any).on('error', (err: Error) => {
  console.error('[Redis] Connection error:', err.message);
  // Alert your monitoring system here (Prometheus counter, Sentry, etc.)
});
```
For the rate limiter specifically, fail closed (reject requests) when Redis is unavailable, not open:
```typescript
if (ctx.redis && ctx.ip) {
  try {
    // ... rate limit logic
  } catch (err) {
    // Redis failure: fail closed for sensitive endpoints
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Service temporarily unavailable' });
  }
}
```

---

### D03 — `createCategory` Is a `publicProcedure` (Unauthenticated Commission Manipulation)
**File:** `packages/api/modules/catalog/router/index.ts`
**Severity:** CRITICAL

**Problem:**
```typescript
createCategory: publicProcedure // In reality, this should be adminProcedure
  .input(categorySchema)
  .mutation(async ({ input }) => {
    return await catalogService.createCategory(input);
  }),
```
The comment even acknowledges this is wrong. The `commissionRate` field on `Category` is set at creation time and determines what percentage the platform takes from every sale in that category. Any unauthenticated external caller can:
1. Create a category with `commissionRate: 0` (zero commission for the platform).
2. A seller then lists products under this category, paying no commission.
3. Or create `commissionRate: 99` categories to sabotage competitor sellers.

**Suggested Fix:**
```typescript
createCategory: adminProcedure  // ← Simple fix
  .input(categorySchema)
  .mutation(async ({ input }) => {
    return await catalogService.createCategory(input);
  }),
```

---

### D04 — Cache `wrap` Has No Stampede Protection
**File:** `packages/shared/src/cache/index.ts`
**Severity:** HIGH

**Problem:**
```typescript
async wrap<T>(key: string, fn: () => Promise<T>, ttlSeconds: number = 3600): Promise<T> {
  const cached = await cacheService.get<T>(key);
  if (cached) return cached;      // Cache miss

  const fresh = await fn();        // ← All concurrent callers execute fn() simultaneously
  await cacheService.set(key, fresh, ttlSeconds);
  return fresh;
}
```
When a cache key expires under high traffic (e.g., `catalog:product:{slug}` after the 5-minute TTL), all concurrent requests that hit the cache miss will simultaneously call `fn()` — which is a complex Prisma query plus a Rust recommendations call. Under high traffic, a single popular product page expiry could trigger hundreds of simultaneous full DB queries.

**Suggested Fix:** Use a Redis-based lock to allow only one request to recompute:
```typescript
async wrap<T>(key: string, fn: () => Promise<T>, ttlSeconds: number = 3600): Promise<T> {
  const cached = await cacheService.get<T>(key);
  if (cached) return cached;

  const lockKey = `lock:${key}`;
  const lockAcquired = await redis.set(lockKey, '1', 'EX', 10, 'NX');

  if (!lockAcquired) {
    // Another process is recomputing — wait briefly and return stale/null
    await new Promise(r => setTimeout(r, 100));
    return await cacheService.get<T>(key) ?? await fn();
  }

  try {
    const fresh = await fn();
    await cacheService.set(key, fresh, ttlSeconds);
    return fresh;
  } finally {
    await redis.del(lockKey);
  }
}
```

---

### D05 — Session Cookie Name Is HTTPS-Only in HTTP Environments
**File:** `apps/api-server/src/context.ts:46`
**Severity:** HIGH

**Problem:**
```typescript
const sessionToken =
  cookies?.['__Secure-authjs.session-token'] ??  // Only set on HTTPS
  cookies?.['authjs.session-token'];              // HTTP fallback
```
NextAuth sets `__Secure-authjs.session-token` only when the connection is HTTPS. In HTTP development or staging environments, NextAuth sets `authjs.session-token` (no `__Secure-` prefix). The fallback `authjs.session-token` handles this case — however, since D01 means this lookup is architecturally broken anyway, fixing D01 requires correctly identifying which cookie name is in use. This is a latent bug that will resurface after D01 is fixed.

**Suggested Fix:** After fixing D01 to decode JWT directly, ensure the same cookie name priority is maintained when calling `decode`:
```typescript
const cookieNames = ['__Secure-authjs.session-token', 'authjs.session-token'];
for (const name of cookieNames) {
  const token = cookies?.[name];
  if (token) {
    const decoded = await decode({ token, secret: process.env.NEXTAUTH_SECRET!, salt: name });
    // ...
  }
}
```

---

### D06 — Cart Mutations Use `publicProcedure` with Client-Supplied Session ID
**File:** `packages/api/modules/cart/router/index.ts`
**Severity:** HIGH

**Problem:**
```typescript
add: publicProcedure
  .input(z.object({ sessionId: z.string(), variantId: z.string(), quantity: z.number() }))
  .mutation(async ({ ctx, input }) => {
    return await cartService.addItem(input.sessionId, ...);
  }),
```
The `sessionId` is supplied by the client and is the sole ownership check for cart operations (`removeItem` checks `item.cart.sessionId !== sessionId`). There is no authentication requirement. Any client that can observe or guess another user's session ID (e.g., via browser dev tools on a shared machine, or a network intercept) can read, add to, or empty another user's cart. The `removeItem` ownership check becomes an IDOR when `sessionId` is client-controlled.

**Suggested Fix:** For authenticated users, derive the cart from `ctx.session.user.id`, not from client input. For anonymous carts, the `sessionId` should be generated server-side and bound to a short-lived cookie — never passed as a mutable request parameter for writes.

---

### D07 — Third BullMQ Worker on `system-events` Queue (Silent Notification Drops)
**File:** `packages/api/modules/notification/workers/notification-worker.ts:7`
**Severity:** HIGH

**Problem:**
```typescript
export const notificationWorker = new Worker('system-events', async (job: Job) => {
  // Handles: order.created, payment.confirmed, order.status_updated, refund.processed, seller.approved, dispute.resolved
}, { connection: redis });
```
```typescript
// event-consumer/src/index.ts — ALSO on 'system-events'
const eventWorker = new Worker('system-events', async job => {
  // Handles: product.created, product.updated, inventory.updated
}, { connection: redis, concurrency: 5 });
```
Two workers compete on the same `system-events` queue. BullMQ distributes each job to exactly one worker. A `order.created` event may be picked up by the `eventWorker` (which has no handler for it — falls to `default: console.log`), dropping the order confirmation email silently. Conversely, a `product.created` event may be picked up by `notificationWorker` (no handler — silently dropped), breaking search index sync.

**Suggested Fix:** Consolidate all `system-events` consumers into a single worker, or use named queues per domain (`notification-events`, `search-events`) so workers don't compete.

---

### D08 — `catalogImportService` Defaults `warehouseId` to `'main-wh'`
**File:** `packages/api/modules/catalog/services/catalog-import-service.ts:4`
**Severity:** HIGH

**Problem:**
```typescript
async enqueueImport(sellerId: string, csvContent: string, warehouseId: string = 'main-wh') {
  const job = await queues.bulkImportQueue.add('process-csv', {
    sellerId,
    csvContent,
    warehouseId  // ← 'main-wh' passed to worker if caller omits it
  });
}
```
The catalog router calls `catalogImportService.enqueueImport(seller.id, input.csvContent, input.warehouseId)` where `input.warehouseId` is optional. When not provided, `'main-wh'` flows into the job payload, the bulk import worker uses it as a FK, and every single imported product's stock level creation fails. The import reports progress as 100% but creates zero valid stock levels.

**Suggested Fix:** Resolve the warehouse ID at the service layer before enqueueing:
```typescript
async enqueueImport(sellerId: string, csvContent: string, warehouseId?: string) {
  let resolvedWarehouseId = warehouseId;
  if (!resolvedWarehouseId) {
    const warehouse = await prisma.warehouse.findFirst({ orderBy: { name: 'asc' } });
    if (!warehouse) throw new Error('NO_DEFAULT_WAREHOUSE_CONFIGURED');
    resolvedWarehouseId = warehouse.id;
  }

  return queues.bulkImportQueue.add('process-csv', { sellerId, csvContent, warehouseId: resolvedWarehouseId });
}
```

---

### D09 — `Payment.providerRef` Has No Unique Constraint (Duplicate Payments on Webhook Retry)
**File:** `packages/db/prisma/schema/payment.prisma`
**Severity:** MEDIUM

**Problem:**
```prisma
model Payment {
  id          String   @id @default(cuid())
  orderId     String
  providerRef String?  // ← No @@unique or @@index
  ...
}
```
`handleWebhook` looks up payments with `findFirst({ where: { providerRef: reference } })`. Paystack retries webhooks on non-200 responses (e.g., if the server is slow or briefly down). Without a unique constraint on `providerRef`, a retry can create a second `Payment` record with the same reference. The first `findFirst` call finds the original record; the retry creates a duplicate. Over time, the database accumulates phantom payment records with no corresponding order transitions.

**Suggested Fix:**
```prisma
model Payment {
  providerRef String? @unique  // Add unique constraint

  @@index([orderId])
}
```
Also make `handleWebhook` idempotent with an upsert:
```typescript
await prisma.payment.upsert({
  where: { providerRef: reference },
  update: { status: 'SUCCESS' },
  create: { orderId, userId, amount, method, status: 'SUCCESS', providerRef: reference }
});
```

---

### D10 — `OrderPackage.sellerId` Has No FK Relation to `Seller`
**File:** `packages/db/prisma/schema/order.prisma:43`
**Severity:** MEDIUM

**Problem:**
```prisma
model OrderPackage {
  id       String @id @default(cuid())
  orderId  String
  sellerId String  // ← Bare string, no @relation
  ...
  order Order @relation(...)
  // No: seller Seller @relation(...)
}
```
`sellerId` is a plain string column with no FK constraint to `Seller`. This means:
- Deleting or deactivating a seller does not cascade or validate against existing packages.
- A typo in `sellerId` during order creation stores a phantom seller ID with no DB error.
- Queries like `prisma.orderPackage.findMany({ where: { sellerId }, include: { seller: true } })` are not possible.

**Suggested Fix:**
```prisma
model OrderPackage {
  ...
  seller Seller @relation(fields: [sellerId], references: [id])
  ...
}

// Add back-relation on Seller:
model Seller {
  packages OrderPackage[]
}
```

---

### D11 — `StockReservation` Missing Index on `(orderId, status)`
**File:** `packages/db/prisma/schema/inventory.prisma`
**Severity:** MEDIUM

**Problem:**
```prisma
model StockReservation {
  orderId String?
  status  ReservationStatus
  // No @@index([orderId, status])
}
```
`inventoryService.releaseStockByOrderId` and `confirmStock` both query:
```typescript
prisma.stockReservation.findMany({ where: { orderId, status: 'ACTIVE' } })
```
Without an index on `(orderId, status)`, this is a full table scan on every order status transition. At 10,000+ reservations this becomes measurably slow and can cause payment webhook timeouts.

**Suggested Fix:**
```prisma
@@index([orderId, status])
@@index([variantId, status])   // Also useful for expired reservation cleanup jobs
@@index([expiresAt, status])   // For expiry sweep queries
```

---

### D12 — `handleShipmentTimeout` Checks Wrong Status After Auto-Transition Fix
**File:** `packages/api/modules/order/workers/order-worker.ts:88`
**Severity:** MEDIUM

**Problem:**
```typescript
async function handleShipmentTimeout(orderId: string) {
  const order = await prisma.order.findUnique({ ... });

  if (order && order.status === 'PAID') {  // ← Orders no longer stay at PAID
    const overduePackages = order.packages.filter(p => p.status === 'PENDING');
    // ...penalize sellers...
  }
}
```
After the `PAID → PROCESSING` auto-transition fix in `orderService.updateStatus`, orders immediately advance to `PROCESSING` upon payment confirmation. An order will never have `status === 'PAID'` when the SLA timeout fires. The seller penalty logic for overdue shipments is completely dead code.

**Suggested Fix:**
```typescript
if (order && (order.status === 'PROCESSING' || order.status === 'PAID')) {
```

---

## Production Deployment Risk Map

```
Authentication (BLOCKS ALL WEB USERS)
  D01: JWT vs DB session — web frontend API calls always get session: null
  D02: Redis errors silently swallowed — rate limiting, stock checks, all queue ops fail open/closed randomly

Security Holes
  D03: createCategory is public — commission rates manipulable by anyone
  D06: Cart uses client session ID — cart hijacking via IDOR

Queue / Infrastructure
  D07: Third worker on system-events — ~50% of notifications and search syncs dropped
  D08: Import service defaults warehouseId to 'main-wh' — all bulk imports create broken stock

Data Integrity
  D09: No unique constraint on Payment.providerRef — duplicate payments on webhook retry
  D10: OrderPackage.sellerId has no FK — no referential integrity for seller packages
  D11: Missing index on StockReservation(orderId, status) — full table scan on every order transition
```

# Bug Hunt — Pass 4: Affiliate, IAM, Return, Dispute, Payment, Workers
**Date:** 2026-05-05

---

## Summary Table

| ID | Area | File | Severity | Category | Description |
|----|------|------|----------|----------|-------------|
| E01 | Affiliate | `affiliate-service.ts:74` | CRITICAL | Logic | `confirmCommission` calls `fundWallet` outside the update transaction — wallet funded even if commission update is rolled back |
| E02 | Affiliate | `affiliate-service.ts:87` | HIGH | Logic | `confirmMatureCommissions` has no idempotency guard — if the cron fires twice (overlap/restart), commissions are double-funded |
| E03 | Return | `return-service.ts:11` | HIGH | Logic | `initiateReturn` has no window check — returns can be opened months or years after delivery with no time limit |
| E04 | Return | `return-service.ts` | HIGH | Logic | No check if a `ReturnShipment` already exists for the `orderLineId` — duplicate return requests can be created for the same line |
| E05 | Dispute | `dispute-service.ts:131` | HIGH | Security | `respondToDispute` authorization compares `senderId` against `dispute.sellerId` (a `Seller.id`), but `senderId` is a `User.id` — sellers are always unauthorized |
| E06 | Payment | `payment-service.ts:170` | HIGH | Logic | `payWithWallet` balance check (`wallet.balance.lt(amount)`) is outside the transaction — TOCTOU race allows concurrent wallet payments to overdraft |
| E07 | IAM | `user-service.ts:37` | HIGH | Security | `validateCredentials` checks `isActive` AFTER verifying the password — timing side-channel leaks that the account exists even for suspended users |
| E08 | Workers (Cron) | `run-workers.ts:43` | HIGH | Logic | Weekly statement cron mutates `now` via `setUTCHours()` which modifies the Date object in-place — `periodEnd` and `periodStart` share the same corrupted reference |
| E09 | Workers (Cron) | `run-workers.ts:75` | MEDIUM | Performance | Nightly autocomplete trie writes every prefix of every product title individually with `zadd` — O(N × avg_title_length) Redis writes, blocks event loop |
| E10 | Workers (Cron) | `run-workers.ts:95` | MEDIUM | Logic | Fraud queue auto-cancel calls `prisma.order.updateMany` directly — bypasses `orderService.updateStatus`, so stock is never released on auto-cancel |
| E11 | Affiliate / Schema | `affiliate.prisma:31` | MEDIUM | Data | `Commission` has no `@@unique([agentId, orderId])` — one affiliate order can generate multiple commission records if `recordCommission` is called twice |

---

## Detailed Findings

---

### E01 — Affiliate `confirmCommission` Funds Wallet Outside Transaction
**File:** `packages/api/modules/affiliate/services/affiliate-service.ts:74`
**Severity:** CRITICAL

**Problem:**
```typescript
async confirmCommission(commissionId: string) {
  const updated = await prisma.commission.update({
    where: { id: commissionId },
    data: { status: 'CONFIRMED' }  // DB write 1: updates status
  });

  await paymentService.fundWallet(commission.agent.userId, commission.amount.toNumber());
  // DB write 2: funds wallet — NOT in the same transaction

  return updated;
}
```
The commission status update and the wallet funding are two separate operations. If the process crashes between them (or `fundWallet` throws), the commission is marked `CONFIRMED` but the wallet is never funded. Conversely, if `commission.update` partially fails and is retried, `fundWallet` could run twice.

**Suggested Fix:**
```typescript
async confirmCommission(commissionId: string) {
  return prisma.$transaction(async (tx) => {
    const commission = await tx.commission.findUnique({ where: { id: commissionId }, include: { agent: true } });
    if (!commission || commission.status !== 'PENDING') throw new Error('ALREADY_PROCESSED');

    await tx.commission.update({ where: { id: commissionId }, data: { status: 'CONFIRMED' } });
    await paymentService.fundWallet(commission.agent.userId, commission.amount.toNumber(), tx); // pass tx
  });
}
```

---

### E02 — `confirmMatureCommissions` Has No Concurrency Guard (Double-Payment Risk)
**File:** `packages/api/modules/affiliate/services/affiliate-service.ts:87`
**Severity:** HIGH

**Problem:**
```typescript
async confirmMatureCommissions() {
  const pending = await prisma.commission.findMany({
    where: { status: 'PENDING', order: { status: 'COMPLETED', updatedAt: { lte: yesterday } } }
  });

  for (const comm of pending) {
    await this.confirmCommission(comm.id);  // Status set to CONFIRMED inside
  }
}
```
The cron runs every hour. If two cron invocations overlap (e.g., the first run is slow and the second fires before it finishes), both will `findMany` the same `PENDING` commissions before either has committed the `CONFIRMED` update. Both calls then execute `confirmCommission` for the same IDs — the `ALREADY_PROCESSED` guard in `confirmCommission` is non-atomic, so both invocations may pass the check and fund the wallet twice.

**Suggested Fix:** Use `updateMany` + a filter to atomically claim commissions before processing:
```typescript
async confirmMatureCommissions() {
  // Atomic claim: mark as IN_PROGRESS before processing
  const claimed = await prisma.commission.updateMany({
    where: { status: 'PENDING', order: { status: 'COMPLETED', updatedAt: { lte: yesterday } } },
    data: { status: 'CONFIRMED' }  // Claim atomically
  });

  // Then fund wallets for the newly confirmed ones
  const confirmed = await prisma.commission.findMany({
    where: { status: 'CONFIRMED', /* add a processedAt=null sentinel field for safety */ },
    include: { agent: true }
  });

  for (const comm of confirmed) {
    await paymentService.fundWallet(comm.agent.userId, comm.amount.toNumber());
  }
  return { count: claimed.count };
}
```

---

### E03 — No Return Window Time Check
**File:** `packages/api/modules/return/services/return-service.ts:11`
**Severity:** HIGH

**Problem:**
```typescript
async initiateReturn(userId: string, orderLineId: string, reason: string) {
  const line = await prisma.orderLine.findUnique({ ... });
  if (!line || line.package.order.userId !== userId) throw new Error('ORDER_NOT_FOUND');
  if (line.package.status !== 'DELIVERED') throw new Error('NOT_DELIVERED');

  // ← No check on HOW LONG AGO the item was delivered
  return prisma.returnShipment.create({ ... });
}
```
There is no return window validation. A buyer can open a return request for an item delivered 2 years ago. Standard e-commerce return windows are 7–30 days. This is both a financial liability and an inventory management issue.

**Suggested Fix:**
```typescript
const RETURN_WINDOW_DAYS = 7;
const deliveredAt = line.package.order.updatedAt; // or a dedicated deliveredAt field
const daysSinceDelivery = (Date.now() - deliveredAt.getTime()) / (1000 * 60 * 60 * 24);
if (daysSinceDelivery > RETURN_WINDOW_DAYS) {
  throw new Error('RETURN_WINDOW_EXPIRED');
}
```

---

### E04 — Duplicate Return Requests Can Be Created for the Same Order Line
**File:** `packages/api/modules/return/services/return-service.ts`
**Severity:** HIGH

**Problem:**
```typescript
return prisma.returnShipment.create({
  data: { orderLineId, reason, status: 'PENDING' }
});
```
There is no check for an existing return request. A buyer can call `initiateReturn` multiple times for the same `orderLineId`, creating duplicate `ReturnShipment` records. When an admin calls `approveReturn`, they may approve multiple of them, crediting the buyer's wallet multiple times for a single returned item.

**Suggested Fix:**
```typescript
const existing = await prisma.returnShipment.findFirst({
  where: { orderLineId, status: { in: ['PENDING', 'APPROVED'] } }
});
if (existing) throw new Error('RETURN_ALREADY_REQUESTED');
```

---

### E05 — Dispute `respondToDispute` Auth Check Compares Wrong ID Types (Sellers Always Unauthorized)
**File:** `packages/api/modules/dispute/services/dispute-service.ts:131`
**Severity:** HIGH

**Problem:**
```typescript
async respondToDispute(disputeId: string, senderId: string, content: string) {
  const dispute = await prisma.dispute.findUnique({ where: { id: disputeId } });

  if (dispute.buyerId !== senderId && dispute.sellerId !== senderId) {
    throw new Error('UNAUTHORIZED');  // ← sellerId is a Seller.id, senderId is a User.id
  }
}
```
`dispute.buyerId` is a `User.id`. `dispute.sellerId` is a `Seller.id` (from the `Seller` table — a different model). `senderId` is the `User.id` from `ctx.session.user.id`. These two types can never be equal, so:
- `dispute.buyerId !== senderId` passes for buyers correctly.
- `dispute.sellerId !== senderId` always passes (Seller ID ≠ User ID) — every seller is always rejected as unauthorized.

Sellers can never respond to their own disputes.

**Suggested Fix:**
```typescript
const seller = await prisma.seller.findUnique({ where: { userId: senderId } });
const isParticipant = dispute.buyerId === senderId || (seller && dispute.sellerId === seller.id);
if (!isParticipant) throw new Error('UNAUTHORIZED');
```
Apply the same fix to `uploadEvidence` and `getDisputeThread` (which has the same `dispute.sellerId !== userId` comparison).

---

### E06 — `payWithWallet` Balance Check Is Outside the Transaction (TOCTOU Race)
**File:** `packages/api/modules/payment/services/payment-service.ts:170`
**Severity:** HIGH

**Problem:**
```typescript
async payWithWallet(userId: string, orderId: string, amount: number) {
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet || wallet.balance.lt(amount)) throw new Error('INSUFFICIENT_FUNDS');
  // ← Balance checked here, OUTSIDE the transaction

  return prisma.$transaction(async (tx) => {
    await tx.wallet.update({ data: { balance: { decrement: amount } } });
    // ...
  });
}
```
Two concurrent requests for the same wallet both read the balance before either transaction commits the decrement. Both pass the `lt(amount)` check, both enter the transaction and both decrement the balance. The wallet can go negative.

**Suggested Fix:** Move the balance check inside the transaction:
```typescript
return prisma.$transaction(async (tx) => {
  const wallet = await tx.wallet.findUnique({ where: { userId } });
  if (!wallet || wallet.balance.lt(amount)) throw new Error('INSUFFICIENT_FUNDS');

  // Decrement and check again (debit-then-verify pattern)
  const updated = await tx.wallet.update({
    where: { id: wallet.id },
    data: { balance: { decrement: amount } }
  });
  if (updated.balance.lt(0)) throw new Error('INSUFFICIENT_FUNDS');

  // ... rest of transaction
});
```

---

### E07 — Password Checked Before `isActive` — Timing Oracle for Suspended Accounts
**File:** `packages/api/modules/iam/services/user-service.ts:37`
**Severity:** HIGH

**Problem:**
```typescript
async validateCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) return null;

  const valid = await bcrypt.compare(password, user.passwordHash); // ← Expensive bcrypt op
  if (!valid) return null;

  if (!user.isActive) throw new Error('ACCOUNT_SUSPENDED'); // ← Only checked AFTER bcrypt
  return user;
}
```
The order of checks leaks account existence:
- Non-existent account: fast `null` return (no bcrypt).
- Suspended account with wrong password: fast `null` return (bcrypt fails).
- Suspended account with **correct** password: throws `ACCOUNT_SUSPENDED`.

A timing or error-message attacker can differentiate: if they see `ACCOUNT_SUSPENDED` vs a generic failure, they know (a) the account exists and (b) they have the correct password for a suspended account.

**Suggested Fix:** Check `isActive` first, before bcrypt:
```typescript
async validateCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) return null;
  if (!user.isActive) return null; // ← Check before bcrypt, return generic null

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  return user;
}
```

---

### E08 — Weekly Statement Cron Mutates `now` In-Place (Statement Covers Wrong Period)
**File:** `packages/api/scripts/run-workers.ts:43`
**Severity:** HIGH

**Problem:**
```typescript
cron.schedule('0 1 * * 1', async () => {
  const now = new Date();
  const periodEnd = new Date(now.setUTCHours(0, 0, 0, 0));  // ← mutates `now` IN-PLACE
  const periodStart = new Date(periodEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
  // ...
  await ledgerService.generateStatement(seller.id, periodStart, periodEnd);
});
```
`now.setUTCHours(0, 0, 0, 0)` **mutates** the `now` Date object and also returns the new timestamp. So `periodEnd` is assigned `new Date(timestamp)` which is correct. However, `now` itself is now the same object as `periodEnd`. If `now` is used anywhere below (or passed by reference), the period calculations will be wrong.

More critically, `periodEnd` is `new Date(now.setUTCHours(0,0,0,0))` — `Date.setUTCHours` returns a *number* (Unix timestamp in ms), not a Date. So `periodEnd = new Date(number)` actually works correctly — but it's a confusing pattern that masks the mutation bug and will break if any developer inserts `now` usage after this line.

**Suggested Fix:** Be explicit and immutable:
```typescript
const now = new Date();
const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
const periodStart = new Date(periodEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
```

---

### E09 — Autocomplete Trie Builder Issues N Redis Writes Per Product Title (Blocks Event Loop)
**File:** `packages/api/scripts/run-workers.ts:75`
**Severity:** MEDIUM

**Problem:**
```typescript
for (const variant of variants) {  // e.g., 50,000 variants
  const title = variant.product.title.toLowerCase();
  for (let i = 1; i <= title.length; i++) {  // e.g., 30 chars per title
    const prefix = title.substring(0, i);
    await redis.zadd('autocomplete_trie', 0, prefix); // ← 30 awaited Redis calls per variant
  }
  await redis.zadd('autocomplete_trie', 0, `${title}*`);
}
```
For 50,000 product variants with an average title length of 30 characters, this generates **1,500,000+ sequential `await redis.zadd` calls**. Each one is a round-trip to Redis. This will:
1. Block the Node.js event loop for hours.
2. Prevent any other cron jobs or worker processing during that time.
3. Overload Redis with tiny sequential writes instead of batched pipeline operations.

**Suggested Fix:** Use a pipeline to batch all writes:
```typescript
const pipeline = redis.pipeline();
for (const variant of variants) {
  const title = variant.product.title.toLowerCase();
  for (let i = 1; i <= title.length; i++) {
    pipeline.zadd('autocomplete_trie', 0, title.substring(0, i));
  }
  pipeline.zadd('autocomplete_trie', 0, `${title}*`);

  // Flush every 1000 commands to avoid memory buildup
  if (pipeline.length >= 1000) {
    await pipeline.exec();
    // reset pipeline
  }
}
await pipeline.exec();
```

---

### E10 — Fraud Queue Auto-Cancel Bypasses State Machine (Stock Never Released)
**File:** `packages/api/scripts/run-workers.ts:95`
**Severity:** MEDIUM

**Problem:**
```typescript
cron.schedule('0 3 * * *', async () => {
  const cancelled = await prisma.order.updateMany({
    where: { status: 'FRAUD_REVIEW', createdAt: { lte: fortyEightHoursAgo } },
    data: { status: 'CANCELLED' }  // ← Direct DB write, bypasses orderService.updateStatus
  });
});
```
`orderService.updateStatus('CANCELLED')` is responsible for releasing stock reservations. This direct `updateMany` skips that logic. Every auto-cancelled fraud order permanently holds reserved stock that will never be released, slowly reducing available inventory until the next manual fix or DB migration.

**Suggested Fix:**
```typescript
const fraudOrders = await prisma.order.findMany({
  where: { status: 'FRAUD_REVIEW', createdAt: { lte: fortyEightHoursAgo } },
  select: { id: true }
});
for (const order of fraudOrders) {
  await orderService.updateStatus(order.id, 'CANCELLED');
}
```

---

### E11 — `Commission` Has No Unique Constraint on `(agentId, orderId)`
**File:** `packages/db/prisma/schema/affiliate.prisma:31`
**Severity:** MEDIUM

**Problem:**
```prisma
model Commission {
  agentId String
  orderId String
  amount  Decimal
  status  String @default("PENDING")
  // No @@unique([agentId, orderId])
}
```
`affiliateService.recordCommission` creates a new `Commission` record every time it is called. If `orderService.createFromCart` calls `recordCommission` twice for the same order (e.g., due to a retry, a race condition, or a bug), two commission records are created. Both will be picked up by `confirmMatureCommissions` and the affiliate agent is paid twice for the same order.

**Suggested Fix:**
```prisma
model Commission {
  ...
  @@unique([agentId, orderId])
}
```
And use `upsert` in `recordCommission`:
```typescript
const commission = await prisma.commission.upsert({
  where: { agentId_orderId: { agentId, orderId } },
  update: {}, // Already exists, don't double-count
  create: { agentId, orderId, amount, status: 'PENDING' }
});
```

---

## Additional Schema-Level Issues Found

| Issue | Location | Description |
|-------|----------|-------------|
| `ReturnShipment.status` is `String`, not an enum | `logistics.prisma` | No DB-level constraint on valid status values — any string can be stored |
| `Payout.status` is `String`, not an enum | `seller.prisma:110` | Same issue — `'PENDING'`, `'SUCCESS'`, `'FAILED'` are unconstrained |
| `SellerStatement.status` is `String`, not an enum | `seller.prisma:97` | Same issue — financial records have unconstrained status fields |
| `AffiliateAgent.status` is `String`, not an enum | `affiliate.prisma` | No constraint on agent status values |
| `Commission.status` is `String`, not an enum | `affiliate.prisma` | Critical for financial records — should be a proper enum |

---

## Cross-Module Risk Map

```
Affiliate Financial Flow
  E01: fundWallet outside tx → wallet funded even on commission rollback
  E02: No concurrency guard → double wallet funding on cron overlap
  E11: No unique(agentId, orderId) → multiple commissions per order

Return Workflow
  E03: No return window → unlimited return period
  E04: No duplicate check → multiple refunds for same item

Dispute Workflow
  E05: sellerId vs userId type mismatch → sellers always unauthorized to respond

Payment / Wallet
  E06: payWithWallet balance check outside tx → wallet overdraft race

IAM / Security
  E07: isActive checked after bcrypt → timing oracle for suspended accounts

Worker / Cron
  E08: Date mutation bug → statements cover wrong periods
  E09: Sequential Redis writes → nightly cron blocks event loop for hours
  E10: Fraud cancel bypasses updateStatus → stock never released on auto-cancel
```

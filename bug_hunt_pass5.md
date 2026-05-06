# Bug Hunt — Pass 5: Server, Rust Client, Payment Adapters, Advertising, Admin
**Date:** 2026-05-05

---

## Summary Table

| ID | Area | File | Severity | Category | Description |
|----|------|------|----------|----------|-------------|
| F01 | Server | `index.ts:54` | CRITICAL | Security | Hardcoded JWT fallback secret is committed to source — anyone with repo access can forge JWTs |
| F02 | Payment Adapters | `flutterwave.adapter.ts:58` | CRITICAL | Security | Flutterwave webhook verification is plain string equality, not HMAC — trivially forgeable |
| F03 | Advertising Router | `advertising/router/index.ts:9` | CRITICAL | Runtime | `ctx.session.user.sellerProfile!.id` — `sellerProfile` is not on the session type; crashes every ad campaign call |
| F04 | Rust Client | `rust-client.ts` | HIGH | Security | No authentication headers sent to Rust services — any internal network process can call fraud/search/recommendations |
| F05 | Rust Client | `rust-client.ts` | HIGH | Reliability | No timeout on Rust service `fetch` calls — a hung Rust service blocks Node.js handlers indefinitely |
| F06 | Payment Adapters | `flutterwave.adapter.ts:100` | HIGH | Logic | Flutterwave payout maps `recipientCode` → `account_bank` and `reference` → `account_number` — fields are wrong, all FLW payouts route incorrectly |
| F07 | Advertising Router | `advertising/router/index.ts:23` | HIGH | Security | `addAdGroup` has no ownership check — any seller can inject ad groups into another seller's campaign |
| F08 | Advertising | `advertising/router/index.ts:32` | HIGH | Security | `recordClick` and `recordImpression` are `publicProcedure` with no rate limiting — click fraud trivially possible |
| F09 | Admin Service | `admin-service.ts:46` | HIGH | Logic | `reviewDocument` checks `d.type === 'BANK'` but documents are stored as `'BANK_STATEMENT'` — auto-activation never triggers |
| F10 | Admin Service | `admin-service.ts:82` | HIGH | Logic | `manualRefund` calls `fundWallet` inside transaction without passing `tx` — wallet credit not rolled back on failure |
| F11 | Server | `index.ts:78` | MEDIUM | Security | Swagger `/docs` is exposed unconditionally in production — full API schema is publicly enumerable |
| F12 | Payment Adapter | `paystack.adapter.ts:71` | MEDIUM | Logic | `initializeTransaction` returns `providerRef: data.data.reference` (Paystack-assigned) but the Payment record stores the locally generated `reference` — webhook lookup may fail |

---

## Detailed Findings

---

### F01 — Hardcoded JWT Secret Committed to Source Code
**File:** `apps/api-server/src/index.ts:54`
**Severity:** CRITICAL

**Problem:**
```typescript
if (!jwtSecret || jwtSecret.includes('placeholder')) {
  process.env.JWT_SECRET = 'a8f3b6cb6433cc2576dbc72aec9cd166fc370dc995e1795c0a63c5e2b5d449aa';
  // ← Hardcoded, committed secret
}
```
This fallback is applied whenever `JWT_SECRET` is missing or contains `'placeholder'`. In any environment where the env var is not explicitly set — including staging, CI/CD pipelines, and Docker containers without proper secrets injection — this hardcoded value is used as the signing key. Since it is committed to the repository:
- Any developer, contractor, or attacker with read access to the repo can forge arbitrary JWTs.
- They can sign tokens with any `sub` (user ID) and `role` (`ADMIN`) and gain full administrative access.
- There is no expiry or rotation mechanism for this hardcoded value.

**Suggested Fix:**
Remove the hardcoded fallback entirely. Fail startup if `JWT_SECRET` is not set:
```typescript
const jwtSecret = process.env.JWT_SECRET || process.env.AUTH_SECRET;
if (!jwtSecret || jwtSecret.includes('placeholder')) {
  server.log.error('FATAL: JWT_SECRET must be set to a secure random value.');
  process.exit(1);
}
process.env.JWT_SECRET = jwtSecret;
```

---

### F02 — Flutterwave Webhook Verification Is Plain String Equality (Not HMAC)
**File:** `packages/api/modules/payment/adapters/flutterwave.adapter.ts:58`
**Severity:** CRITICAL

**Problem:**
```typescript
verifyWebhookSignature(rawBody: string, signature: string): boolean {
  return signature === FLW_WEBHOOK_SECRET; // ← Direct comparison, not HMAC
}
```
Flutterwave sends a `verif-hash` header that is set to a static secret you configure in the Flutterwave dashboard. This implementation correctly compares against that static value — but this is NOT cryptographic verification. Unlike Paystack's HMAC-SHA512 over the request body, this approach:
1. Does not bind the signature to the request body — the body can be tampered with while the header remains valid.
2. If `FLW_WEBHOOK_SECRET` is exposed (logs, error messages, git history), an attacker can forge any payment confirmation webhook.
3. The `rawBody` parameter is accepted but completely ignored.

**Suggested Fix:** Flutterwave does support HMAC verification via its `verif-hash` mechanism (comparing against a shared secret), but the body should additionally be independently verified via Flutterwave's `/transactions/{id}/verify` API endpoint before processing any payment confirmation:
```typescript
async verifyWebhookPayment(transactionId: string): Promise<boolean> {
  const res = await fetch(`${FLW_BASE}/transactions/${transactionId}/verify`, { headers: headers() });
  const data = await res.json();
  return data.status === 'success' && data.data.status === 'successful';
}
```

---

### F03 — Advertising Router Crashes on Every Call (`sellerProfile` Not in Session)
**File:** `packages/api/modules/advertising/router/index.ts:9`
**Severity:** CRITICAL

**Problem:**
```typescript
createCampaign: sellerProcedure
  .mutation(async ({ ctx, input }) => {
    return advertisingService.createCampaign(
      ctx.session.user.sellerProfile!.id,  // ← Runtime crash
      ...
    );
  }),
```
The `TRPCContext.session.user` type is `{ id, email, role, firstName, lastName }` — defined in `context.ts`. There is no `sellerProfile` field on the session user. The non-null assertion `!` suppresses the TypeScript error, but at runtime `ctx.session.user.sellerProfile` is `undefined`. Accessing `.id` on `undefined` throws `TypeError: Cannot read properties of undefined`. The same pattern appears in `getCampaigns` and `updateStatus`.

**Suggested Fix:** Look up the seller profile from the session user ID:
```typescript
createCampaign: sellerProcedure
  .mutation(async ({ ctx, input }) => {
    const seller = await prisma.seller.findUnique({ where: { userId: ctx.session.user.id } });
    if (!seller) throw new TRPCError({ code: 'NOT_FOUND', message: 'Seller profile not found' });
    return advertisingService.createCampaign(seller.id, input.name, input.budget, input.startDate, input.endDate);
  }),
```

---

### F04 — Rust Services Receive No Authentication (Internal API Open to Network)
**File:** `packages/api/rust-client.ts`
**Severity:** HIGH

**Problem:**
```typescript
private static async request<T>(baseUrl: string, path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,  // ← No auth header
    },
  });
}
```
All calls to `SEARCH`, `FRAUD`, `RECOMMENDATIONS`, `INVENTORY`, and `IMAGE_PROCESSOR` services carry no authentication. On a multi-tenant VPS or container network, any process that can reach `localhost:3001-3006` can:
- Query the fraud service to probe its rules (`/check` with arbitrary parameters).
- Upsert arbitrary documents into the search index (`/upsert`).
- Trigger recommendation model training with arbitrary user IDs.

**Suggested Fix:** Add an internal shared secret to all inter-service calls:
```typescript
headers: {
  'Content-Type': 'application/json',
  'X-Internal-Token': process.env.INTERNAL_API_TOKEN || '',
  ...options.headers,
},
```
Each Rust service should validate this header and reject requests without it.

---

### F05 — No Timeout on Rust Service `fetch` Calls
**File:** `packages/api/rust-client.ts`
**Severity:** HIGH

**Problem:**
```typescript
const response = await fetch(url, { ...options, headers: { ... } });
```
`fetch` in Node.js has no default timeout. If any Rust service hangs (e.g., the fraud service is overwhelmed), every incoming payment initialization request hangs at `RustClient.fraud.check(...)`. With Fastify's default connection pool, a surge of concurrent requests to a hung Rust service will exhaust all available workers, bringing down the entire API server.

**Suggested Fix:**
```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 5000); // 5s hard timeout

try {
  const response = await fetch(url, { ...options, signal: controller.signal, headers: { ... } });
  // ...
} finally {
  clearTimeout(timeout);
}
```

---

### F06 — Flutterwave Payout Maps Wrong Fields (All Payouts Go to Wrong Account)
**File:** `packages/api/modules/payment/adapters/flutterwave.adapter.ts:100`
**Severity:** HIGH

**Problem:**
```typescript
async initiatePayout(params: PayoutParams): Promise<PayoutResult> {
  body: JSON.stringify({
    account_bank: params.recipientCode,  // ← recipientCode is a Paystack transfer recipient code, NOT a bank code
    account_number: params.reference,    // ← reference is a payout reference string, NOT a bank account number
    amount: params.amountInSubunit / 100,
    ...
  }),
}
```
`PayoutParams.recipientCode` is populated from `Seller.transferRecipientCode` which is a Paystack-specific code (e.g., `RCP_abc123xyz`). Flutterwave's `account_bank` expects a numeric bank code (e.g., `044` for Access Bank). `PayoutParams.reference` is a job/payout reference ID, not an account number. Every Flutterwave payout will either fail immediately or route funds to an incorrect (non-existent) account.

**Suggested Fix:** The `Seller` schema needs separate Flutterwave-specific fields, or the `PayoutParams` must carry provider-specific payloads. Separate the bank code and account number:
```typescript
// Seller schema needs: flwBankCode, flwAccountNumber
body: JSON.stringify({
  account_bank: params.bankCode,      // e.g., "044"
  account_number: params.accountNumber, // e.g., "0123456789"
  amount: params.amountInSubunit / 100,
  currency: 'NGN',
  narration: params.reason,
  reference: params.reference,
}),
```

---

### F07 — `addAdGroup` Has No Campaign Ownership Check (Any Seller Can Hijack Campaigns)
**File:** `packages/api/modules/advertising/router/index.ts:23`
**Severity:** HIGH

**Problem:**
```typescript
addAdGroup: sellerProcedure
  .input(AddAdGroupSchema)
  .mutation(async ({ input }) => {  // ← ctx not used
    return advertisingService.addAdGroup(
      input.campaignId,  // ← Any campaign ID accepted
      input.productId,
      input.bid,
      input.keywords
    );
  }),
```
Any authenticated seller can pass any `campaignId` — including campaigns belonging to other sellers — and add ad groups to them. This allows:
- Inflating a competitor's campaign budget by adding high-bid ad groups.
- Associating a competitor's product with a fraudulent campaign.

**Suggested Fix:**
```typescript
.mutation(async ({ ctx, input }) => {
  const seller = await prisma.seller.findUnique({ where: { userId: ctx.session.user.id } });
  if (!seller) throw new TRPCError({ code: 'FORBIDDEN' });

  const campaign = await prisma.adCampaign.findUnique({ where: { id: input.campaignId } });
  if (!campaign || campaign.sellerId !== seller.id) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Campaign does not belong to this seller' });
  }

  return advertisingService.addAdGroup(input.campaignId, input.productId, input.bid, input.keywords);
}),
```

---

### F08 — `recordClick`/`recordImpression` Are Public with No Rate Limiting (Click Fraud)
**File:** `packages/api/modules/advertising/router/index.ts:32`
**Severity:** HIGH

**Problem:**
```typescript
recordImpression: publicProcedure  // ← No auth, no rate limit
  .input(RecordActionSchema)
  .mutation(async ({ ctx, input }) => {
    return advertisingService.recordImpression(input.adGroupId, userId);
  }),

recordClick: publicProcedure  // ← No auth, no rate limit
  .mutation(async ({ ctx, input }) => {
    return advertisingService.recordClick(input.adGroupId, userId);
  }),
```
These endpoints charge the seller's ledger on every click (`AD_SPEND` entry). Any unauthenticated bot can call `recordClick` in a loop with a competitor's `adGroupId` and drain their advertising budget to zero. Since they use `publicProcedure` (not `rateLimitProcedure`), not even the 5-request/minute IP rate limit applies.

**Suggested Fix:**
- Use `rateLimitProcedure` (or a tighter limit) for both endpoints.
- Add a deduplication check: one click per session/IP per ad group per time window using Redis:
```typescript
const dedupeKey = `ad:click:${adGroupId}:${userId ?? ip}`;
const already = await redis.set(dedupeKey, '1', 'EX', 3600, 'NX');
if (!already) return null; // Already clicked in the last hour
```

---

### F09 — Auto-Activation Checks for `'BANK'` but Documents Are Stored as `'BANK_STATEMENT'`
**File:** `packages/api/modules/admin/services/admin-service.ts:46`
**Severity:** HIGH

**Problem:**
```typescript
const hasApprovedBank = mappedDocs.some(d => d.type === 'BANK' && d.status === 'APPROVED');

if (hasApprovedNIN && hasApprovedBank) {
  await prisma.seller.update({ data: { status: 'ACTIVE' } });
}
```
`sellerService.uploadDocument` comment states valid types are `"NIN" | "CAC" | "BANK_STATEMENT" | "UTILITY_BILL"`. When a bank document is uploaded it is stored with `type: 'BANK_STATEMENT'`. The auto-activation check looks for `type === 'BANK'` which will never match any stored document. The auto-activation feature is entirely inoperative — sellers are never auto-activated, they must wait for manual `approveSellerKYC`.

**Suggested Fix:**
```typescript
const hasApprovedBank = mappedDocs.some(
  d => (d.type === 'BANK_STATEMENT' || d.type === 'BANK') && d.status === 'APPROVED'
);
```

---

### F10 — `manualRefund` Calls `fundWallet` Without `tx` (Refund Not Atomic)
**File:** `packages/api/modules/admin/services/admin-service.ts:82`
**Severity:** HIGH

**Problem:**
```typescript
async manualRefund(adminId: string, orderId: string, amount: number, reason: string) {
  return prisma.$transaction(async (tx) => {
    await paymentService.fundWallet(order.userId, amount); // ← No tx passed
    await tx.eventLog.create({ ... });
    // ...
  });
}
```
Same root cause as B01/D04/E01. `fundWallet` uses the global `prisma` client, not `tx`. If `tx.eventLog.create` fails, the transaction rolls back the event log but the wallet has already been credited. The buyer receives a manual refund that is never recorded in the audit log.

**Suggested Fix:** Pass `tx` to `fundWallet` (same pattern as the other fixes).

---

### F11 — Swagger `/docs` Exposed Unconditionally in Production
**File:** `apps/api-server/src/index.ts:78`
**Severity:** MEDIUM

**Problem:**
```typescript
await server.register(swaggerUi, {
  routePrefix: '/docs',  // ← No NODE_ENV guard
  ...
});
```
The full interactive OpenAPI documentation is publicly accessible at `/docs` in every environment including production. This exposes:
- All tRPC endpoint paths, input schemas, and response types.
- Enum values for order statuses, user roles, and other sensitive domain objects.
- A complete attack surface map for the API.

**Suggested Fix:**
```typescript
if (process.env.NODE_ENV !== 'production') {
  await server.register(swaggerUi, { routePrefix: '/docs', ... });
}
```

---

### F12 — Paystack Adapter Reference Mismatch Between Init and Webhook Lookup
**File:** `packages/api/modules/payment/adapters/paystack.adapter.ts:71`
**Severity:** MEDIUM

**Problem:**
```typescript
async initializeTransaction(params: InitParams): Promise<InitResult> {
  const reference = `ORD-${params.orderId}-${Date.now()}`; // ← Local reference

  // ... send to Paystack with this reference ...

  return {
    authorizationUrl: data.data.authorization_url,
    reference,           // ← Local reference returned
    providerRef: data.data.reference,  // ← Paystack's own reference (may differ)
  };
}
```
The `initializeTransaction` call:
1. Generates a local reference: `ORD-abc-1234567890`
2. Sends it to Paystack.
3. Returns `reference = 'ORD-abc-...'` AND `providerRef = data.data.reference` (Paystack's reference).

In `payment-service.ts`, the Payment record is stored with `providerRef: initResult.providerRef` (the Paystack reference). However the Paystack webhook `charge.success` event sends back the reference that **we** passed to Paystack (the local `ORD-...` reference). So `handleWebhook` does `findFirst({ where: { providerRef: reference } })` looking for the local reference — but the DB stores Paystack's reference. The lookup will fail and the webhook will be ignored.

**Suggested Fix:** Store the locally generated reference consistently:
```typescript
return {
  authorizationUrl: data.data.authorization_url,
  reference,
  providerRef: reference,  // ← Use the reference WE sent, which is what webhook returns
};
```

---

## Consolidated Final Risk Map

```
Server Entry (index.ts)
  F01: Hardcoded JWT secret in source → full admin access forgery
  F11: Swagger docs exposed in prod → full API enumeration

Rust Infrastructure
  F04: No auth on internal services → fraud/search manipulation
  F05: No timeout on Rust calls → hung service kills Node.js

Payment Adapters
  F02: Flutterwave webhook = plain string, not HMAC → forgeable payment confirmations
  F06: Flutterwave payout maps wrong fields → all FLW payouts fail or go to wrong account
  F12: Paystack providerRef mismatch → webhooks ignored, orders never confirmed

Advertising Module
  F03: sellerProfile not in session type → all campaign operations crash with TypeError
  F07: No campaign ownership check → any seller can modify competitor campaigns
  F08: recordClick is public, no rate limit → trivial click fraud budget drain

Admin Service
  F09: BANK vs BANK_STATEMENT type mismatch → seller auto-activation never fires
  F10: manualRefund fundWallet outside tx → non-atomic refund, audit log not guaranteed
```

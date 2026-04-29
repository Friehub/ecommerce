# Contributing Guide

This document defines the rules every developer on the team must follow.
No exceptions. If a rule is unclear, ask before writing code.

---

## 1. Scope Rule (Read This First)

Before writing a single line of code, check `SCOPE.md`.

If the feature is not in `SCOPE.md` under "In Scope", **do not build it**.
Write it in `BACKLOG.md` and move on.

The contest is won by delivering what is planned, not by adding extras.

---

## 2. Branch Naming

```
feature/<module>/<short-description>
fix/<module>/<short-description>
chore/<short-description>

Examples:
  feature/orders/state-machine
  feature/payments/paystack-webhook
  fix/inventory/reservation-expiry
  chore/prisma-schema-seed
```

- One module per branch.
- Never mix work from two different modules in one branch.
- Branch off `main`. Never branch off another feature branch.

---

## 3. Commit Convention

Format: `<type>(<module>): <short description>`

| Type | When to use |
|---|---|
| `feat` | New functionality |
| `fix` | Bug fix |
| `chore` | Dependency, config, tooling |
| `refactor` | Code change with no behavior change |
| `test` | Adding or fixing tests |
| `docs` | Documentation only |

```
feat(orders): implement order state machine transitions
fix(inventory): release reservation on payment timeout
chore(prisma): add FlashSale and Coupon tables
docs(api): add dispute router procedure descriptions
```

---

## 4. PR Rules

Before opening a PR:

- [ ] `pnpm typecheck` passes (no TypeScript errors)
- [ ] `pnpm lint` passes (no ESLint errors)
- [ ] `cargo check` passes on any Rust crates touched
- [ ] The module's happy path works end-to-end (not just the unit test)
- [ ] No console.log left in the code
- [ ] No commented-out code blocks
- [ ] No TODO comments without a linked issue

PR title follows the same format as commits: `feat(orders): implement order state machine`

PR description must answer:
1. What does this PR do?
2. What module(s) does it touch?
3. What events does it fire or listen to?
4. How was it tested?

---

## 5. Module Rules (Non-Negotiable)

These rules are defined in `ARCHITECTURE.md`. They apply to every module, always.

```
RULE 1: Never import from another module's internal files.
        ✅  import { createOrder } from '@/modules/orders'
        ❌  import { _insertOrder } from '@/modules/orders/repository/order.repository'

RULE 2: Cross-module communication via the event bus only.
        Never call another module's function directly for side effects.

RULE 3: Zero business logic in route handlers or Server Actions.
        They call module functions. That is all.

RULE 4: Every module's public surface is defined in its index.ts.
        If it is not in index.ts, it does not exist to other modules.

RULE 5: A module owns its Prisma tables. It never queries another module's tables.
        If you need data from another module, call its public API.
```

---

## 6. TypeScript Standards

```typescript
// Types: always explicit, never `any`
function createOrder(input: CreateOrderInput): Promise<Order> { ... }

// Error handling: never swallow errors silently
try {
  await processPayment(orderId)
} catch (error) {
  logger.error({ event: 'payment.process.failed', orderId, error })
  throw error  // re-throw — let the caller handle it
}

// Money: always use integer pence/kobo, never float
// ₦1500 is stored as 150000 (kobo)
const commission = Math.round(orderTotal * commissionRate)  // integer arithmetic

// Logging: structured, no PII
logger.info({ event: 'order.created', orderId, sellerId, itemCount })
// NOT: logger.info(`Order created for ${user.email}`)
```

---

## 7. Rust Standards

```rust
// All money uses rust_decimal — never f64
use rust_decimal::Decimal;
use rust_decimal_macros::dec;
let commission = order_total * dec!(0.07);

// All domain IDs use define_id_type! macro
define_id_type!(OrderId, "Unique order identifier");
// Never: fn get_order(id: String) — always: fn get_order(id: OrderId)

// Errors: thiserror enum, never panic in request path
// Logs: tracing macros only — no println!
tracing::info!(order_id = %id, "Order processed");

// Every handler returns Result<Json<T>, StatusCode>
// Never unwrap() in a request handler
```

---

## 8. Database Rules

- Never edit an existing migration file. Always create a new one.
- Every new table needs at least: `id`, `created_at`, `updated_at`.
- Foreign keys must have explicit `onDelete` behavior defined.
- Run `prisma migrate dev` locally before pushing schema changes.
- Seed data lives in `packages/db/seed.ts`. Keep it deterministic.

---

## 9. What to Do When Blocked

1. Check the relevant doc in `/docs/` — the answer is usually there.
2. Check `ARCHITECTURE.md` for structural questions.
3. Ask in the team channel with: what you tried, what error you got, what you expected.
4. Do not sit on a blocker for more than 2 hours without asking.

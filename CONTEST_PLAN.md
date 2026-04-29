# Contest Build Plan — 2 Weeks

## The Core Constraint

14 days. One deployable, demonstrable platform that covers every major surface:
buyer marketplace, seller hub, delivery agent, admin portal, and the revenue engines.

The full production architecture (Rust services, mobile apps, ML) is documented and designed.
For the contest, we deliver the TypeScript foundation. The architecture ensures nothing needs to be
rewritten when production services are added later.

---

## The Stubbing Strategy

Every Rust service is replaced by a TypeScript stub that sits behind the **same public interface**.
The TS adapter module calls `http://localhost:{port}/...` in production.
For the contest, the adapter calls a local function instead.

```typescript
// The adapter interface never changes.
// What changes is the implementation behind it.

// Contest (TypeScript stub):
export async function searchProducts(query: SearchQuery): Promise<SearchResult[]> {
  return db.productVariant.findMany({
    where: { product: { title: { contains: query.q, mode: 'insensitive' } } },
    take: 20,
  })
}

// Production (Rust HTTP call — drop-in replacement):
export async function searchProducts(query: SearchQuery): Promise<SearchResult[]> {
  const res = await fetch(`${RUST_SEARCH_URL}/search?q=${query.q}`)
  return res.json()
}
```

| Rust Service | Contest Stub |
|---|---|
| Search (Tantivy) | PostgreSQL ILIKE query |
| Ad Auction (gRPC) | Highest bid wins — simple SQL sort |
| Inventory Reservation | Redis DECR in TypeScript |
| Fraud Detection | Rule-based score (velocity + account age) in TypeScript |
| Recommendations | Top sellers in buyer's most-visited category |
| Image Processing | `sharp` (Node.js) for resize — sufficient at contest scale |

Mobile app and ML recommendations are deferred entirely.

---

## Day-by-Day Build Schedule

### Week 1 — Foundation & Core Commerce

**Day 1 — Monorepo Scaffold & Schema**
- [ ] Initialize pnpm workspace with `apps/web`, `packages/api`, `packages/types`, `packages/db`
- [ ] Write complete Prisma schema (all tables per `docs/01-DATABASE_SCHEMA.md`)
- [ ] Run initial migration, create seed script with demo data
- [ ] Configure Next.js 15, tRPC, NextAuth.js v5
- [ ] Set up Redis (Upstash), BullMQ, Cloudflare R2 clients in `infra/`
- [ ] Set up shared event bus in `shared/events/`

**Day 2 — IAM Module**
- [ ] User registration (buyer, seller self-registration)
- [ ] Login / logout (email + password, Google OAuth)
- [ ] JWT session via NextAuth.js v5
- [ ] Role middleware: `protectedProcedure`, `sellerProcedure`, `adminProcedure`, `agentProcedure`
- [ ] User profile + address management
- [ ] Seller onboarding flow (KYC document upload → pending approval)

**Day 3 — Catalog & Media Modules**
- [ ] Category tree (seeded with real Jumia category hierarchy)
- [ ] Brand registry
- [ ] Product + ProductVariant CRUD (seller creates listings)
- [ ] ProductMedia: upload to R2 → call image stub (sharp resize → 4 variants → store URLs)
- [ ] Buyer-facing product listing page (SSR, category filters)
- [ ] Product detail page (variants, images, seller info)

**Day 4 — Inventory Module**
- [ ] StockLevel seeding per variant
- [ ] Redis-backed reservation (TypeScript stub for Rust service)
- [ ] `reserveStock`, `releaseStock`, `confirmStock` public API
- [ ] Admin stock management view

**Day 5 — Cart & Promotions Modules**
- [ ] Cart: add / update / remove items, persist to DB (guest + logged-in)
- [ ] Price snapshot on add-to-cart (locks price at time of add)
- [ ] Promotions: coupon code validation, percentage/fixed discounts
- [ ] Flash sale: time-bound price override + stock cap
- [ ] Cart page with real-time stock validation

**Day 6 — Orders Module (OMS)**
- [ ] Convert cart → Order + OrderPackages (grouped by seller)
- [ ] Order state machine (all transitions per `docs/05-STATE_MACHINES.md`)
- [ ] Order event firing (`order.created`, `order.cancelled`, `order.completed`)
- [ ] Order detail page (buyer)
- [ ] Order queue page (seller)
- [ ] SLA enforcement (BullMQ scheduled jobs for auto-cancel on timeout)

**Day 7 — Payments Module**
- [ ] Paystack card payment: initialize → redirect → webhook verify
- [ ] Pay on Delivery flow
- [ ] JumiaPay wallet: fund via Paystack, deduct at checkout
- [ ] Escrow model: funds held on `payment.confirmed`, released on `order.completed`
- [ ] Refund initiation (on return QC pass)
- [ ] Webhook handler (`/api/webhooks/paystack`) with HMAC signature verification

---

### Week 2 — Seller, Ops, Revenue & Polish

**Day 8 — Seller Hub Module**
- [ ] Seller dashboard (sales overview, pending orders, low stock alerts)
- [ ] Product management (create, edit, deactivate listings)
- [ ] Order management (confirm, mark shipped + tracking number)
- [ ] Performance score display (rating, on-time rate, cancellation rate)
- [ ] Seller admin: approve/reject KYC (admin view)

**Day 9 — Logistics Module**
- [ ] Shipment creation on order PROCESSING
- [ ] Agent assignment (admin assigns agent to shipment)
- [ ] Agent web view: today's deliveries
- [ ] Status transitions: PICKED_UP → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED
- [ ] Proof of delivery: photo upload to R2
- [ ] Failed delivery reporting + re-attempt scheduling
- [ ] Pickup station data seeded
- [ ] Return shipment flow (schedule pickup → QC → trigger refund)

**Day 10 — Advertising & Affiliate Modules**
- [ ] Ad campaign creation (seller creates SPONSORED_PRODUCT campaign, sets keywords + bids)
- [ ] Auction stub: at search time, sort active bids by `bid × quality_score`, inject top 2 as sponsored
- [ ] Impression + click tracking (async, BullMQ)
- [ ] Ad spend deducted from seller ledger on click
- [ ] Campaign budget enforcement (pause when exhausted)
- [ ] Affiliate agent registration
- [ ] Referral link generation (per product / category / homepage)
- [ ] Click attribution (session-based, 30-day cookie window)
- [ ] Commission on confirmed order (7-day hold, then confirm)

**Day 11 — Seller Finance & Disputes Modules**
- [ ] Ledger entry creation on each relevant event (SALE, COMMISSION, AD_SPEND, PENALTY, REFUND)
- [ ] Weekly statement generation (BullMQ cron, every Monday 00:00)
- [ ] Payout trigger via Paystack Transfer API
- [ ] Seller statement page (itemized view)
- [ ] Dispute opening (buyer selects order line + reason + evidence upload)
- [ ] Seller response (72h window, auto-escalate on timeout)
- [ ] Moderator ruling UI (admin portal: view evidence, issue BUYER/SELLER/SPLIT ruling)
- [ ] Post-ruling actions (refund trigger or fund release)

**Day 12 — Notifications & Reviews Modules**
- [ ] Event → notification mapping (per `docs/08-NOTIFICATION_TEMPLATES.md`)
- [ ] Email delivery via Resend (React Email templates for key events)
- [ ] In-app notification inbox (stored in DB, polled on page load)
- [ ] Push notifications: deferred (no mobile app)
- [ ] Review creation (only on COMPLETED orders, one review per order line)
- [ ] Verified purchase badge
- [ ] Product rating aggregation (recalculate on each new review)
- [ ] Review display on product detail page

**Day 13 — Admin Portal & Search Stub**
- [ ] Admin dashboard: GMV, active orders, active sellers, open disputes (metrics)
- [ ] Seller management: list, approve, suspend
- [ ] Fraud queue: flagged orders (rule-based stub), allow/block action
- [ ] Dispute queue: open disputes assigned to moderator
- [ ] Manual refund override
- [ ] CMS: banner management (homepage hero, category headers)
- [ ] Search module: PostgreSQL FTS with category + price + brand filters
- [ ] Recommendation stub: top sellers in buyer's most-browsed categories

**Day 14 — Polish, Seed & Deploy**
- [ ] Full demo data seed (20 sellers, 200 products, 50 completed orders, reviews, disputes)
- [ ] End-to-end smoke test: register → browse → checkout → pay → seller ships → delivered
- [ ] UI polish pass (typography, spacing, hover states, loading skeletons)
- [ ] Deploy to Vercel (web) + Railway (PostgreSQL + Redis)
- [ ] Health checks passing
- [ ] Demo walkthrough script prepared

---

## What Is Delivered

| Surface | Delivered |
|---|---|
| Buyer marketplace | Full — browse, search, cart, checkout, order tracking, reviews, wallet |
| Seller Hub | Full — listings, orders, shipments, finance statements, ad campaigns |
| Delivery Agent (web) | Full — delivery queue, status updates, proof of delivery |
| Admin Portal | Full — seller KYC, disputes, fraud queue, CMS, metrics |
| JumiaPay Wallet | Full — fund, spend, refund |
| Paystack Card | Full — with webhook verification and escrow |
| Dispute Resolution | Full — buyer/seller messaging, evidence, moderator ruling |
| Affiliate (JForce) | Full — referral links, click attribution, commission |
| Advertising | Functional stub — campaigns, impression/click tracking, spend deduction |
| Notifications | Email + in-app inbox |

## What Is Deferred (Post-Contest)

| Item | Why Deferred |
|---|---|
| React Native mobile apps | Separate project — 5–7 days minimum |
| Rust Search (Tantivy) | PostgreSQL stub delivers acceptable demo quality |
| Rust Ad Auction (gRPC) | SQL-based stub is functionally correct |
| Rust Inventory Service | Redis TS stub handles the flash sale scenario |
| Rust Fraud Detection | Rule-based TS scorer is sufficient |
| ML Recommendations | Rule-based top-sellers stub is sufficient |
| Image Processor (Rust) | `sharp` in Node.js handles contest load |
| OpenTelemetry full setup | Health checks only for contest |

---

## Risk Register

| Risk | Probability | Mitigation |
|---|---|---|
| Paystack webhook integration takes longer than expected | Medium | Test webhook locally with ngrok from Day 7 morning |
| Prisma migration conflicts during development | Medium | One migration per module, never edit old migrations |
| Monorepo tRPC type resolution breaks | Low | Resolve on Day 1 before any module work begins |
| Day 14 deploy failures | Medium | Deploy to Vercel on Day 12 and keep it live from that point |
| Scope creep (adding features not in this plan) | High | This document is the scope. Nothing else is built. |

---

## Definition of Done (Per Module)

A module is done when:
1. Its Prisma tables are migrated and seeded.
2. Its `index.ts` exports its public API.
3. Its events are firing and at least one listener is registered.
4. Its tRPC procedures are defined and callable.
5. Its primary UI page renders real data.
6. An end-to-end test (manual or automated) validates the happy path.

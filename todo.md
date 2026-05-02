# Jumia Clone — Platform TODO

> Last audited: 2026-05-02
> Legend: `[BUG]` schema/logic defect | `[STUB]` partial implementation | `[MISSING]` zero code | `[POLISH]` non-blocking improvement

---

## P0 — Blocking Bugs (Fix Before Any Demo)

These break core user flows if left unresolved.

- [x] **[BUG] `return-service.ts`** — `approveReturn` does not update the `OrderLine` to reflect the returned state. After a refund is triggered, the line has no `returned` flag. Add a status field or a separate `returnedAt` timestamp to `OrderLine` and set it on approval.
- [x] **[BUG] `review-service.ts` — `moderateReview`** — The function calls `prisma.review.findUnique` and returns without applying the `status` update. Replace `findUnique` with `prisma.review.update` so the moderation decision is actually persisted.
- [x] **[BUG] `review-service.ts` — Rating aggregation scope** — Current aggregate queries the seller-level average across all products. Product-level `averageRating` is never updated on the `Product` record itself. Add a `prisma.product.update` call after review creation to set the per-product average.
- [x] **[BUG] `revenue-service.ts` — `approvePayout` — wrong recipient field** — The Paystack Transfer API call passes `payout.id` as `recipient`. It must pass `payout.seller.transferRecipientCode`. Ensure that field is loaded in the include and passed correctly.
- [x] **[BUG] `admin-service.ts` — `resolveDispute` — status enum mismatch** — The dispute status is set to `'RESOLVED'` or `'REJECTED'`. The Prisma schema enum uses `RESOLVED` and `ESCALATED` — there is no `REJECTED` variant. Align the service call with the actual schema enum values.
- [x] **[BUG] `order-worker.ts` — `handleEscrowRelease` double-records ledger entries** — `ledgerService.recordSale` is called per line on `escrow-release`, but `recordSale` was already called when the order transitioned to `PAID`. This results in duplicate `SALE` ledger entries. The escrow-release job should only call `ledgerService.scheduleEscrowRelease` and `releaseMatureEscrow`, not `recordSale` again.
- [x] **[BUG] `media-service.ts` — `processAndUpload` sets wrong `ContentType`** — The S3 `PutObjectCommand` sets `ContentType` based on `extension` but all output files are converted to WebP. Hardcode `ContentType: 'image/webp'` for all upload variants.

---

## P1 — Settlement & Finance Integrity

- [x] **[STUB] `revenue-service.ts` — simulated payout fallback** — The `SIM-XXXXXX` bank reference is generated for any environment where `PAYSTACK_SECRET_KEY` equals `sk_test_placeholder`. This will ship to staging if `.env` is not set correctly. Add a hard assertion that refuses to run `approvePayout` without a real key outside of `NODE_ENV=test`.
- [x] **[STUB] `ledger-service.ts` — `withdrawFunds` empty `statementId`** — Old callers may still pass an empty string `''`. The current code does `statementId: statementId || undefined` which coerces `''` to `undefined` — this is correct now, but there is no explicit null path. Add a unit test that asserts `statementId: null` is stored when no statement is supplied.
- [x] **[MISSING] `run-workers.ts` — fraud review queue processor** — There is no cron or worker that processes orders flagged as `FRAUD_REVIEW` by the Rust fraud service. Add a daily BullMQ job that fetches `Order` records where `status = 'FRAUD_REVIEW'`, surfaces them to the admin queue, and auto-cancels those older than 48 hours.
- [x] **[MISSING] Affiliate commission confirmation job** — `affiliateService.recordCommission` creates commissions with `status: 'PENDING'`. There is no scheduled job to confirm commissions after the 7-day return window passes. Add a daily cron that calls `affiliateService.confirmCommission` for all pending commissions where the parent order is `COMPLETED` and `createdAt` is older than 7 days.
- [x] **[STUB] `run-workers.ts` — search sync uses `catalogService.syncToSearch`** — The `catalogService.syncToSearch` function needs to be verified: confirm it actually calls the Rust search service HTTP endpoint at `RUST_SEARCH_URL` rather than a no-op. If the Rust service is unavailable the cron should log a warning and not crash.

---

## P2 — Missing Web UI Routes

The backend modules exist but there are no corresponding frontend pages.

- [x] **[MISSING] Notifications inbox page** — Create `apps/web/src/app/(buyer)/notifications/page.tsx`. Display unread notifications from `notification.getUnreadNotifications`, with a mark-all-as-read button. Show a notification badge count in `Navbar.tsx` based on the unread count.
- [x] **[MISSING] Dispute center — seller view** — There is a buyer dispute page at `(buyer)/disputes/` but no equivalent under `(seller)/seller/disputes/`. Sellers need to see open disputes against their packages and submit responses. Create `apps/web/src/app/(seller)/seller/disputes/page.tsx` and `[id]/page.tsx`.
- [x] **[MISSING] Affiliate portal** — `apps/web/src/app/affiliate/page.tsx` exists but is a placeholder. Implement the full portal: agent registration, referral link list with copy-to-clipboard, click counts, pending vs. confirmed commission table, and total earnings.
- [x] **[MISSING] Admin — seller management list** — `(admin)/dashboard/page.tsx` shows metrics. There is no page for listing sellers, filtering by KYC status, or taking suspension actions. Create `apps/web/src/app/(admin)/sellers/page.tsx`.
- [x] **[MISSING] Admin — fraud queue** — No admin page to view and act on fraud-flagged orders. Create `apps/web/src/app/(admin)/fraud/page.tsx` with allow/block actions wired to the admin router.
- [x] **[MISSING] Admin — payout approvals** — Sellers request payouts but there is no admin UI to approve or reject them. Create `apps/web/src/app/(admin)/payouts/page.tsx`.
- [x] **[MISSING] Order tracking page (buyer)** — There is a checkout success page but no dedicated order detail/tracking page at `(buyer)/orders/[id]/page.tsx`. Buyers have no way to view the shipment status timeline after checkout.
- [x] **[MISSING] Buyer — orders list** — There is no `(buyer)/orders/page.tsx` to list all buyer orders. This is a core buyer flow.
- [x] **[MISSING] Delivery agent — dedicated portal** — `apps/web/src/app/apps/agent/page.tsx` exists as a stub. Implement: daily delivery list, mark picked-up, mark delivered with proof photo upload, and failed delivery reporting.

---

## P3 — Module-Level Missing Procedures

Backend services exist but the routers lack certain procedures or the service is not wired to events.

- [ ] **[MISSING] `advertising` router — campaign pause/resume** — `advertisingService` has no `pauseCampaign` / `resumeCampaign` method. When budget is exhausted the status flips to `OUT_OF_BUDGET` automatically, but sellers cannot manually pause. Add procedures and service methods.
- [ ] **[MISSING] `advertising` — auction injection at search time** — The search route does not query active ad groups and inject sponsored results. Wire `advertisingService` into the catalog/search path: at query time, fetch top bid for matching keywords and prepend the sponsored product to results with an `isSponsored: true` flag.
- [ ] **[MISSING] `affiliate` — attribution linkage at checkout** — `affiliateService.recordCommission` exists but is never called. Wire it into `orderService` on order creation: read the `referralLinkId` from the session/cookie, resolve the agent, and call `recordCommission`.
- [ ] **[MISSING] `dispute` router — admin escalation** — `disputeService` has no `escalateToAdmin` method. When the seller does not respond within 72 hours, the dispute should auto-escalate. Add a BullMQ delayed job on `dispute.opened` that fires after 72 hours and transitions status to `ESCALATED` if still `OPEN`.
- [ ] **[MISSING] `dispute` — moderator resolution creates `DisputeResolution` record** — `adminService.resolveDispute` updates dispute status but never creates a `DisputeResolution` row (the schema table exists). Create the resolution record with `ruling`, `adminId`, and `notes` on every resolution.
- [ ] **[MISSING] `media` router** — `mediaService` has no tRPC router. It is only reachable via the Next.js route handler at `/api/media/upload`. Add a `mediaRouter` with a `getUploadUrl` procedure and mount it in `root.ts` so the BFF can use it cleanly.
- [ ] **[MISSING] `notification` — `order.delivered` event handler** — The notification worker handles `order.created`, `payment.confirmed`, `order.status_updated` (only for SHIPPED), `seller.approved`, and `dispute.resolved`. It does not handle `order.delivered` or `order.completed`. Add cases and the corresponding email templates.
- [ ] **[MISSING] `notification` — `refund.processed` event handler** — No notification is sent to the buyer when a refund is processed. Add a handler and `REFUND_PROCESSED` email template.
- [ ] **[MISSING] `review` router — per-product average rating endpoint** — There is no procedure to fetch a product's aggregated rating (count + average) independently of fetching all reviews. Add `review.getProductRatingSummary` for efficient rendering on the product listing card.
- [ ] **[MISSING] `seller` router — bulk product deactivation** — Sellers can create and edit individual listings but there is no bulk deactivate/activate procedure. Add `catalog.bulkUpdateStatus` accepting an array of product IDs.

---

## P4 — Infrastructure & Operational Gaps

- [ ] **[MISSING] `event-consumer` Rust service is not wired** — `services/event-consumer/` exists in Cargo.toml but has no implementation. Decide whether TypeScript BullMQ workers fully replace it or whether this service should consume from a Kafka/Redis stream. Document the decision and either implement it or remove it from `docker-compose.prod.yml`.
- [ ] **[MISSING] Database seed script** — `CONTEST_PLAN.md` requires 20 demo sellers, 200 products, 50 completed orders, reviews, and disputes for the Day 14 demo. No seed file exists under `packages/db`. Create `packages/db/prisma/seed.ts` covering all entities.
- [ ] **[MISSING] Health check endpoints for all Rust services** — `docker-compose.prod.yml` defines health checks but the Rust binaries need to expose `/health` on their respective ports. Verify each service (`auction`, `fraud`, `recommendations`, `image-processor`, `inventory`, `search`) returns 200 from its health route.
- [ ] **[MISSING] GitHub Actions CI pipeline** — `.github/` directory exists but no workflows are present. Add a `ci.yml` that: installs pnpm dependencies, runs `tsc --noEmit` for `packages/api` and `apps/web`, and runs `cargo check` for all Rust services on every PR.
- [ ] **[MISSING] `PAYSTACK_WEBHOOK_SECRET` validation at startup** — The application boots without asserting that `PAYSTACK_WEBHOOK_SECRET` is set to a non-placeholder value. Add a startup guard in `apps/api-server/src/index.ts` that throws if critical secrets are still set to their `_placeholder` defaults in production.
- [ ] **[STUB] Rate limiting on auth routes** — There is no rate limiter on `/api/auth` or the tRPC `iam.login` procedure. Add Redis-backed rate limiting (e.g. Upstash Ratelimit) to login and registration endpoints.
- [ ] **[MISSING] OpenTelemetry tracing** — Health checks exist but no distributed tracing spans are emitted. Add basic OTEL instrumentation to the Fastify/tRPC server: trace incoming requests, Prisma queries, and BullMQ job executions.

---

## P5 — Code Quality & Type Safety

- [ ] **[BUG] `typecheck.log` — 284 KB of errors** — The `typecheck.log` file at the repo root indicates TypeScript compilation is not clean. Run `pnpm tsc --noEmit` across all packages and resolve all errors before any production deployment.
- [ ] **[BUG] `web-typecheck.log` — errors in `apps/web`** — The `web-typecheck.log` confirms type errors in the Next.js app. Address all errors, prioritising any in route handlers and tRPC client calls.
- [ ] **[STUB] `ops-service.ts` — `totalGmv30d` is not filtered to 30 days** — `totalGmv30d` is set to the same value as the all-time `gmv`. Add a `createdAt: { gte: thirtyDaysAgo }` filter to the aggregate query for the 30-day figure.
- [ ] **[STUB] `dispute-service.ts` — admin access to `getDisputeThread`** — The authorization check blocks anyone who is not the buyer or seller. Admins cannot view the thread. Add a role check: if the caller holds the `ADMIN` role, bypass the buyer/seller restriction.
- [ ] **[STUB] `catalog/services/wishlist-service.ts`** — A wishlist service file exists in the catalog module but there is no router procedure exposing it and no Prisma model for a `Wishlist` or `WishlistItem`. Either add the schema and wire the router, or remove the file and move it to the backlog.
- [ ] **[STUB] `advertising-service.ts` — no keyword-match logic at query time** — `addAdGroup` stores keywords but `recordImpression` accepts `adGroupId` directly. The auction step (selecting which ad group to show given a search query) is entirely absent. Implement a `selectSponsoredResult(query: string)` method that filters `AdKeyword` by match and returns the highest-bid active group.

---

## Backlog (Post-Contest)

These are deliberately deferred per `SCOPE.md`. Do not build during the contest window.

- [ ] React Native buyer app
- [ ] React Native delivery agent app
- [ ] Rust Search service (Tantivy) — replace PostgreSQL ILIKE stub
- [ ] Rust Ad Auction (gRPC) — replace SQL bid sort stub
- [ ] Rust Inventory service — replace Redis TypeScript stub
- [ ] Rust Fraud Detection — ML model (Phase 2)
- [ ] Rust Recommendations — ALS + Qdrant (Phase 2)
- [ ] Rust Image Processor — replace sharp Node.js stub
- [ ] SMS notifications via Termii or Africa's Talking
- [ ] Push notifications (requires mobile app)
- [ ] OpenTelemetry full distributed tracing
- [ ] Seller Brand Store
- [ ] Multi-currency support (USD, GHS, KES)
- [ ] Buyer wishlist with price-drop alerts
- [ ] Product comparison tool
- [ ] Flash sale real-time countdown (WebSocket)
- [ ] Loyalty / rewards points system
- [ ] Seller CSV bulk product import
- [ ] A/B testing on homepage banners
- [ ] International shipping support
- [ ] Kafka event bus (replace BullMQ for scale)

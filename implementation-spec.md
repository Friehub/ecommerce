# Jumia Clone — Full Implementation Spec

All items are confirmed by reading the actual source code. No guessing.
Items are ordered by priority: fix blockers first, then wire existing code, then build new features.

---

## SECTION A — FIXES
These are bugs where code exists but behaves incorrectly.

---

### A1 · Payout account staging bug
**File:** `packages/api/modules/iam/services/seller-service.ts`

The `setupPayoutAccount` method checks both that the Paystack key is not a placeholder AND that `NODE_ENV` equals `production` before calling the real Paystack API. This means a staging server with a real key still generates a fake `SIM_REC_` recipient code, which will cause all real payouts to fail.

Fix: remove the `NODE_ENV` check entirely. The only condition for calling the real API should be that the key is not the placeholder string. This mirrors the fix already applied to `revenue-service.ts`.

---

### A2 · Inventory syncAll is a no-op
**File:** `packages/api/modules/inventory/router/index.ts`

The `syncAll` admin mutation returns `{ success: true }` immediately without doing anything. The purpose of this endpoint is to walk every `StockLevel` row in the database and write the current available quantity (onHand minus reserved) into Redis so the Lua reservation script has accurate data.

Fix: iterate all `StockLevel` records from the database, compute available quantity for each, and write it to the Redis key `stock:{variantId}` using a pipeline for efficiency. Return the count of synced records.

---

### A3 · Dead duplicate handlers in order-worker
**File:** `packages/api/modules/order/workers/order-worker.ts`

The file contains fully-written handler functions — `handleDisputeAutoEscalate`, `handleFraudReview`, `handlePaymentTimeout`, `handleEscrowRelease`, `handleShipmentTimeout` — that are never called anywhere because the worker itself is a stub. Worse, some of these diverge from the real implementations in `services/event-consumer/src/index.ts`. For example, the stub `handleDisputeAutoEscalate` does not publish the `dispute.escalated` event, while the real one in the event-consumer does.

Fix: delete all the dead handler functions. Keep only the exported stub object that satisfies imports. This prevents future developers from accidentally calling the wrong version.

---

---

## SECTION B — WIRE
These features are fully implemented in service files but never exposed through a router, so they are unreachable from the frontend.

---

### B1 · KYC — seller document upload
**File:** `packages/api/modules/iam/router/index.ts`

`sellerService.uploadDocument()` exists and works correctly — it creates a `SellerDocument` record with status `PENDING`. But there is no tRPC procedure that calls it. Sellers have no way to submit their NIN or bank statement through the API.

Wire it as a `protectedProcedure` that accepts a document type (NIN, BANK_STATEMENT, CAC, UTILITY_BILL) and a URL (the S3 key returned after the file is uploaded via the media presigned URL flow). The procedure should look up the seller profile for the authenticated user and reject the request if they have not completed onboarding yet.

---

### B2 · KYC — admin document review
**File:** `packages/api/modules/admin/router/index.ts`

`adminService.reviewDocument()` is fully implemented. When called with `APPROVED`, it updates the document status, then checks if the seller now has both an approved NIN and an approved BANK_STATEMENT, and if so automatically activates the seller account and publishes `seller.approved`. None of this runs because the method is never called from a router.

Wire it as an `adminProcedure` that accepts a document ID, a decision (APPROVED or REJECTED), and an optional rejection reason. Require the rejection reason when the decision is REJECTED.

---

### B3 · Seller suspension should publish an event
**File:** `packages/api/modules/admin/router/index.ts`

The `updateSellerStatus` mutation does a raw database update with no side effects. When a seller is suspended, they receive no notification and no audit log entry is created.

Fix the mutation body to additionally call `publishEvent('seller.status_changed', ...)` with the seller ID, user ID, and new status. Also write an `EventLog` record. Then add a handler in the event-consumer that sends the seller an in-app and email notification about the status change.

The same applies to `updateUserStatus` — suspending a buyer account should also publish an event and notify the user.

---

### B4 · Payment router only exposes Paystack
**File:** `packages/api/modules/payment/router/index.ts`

`paymentService.initializeTransaction()` accepts a provider name and handles Flutterwave and Monnify correctly. However, the router only exposes `initializePaystack`. The checkout page has no way to start a Flutterwave or Monnify payment session.

Wire a new generic `initializePayment` procedure that accepts an order ID and a provider enum (paystack, flutterwave, monnify), looks up the order, and calls `paymentService.initializeTransaction` with the chosen provider.

---

### B5 · Flutterwave webhook route missing
**New file:** `apps/web/src/app/api/webhooks/flutterwave/route.ts`

The Flutterwave adapter is fully built. It is missing only the Next.js route handler that receives the webhook callback from Flutterwave's servers.

Create a POST handler following the exact same pattern as the existing Paystack webhook at `apps/web/src/app/api/webhooks/paystack/route.ts`. The only differences are: read the signature from the `verif-hash` header (Flutterwave's header name), and get the adapter using `getPaymentAdapter('flutterwave')`. Everything else — signature verification, event parsing, calling `handleWebhookSuccess` or `handleWebhookFailure`, returning 200 — is identical.

Register this URL in the Flutterwave dashboard under Settings → Webhooks.

---

### B6 · Monnify webhook route missing
**New file:** `apps/web/src/app/api/webhooks/monnify/route.ts`

Same situation as B5. The Monnify adapter is complete. Create the webhook route handler following the Paystack pattern. The signature header name for Monnify is `monnify-signature`. Use `getPaymentAdapter('monnify')`.

Register the URL in the Monnify dashboard.

---

### B7 · Shipments are never created when a package is confirmed
**Files:** `packages/api/modules/order/services/package-service.ts` and `services/event-consumer/src/index.ts`

`logisticsService.createShipment()` is fully implemented and idempotent (it checks for an existing shipment before creating). But it is never called anywhere in the codebase. When a seller marks their package as PROCESSING (ready to ship), no `Shipment` record is created, so delivery agents see an empty list in their portal and can never pick anything up.

Fix: in `package-service.ts`, after the status is updated to PROCESSING, publish a `package.confirmed` event. Then in the event-consumer, add a handler for that event that calls `logisticsService.createShipment(packageId)`.

---

### B8 · Delivery agents can never be registered
**File:** `packages/api/modules/logistics/router/index.ts`

`logisticsRouter.getMyShipments` queries `DeliveryAgent.findUnique({ where: { userId } })` and throws `NOT_AN_AGENT` if nothing is found. But there is no route anywhere in the codebase to create a `DeliveryAgent` record. The entire agent portal is permanently broken for any new agent.

Wire two new procedures. First, a `registerAsAgent` protected procedure that accepts a zone string, creates the `DeliveryAgent` record, and updates the user's role to AGENT so the `agentProcedure` guard passes on future calls. Second, a `listPickupStations` public procedure that queries all active `PickupStation` records — the schema exists but is completely unused.

---

### B9 · Bulk product activate is missing
**File:** `packages/api/modules/seller/router/index.ts`

`bulkDeactivateProducts` exists and sets product status to DRAFT. There is no `bulkActivateProducts`. Sellers can mass-deactivate but have no way to mass-reactivate.

Wire an identical `bulkActivateProducts` seller procedure that accepts an array of product IDs, verifies the seller owns them all, and sets status to ACTIVE.

---

### B10 · Search autocomplete has no query endpoint
**File:** `packages/api/modules/catalog/router/index.ts`

The nightly cron in `run-workers.ts` builds an autocomplete data structure in Redis under the key `autocomplete_trie`. But there is no tRPC procedure that reads from it. The frontend search box has no autocomplete.

Wire a public `autocomplete` procedure that accepts a query string, first tries the Rust search service's autocomplete method, and falls back to reading from the Redis sorted set using a prefix range query. Return up to 8 suggestions.

---

---

## SECTION C — BUILD
These are net-new features with no existing implementation. They require new schema models, new service methods, and new router procedures.

---

### C1 · Product approval workflow

Currently products go live instantly when a seller creates them (`status: 'ACTIVE'`). Real Jumia requires admin review before a product is visible to buyers, especially for new sellers.

What to build:

Change `catalogService.createProduct()` to set status to `PENDING_APPROVAL` instead of `ACTIVE`. Add two new admin procedures — `getPendingProducts` which lists all products in that status, and `moderateProduct` which accepts a decision of APPROVED or REJECTED plus an optional reason. When approved, set status to ACTIVE and sync to the search index. When rejected, set status to REJECTED. In both cases, publish a `product.moderated` event. Add a handler in the event-consumer that sends the seller a notification with the decision and reason.

You may want to trust verified sellers more — optionally allow sellers with `ACTIVE` status and more than 10 approved products to skip the queue and auto-activate. That logic lives in `createProduct`.

---

### C2 · Failed delivery re-assignment

When a shipment transitions to `FAILED` status, the order stalls permanently. There is no admin tooling to handle it and no way to retry delivery.

What to build:

In `logisticsService.updateStatus()`, when the new status is FAILED, publish a `shipment.failed` event. Add two new admin logistics procedures — `getFailedShipments` which lists all shipments with FAILED status including the delivery address and agent details, and `reassignShipment` which accepts a shipment ID and a new agent ID, resets the shipment status back to PENDING, and assigns the new agent. Also add a handler in the event-consumer for `shipment.failed` that sends a notification to the operations team (or a designated admin user).

---

### C3 · Shipping fee calculator

The shipping fee is hardcoded at ₦500 for every order regardless of weight, distance, or item count. This is a placeholder.

What to build:

Create a pure function (no database calls) that accepts the total weight of the package in grams, the seller's state, and the buyer's state. It should return a fee based on: a base charge, a per-kilogram surcharge above the first 500g, and an interstate surcharge when seller and buyer states differ. Plug this function into `order-service.ts` inside `createFromCart()` where the hardcoded 500 currently sits. You will need to sum the `weightGrams` field on each `ProductVariant` in the order lines to get total weight, and look up the buyer's address state from the `Address` record.

---

### C4 · CMS banner management

`contentService.getBanners()` returns a hardcoded array of three Unsplash images. The database has a CMS schema (`cms.prisma`) with a `Banner` model but it is completely unused.

What to build:

If the `Banner` model does not yet exist in the schema, add it with fields for title, image URL, link, display position, active flag, and timestamps. Update `getBanners()` to query the database and fall back to the hardcoded array only if the table is empty (useful for development). Add three admin procedures — create banner, update banner (to toggle active or change position), and delete banner. Each mutation should bust the `content:banners` Redis cache so changes appear immediately.

---

### C5 · Seller-created discount coupons

Currently only admins can create promotions. Sellers on Jumia can create their own discount codes scoped to their products.

What to build:

Add a nullable `sellerId` field to the `Promotion` model so promotions can be seller-scoped. Add two new seller procedures — `createCoupon` which accepts a coupon code, discount type (percentage or fixed), value, usage limit, and date range and creates both the `Promotion` and `Coupon` records linked to the seller, and `listMyCoupons` which returns all coupons the seller has created. Update `promoService.validateCoupon()` to also check that the coupon's seller (if set) matches a seller in the buyer's current cart — do not allow cross-seller coupon abuse.

---

### C6 · Product Q&A

Buyers on Jumia can ask questions on product pages. Sellers and other buyers can answer. There is no schema, service, or router for this.

What to build:

Add two new models to the catalog schema — `ProductQuestion` (linked to product and user, contains the question text and timestamp) and `ProductAnswer` (linked to question and user, contains the answer text, a boolean for whether the answerer is the seller, and timestamp). Add three catalog procedures — `askQuestion` (protected, any buyer can ask), `answerQuestion` (protected, any user can answer but mark `isSeller: true` if the responder is the product's seller), and `getQuestions` (public, returns questions with their answers for a given product ID, paginated).

---

### C7 · Public seller storefront

Sellers need a public profile page at a URL like `/vendor/{sellerId}` showing their store name, rating, member since date, and product listings.

What to build:

Add two new public seller procedures — `getPublicProfile` which accepts a seller ID or business name slug and returns only public-safe fields (business name, status, tier, member since date, product count, average rating — never bank details or personal info), and `getSellerProducts` which returns paginated active products for a given seller ID. Create a new Next.js page at `apps/web/src/app/(buyer)/vendor/[sellerId]/page.tsx` that calls these two procedures and renders the storefront.

---

### C8 · Seller tier upgrade logic

The `SellerTier` enum (`STANDARD`, `EXPRESS`, `BRAND`) exists on the `Seller` model and is never evaluated or changed. Tier affects search ranking and platform badges.

What to build:

Add a weekly cron job to `packages/api/scripts/run-workers.ts` that runs every Sunday. For each active seller, fetch their metrics from `sellerDashboardService.getMetrics()`. Apply rules — BRAND tier if GMV exceeds ₦5M and average rating is 4.5 or above, EXPRESS tier if GMV exceeds ₦1M and rating is 4.0 or above, otherwise STANDARD. If the tier has changed, update the database and publish a `seller.tier_changed` event. Add a handler in the event-consumer that congratulates the seller with a notification.

---

### C9 · Google / Social OAuth login

Only email and password login exists. Nigerian users heavily use Google login.

What to build:

Add the Google provider to the NextAuth configuration in `apps/web/src/auth.ts`. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to environment variables. In the NextAuth `signIn` callback, upsert the user record in your database using the Google-provided email as the unique key, setting `emailVerified: true` since Google already verified it. Ensure the user gets a `BUYER` role by default. The session and JWT callbacks already handle the rest since they read from the database.

Register the OAuth app in Google Cloud Console and set the redirect URI to `{domain}/api/auth/callback/google`.

---

### C10 · SMS notifications

Email notifications are working. In Nigeria, SMS has significantly higher open rates than email, especially for order updates and OTPs. There is no SMS service wired.

What to build:

Integrate either Termii or Africa's Talking (both have Nigerian NGN pricing and good delivery rates). Create a new `smsService` in `packages/api/modules/notification/services/sms-service.ts` with a single `sendSms(phone, message)` method. Add SMS sends alongside the existing email sends in the notification worker for the most critical events — order confirmed, order shipped, order delivered, and payment received. Keep SMS messages short (under 160 characters). Store the user's phone number in the `User` model if not already present and only send SMS if a phone number exists.

---

### C11 · Phone number verification at registration

Users can register with any phone number without verifying it. This enables fraud and fake accounts.

What to build:

When a user adds or updates their phone number, generate a 6-digit OTP, store a hashed version with a 10-minute TTL in Redis under `otp:{userId}`, and send the OTP via SMS using the service built in C10. Add a `verifyPhone` protected procedure that accepts the OTP, compares it to the stored hash, and if correct marks the phone as verified in the database. Rate-limit OTP generation to 3 attempts per hour per user using Redis to prevent abuse.

---

---

## Environment Variables Needed

The following variables are referenced in the codebase but may not be set in all environments. Confirm they are present in `.env` and in your deployment secrets.

Payment providers: `PAYSTACK_SECRET`, `PAYSTACK_WEBHOOK_SECRET`, `FLW_SECRET_KEY`, `FLW_WEBHOOK_SECRET`, `MONNIFY_API_KEY`, `MONNIFY_SECRET_KEY`, `MONNIFY_CONTRACT_CODE`

Auth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`

SMS: `TERMII_API_KEY` or `AFRICASTALKING_API_KEY` and `AFRICASTALKING_USERNAME`

Storage: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`, `AWS_REGION` (or equivalent R2 keys)

Infrastructure: `DATABASE_URL`, `REDIS_URL`, `RESEND_API_KEY`

---

## What "fully functional like Jumia" actually requires beyond this list

After everything above is done, you will have a functionally complete marketplace. The remaining gaps between this codebase and production Jumia are scale and operational concerns, not feature gaps:

The six Rust services (search, inventory, recommendations, fraud, analytics, logistics routing) are stubbed with TypeScript fallbacks. The TypeScript fallbacks are correct and will work for low to medium traffic, but will not handle Jumia-level concurrency. Replace them when you have real load.

There is no mobile app. Jumia's primary surface is mobile. The tRPC API is already REST-compatible via the Next.js adapter, so a React Native or Flutter app can consume it directly.

There is no multi-currency or multi-country support. Everything is hardcoded to NGN and Nigeria. Jumia operates in 11 countries. Adding a country would require a currency layer, a country-specific category tree, and separate seller/logistics zones.

There is no recommendation engine beyond "newest products". The Rust recommendations service stub always returns an empty array. A real engine needs collaborative filtering on order history, at minimum.

Reporting and finance exports are missing. Sellers need downloadable CSV statements. The ledger data exists but there is no export endpoint.

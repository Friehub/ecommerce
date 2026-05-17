
[x] Seller score still computed from a string hash, not real DB data (Fixed)
If seller.rating is 0 (most new sellers), the product page falls back to 80 + (idHash % 19) — a fake score between 80–98%. A brand-new seller with zero feedback appears to have an 80–98% score. This is still misleading.

[x] Cart page has hardcoded shipping ₦500 fallback (Fixed)
The cart page uses const shipping = cart?.items?.length > 0 ? 500 : 0 — always ₦500 regardless of destination or seller. The checkout page correctly calls api.order.calculateShipping; the cart summary should show the same estimate or omit shipping until checkout.
🆕 New issues found in this version

Critical (Fixed)
[x] Seller registration "Finalize Onboarding" submits nothing — anyone skips to dashboard
The seller registration page has two steps. Step 1 collects business name, email, phone. Step 2 collects a KYC document. But the "FINALIZE ONBOARDING" button on step 2 is a <Link href="/seller/dashboard"> — not a form submit. No API call is made. No data is sent to the backend. Anyone can click through and land on the seller dashboard without submitting any details or documents.

High (Fixed)
[x] Support chat is entirely simulated — messages never leave the browser
The /support page renders a chat interface. Messages are stored in local useState; there is no API call, no socket connection, no backend. The "agent" responses are hardcoded strings. Buyers who send support messages are talking to a local array. No one sees their messages.

High (Fixed)
[x] Privacy/Terms page uses internal breadcrumb labels — "Hub" and "Legal Framework"
The breadcrumb on the privacy page reads "Hub / Legal Framework". Buyers see "Hub" as the home link label and "Legal Framework" as the page title in the breadcrumb trail. These should read "Home / Privacy Policy" or "Home / Terms & Conditions".

High (Fixed)
[x] Wallet page uses deprecated api.useContext() — will break in tRPC v11+
The wallet page calls const utils = api.useContext() — this is the deprecated tRPC v10 pattern. The correct v11 pattern is api.useUtils(), which is already used consistently everywhere else in the app. This will produce a console warning and may break in a future tRPC upgrade.

Medium (Fixed)
[x] CategorySidebar and CategoryGrid use raw <img> tags instead of Next.js <Image>
Both homepage components use plain <img src={cat.imageUrl}>. This skips Next.js image optimisation (WebP conversion, lazy loading, CLS prevention, CDN caching). On a slow Nigerian mobile connection these unoptimised images will load noticeably slower than the rest of the page.

Medium (Fixed)
[x] New product image upload uses <img alt=""> — empty alt on a visible image
The seller inventory new product page renders uploaded image previews with alt="". This marks them as decorative to screen readers. Since these are content images (product photos the seller is reviewing), they need a descriptive alt like alt="Product image preview" or the filename.

Low
No error.tsx or not-found.tsx pages — unbranded Next.js defaults on errors
Still no custom error or 404 pages in the app directory. When a product slug doesn't exist, a tRPC call throws, or a buyer lands on a missing URL, Next.js falls back to its generic unstyled error UI. Adding these two files at the app root would be a 20-minute fix.

Crash #1
trpc/server.ts sends no X-Internal-Token header — every server component call returns 401
In production, Next.js server components call the Fastify API server at http://127.0.0.1:4000. The API server checks x-internal-token on all tRPC routes in production and rejects requests missing it with a 401. trpc/server.ts uses a plain httpBatchLink with no headers — so every call from a server component fails. The product page, which is a server component, crashes on every load.
Fix: add headers: { 'x-internal-token': \`Bearer \${process.env.INTERNAL_API_TOKEN}\` } to the httpBatchLink in trpc/server.ts. Also add INTERNAL_API_TOKEN to the web process in ecosystem.config.cjs.

Crash #2
No error.tsx anywhere — a tRPC 401 becomes a blank "server error" screen with no recovery
When the server component throws (due to the 401 above), Next.js has no error.tsx boundary to catch it. The user sees the default Next.js error screen with no branding, no retry, and no navigation back. This is what you're seeing — "This page couldn't load / A server error occurred."
Fix: add app/error.tsx and app/not-found.tsx as a minimum. For the product route specifically, wrap await api.catalog.getProductBySlug.query() in try/catch and redirect to a friendly error page.

🟠 Production blockers
Blocker
INTERNAL_API_URL and INTERNAL_API_TOKEN missing from .env.example and ecosystem.config.cjs
These two variables are critical for server components to reach the API server in production. They're used in trpc/shared.ts and must be set on the Next.js process — but they're not in .env.example (so no one knows they exist), and the web process in ecosystem.config.cjs doesn't forward them. Any developer deploying from the docs would ship a broken product page.

Blocker (Fixed)
[x] Seller registration "Finalize Onboarding" is a bare <Link> — no API call, no data saved
The final submit button on step 2 of seller registration navigates directly to /seller/dashboard without calling any API. No seller record is created, no KYC document is stored, no onboarding entry appears in the admin queue. Anyone can bypass registration entirely.

Blocker (Fixed)
[x] Support chat is entirely local state — buyer messages are never received
The /support page renders a live chat UI backed by useState. No socket, no API call, no message storage. Buyers who send support messages receive no response and their issue is not logged anywhere. This is a trust-breaking experience in production.

Blocker
SMS and push notifications are stubs — buyers receive no transactional messages
The notification service logs [STUB/TEST] Sending SMS and [STUB/FCM] Push to console instead of dispatching. Order confirmations, OTP codes, delivery alerts, and dispute updates are never sent via SMS or push in production. Email works if RESEND_API_KEY is set, but SMS (Termii) and FCM (Firebase) are not wired.

Blocker
Payment routes have no rate limiting — open to payment abuse
initializePayment, fundWallet, and withdraw all use plain protectedProcedure with no rate limiting. Any authenticated user can hammer payment initiation endpoints. Authentication procedures like register and seller onboarding use rateLimitProcedure, but payment does not.
🔵 Reliability & stability gaps

Medium
All server components lack try/catch — any API hiccup crashes the page
Every server component (product page, category page, etc.) awaits tRPC calls directly with no error handling. A momentary Redis timeout, DB connection blip, or API server restart crashes those pages for every user hitting them at that moment. They should catch errors and render a degraded but functional state.

Medium
Smoke test only pings the API server — the web app isn't verified post-deploy
The deploy workflow's smoke test hits http://localhost:4000/health (the API server). It never checks localhost:3000 (Next.js). A broken web build that fails to start would pass the smoke test and ship silently.

Medium
Rust service URLs in staging deploy use container names — not configured for PM2 bare-metal deploy
In docker-compose.staging.yml, the API service sets SEARCH_SERVICE_URL=http://search:3001 etc. But the CI deploy uses PM2, not Docker Compose. In PM2, these container hostnames don't resolve — all Rust service calls go to localhost:3001–3006 by default. Unless those services are running locally, search, recommendations, and fraud are all broken in staging.

Medium
Wallet page uses deprecated api.useContext() instead of api.useUtils()
This is the only file still using the tRPC v10 pattern. It will produce a console warning today and break when tRPC is upgraded. A one-line fix.

Medium (Fixed)
[x] Admin sidebar — Dashboard and Sellers links still 404
These two link to /admin/dashboard and /admin/sellers. The actual routes are /dashboard and /sellers — the (admin) route group adds no URL prefix. Still not fixed from the previous audit.

Medium (Fixed)
[x] No SEO metadata on product, category, or search pages
Still no generateMetadata() on any dynamic page. Product links shared on WhatsApp show no title, description, or image preview. This significantly reduces organic discovery and social sharing effectiveness.

⚪ Ops / noise / cleanup
Low
22 console.log("DEBUG: [N/8]...") lines ship in the production API server
The API server's boot sequence logs step-by-step debug messages. In production these appear in PM2 logs on every restart, polluting log aggregators and making it harder to spot real errors. They should be gated behind process.env.NODE_ENV !== 'production' or removed.

Low
5 tRPC procedures use .output(z.any()) — no output validation
Procedures with z.any() output skip tRPC's response validation. If the service layer returns unexpected shapes (e.g., Prisma schema changes), the client receives malformed data silently rather than a typed error. Worth replacing with proper Zod schemas on the critical paths (product, order, payment).

Low (Fixed)
[x] Privacy page breadcrumb reads "Hub / Legal Framework" instead of "Home / Privacy Policy"
Internal copy that slipped through to the buyer-facing privacy page. Minor but visibly unprofessional.

Low
No pagination on search, category, or products listing pages
All three browse pages cap results silently. Categories with many products appear to have very few. Needed before handling real catalogue volume.


Critical
No API or UI to create warehouses — first seller product listing will throw
When a seller creates a product, catalogService.createProduct() looks up warehouseService.findFirst() to auto-create a stock level. If no warehouse exists in the DB, it throws NO_WAREHOUSE_CONFIGURED. There is no admin endpoint, no admin UI, and no seed to create warehouses. The database ships empty. Every new product listing fails until someone manually inserts a warehouse row via SQL.
Add an admin.createWarehouse procedure and a simple form on the inventory admin page. Also add a warehouse seed in packages/db/seed.ts so staging always has one.

High
Sellers cannot choose a warehouse when updating stock — hardcoded to first match
The inventory.reserve procedure and updateStock mutation require a warehouseId, but the seller inventory UI passes whatever the API resolves first. Multi-warehouse sellers — e.g. Lagos + Abuja — have no way to direct stock to a specific location. Stock will silently pile into whichever warehouse was inserted first.

High
inventory.reserve is publicProcedure — any anonymous user can deplete stock
The stock reservation endpoint requires no authentication. Anyone who knows a variantId can fire repeated calls and drain inventory without placing an order. Stock reservation should be protectedProcedure at minimum, and ideally only called internally from order.create rather than exposed as a standalone route.

Medium
Redis stock cache can drift from DB after a crash between reservation and DB write
In the fallback path (when Rust inventory is down), inventoryService.reserveStock() atomically decrements the Redis key, then writes the reservation to Postgres in a separate step. If the process crashes between those two operations, Redis shows stock as reserved but no StockReservation record exists. The next confirmStock call will fail to find the reservation and the decrement is lost, making the item appear oversold. The nightly syncAllStock cron would recover this, but orders in that window are at risk.

💳 Payment
Critical
Checkout success page never calls verifyPayment — anyone can fake a paid order
After a buyer returns from the Paystack/Flutterwave redirect, the success page only calls api.order.get using the ?orderId= URL param. It shows a "Thank You" screen regardless of payment status. A buyer can: (1) start checkout, (2) copy the URL with ?orderId=, (3) skip payment, (4) paste the URL directly and see a success screen. The order stays in PENDING_PAYMENT status, but the buyer sees confirmation and may believe the order is placed. api.payment.verifyPayment exists but is never called here.
On success page mount, call api.payment.verifyPayment using the ?reference= param (also passed by Paystack in the redirect). Show a loading state while verifying, and display a clear failure message if payment wasn't confirmed.

Critical
Duplicate initializePaystack and initializePayment procedures — two separate payment records created for one order
The payment router has both initializePaystack (legacy, hardcoded to Paystack) and initializePayment (new, provider-agnostic). The checkout page calls initializePayment correctly. But initializePaystack is still exposed and also creates a Payment record. If anything calls both for the same order, the webhook handler will find two pending records with different providerRefs. The old one will never be resolved. Remove initializePaystack and update any remaining callers.

High
Cancelled orders don't release coupon usage — coupons are permanently consumed
When order.create succeeds, promoService.markCouponUsed() increments usedCount and creates a CouponRedemption record. But orderService.cancelOrder() never calls a coupon release. When a buyer cancels an order (or the SLA timeout cancels it after 30 minutes), their coupon slot is permanently consumed. They cannot re-use the coupon on a new order, and the global usage counter is inflated.
Add a promoService.releaseCoupon(orderId) method that decrements usedCount and deletes the redemption record. Call it in updateStatus() when status transitions to CANCELLED.

High
Monnify adapter falls back to 'mock_token' silently on auth failure
If Monnify's /auth/login fails (wrong credentials, network error), getAuthToken() catches the error and returns 'mock_token'. Every subsequent API call using this token will receive a 401 from Monnify, but from the codebase's perspective the flow just throws a MONNIFY_INIT_FAILED error with no indication the real cause was auth. Buyers choosing Monnify will see a generic payment failure. The silent fallback should throw instead.

High
Flutterwave webhook uses tx_ref as reference but Flutterwave also passes id — mismatch risk on retry
The Flutterwave webhook handler extracts event.data.tx_ref and passes it to paymentService.handleWebhook(), which looks up { providerRef: reference } in the DB. The payment record was created with the tx_ref as providerRef, so this works in the happy path. But if Flutterwave retries with a different payload shape (some webhook events use data.flw_ref instead), the lookup returns nothing and the payment silently goes unhandled.

Medium
Wallet funding callback returns to /wallet — page doesn't exist at that path
In paymentService.requestWalletFunding(), the callback URL is set to ${NEXTAUTH_URL}/wallet. But the wallet page is at /account/wallet. After funding, Paystack redirects the buyer to a 404.
🚚 Delivery & Logistics

Critical
Return window calculated from order.updatedAt — not actual delivery date
The return service checks const deliveredAt = line.package.order.updatedAt and computes days since delivery from that. updatedAt changes every time the order is touched — status updates, payment confirmation, admin edits. A 7-day-old order that was edited yesterday would show 1 day remaining in the return window. An order updated the same day it was delivered would show the full 7 days. This needs to use the timestamp when the order transitioned to DELIVERED status — either a dedicated deliveredAt column or a status history table.
Add a deliveredAt DateTime? field to the Order model. Set it in orderService.updateStatus() when status becomes DELIVERED. Use it in the return window check.

High
Shipments are created with agentId: 'system-unassigned' — a hardcoded string, not a real agent
When an order reaches PROCESSING, the logistics worker auto-creates a shipment via logisticsService.createShipment(packageId), which sets agentId: 'system-unassigned'. This string is not a valid DeliveryAgent ID. If the agentId field has a foreign key constraint, this will throw on creation. If it doesn't, queries joining agent details will return null for every unassigned shipment. Admin must then assign a real agent via the logistics page — but there is no notification or queue for unassigned shipments.

High
Shipping fee calculated from state only — no LGA, distance, or pickup station logic
The shipping calculator uses a simple state multiplier: 6 northern states get 1.5×, everywhere else is 1.0×. There is no distance calculation, no pickup station discount, no last-mile zone, no weight tier above 1 kg. A 10 kg shipment from Lagos to Abuja costs the same as a 1 kg one. For a marketplace with sellers across Nigeria shipping to buyers nationwide, this will result in frequent undercharging that eats seller margins.

High
Order track endpoint is publicProcedure with no ownership check — order IDs are enumerable
Anyone who can guess or obtain an order ID can retrieve full order details including buyer address, package contents, and delivery status via api.order.track. Order IDs from the codebase appear to be UUIDs (hard to guess), but they are displayed in the browser URL on the success page, in emails, and in breadcrumbs. A buyer who shares their order URL gives anyone that URL full tracking access including their home address. Should be restricted to the order owner or require a separate tracking token.

Medium
Shipment FAILED status maps to package CANCELLED — cancels the package permanently on first delivery attempt
In logisticsService.updateStatus(), when a delivery agent marks a shipment FAILED, it calls packageService.updateStatus(packageId, 'CANCELLED'). A failed delivery attempt (customer not home, wrong address) permanently cancels the package. The shipment state machine does allow retrying from FAILED, but the package is already cancelled by then. These should be decoupled: failed deliveries should mark the package as RETURN_TO_SELLER or RESCHEDULED, not cancelled outright.
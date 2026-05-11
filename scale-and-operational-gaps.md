# Beyond Feature Complete — Scale & Operational Gaps

This document covers what separates a functionally complete marketplace from a
production Jumia-scale platform. None of these are missing features in the
traditional sense — the app works without them. They become necessary as traffic
grows, markets expand, and sellers demand better tooling.

Address them in the order they hurt you first.

---

## 1. Rust Services (Performance)

The codebase has six Rust services — search, inventory, recommendations, fraud
detection, analytics, and logistics routing. All six are currently stubbed. The
TypeScript fallbacks are logically correct and will serve real users at low to
medium traffic without any changes.

The problem appears under load. The TypeScript fallbacks hit the database
directly for every operation. At Jumia-scale — thousands of concurrent searches,
hundreds of simultaneous checkouts — the database becomes the bottleneck. The
Rust services exist specifically to move hot-path operations into memory and
avoid that bottleneck.

Replace each service when you have evidence it is the actual bottleneck, not
before. The order to tackle them is inventory first (checkout concurrency is the
most damaging failure), then search (most frequent operation), then fraud
(currently runs synchronous DB queries on every order), then recommendations,
then analytics, then logistics routing last since that one has the least
real-time pressure.

For each service, the contract (the interface between TypeScript and Rust) is
already defined in `packages/api/rust-client.ts`. The Rust side just needs to
implement that contract over HTTP. The TypeScript fallbacks stay in place as a
circuit breaker — if the Rust service is down, the system degrades gracefully
rather than failing.

---

## 2. Mobile App

Jumia's primary surface is mobile. The vast majority of their Nigerian users
shop on Android. A web-only platform will work but will not reach the full
addressable market.

The good news is the API requires no changes. The tRPC router is already
exposed as standard HTTP through the Next.js adapter, so any mobile client can
consume it by calling the same endpoints the web frontend uses. There is no
separate mobile API to build.

The choice is between React Native and Flutter. React Native is the faster path
if your team already knows React — the data-fetching patterns, the tRPC client
setup, and the component logic are nearly identical to the web app. Flutter
gives better Android performance and a larger talent pool in Nigeria specifically,
but requires learning Dart and rebuilding all UI from scratch.

Either way, the core work is UI — the business logic already lives server-side.
Priority screens are: home feed, search and category browse, product detail,
cart and checkout, order tracking, and the seller hub order management view.
Everything else can ship later.

Push notifications are required for mobile and are not implemented on any
surface yet. Use Firebase Cloud Messaging. Store the FCM device token on the
`User` model when the user logs in on mobile, and add FCM sends to the
notification worker alongside the existing email and SMS sends.

---

## 3. Multi-Country and Multi-Currency

Everything in the codebase is hardcoded to Nigeria and NGN. Currency amounts,
phone number formats, shipping zones, tax logic, payment providers, and even
the seed data all assume Nigeria. Jumia operates in 11 African countries.

Expanding to a second country is a significant architectural change, not a
configuration change. The minimum required work is:

The database needs a `Country` model and every entity that is country-specific
— categories, sellers, warehouses, pickup stations, promotions, payment methods
— needs a country foreign key. Products can be global or country-specific
depending on seller reach.

The payment layer needs country-specific provider selection. Paystack covers
Nigeria and Ghana. Flutterwave covers more markets. Each country needs its own
set of active providers configured, and the checkout flow needs to select the
right one based on the buyer's country.

Currency needs a conversion layer. Store all monetary values in a base currency
(USD or NGN) and convert on display using daily exchange rates pulled from an
FX API. Never store pre-converted amounts — always convert at read time.

Logistics zones are country-specific. A shipment from Lagos to Accra is
fundamentally different from Lagos to Kano. The zone and shipping fee models
need to be country-aware.

Tax rules differ by country. Nigeria has VAT. Kenya has different rules.
Somalia has none. This is a legal requirement in each market, not optional.

The practical recommendation is to design the data model to be country-aware
from the start — even if you only operate in Nigeria today — so you are not
doing a migration later. Add the `countryCode` field to all relevant models now,
default it to `NG`, and add the multi-country logic when you are ready to expand.

---

## 4. Recommendation Engine

The Rust recommendations service always returns an empty array. The TypeScript
fallback in `catalog-service.ts` returns the 12 newest products to everyone,
regardless of who they are or what they have bought. This is not a
recommendation engine — it is a product list.

A real recommendation engine has three layers. The first is collaborative
filtering — users who bought X also bought Y. This requires order history data
and a model that updates periodically. The minimum viable version is an offline
batch job that runs nightly, computes co-purchase frequencies across all orders,
stores them in a `ProductRelation` table, and serves them at read time. No ML
required for this step.

The second layer is personalization — showing each user products based on their
own browsing and purchase history. This requires storing click and view events
(which the analytics service can capture) and using them to rank the
collaborative filtering results for each individual user.

The third layer is real-time signals — adjusting recommendations based on
trending products, flash sales, and inventory levels. This is where the Rust
service becomes important, since it can hold the ranking model in memory and
re-score results in microseconds.

Start with layer one. It will produce measurably better results than newest
products, requires no ML expertise, and can be built entirely in TypeScript
with the existing Prisma schema. Move to layers two and three when you have
enough data to make personalization meaningful (rough threshold: 10,000 orders).

---

## 5. Reporting and Finance Exports

Sellers currently have no way to download their financial data. The ledger is
fully populated — every sale, commission, penalty, escrow entry, and payout is
recorded in `SellerLedgerEntry`. But there is no endpoint to export it.

This is a support burden issue as much as a feature gap. Without export tooling,
sellers email support asking for their transaction history, which is manual work.

What to build:

A seller procedure that accepts a date range and returns all ledger entries for
that seller as a downloadable CSV. The CSV should include columns for date,
type (SALE, COMMISSION, PENALTY, PAYOUT, REFUND), amount, order reference, and
running balance. This is the equivalent of a bank statement.

An admin procedure that generates a platform-wide settlement report — total GMV,
total commissions earned, total payouts disbursed, and total refunds issued for
a given period. This is what the finance team needs for reconciliation.

Both exports should be generated as files and either returned as a download or
uploaded to S3 and returned as a signed URL, since large date ranges can produce
large files that should not be held in memory.

The order summary and payout history pages on the frontend already show this
data in paginated form — the export is just a bulk version of the same queries
without the pagination limit.

---

## Suggested Rollout Order

Do not try to tackle all of this at once. A suggested order based on business
impact and engineering dependency:

First, reporting and finance exports — highest seller satisfaction payoff for
the least engineering effort, since all the data already exists.

Second, mobile app — biggest reach expansion, especially in Nigeria where mobile
is the dominant commerce surface. Start with Android only.

Third, Rust inventory service — the one that causes the most damaging failures
under load. Overselling inventory is a trust-destroying customer experience.

Fourth, recommendation engine layer one — co-purchase collaborative filtering.
Meaningful uplift in conversion with modest engineering effort.

Fifth, multi-country foundation — add country codes to the data model before
you have real data in it. Much cheaper than migrating later.

Sixth, remaining Rust services — in the order: search, fraud, analytics,
recommendations (replace layer one), logistics routing.

Push notifications and the deeper recommendation layers come after you have a
mobile app to send them to.

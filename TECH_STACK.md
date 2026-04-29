# Tech Stack & Mobile Support

## The Guiding Principle: API-First

The single most important architectural decision for multi-platform support is this:

> **Business logic lives in the module layer. The HTTP layer is just a transport adapter.**

This means the same module functions power:
- The Next.js web app (via Server Actions and API Routes)
- The React Native mobile app (via the same API Routes)
- Any future third-party integrations (via the same API)

Nothing is duplicated. The web and mobile share one backend.

---

## Full Stack Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                            CLIENTS                                   │
│   Next.js Web App (Buyer, Seller Hub, Admin, Affiliate)             │
│   React Native Mobile App (Buyer App, Delivery Agent App)           │
└──────────────┬──────────────────────────────┬───────────────────────┘
               │  Server Actions (web only)    │  tRPC / REST (mobile)
               ▼                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Next.js (App Router)                            │
│            API Routes  ·  Server Actions  ·  SSR Pages              │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│               TypeScript Module Layer (Business Logic)               │
│   catalog · orders · payments · logistics · seller-hub · ads ...     │
│   (some modules are thin adapters that call Rust services below)     │
└────┬──────────────┬──────────────┬──────────────┬────────────────────┘
     │              │              │              │
     ▼              ▼              ▼              ▼
┌─────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────────────┐
│Postgres │  │  Redis   │  │  Rust    │  │  Rust Services         │
│(Prisma) │  │Cache/    │  │ Search   │  │  Auction · Fraud ·     │
│         │  │Queue/    │  │(Tantivy) │  │  Inventory · Recs ·    │
│         │  │Sessions  │  │          │  │  Image Processor       │
└─────────┘  └──────────┘  └──────────┘  └────────────────────────┘
```

---

## Web Stack (TypeScript / Next.js)

| Layer | Technology | Why |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | SSR, streaming, Server Actions, file routing |
| **Language** | TypeScript | Type safety across all module boundaries |
| **Styling** | Vanilla CSS (CSS Custom Properties) | Zero runtime overhead, full design control |
| **ORM** | Prisma | Type-safe queries, auto-generated migrations |
| **Database** | PostgreSQL | ACID transactions, relational integrity |
| **Cache / Sessions** | Redis (Upstash) | Cart, sessions, rate limiting |
| **Job Queue** | BullMQ (Redis-backed) | Async: emails, settlements, fraud queue |
| **API Layer** | tRPC | End-to-end type safety between server and client |
| **Auth** | NextAuth.js v5 | Session management, OAuth, JWT |
| **Validation** | Zod | Runtime schema validation, shared with mobile |
| **File Storage** | Cloudflare R2 | S3-compatible, CDN-ready |
| **Email** | Resend | Clean API, React Email templates |
| **Monitoring** | OpenTelemetry + Grafana | Tracing, metrics, alerting |

## Rust Services Stack

| Service | Framework | Key Crates | Interface |
|---|---|---|---|
| **Search** | Axum | Tantivy, serde | REST |
| **Ad Auction** | Axum | tonic (gRPC), prost | gRPC |
| **Inventory Reservation** | Axum | redis-rs, sqlx | REST |
| **Fraud Detection** | Axum | Candle (ML), serde | REST |
| **Recommendations** | Axum | qdrant-client, nalgebra | REST |
| **Image Processor** | Axum | image, webp | REST |

All Rust services share: `tokio` (async runtime), `tracing` (structured logging), `serde` (serialization).

---

## Mobile Stack

| Layer | Technology | Why |
|---|---|---|
| **Framework** | React Native + Expo | Cross-platform (iOS + Android), fastest iteration |
| **Language** | TypeScript | Shared type contracts with the web backend |
| **Navigation** | Expo Router | File-based routing, mirrors Next.js conventions |
| **State** | Zustand | Lightweight, no boilerplate |
| **API Client** | tRPC React Query client | Same types as the server, zero manual type sync |
| **Auth** | Expo SecureStore + JWT | Secure token storage on device |
| **Push Notifications** | Expo Notifications + FCM/APNs | Unified push across iOS and Android |
| **Payments** | Stripe React Native SDK / Paystack SDK | PCI-compliant in-app payments |
| **Camera** | Expo Camera | Delivery agent proof-of-delivery photos |
| **Maps** | React Native Maps | Delivery tracking map view |

---

## How Web and Mobile Share Code

The key is the `@packages` shared layer — a local monorepo workspace that both the web app and mobile app import from.

### Repository Structure

```
/
├── apps/
│   ├── web/                  # Next.js web application
│   └── mobile/               # React Native / Expo application
│
├── services/               # Rust microservices (Cargo workspace)
│   ├── search/               # Axum + Tantivy
│   ├── auction/              # Axum + gRPC (Ad Auction)
│   ├── inventory/            # Axum + Redis (Flash Sale Reservation)
│   ├── fraud/                # Axum + Candle (ML scoring)
│   ├── recommendations/      # Axum + Qdrant
│   └── image-processor/      # Axum + image crate
│
└── packages/               # Shared TypeScript packages
    ├── api/                  # tRPC router definitions (shared contract)
    ├── types/                # Shared TypeScript types and Zod schemas
    ├── config/               # Shared ESLint, TypeScript configs
    └── db/                   # Prisma schema and client
```

**Package manager**: `pnpm workspaces` — fast installs, efficient disk usage.

### The Shared API Contract

```typescript
// packages/api/src/routers/orders.ts
// Defined ONCE. Consumed by both web and mobile.

export const ordersRouter = router({
  create: protectedProcedure
    .input(CreateOrderSchema)
    .mutation(async ({ input, ctx }) => {
      return createOrder(input, ctx.userId)   // calls the orders module
    }),

  getById: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ input }) => {
      return getOrderById(input.orderId)
    }),
})
```

The web app uses this via Server Actions or the tRPC React client.
The mobile app uses the identical tRPC React Query client.
**Same types. Same validation. One source of truth.**

---

## Mobile App Breakdown

There are three distinct mobile surfaces, each a different app or deep section:

### 1. Buyer App
The primary consumer-facing app. Equivalent to the Jumia mobile app.

**Screens:**
- Home (carousels, flash sales, categories)
- Search & Browse (with filters)
- Product Detail (images, reviews, add to cart)
- Cart & Checkout
- Order Tracking (map view, status timeline)
- Account (order history, wishlist, addresses)
- JumiaPay Wallet

### 2. Delivery Agent App
A lightweight app for last-mile delivery staff.

**Screens:**
- Today's Deliveries (sorted by route)
- Package Detail (QR scan to confirm pickup)
- Navigation (hand-off to Maps)
- Proof of Delivery (camera capture)
- Failed Delivery Reporting

### 3. Seller Hub (Mobile)
A trimmed-down seller dashboard for on-the-go management.

**Screens:**
- Sales Overview (daily/weekly revenue)
- Order Queue (new orders requiring action)
- Product Inventory (stock levels, quick edit)
- Notifications (SLA alerts)

---

## API Design: REST vs tRPC vs GraphQL

We use **tRPC** as the primary API layer.

| Concern | tRPC | REST | GraphQL |
|---|---|---|---|
| **Type Safety** | End-to-end, automatic | Manual OpenAPI spec | Schema definition required |
| **Mobile Support** | tRPC client works in React Native | Standard, works everywhere | Apollo or URQL client |
| **Learning Curve** | Low if you know TypeScript | Low | Moderate |
| **Flexibility** | Best for web + React Native | Best for external APIs | Best for complex data fetching |
| **Our Choice** | Internal APIs (web + mobile) | Webhooks + external integrations | Not needed |

**Rule**: External integrations (payment webhooks, logistics partner callbacks) are plain REST `api/` routes. Internal consumption is always tRPC.

---

## Authentication Strategy

### Web
- NextAuth.js v5 handles session creation.
- Sessions stored in a signed JWT (stored in `httpOnly` cookie).
- OAuth: Google, Facebook.

### Mobile
- Mobile posts credentials to `/api/auth/mobile` (a dedicated REST endpoint).
- Server returns an access token (JWT, 15min TTL) and a refresh token (30 days).
- Access token stored in **Expo SecureStore** (encrypted, not AsyncStorage).
- Refresh token rotation on every use.

### Role Enforcement
- Every tRPC procedure receives the session context.
- A `protectedProcedure` middleware validates the JWT and attaches the user + role.
- Role-specific middleware: `sellerProcedure`, `adminProcedure`, `agentProcedure`.

```typescript
// shared pattern used by every protected route
export const sellerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'SELLER') throw new TRPCError({ code: 'FORBIDDEN' })
  return next({ ctx: { ...ctx, seller: ctx.user.sellerProfile } })
})
```

---

## Offline & Performance Strategy (Mobile)

Mobile networks in emerging markets are unreliable. The mobile app must handle this gracefully.

| Strategy | Implementation |
|---|---|
| **Optimistic Updates** | tRPC React Query optimistic mutations for cart actions |
| **Data Caching** | React Query's cache with stale-while-revalidate |
| **Offline Cart** | Cart state persisted to device storage via MMKV |
| **Image Optimization** | Expo Image with progressive loading and disk caching |
| **Bundle Splitting** | Expo Router lazy loads screens on navigation |
| **API Retries** | tRPC client configured with exponential backoff |

---

## Infrastructure & DevOps

| Concern | Tool | Notes |
|---|---|---|
| **Hosting (Web)** | Vercel or Railway | Zero-config Next.js deployment |
| **Database** | Supabase (managed Postgres) or Railway | Managed, includes connection pooling |
| **Redis** | Upstash (serverless Redis) | Per-request billing, no idle cost |
| **Mobile CI/CD** | EAS Build (Expo) | Cloud builds for iOS and Android |
| **Environment Config** | `.env` + Doppler | Secret management across environments |
| **Error Tracking** | Sentry (web + React Native SDK) | Unified error tracking across platforms |

---

## Summary: What Gets Built Once vs What Gets Built Twice

| Concern | Built Once? |
|---|---|
| Business logic (modules) | Yes — one codebase |
| Database schema | Yes — one Prisma schema |
| API definitions (tRPC routers) | Yes — one shared package |
| TypeScript types | Yes — one shared package |
| Validation schemas (Zod) | Yes — one shared package |
| UI components | No — web uses CSS, mobile uses RN StyleSheet |
| Navigation | No — Next.js router vs Expo Router |
| Auth session handling | No — cookies (web) vs SecureStore (mobile) |

The split is clean: **data and logic are shared, presentation is not**. This is the correct boundary.

# Architecture: Modular Monolith with Vertical Slices

## The Problem We Are Solving

24 services. One codebase. A 2-week build timeline.

**Microservices** would introduce too much infrastructure overhead (service discovery, network latency, distributed transactions). A traditional **monolith** would result in a tangled mess where touching the Cart breaks the Seller Hub.

The answer is a **Modular Monolith**: one deployable unit, but with strict internal boundaries so each service can be built, tested, and eventually extracted in complete isolation.

---

## Core Principle: Every Module Is a Bounded Context

Each of the 24 services maps to one **module**. A module:

- Owns its own business logic.
- Owns its own database tables (even though they share one Prisma schema).
- Exposes a **single public interface** (`index.ts`). Nothing inside is accessible from outside.
- Communicates with other modules **only through events**, never through direct internal imports.

This means you can build the `orders` module without caring how `inventory` works internally. You just fire an event. That is the key.

---

## The Rule Set (Non-Negotiable)

```
RULE 1: A module NEVER imports from another module's internal files.
         ✅  import { reserveStock } from '@/modules/inventory'
         ❌  import { _reserveStockQuery } from '@/modules/inventory/repository/stock'

RULE 2: Cross-module communication happens only through the event bus.
         Module A fires an event → Event bus → Module B reacts.

RULE 3: The shared kernel is kept minimal and read-only.
         It contains: db client, types contracts, utility functions.
         It contains NO business logic.

RULE 4: Each module's public API is defined in its index.ts.
         If it is not exported from index.ts, it does not exist to the outside world.

RULE 5: HTTP (Next.js App Router) is a thin adapter layer only.
         Route handlers call module functions. They contain zero business logic.
```

---

## Repository Structure (Monorepo)

The project is a **pnpm monorepo** with three top-level areas:

```
/
├── apps/
│   ├── web/                          # Next.js web app
│   │   └── src/
│   │       ├── app/                  # App Router — thin HTTP layer only
│   │       │   ├── (marketplace)/    # Buyer-facing pages
│   │       │   ├── (seller)/         # Seller Hub pages
│   │       │   ├── (logistics)/      # Delivery agent app
│   │       │   ├── (admin)/          # Admin portal
│   │       │   ├── (affiliate)/      # JForce affiliate portal
│   │       │   └── api/              # Webhooks + external integrations
│   │       ├── modules/              # ← THE CORE. Each = one bounded context.
│   │       │   ├── marketplace/
│   │       │   ├── catalog/
│   │       │   ├── orders/
│   │       │   ├── inventory/        # TS adapter → calls Rust Inventory Service
│   │       │   ├── payments/
│   │       │   ├── seller-hub/
│   │       │   ├── seller-finance/
│   │       │   ├── logistics/
│   │       │   ├── advertising/      # TS adapter → calls Rust Ad Auction Service
│   │       │   ├── promotions/
│   │       │   ├── affiliate/
│   │       │   ├── disputes/
│   │       │   ├── trust/            # TS adapter → calls Rust Fraud Service
│   │       │   ├── search/           # TS adapter → calls Rust Search Service
│   │       │   ├── recommendations/  # TS adapter → calls Rust Recommendation Service
│   │       │   ├── iam/
│   │       │   ├── notifications/
│   │       │   ├── analytics/
│   │       │   ├── admin/
│   │       │   ├── cms/
│   │       │   └── media/            # TS adapter → calls Rust Image Processor
│   │       ├── shared/               # Shared kernel (db client, event bus, utils)
│   │       └── infra/                # Redis, BullMQ, R2, email adapters
│   │
│   └── mobile/                       # React Native / Expo
│
├── services/                         # Rust microservices (Cargo workspace)
│   ├── search/                       # Axum + Tantivy
│   ├── auction/                      # Axum + gRPC (Ad Auction Engine)
│   ├── inventory/                    # Axum + Redis (Flash Sale Reservation)
│   ├── fraud/                        # Axum + Candle (ML risk scoring)
│   ├── recommendations/              # Axum + Qdrant (vector similarity)
│   └── image-processor/              # Axum + image crate
│
└── packages/                         # Shared TypeScript packages
    ├── api/                          # tRPC routers
    ├── types/                        # Shared types + Zod schemas
    ├── config/                       # Shared ESLint, TS configs
    └── db/                           # Prisma schema and client
```

### Key Distinction: TS Modules vs Rust Services

Some TypeScript modules are **thin adapter clients** to a Rust service. They own no business logic — they translate module calls into HTTP/gRPC calls to the Rust service and return the result.

| TS Module | Rust Service | Protocol |
|---|---|---|
| `modules/search/` | `services/search/` | REST |
| `modules/advertising/` | `services/auction/` | gRPC |
| `modules/inventory/` (reservation only) | `services/inventory/` | REST |
| `modules/trust/` (fraud scoring) | `services/fraud/` | REST |
| `modules/recommendations/` | `services/recommendations/` | REST |
| `modules/media/` (image processing) | `services/image-processor/` | REST |

All other modules are **pure TypeScript** with direct Prisma access.

---

## Inside Every Module (Vertical Slice)

Every module follows the same internal structure. This is the vertical slice pattern.

```
modules/orders/
│
├── domain/                       # Business logic — pure functions, no I/O
│   ├── order.entity.ts           # Order type, state machine
│   ├── order.service.ts          # Core business rules
│   └── order.errors.ts           # Domain-specific errors
│
├── repository/                   # Database access — all SQL/Prisma here
│   └── order.repository.ts
│
├── events/                       # Events this module fires and consumes
│   ├── order.events.ts           # Event type definitions
│   └── order.listeners.ts        # Reactions to events from other modules
│
├── api/                          # Next.js Server Actions or API handlers
│   └── order.actions.ts
│
├── types.ts                      # Public type contracts for other modules
└── index.ts                      # ← THE ONLY FILE OTHER MODULES CAN IMPORT
```

### What `index.ts` looks like

```typescript
// modules/orders/index.ts
// This is the ONLY public surface of the orders module.

export { createOrder } from './domain/order.service'
export { getOrderById, getOrdersByUser } from './repository/order.repository'
export type { Order, OrderStatus, CreateOrderInput } from './types'
```

---

## The Event Bus (Cross-Module Communication)

Instead of `orders` calling `inventory` directly, `orders` fires an event and `inventory` listens for it.

```
Order Placed
    │
    ▼
orders module fires: order.created { orderId, lineItems }
    │
    ├──► inventory module listens → reserves stock
    ├──► notifications module listens → sends "Order Confirmed" email
    └──► analytics module listens → records conversion event
```

```
Payment Confirmed
    │
    ▼
payments module fires: payment.confirmed { orderId, amount }
    │
    ├──► orders module listens → transitions order to PROCESSING
    └──► seller-finance module listens → creates a pending ledger entry
```

This is how you add behavior to a new event without modifying existing modules. Zero coupling.

---

## The Shared Database Schema

One Prisma schema. Each module owns its tables. The canonical schema is fully defined in `docs/01-DATABASE_SCHEMA.md`.
The rule: a module's repository only queries its own tables.

```
prisma/schema.prisma

# IAM Domain
model User              # roles: BUYER / SELLER / AGENT / MODERATOR / ADMIN
model Session
model UserAddress
model OAuthAccount

# Catalog Domain
model Category          # self-referencing (parent_id), stores commission_rate
model Brand
model Product
model ProductVariant    # the purchasable unit — has its own SKU, price, stock
model ProductMedia

# Cart & Order Domain
model Cart
model CartItem
model Order
model OrderPackage      # one per seller within an order
model OrderLine         # one per variant within a package

# Inventory Domain
model Warehouse
model StockLevel        # qty_available = qty_on_hand - qty_reserved
model StockReservation  # flash sale / checkout hold tokens

# Payment Domain
model Payment
model Wallet
model WalletTransaction
model Refund

# Seller Domain
model Seller
model SellerDocument

# Seller Finance Domain
model SellerLedgerEntry # immutable: SALE / COMMISSION / AD_SPEND / PENALTY / REFUND
model SellerStatement   # weekly aggregate of ledger entries
model Payout            # disbursement to seller bank account

# Logistics Domain
model Warehouse
model DeliveryAgent
model Shipment
model ShipmentEvent
model PickupStation
model ReturnShipment

# Advertising Domain
model AdCampaign
model AdGroup
model AdKeyword
model AdImpression
model AdClick
model AdConversion

# Promotions Domain
model Promotion
model Coupon
model FlashSale

# Affiliate Domain
model AffiliateAgent
model ReferralLink
model ReferralClick
model Commission

# Dispute Domain
model Dispute
model DisputeMessage
model DisputeEvidence
model DisputeResolution

# Review Domain
model Review
model ReviewMedia

# CMS Domain
model Banner
model Page

# Notification Domain
model NotificationPreference
model NotificationLog

# Event Infrastructure
model EventLog          # persists all bus events before delivery (at-least-once)
```

---

## Module Build Order (Dependency Graph)

Build modules in this order to avoid circular dependencies. Each row depends on the rows above it.

```
Layer 0 (Foundation):      iam, media, cms
Layer 1 (Catalog):         catalog (depends on: iam, media)
Layer 2 (Commerce Core):   inventory, payments, promotions (depends on: catalog, iam)
Layer 3 (Transactions):    orders, cart (depends on: catalog, inventory, payments, promotions)
Layer 4 (Fulfillment):     logistics (depends on: orders, inventory)
Layer 5 (Revenue):         advertising, affiliate, seller-finance (depends on: orders, catalog, payments)
Layer 6 (Seller Tools):    seller-hub (depends on: catalog, inventory, orders, advertising, seller-finance)
Layer 7 (Trust):           disputes, trust (depends on: orders, logistics, iam)
Layer 8 (Intelligence):    search, recommendations, analytics (depends on: catalog, orders, iam)
Layer 9 (Ops):             notifications, admin (depends on: all layers)
```

---

## Technology Decisions

### TypeScript Layer (Next.js Monolith)

| Concern | Choice | Reason |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | SSR, Server Actions, file-based routing |
| **Language** | TypeScript | Type safety across all module boundaries |
| **ORM** | Prisma + PostgreSQL | Relational integrity, type-safe queries |
| **Cache** | Redis (Upstash) | Sessions, cart state, rate limiting |
| **Job Queue** | BullMQ (Redis-backed) | Async: notifications, settlements, fraud queue |
| **API** | tRPC | End-to-end type safety for web and mobile |
| **Auth** | NextAuth.js v5 | Sessions, OAuth, JWT |
| **Validation** | Zod | Runtime schema validation shared with mobile |
| **Media Storage** | Cloudflare R2 | S3-compatible, CDN-ready |
| **Email** | Resend | Simple API, React Email templates |
| **CSS** | Vanilla CSS (CSS variables) | No framework bloat, full design control |
| **Package Manager** | pnpm workspaces | Monorepo support, fast installs |

### Rust Layer (Internal Microservices)

| Service | Stack | Reason |
|---|---|---|
| **Search** | Axum + Tantivy | Sub-10ms full-text search at scale |
| **Ad Auction** | Axum + gRPC (tonic) | Real-time bidding < 3ms per request |
| **Inventory Reservation** | Axum + Redis atomic ops | Thundering herd on flash sales |
| **Fraud Detection** | Axum + Candle | Real-time ML inference at checkout |
| **Recommendations** | Axum + Qdrant | Vector similarity computation |
| **Image Processing** | Axum + image crate | CPU-intensive resize/WebP conversion |

---

## How to Build Each Part Incrementally

Because every module has the same internal shape and only communicates via events, the process is always the same:

```
Step 1: Define the module's types.ts (what does it produce and consume?)
Step 2: Write the Prisma schema additions for this module's tables.
Step 3: Implement the domain/ business logic (pure functions, no DB calls).
Step 4: Implement the repository/ (data access).
Step 5: Wire the events (what does this module emit? what does it listen to?)
Step 6: Expose the public index.ts.
Step 7: Build the app/ page that uses the module.
```

At no point does building one module require another module to be complete. If `logistics` is not built yet, `orders` fires `order.created` into the event bus and `logistics` simply does not have a listener yet. The system still works.

---

## Scalability Exit Ramp

If this were to go to production at scale, each module can be extracted into its own microservice because:

- It has a clear public API (`index.ts` becomes the service interface).
- It already communicates only via events (events become message queue topics).
- It owns its own tables (tables become a separate database).

No rewrites required. The modularity that prevents bloat during development is the same property that enables extraction later.

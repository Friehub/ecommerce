# Scope Document — Contest Build

This document defines exactly what is and is not being built.
If a feature is not in the IN SCOPE list, it does not get built.
Write it in the BACKLOG and keep moving.

---

## IN SCOPE (Must Ship by Day 14)

### Buyer
- User registration, login (email + Google OAuth)
- Browse by category, search (PostgreSQL FTS)
- Product detail page (variants, images, reviews)
- Cart (add/update/remove, apply coupon)
- Checkout (address, delivery, payment method)
- Paystack card + JumiaPay wallet + Pay on Delivery
- Order detail and tracking (status timeline)
- Order cancellation (pre-shipment)
- Return request (post-delivery)
- Verified purchase reviews
- Open a dispute + upload evidence

### Seller Hub
- Seller registration + KYC document upload
- Create and edit product listings
- View and confirm incoming orders
- Mark as shipped (enter tracking number)
- View stock levels
- Create SPONSORED_PRODUCT ad campaign
- View campaign impressions, clicks, spend
- View weekly settlement statement

### Delivery Agent
- Login, view today's deliveries
- Mark picked up, mark delivered + proof photo
- Report failed delivery

### Admin Portal
- Approve / reject seller KYC
- Suspend users
- Dispute queue + issue ruling
- CMS banner management
- Platform metrics (GMV, orders, active sellers)
- Fraud queue + action

### Revenue
- Commission deducted in settlement
- Ad spend deducted on click
- Affiliate referral links + click attribution + commission

### Notifications
- Email (Resend) for key order events
- In-app notification inbox

### Infrastructure
- TypeScript stubs for all 6 Rust services
- BullMQ event bus
- Full Prisma schema + migrations + seed data

---

## OUT OF SCOPE (Do Not Build)

| Feature | Status |
|---|---|
| React Native mobile apps | Backlog |
| Rust Search (Tantivy) | Backlog — TS stub active |
| Rust Ad Auction (gRPC) | Backlog — SQL stub active |
| Rust Inventory (flash sale concurrency) | Backlog — TS Redis stub active |
| Rust Fraud Detection (ML) | Backlog — rule-based TS active |
| Rust Recommendations (Qdrant) | Backlog — top-sellers stub active |
| Rust Image Processor | Backlog — sharp (Node.js) active |
| SMS notifications | Backlog |
| Push notifications | Backlog (no mobile app) |
| OpenTelemetry full tracing | Backlog — health checks only |
| Seller Brand Store | Backlog |
| Multi-currency | Backlog — NGN only |
| Buyer wishlist | Backlog |
| Product comparison | Backlog |
| Flash sale real-time countdown | Backlog |
| Loyalty / rewards system | Backlog |
| Seller CSV bulk import | Backlog |
| A/B testing | Backlog |

---

## BACKLOG (Post-Contest Ideas)

Add ideas here instead of building them now.

- Rust services (all 6)
- React Native Buyer App + Delivery Agent App
- SMS via Africa's Talking / Termii
- ML Recommendations (ALS + Qdrant)
- Seller Brand Store
- Multi-currency (USD, GHS, KES)
- Flash sale real-time countdown (WebSocket)
- Buyer wishlist with price drop alerts
- Bulk product CSV import for sellers
- A/B testing on homepage banners
- International shipping

---

## Decision Rule

1. Feature in IN SCOPE? → Build it.
2. Feature in OUT OF SCOPE? → Do not build it.
3. Feature not mentioned anywhere? → Add to BACKLOG, do not build it.

A feature that takes 2 hours to build costs more than 2 hours.
It costs the focus needed to finish the planned work on time.

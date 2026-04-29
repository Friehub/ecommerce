# Ecommerce Platform — System Documentation

This document is the canonical reference for every service, system, and mechanism that
constitutes a production-grade ecommerce platform (modeled after Jumia). It is the foundation
for all design, architecture, and implementation decisions.

---

## Full System Architecture

```
╔══════════════════════════════════════════════════════════════════════════════════════╗
║                                    CLIENTS                                           ║
║                                                                                      ║
║   ┌─────────────────────────────────────┐   ┌────────────────────────────────────┐  ║
║   │         Next.js Web App             │   │    React Native Mobile App         │  ║
║   │                                     │   │        (Post-Contest)              │  ║
║   │  (marketplace) · (seller) · (admin) │   │  Buyer App · Delivery Agent App    │  ║
║   │  (logistics)   · (affiliate)        │   │                                    │  ║
║   └──────────────────┬──────────────────┘   └─────────────────┬──────────────────┘  ║
╚═════════════════════╪════════════════════════════════════════╪════════════════════╝
                      │  Server Actions                        │  tRPC / REST
                      │  (web-only)                            │  (shared contract)
                      ▼                                        ▼
╔══════════════════════════════════════════════════════════════════════════════════════╗
║                         NEXT.JS APP ROUTER (HTTP Layer)                              ║
║                   API Routes  ·  Server Actions  ·  SSR Pages                        ║
╚══════════════════════════════════════════════════════════════╦═══════════════════════╝
                                                               ║
                                                               ▼
╔══════════════════════════════════════════════════════════════════════════════════════╗
║                     TYPESCRIPT MODULE LAYER  (Business Logic)                        ║
║                                                                                      ║
║  ┌──────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐  ║
║  │   iam    │ │ catalog │ │inventory │ │  orders  │ │ payments │ │  logistics  │  ║
║  └──────────┘ └─────────┘ └─────┬────┘ └────┬─────┘ └──────────┘ └─────────────┘  ║
║  ┌──────────┐ ┌─────────┐       │            │      ┌──────────┐ ┌─────────────┐  ║
║  │seller-hub│ │seller-  │       │            │      │ disputes │ │    trust    │  ║
║  │          │ │finance  │       │ (adapter)  │      └──────────┘ │  (adapter)  │  ║
║  └──────────┘ └─────────┘       │            │                   └─────────────┘  ║
║  ┌──────────┐ ┌─────────┐       │            │      ┌──────────┐ ┌─────────────┐  ║
║  │  search  │ │  recs   │       │            │      │   ads    │ │  affiliate  │  ║
║  │(adapter) │ │(adapter)│       │            │      │(adapter) │ │             │  ║
║  └──────┬───┘ └────┬────┘       │            │      └────┬─────┘ └─────────────┘  ║
║  ┌──────┴───────────┴───────────┴────────────┴───────────┴──────────────────────┐  ║
║  │             notifications · analytics · admin · cms · media (adapter)        │  ║
║  └────────────────────────────────────────────────────────────────────────────── ┘  ║
╚═══════════╦═══════════════════════════════════════════════╦══════════════════════════╝
            ║  Internal HTTP / gRPC calls                   ║  Prisma ORM
            ║  (adapters → Rust services)                   ║
            ▼                                               ▼
╔═══════════════════════════════╗      ╔═══════════════════════════════════════════════╗
║    RUST SERVICES LAYER        ║      ║            DATA LAYER                         ║
║                               ║      ║                                               ║
║  ┌───────────────────────┐    ║      ║  ┌───────────────────┐  ┌───────────────┐    ║
║  │ search  (Axum+Tantivy)│    ║      ║  │   PostgreSQL 16   │  │  Redis 7      │    ║
║  │         REST          │    ║      ║  │   (Prisma ORM)    │  │  Cache        │    ║
║  └───────────────────────┘    ║      ║  │   Primary store   │  │  Sessions     │    ║
║  ┌───────────────────────┐    ║      ║  │   for all modules │  │  Rate limits  │    ║
║  │ auction (Axum+tonic)  │    ║      ║  └───────────────────┘  │  BullMQ jobs  │    ║
║  │         gRPC          │    ║      ║                          └───────────────┘    ║
║  └───────────────────────┘    ║      ║  ┌───────────────────┐                       ║
║  ┌───────────────────────┐    ║      ║  │  Cloudflare R2    │                       ║
║  │inventory(Axum+redis)  │    ║      ║  │  Product images   │                       ║
║  │         REST          │    ║      ║  │  Delivery proofs  │                       ║
║  └───────────────────────┘    ║      ║  │  KYC documents    │                       ║
║  ┌───────────────────────┐    ║      ║  └───────────────────┘                       ║
║  │ fraud  (Axum+Candle)  │    ║      ║                                               ║
║  │         REST          │    ║      ║  ┌───────────────────┐                       ║
║  └───────────────────────┘    ║      ║  │      Qdrant       │                       ║
║  ┌───────────────────────┐    ║      ║  │  Vector store for │                       ║
║  │  recs  (Axum+Qdrant)  │    ║      ║  │  recommendations  │                       ║
║  │         REST          │    ║      ║  └───────────────────┘                       ║
║  └───────────────────────┘    ║      ╚═══════════════════════════════════════════════╝
║  ┌───────────────────────┐    ║
║  │image-proc (Axum+img)  ║    ║      ╔═══════════════════════════════════════════════╗
║  │         REST          │    ║      ║         ASYNC EVENT BUS (BullMQ)              ║
║  └───────────────────────┘    ║      ║                                               ║
╚═══════════════════════════════╝      ║  order.created  → inventory, notifications    ║
                                       ║  payment.confirmed → orders, seller-finance   ║
                                       ║  shipment.delivered → orders, notifications   ║
                                       ║  dispute.resolved → payments, orders          ║
                                       ║  ad.click → seller-finance, analytics         ║
                                       ║  (all events persisted to EventLog table)     ║
                                       ╚═══════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════════════════════════╗
║                          EXTERNAL INTEGRATIONS                                       ║
║                                                                                      ║
║   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────────────┐  ║
║   │    Paystack      │  │     Resend       │  │      3PL Logistics Partners       │  ║
║   │  Card payments   │  │  Email delivery  │  │  (GIG Logistics, DHL, Others)    │  ║
║   │  Transfers       │  │  React Email     │  │  Webhook: shipment status updates │  ║
║   │  Webhook: charge │  │  templates       │  │                                  │  ║
║   │  .success etc.   │  └──────────────────┘  └──────────────────────────────────┘  ║
║   └──────────────────┘                                                               ║
╚══════════════════════════════════════════════════════════════════════════════════════╝

Key:
  (adapter)  = TypeScript module that calls a Rust service via HTTP/gRPC
  All other TypeScript modules = pure TS with direct Prisma access
  Contest: Rust services run as TypeScript stubs behind the same interface
```

---

## Table of Contents

1. [The Ecosystem Overview](#1-the-ecosystem-overview)
2. [Marketplace Service](#2-marketplace-service)
3. [Catalog Service](#3-catalog-service)
4. [Order Management System (OMS)](#4-order-management-system-oms)
5. [Inventory Management](#5-inventory-management)
6. [Cart & Checkout](#6-cart--checkout)
7. [Payment Service (JumiaPay)](#7-payment-service-jumiapay)
8. [Seller Hub](#8-seller-hub)
9. [Seller Finance & Settlement](#9-seller-finance--settlement)
10. [Logistics & Fulfillment](#10-logistics--fulfillment)
11. [Advertising Platform (Retail Media)](#11-advertising-platform-retail-media)
12. [Promotions & Campaign Engine](#12-promotions--campaign-engine)
13. [Affiliate Platform (JForce)](#13-affiliate-platform-jforce)
14. [Dispute Resolution](#14-dispute-resolution)
15. [Trust & Safety](#15-trust--safety)
16. [Search & Discovery](#16-search--discovery)
17. [Recommendation Engine](#17-recommendation-engine)
18. [Identity & Access Management (IAM)](#18-identity--access-management-iam)
19. [Notification Gateway](#19-notification-gateway)
20. [Analytics & Reporting](#20-analytics--reporting)
21. [Admin & Ops Portal](#21-admin--ops-portal)
22. [Content Management System (CMS)](#22-content-management-system-cms)
23. [Media & CDN Service](#23-media--cdn-service)
24. [How All Services Connect](#24-how-all-services-connect)

---

## 1. The Ecosystem Overview

A production ecommerce platform is not a single application. It is a **system of interconnected services**, each with a distinct domain and responsibility. Breaking them down:

| Service Layer | Services Included |
|---|---|
| **Buyer-Facing** | Marketplace, Cart & Checkout, Search, Recommendations |
| **Product** | Catalog, Media |
| **Transactional** | OMS, Inventory, Payment |
| **Seller-Facing** | Seller Hub, Seller Finance, Brand Stores |
| **Logistics** | WMS, Last-Mile Delivery, Pickup Stations, Returns |
| **Revenue** | Advertising, Promotions, Affiliate |
| **Trust** | Dispute Resolution, Fraud Detection, Reviews, KYC |
| **Platform Ops** | IAM, Notifications, Analytics, Admin Portal, CMS |

---

## 2. Marketplace Service

The storefront is the primary buyer interface. It is where all other services converge into a unified shopping experience.

**Core Responsibilities:**
- Homepage: Banners (CMS-driven), flash sale countdowns, and curated carousels.
- Category Pages: Faceted filtering (by price, brand, rating, shipping speed).
- Product Detail Page (PDP): Images, description, specs, variants, seller info, and reviews.
- Official Stores: Branded micro-storefronts for verified brands (e.g., Samsung Store, Nike Store).

**Key Mechanisms:**
- **Flash Sales**: Time-boxed, limited-quantity listings with countdown timers. Inventory is reserved on flash sale start.
- **Deal of the Day**: Curated single SKU promoted at the top of the homepage.
- **Bundles**: Multiple SKUs sold together at a combined price.

---

## 3. Catalog Service

The catalog is the source of truth for all product data on the platform.

**Core Responsibilities:**
- Product creation, editing, and versioning.
- Structured attribute management per category (e.g., RAM/Storage for phones, Wattage for appliances).
- Category taxonomy management (tree structure).
- SKU and variant management (e.g., Color: Red, Blue; Size: M, L, XL).

**Key Mechanisms:**
- **Canonical Products**: A single product entity can be sold by multiple sellers (like Amazon's ASIN model). Sellers attach their offers (price, stock) to the canonical listing.
- **Attribute Templates**: Each category has a predefined schema of required and optional attributes.
- **Content Quality Score**: Products are scored on completeness (images, description, attributes) to incentivize sellers to provide better data.

---

## 4. Order Management System (OMS)

The OMS governs the entire lifecycle of a customer order from placement to completion.

**Order States:**
```
PENDING_PAYMENT → PAYMENT_CONFIRMED → PROCESSING → SHIPPED → OUT_FOR_DELIVERY → DELIVERED → COMPLETED
                                                                                           → RETURN_REQUESTED → RETURNED
                         → CANCELLED
```

**Core Responsibilities:**
- Order creation (consuming cart data and reserving inventory).
- Status transitions driven by events from Payment, Logistics, and the Seller.
- Multi-seller order splitting: A single cart with items from 3 sellers creates 3 sub-orders (packages).
- SLA (Service Level Agreement) enforcement: Sellers are penalized if they do not confirm/ship within defined windows.

---

## 5. Inventory Management

Inventory tracks the physical location and availability of every unit of every product.

**Core Responsibilities:**
- Real-time stock level tracking per seller and per warehouse.
- **Stock Reservation**: When a customer adds to cart and proceeds to checkout, stock is soft-reserved to prevent overselling. If payment fails, the reservation expires.
- Low-stock alerts for sellers.
- Jumia Express (FBA model): Jumia-fulfilled inventory stored in its own warehouses.

**Key Mechanisms:**
- **Available to Promise (ATP)**: The quantity actually available for new orders = On-Hand Stock − Reserved Stock − Safety Stock Buffer.
- **Multi-warehouse routing**: When an item is in multiple warehouses, the system picks the closest to the customer to minimize delivery time.

---

## 6. Cart & Checkout

The cart is a temporary state machine managing item selections before order commitment.

**Core Responsibilities:**
- Persistent cart (survives across sessions for logged-in users).
- Guest cart (cookie-based, merged on login).
- Price recalculation in real time (reflecting promotions, coupons, and shipping fees).
- Multi-step checkout: Address → Shipping Method → Payment Method → Review → Confirm.

**Pricing Engine:**
```
Item Price
  − Seller Discount
  − Platform Coupon
  − Flash Sale Discount
  + Shipping Fee
  − Shipping Coupon
  = Order Total
```

---

## 7. Payment Service (JumiaPay)

JumiaPay is the integrated fintech layer that processes all financial transactions on the platform.

**Payment Methods Supported:**
- Credit/Debit Card (Visa, Mastercard).
- Bank Transfer (USSD and direct transfer).
- JumiaPay Wallet (stored value, funded via bank transfer or card).
- Pay on Delivery (POD): Cash collected at the doorstep by the delivery agent.
- Buy Now Pay Later (BNPL): Installment financing via third-party partners.

**Key Mechanisms:**
- **Escrow Model**: Buyer funds are held by the platform and only released to the seller after the return window expires (typically 7 days post-delivery).
- **Refund Flow**: Refunds go back to the original payment method or the JumiaPay wallet.
- **Settlement**: Sellers are paid on a weekly or bi-weekly schedule. Net settlement = Sales Revenue − Platform Commission − Ad Spend − Penalties.

---

## 8. Seller Hub

The Seller Hub (Vendor Center) is the self-service portal for all marketplace sellers.

**Core Modules:**
- **Onboarding**: Business registration, KYC document upload, store setup.
- **Product Management**: Create, edit, and manage listings. Bulk upload via CSV/Excel.
- **Order Management**: View incoming orders, print shipping labels, confirm shipment.
- **Inventory**: View stock levels, set reorder points, and request warehouse transfers.
- **Performance Dashboard**: Seller Score (based on order cancellation rate, late shipment rate, and customer rating).
- **Promotion Manager**: Create seller-funded discounts for their own products.

**Seller Tiers:**
- Standard Seller: Self-fulfilled orders.
- Jumia Express Seller: Stock sent to Jumia warehouse; Jumia handles packing and delivery.
- Official Brand Seller: Verified brand with a dedicated storefront.

---

## 9. Seller Finance & Settlement

Handles all money flows between the platform and its sellers.

**Core Responsibilities:**
- Generating itemized statements for every seller (per order, per commission deduction).
- Applying platform commission rates (variable by category, e.g., 5% on Electronics, 15% on Fashion).
- Deducting advertising spend from settlement.
- Applying penalty charges for SLA breaches (late shipments, false delivery claims).
- Disbursing net settlement to seller bank accounts.

---

## 10. Logistics & Fulfillment

Jumia Logistics is a hybrid fulfillment network combining in-house operations with third-party logistics (3PLs).

### A. Warehouse Management System (WMS)
- Receiving inbound shipments from sellers.
- Putaway: Assigning physical bin locations to each SKU.
- Picking & Packing: Assembling orders for dispatch.
- Cross-docking: Transferring inbound items directly to outbound without storage.

### B. Last-Mile Delivery
- **Route Optimization**: Orders are clustered by geographic zone and assigned to delivery agents.
- **Delivery Agent App**: Agents confirm pickup, scan packages at delivery, and capture proof of delivery (photo/signature).
- **Delivery Status Updates**: Real-time push to buyer: "Out for Delivery", "Delivered".
- **Failed Delivery Handling**: If the buyer is unavailable, the agent schedules a re-attempt or routes to a pickup station.

### C. Pickup Stations
- Customers who prefer self-collection receive a QR code.
- The station agent scans the code and hands over the package.
- Uncollected packages are returned to the warehouse after a hold period.

### D. Returns Management
- Buyer initiates a return via the app (selecting reason: Wrong Item, Defective, etc.).
- A pickup is scheduled or the buyer is directed to a pickup station.
- Upon receipt, a Quality Check (QC) agent inspects the item.
- If QC passes: Refund is triggered.
- If QC fails (e.g., item condition is worse than reported): The return is rejected and the item is sent back to the buyer.

---

## 11. Advertising Platform (Retail Media)

Jumia Ads is the internal advertising platform that allows sellers and brands to pay for visibility.

**Ad Formats:**
- **Sponsored Products**: Individual product listings that appear at the top of search results and category pages. Auction-based.
- **Display Banners**: Image banners placed on the homepage, category headers, and the checkout confirmation page.
- **Brand Takeover**: Full-page interstitials for official brand partners on high-traffic event days.

**Ad Auction Mechanics:**
- Sellers set a **Cost Per Click (CPC)** bid.
- Ad rank = CPC Bid × Quality Score (CTR history, listing quality).
- Winner appears first; they pay the second-highest bid + 1 unit (Vickrey-style).

**Campaign Types:**
- **Manual**: Seller selects specific keywords and sets individual bids.
- **Automatic**: The platform targets keywords based on the product listing content.

**Reporting:**
- Impressions, Clicks, Orders, Revenue, ROAS (Return on Ad Spend), ACoS (Advertising Cost of Sale).

---

## 12. Promotions & Campaign Engine

Manages all platform-level and seller-funded promotional mechanics.

**Promo Types:**
| Type | Description |
|---|---|
| **Flash Sale** | Time-limited, limited-quantity deep discounts. |
| **Percentage Discount** | e.g., "20% off selected items". |
| **Fixed Discount** | e.g., "₦5,000 off orders above ₦50,000". |
| **Buy X Get Y** | e.g., "Buy 2, Get 1 Free". |
| **Free Shipping Coupon** | Waives delivery fee. |
| **Voucher/Coupon Code** | Shareable codes for targeted audiences. |
| **Cashback** | Percentage of order returned to JumiaPay wallet. |

**Campaign Calendar:**
- Black Friday, Jumia Anniversary Sale, Category-specific sales (Fashion Week, Tech Deals).
- Coordinated across homepage banners (CMS), push notifications, and email campaigns.

---

## 13. Affiliate Platform (JForce)

JForce is Jumia's affiliate/sales consultant program that extends the platform's reach into offline and social networks.

**How It Works:**
1. A user signs up as a JForce agent.
2. The agent generates a unique referral link for any product or category.
3. When a buyer purchases through the link, the agent earns a commission (percentage of order value).
4. Commissions are tracked, aggregated, and paid out via JumiaPay.

**Key Mechanisms:**
- **Attribution Window**: Commissions are credited if the buyer completes purchase within 30 days of clicking the link.
- **Multi-touch Attribution**: The last-click model is the default; first-click is available for brand campaigns.
- **Agent Tiers**: Based on monthly performance, agents are tiered (Bronze, Silver, Gold) with progressively higher commission rates.

---

## 14. Dispute Resolution

The dispute system mediates conflicts between buyers and sellers.

**Dispute Triggers:**
- Item not received (but marked as delivered).
- Item received but wrong product sent.
- Item received but defective.
- Seller refusing to accept a valid return.

**Resolution Workflow:**
```
Buyer Opens Dispute
  → System notifies Seller (72h to respond)
  → Seller responds or disputes the claim
  → If resolved: Case closed
  → If unresolved: Jumia Moderator reviews evidence (photos, chat logs, delivery proof)
     → Moderator rules in favor of Buyer OR Seller
     → Ruling triggers Refund or Case Dismissal
```

**Evidence Collected:**
- Product photos uploaded by the buyer.
- Delivery agent proof of delivery (photo/signature).
- Seller's shipping confirmation and tracking data.

---

## 15. Trust & Safety

A suite of systems that maintain the integrity and safety of the platform.

### A. Fraud Detection
- **Order Fraud**: Machine learning models flag suspicious orders (multiple high-value orders to the same address, VPN usage, mismatched billing/delivery).
- **Seller Fraud**: Detecting fake reviews, inventory manipulation, and counterfeit listings.
- **Payment Fraud**: Card testing, chargeback abuse detection.

### B. Review & Rating System
- Only verified buyers (who completed a purchase) can leave a review.
- Reviews are subject to content moderation (profanity filtering, fake review detection).
- Seller Rating is an aggregate score displayed on every product listing.
- Products with ratings below a threshold are automatically suppressed.

### C. KYC / Seller Verification
- Sellers must submit: Government-issued ID, Business registration documents, Bank account details.
- KYC is verified before a seller can list products or receive payouts.
- Ongoing monitoring for changes in selling behavior.

---

## 16. Search & Discovery

The search engine is one of the most critical performance surfaces on the platform.

**Core Capabilities:**
- **Full-text search**: Matches queries against product title, description, and attributes.
- **Faceted filtering**: Allows narrowing results by price range, brand, rating, availability, etc.
- **Spell correction & synonyms**: "fone" → "phone", "tele vision" → "television".
- **Ranking algorithm**: Factors include relevance score, listing quality, seller rating, sales velocity, and ad bid (for sponsored products).
- **Zero-result handling**: If no exact match, the engine returns broadened or related results.

---

## 17. Recommendation Engine

Drives personalization across the platform to increase conversion and average order value.

**Recommendation Surfaces:**
| Surface | Logic |
|---|---|
| Homepage "Top Picks for You" | Collaborative filtering based on purchase history |
| PDP "Frequently Bought Together" | Market basket analysis |
| Cart "You Might Also Need" | Category-based cross-sell |
| Post-purchase "Buy Again" | Replenishment reminders for consumables |
| Email/Push Personalization | Abandoned cart, back-in-stock alerts |

---

## 18. Identity & Access Management (IAM)

Controls authentication and authorization for every actor on the platform.

**User Roles:**
| Role | Access |
|---|---|
| **Guest** | Browse, search, view products |
| **Buyer** | Purchase, track orders, leave reviews |
| **Seller** | Manage listings, orders, and ads |
| **Delivery Agent** | Accept and update delivery status |
| **Moderator** | Handle disputes, review flagged content |
| **Admin** | Full platform access, configuration, and reporting |

**Auth Mechanisms:**
- Email/password with bcrypt hashing.
- OAuth (Google, Facebook) for social login.
- JWT tokens with refresh token rotation.
- MFA (Multi-Factor Authentication) for Seller Hub and Admin Portal.

---

## 19. Notification Gateway

A unified service for routing all platform communications across multiple channels.

**Channels:**
- **Email**: Order confirmations, shipment updates, promotional campaigns.
- **SMS**: OTP, delivery alerts, payment confirmations.
- **Push Notifications** (Web & Mobile): Flash sale alerts, price drops, order status changes.
- **In-App Inbox**: Persistent notification feed inside the platform.

**Event-Driven Architecture:**
Notifications are triggered by domain events (e.g., `order.shipped`, `payment.failed`, `dispute.opened`) and routed to the appropriate channel based on user preferences.

---

## 20. Analytics & Reporting

Provides business intelligence across all platform domains.

**Buyer Analytics:**
- Funnel analysis: View → Cart → Checkout → Purchase.
- Cohort retention: How often buyers return.

**Seller Analytics:**
- Sales, Revenue, Returns, and Conversion Rate per listing.
- Competitor benchmarking (anonymized).

**Ad Analytics:**
- Impressions, CTR, Conversion Rate, ROAS, ACoS.

**Platform-Level Analytics:**
- GMV (Gross Merchandise Value), NMV (Net Merchandise Value after returns).
- Active buyers, active sellers, orders per day.
- Category-level performance.

---

## 21. Admin & Ops Portal

Internal tooling for the platform operator's teams.

**Modules:**
- **Catalog Ops**: Review and approve seller product listings.
- **Seller Ops**: Activate/suspend seller accounts, manage commission rates.
- **Logistics Ops**: Monitor delivery SLAs, reassign delivery routes.
- **Finance Ops**: Override settlement calculations, issue manual refunds.
- **Dispute Queue**: Assign and resolve escalated cases.
- **Fraud Queue**: Review flagged orders and accounts.

---

## 22. Content Management System (CMS)

Manages all editorial and marketing content on the platform without requiring engineering deployments.

**Managed Content:**
- Homepage banner slots and carousel images (with scheduling and A/B testing).
- Category landing pages and promotional landing pages.
- Help Center articles.
- Terms of Service, Privacy Policy, and Return Policy pages.

---

## 23. Media & CDN Service

Handles all product and marketing media assets.

**Core Responsibilities:**
- Image upload, validation (resolution, file size, format), and storage.
- Automatic image resizing for different surfaces (thumbnail, PDP, banner).
- CDN delivery for low-latency global access.
- Video support for product demo videos.

---

## 24. How All Services Connect

```
                      ┌─────────────────────────────────────────┐
                      │           BUYER (Web / Mobile)          │
                      └───────────────┬─────────────────────────┘
                                      │
              ┌───────────────────────▼───────────────────────────┐
              │         Marketplace (Storefront)                   │
              │  Search · Catalog · Recommendations · CMS Banners  │
              └────┬────────────┬─────────────────┬───────────────┘
                   │            │                 │
          ┌────────▼──┐  ┌──────▼──────┐  ┌──────▼────────┐
          │  Cart &   │  │   Promo /   │  │   Advertising │
          │ Checkout  │  │  Campaign   │  │    (Retail    │
          └────┬──────┘  └─────────────┘  │     Media)    │
               │                          └───────────────┘
     ┌─────────▼──────────┐
     │  Order Management  │◄──── Seller Hub ◄──── Seller
     │       (OMS)        │
     └──┬──────────┬──────┘
        │          │
┌───────▼───┐  ┌───▼────────────────────────────────────────┐
│ Inventory │  │              Payment (JumiaPay)             │
│ Management│  │  Card · Wallet · POD · BNPL · Settlement    │
└───────────┘  └────────────────────────────────────────────┘
        │
┌───────▼──────────────────────────┐
│         Logistics                │
│  WMS → Last-Mile → Pickup Points │
│         → Returns                │
└───────────────────────────────────┘
        │
┌───────▼────────────────────────────────────────────────┐
│  Trust & Safety · Dispute Resolution · Fraud Detection │
└────────────────────────────────────────────────────────┘
        │
┌───────▼───────────────────────────────────────────┐
│  Platform Ops: IAM · Notifications · Analytics    │
│               Admin Portal · CMS                  │
└───────────────────────────────────────────────────┘
```

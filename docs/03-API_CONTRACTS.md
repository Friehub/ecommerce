# 03 - API Contract Design

**Status:** Research
**Blocks:** Both web and mobile client development.

---

## API Layers

| Layer | Protocol | Consumer |
|---|---|---|
| tRPC routers | TypeScript RPC | Web (Server Actions + Client) + Mobile |
| REST `/api/*` | HTTP JSON | Payment webhooks, logistics callbacks, external integrations |
| gRPC | Protocol Buffers | Next.js → Rust Ad Auction Service |

---

## tRPC Router Structure

```
packages/api/src/
├── root.ts                   # Merges all routers
└── routers/
    ├── auth.ts
    ├── catalog.ts
    ├── cart.ts
    ├── orders.ts
    ├── payments.ts
    ├── seller.ts
    ├── inventory.ts
    ├── logistics.ts
    ├── advertising.ts
    ├── promotions.ts
    ├── affiliate.ts
    ├── disputes.ts
    ├── reviews.ts
    ├── notifications.ts
    └── admin.ts
```

---

## Procedure Types

| Type | Auth Required | Usage |
|---|---|---|
| `publicProcedure` | No | Browse catalog, search, view products |
| `protectedProcedure` | Yes (any role) | Cart, orders, account |
| `buyerProcedure` | BUYER role | Checkout, reviews, disputes |
| `sellerProcedure` | SELLER role | Seller Hub endpoints |
| `agentProcedure` | AGENT role | Delivery app endpoints |
| `adminProcedure` | ADMIN/MODERATOR | Admin portal endpoints |

---

## Key Endpoints by Router

### `catalog` router
| Procedure | Type | Description |
|---|---|---|
| `catalog.list` | query | Paginated product list with filters |
| `catalog.getById` | query | Single product with variants and media |
| `catalog.search` | query | Delegates to Rust Search Service |
| `catalog.categories` | query | Full category tree |

### `cart` router
| Procedure | Type | Description |
|---|---|---|
| `cart.get` | query | Current cart with line items |
| `cart.addItem` | mutation | Add variant to cart |
| `cart.updateItem` | mutation | Change quantity |
| `cart.removeItem` | mutation | Remove line item |
| `cart.applyCoupon` | mutation | Validate and apply promotion code |

### `orders` router
| Procedure | Type | Description |
|---|---|---|
| `orders.create` | mutation | Convert cart to order, reserve stock |
| `orders.getById` | query | Order detail with packages and lines |
| `orders.listByUser` | query | User order history |
| `orders.cancel` | mutation | Cancel order (pre-shipment only) |
| `orders.requestReturn` | mutation | Initiate return for an order line |

### `payments` router
| Procedure | Type | Description |
|---|---|---|
| `payments.initiate` | mutation | Create payment intent, return Paystack reference |
| `payments.verify` | mutation | Verify Paystack callback, trigger payment.confirmed event |
| `payments.getWallet` | query | User wallet balance |
| `payments.fundWallet` | mutation | Top up JumiaPay wallet |

### `seller` router
| Procedure | Type | Description |
|---|---|---|
| `seller.getProfile` | query | Seller profile + tier + rating |
| `seller.listProducts` | query | Seller's own listings |
| `seller.createProduct` | mutation | New product listing |
| `seller.updateProduct` | mutation | Edit listing |
| `seller.getOrders` | query | Incoming orders for seller |
| `seller.confirmShipment` | mutation | Mark package as shipped + tracking number |
| `seller.getStatement` | query | Settlement statement for a period |

### `logistics` router (agent-facing)
| Procedure | Type | Description |
|---|---|---|
| `logistics.getDeliveries` | query | Agent's assigned deliveries for today |
| `logistics.confirmPickup` | mutation | Scan and confirm package pickup |
| `logistics.markDelivered` | mutation | Mark delivered + upload proof photo |
| `logistics.reportFailed` | mutation | Log failed delivery attempt |

### `advertising` router
| Procedure | Type | Description |
|---|---|---|
| `advertising.createCampaign` | mutation | New ad campaign |
| `advertising.getCampaigns` | query | Seller's campaigns |
| `advertising.getPerformance` | query | Impressions, clicks, ROAS for a campaign |
| `advertising.pauseCampaign` | mutation | Pause/resume |

### `disputes` router
| Procedure | Type | Description |
|---|---|---|
| `disputes.open` | mutation | Buyer opens dispute on an order line |
| `disputes.respond` | mutation | Seller response |
| `disputes.uploadEvidence` | mutation | Both parties upload photos/docs |
| `disputes.resolve` | mutation | Moderator issues ruling (adminProcedure) |
| `disputes.getById` | query | Dispute thread + evidence |

### `admin` router
| Procedure | Type | Description |
|---|---|---|
| `admin.approveSeller` | mutation | Approve seller KYC |
| `admin.suspendUser` | mutation | Suspend buyer or seller |
| `admin.getDisputeQueue` | query | All open disputes |
| `admin.getFraudQueue` | query | Flagged orders |
| `admin.manualRefund` | mutation | Override refund |
| `admin.getMetrics` | query | GMV, active users, orders per day |

---

## REST Endpoints (Webhooks & External)

| Route | Method | Purpose |
|---|---|---|
| `/api/webhooks/paystack` | POST | Paystack payment event callback |
| `/api/webhooks/logistics` | POST | Third-party logistics status callback |
| `/api/auth/mobile` | POST | Mobile app login (returns JWT pair) |
| `/api/auth/refresh` | POST | Refresh access token |
| `/api/media/upload` | POST | Presigned URL for product image upload |

---

## Input Validation

All tRPC inputs use Zod schemas defined in `packages/types`.
The same schema is used for:
- Server-side validation (tRPC middleware)
- Client-side form validation (react-hook-form + zodResolver)
- Mobile form validation (same schema, same package)

---

## Error Codes

| Code | Meaning |
|---|---|
| `UNAUTHORIZED` | Not logged in |
| `FORBIDDEN` | Wrong role |
| `NOT_FOUND` | Resource does not exist |
| `BAD_REQUEST` | Invalid input (Zod parse failure) |
| `CONFLICT` | State violation (e.g. cancelling a shipped order) |
| `PAYMENT_REQUIRED` | Insufficient wallet balance |
| `OUT_OF_STOCK` | Inventory reservation failed |

# Module Ownership & Public API

This document assigns ownership and defines the public contract of every module.
A developer assigned to a module owns it end-to-end: schema, domain logic, repository,
events, and the UI page. They do not touch other modules.

---

## Ownership Table

| Module | Language | Depends On | Assign To |
|---|---|---|---|
| `iam` | TypeScript | — | Dev 1 |
| `media` | TypeScript + Rust stub | — | Dev 1 |
| `cms` | TypeScript | — | Dev 1 |
| `catalog` | TypeScript | iam, media | Dev 2 |
| `inventory` | TypeScript + Rust stub | catalog | Dev 2 |
| `promotions` | TypeScript | catalog | Dev 2 |
| `cart` | TypeScript | catalog, inventory, promotions | Dev 2 |
| `payments` | TypeScript | iam | Dev 3 |
| `orders` | TypeScript | catalog, inventory, payments, promotions | Dev 3 |
| `logistics` | TypeScript | orders | Dev 3 |
| `seller-hub` | TypeScript | catalog, inventory, orders | Dev 2 |
| `seller-finance` | TypeScript | orders, payments, advertising | Dev 3 |
| `advertising` | TypeScript + Rust stub | catalog, iam | Dev 4 |
| `affiliate` | TypeScript | catalog, orders | Dev 4 |
| `disputes` | TypeScript | orders, logistics | Dev 4 |
| `trust` | TypeScript + Rust stub | orders, iam | Dev 3 |
| `reviews` | TypeScript | orders, catalog | Dev 4 |
| `search` | TypeScript + Rust stub | catalog | Dev 4 |
| `recommendations` | TypeScript + Rust stub | catalog, orders | Dev 4 |
| `notifications` | TypeScript | all (event listener) | Dev 1 |
| `analytics` | TypeScript | all (event listener) | Dev 1 |
| `admin` | TypeScript | all | Dev 1 |

**Fill in the "Assign To" column with actual developer names when the team is formed.**

---

## Module Public APIs (index.ts contracts)

The following defines what each module EXPORTS. These are the only functions other
modules and tRPC routers may call. Nothing else is accessible.

---

### `iam`
```typescript
export { registerUser, loginUser, logoutUser }
export { getUserById, getUserByEmail }
export { createSellerProfile, getSellerProfile, updateSellerStatus }
export { getUserAddresses, createAddress, setDefaultAddress }
export type { User, Seller, UserRole, SellerStatus, SellerTier }
```

---

### `catalog`
```typescript
export { getCategories, getCategoryById }
export { getProductById, getProductWithVariants, listProducts }
export { createProduct, updateProduct, deactivateProduct }
export { getVariantById, updateVariantPrice }
export { getBrands }
export type { Product, ProductVariant, Category, Brand }
```

---

### `inventory`
```typescript
export { getStockLevel, getStockLevels }
export { reserveStock, releaseStock, confirmStock }
export { updateStockOnHand }
export type { StockLevel, StockReservation, ReservationToken }
```

---

### `cart`
```typescript
export { getCart, addToCart, updateCartItem, removeCartItem }
export { applyCoupon, removeCoupon }
export { getCartTotal }
export type { Cart, CartItem, CartTotal }
```

---

### `promotions`
```typescript
export { validateCoupon, markCouponUsed }
export { getActiveFlashSales, getFlashSaleForVariant }
export { applyPromotionToCart }
export type { Promotion, Coupon, FlashSale }
```

---

### `orders`
```typescript
export { createOrder, getOrderById, getOrdersByUser }
export { getPackagesByOrder, getOrderLinesByPackage }
export { transitionOrderStatus, transitionPackageStatus }
export { cancelOrder, requestReturn }
export { getSellerOrders }
export type { Order, OrderPackage, OrderLine, OrderStatus, PackageStatus }
```

---

### `payments`
```typescript
export { initiatePayment, verifyPayment }
export { getWallet, creditWallet, debitWallet }
export { getPaymentByOrder }
export { initiateRefund, getRefundByOrder }
export type { Payment, Wallet, Refund, PaymentMethod, PaymentStatus }
```

---

### `logistics`
```typescript
export { createShipment, getShipmentByPackage }
export { transitionShipmentStatus, uploadProofOfDelivery }
export { getAgentDeliveries }
export { getPickupStations }
export { createReturnShipment, updateReturnShipmentStatus }
export type { Shipment, ShipmentEvent, ShipmentStatus, ReturnShipment }
```

---

### `seller-hub`
```typescript
export { getSellerDashboard }
export { getSellerPerformanceScore }
export type { SellerDashboard, PerformanceScore }
// Note: seller-hub is a composition module — it calls catalog, orders, inventory,
// advertising, seller-finance modules and aggregates. It exports views, not raw data.
```

---

### `seller-finance`
```typescript
export { getLedgerEntries, createLedgerEntry }
export { getStatementByPeriod, generateStatement }
export { getPayoutsByPeriod }
export type { SellerLedgerEntry, SellerStatement, Payout, LedgerEntryType }
```

---

### `advertising`
```typescript
export { createCampaign, getCampaignsBySeller, updateCampaignStatus }
export { getCampaignPerformance }
export { runAuction }  // returns sponsored product slots for a search query
export { recordImpression, recordClick }
export type { AdCampaign, AdGroup, AdKeyword, AuctionResult }
```

---

### `affiliate`
```typescript
export { getAgentByUser, createReferralLink, getReferralLink }
export { recordClick, attributeCommission, confirmCommission }
export { getCommissionsByAgent }
export type { AffiliateAgent, ReferralLink, Commission }
```

---

### `disputes`
```typescript
export { openDispute, getDisputeById, getDisputesByUser }
export { addMessage, uploadEvidence }
export { respondToDispute, escalateDispute }
export { resolveDispute }
export type { Dispute, DisputeMessage, DisputeEvidence, DisputeResolution, DisputeStatus }
```

---

### `reviews`
```typescript
export { createReview, getReviewsByProduct, getReviewByOrderLine }
export { getProductRating }
export type { Review }
```

---

### `search`
```typescript
export { searchProducts, getSuggestions }
export type { SearchQuery, SearchResult, SearchFilters }
// Implementation: PostgreSQL FTS stub in contest, Rust/Tantivy in production.
// Interface never changes — only the implementation behind it.
```

---

### `recommendations`
```typescript
export { getRecommendationsForUser, getSimilarProducts, getFrequentlyBoughtTogether }
export type { RecommendationResult }
// Implementation: Top-sellers rule-based stub in contest, ALS+Qdrant in production.
```

---

### `notifications`
```typescript
export { sendEmail, sendInAppNotification }
export { getNotificationsForUser, markAsRead }
export type { Notification }
// This module is primarily driven by event listeners, not direct calls.
```

---

### `media`
```typescript
export { uploadProductImage, deleteProductImage }
export { getPresignedUploadUrl }
export type { MediaUploadResult }
// Implementation: sharp (Node.js) in contest, Rust image processor in production.
```

---

### `cms`
```typescript
export { getBanners, getBannersByPlacement }
export { createBanner, updateBanner, deactivateBanner }
export { getPageBySlug }
export type { Banner, Page, BannerPlacement }
```

---

### `trust`
```typescript
export { scoreFraud }
export type { FraudScore, FraudAction }
// Implementation: rule-based TypeScript in contest, Rust/Candle in production.
// Called synchronously at checkout before payment is authorized.
```

---

## Cross-Module Event Map

Quick reference showing which module fires each event and who listens.
Full payload definitions are in `docs/02-EVENT_SCHEMA.md`.

| Event | Fired By | Listeners |
|---|---|---|
| `order.created` | orders | inventory, notifications, analytics |
| `order.cancelled` | orders | inventory, payments, seller-finance, notifications |
| `order.completed` | orders (cron) | seller-finance, affiliate, notifications |
| `payment.confirmed` | payments | orders, seller-finance, notifications |
| `payment.failed` | payments | orders, inventory, notifications |
| `shipment.delivered` | logistics | orders, seller-finance, notifications |
| `dispute.opened` | disputes | payments, notifications |
| `dispute.resolved` | disputes | payments, orders, notifications |
| `ad.click` | advertising | seller-finance, analytics |
| `referral.clicked` | affiliate | affiliate |
| `stock.low` | inventory | notifications |

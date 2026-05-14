# Jumia Clone — Frontend/Backend Wiring Audit

**Date**: 2026-05-14  
**Scope**: Buyer journey — every page a buyer can visit from landing to post-order.  
**Method**: Read each page file, map every `api.*` call to its backend procedure, flag anything missing, hardcoded, or broken.

---

## Summary

| Status | Count |
| ------ | ----- |
| Fully wired | 17 |
| Partially wired (minor gaps) | 4 |
| Broken — page exists, backend missing | 2 |
| Dead links — page does not exist at all | 3 |

---

## 1. Homepage (`/`)

**Status: Fully wired.**

The homepage dynamically builds itself from live data. Nothing is hardcoded.

- Categories sidebar → `api.catalog.getCategories` ✓
- Hero carousel → `api.content.getHeroBanners` ✓ (falls back to default banners if DB is empty — good)
- Flash sales section → `api.promo.getFlashSales` ✓
- Category grid → `api.catalog.getCategories` ✓
- Product sections → loop over categories, each calls `api.catalog.listProducts` with `categoryId` ✓

**No issues.**

---

## 2. Search (`/search`)

**Status: Fully wired.**

- Product results → `api.catalog.listProducts` with `query`, `minPrice`, `maxPrice`, `brandId`, `sortBy` ✓
- Brand filter dropdown → `api.catalog.getBrands` ✓
- All filters passed as URL query params and synced to the API call ✓

**No issues.**

---

## 3. Category Page (`/category/[slug]`)

**Status: Fully wired.**

- Category header info → `api.catalog.getCategoryBySlug` ✓
- Product list → `api.catalog.listProducts` with `categoryId` ✓

**No issues.**

---

## 4. Product Detail (`/products/[slug]`)

**Status: Fully wired.**

- Product data → `api.catalog.getProductBySlug` (server-side call) ✓
- Add to cart → `CartContext` → `api.cart.add` ✓
- Wishlist toggle → `api.catalog.addToWishlist` / `api.catalog.removeFromWishlist` ✓
- Wishlist state check → `api.catalog.getWishlist` ✓
- Reviews section → `api.review.getProductReviews` ✓

**No issues.**

---

## 5. Flash Sales Page (`/flash-sales`)

**Status: Fully wired.**

- Flash sale items → `api.promo.getFlashSales` ✓
- Countdown timer is computed client-side from `endTime` returned by the API ✓

**No issues.**

---

## 6. Cart (drawer + `/cart`)

**Status: Fully wired.**

- Cart state managed in `CartContext`, which calls `api.cart.get` on mount ✓
- Add item → `api.cart.add` ✓
- Update quantity → `api.cart.updateQuantity` ✓
- Remove item → `api.cart.remove` ✓
- Cart drawer opens automatically on add ✓

**No issues.**

---

## 7. Checkout (`/checkout`)

**Status: Partially wired. One hardcoded value.**

- Cart data → read from `CartContext` ✓
- Delivery addresses → `api.iam.getAddresses` ✓
- Add new address inline → `api.iam.addAddress` ✓
- Place order → `api.order.create` ✓
- Payment initialization (card) → `api.payment.initializePayment` ✓

**Issue — shipping fee is hardcoded:**

```
// apps/web/src/app/(buyer)/checkout/page.tsx, line 90
const shipping = 500;
```

The delivery fee is always ₦500 regardless of the seller's location, product weight, or delivery zone. The backend does not expose a shipping calculation endpoint — this needs to be either fetched from the API or computed server-side when the order is created. For now the order total stored in the DB will be wrong if the real fee differs.

**Fix needed**: Add `ops.getShippingFee` or compute it inside `order.create` on the backend based on address + cart contents.

---

## 8. Checkout Success (`/checkout/success`)

**Status: Partially wired.**

The page reads the `orderId` from the URL query string and shows a static success message. It does not fetch the order from the backend to confirm its status or display the actual order summary.

**Issue**: If a user lands on this page directly (bookmarked or payment callback redirected here), there is no verification that the order actually completed. The page has no `api.order.get` call.

**Fix needed**: Add `api.order.get({ orderId })` to display actual order details and confirm status is not `PENDING`.

---

## 9. Vendor Page (`/vendor/[sellerId]`)

**Status: Fully wired.**

- Seller profile → `api.iam.getPublicProfile` ✓
- Seller products → `api.catalog.getSellerProducts` ✓

**No issues.**

---

## 10. Wishlist (`/wishlist`)

**Status: Fully wired.**

- Wishlist items → `api.catalog.getWishlist` ✓
- Remove from wishlist → `api.catalog.removeFromWishlist` ✓
- Add to cart from wishlist → uses `CartContext.addToCart` ✓

**No issues.**

---

## 11. My Orders (`/account/orders`)

**Status: Fully wired.**

- Order list → `api.order.listMyOrders` ✓
- Loading skeletons shown correctly ✓

**No issues.**

---

## 12. Order Detail (`/account/orders/[id]`)

**Status: Fully wired.**

- Order detail → `api.order.get` ✓
- Cancel order → `api.order.cancel` ✓
- Initiate return → `api.return.initiate` ✓
- Confirm modal used before destructive actions ✓

**No issues.**

---

## 13. Addresses (`/account/addresses`)

**Status: Fully wired.**

- Address list → `api.iam.getAddresses` ✓
- Add address → `api.iam.addAddress` ✓
- Delete address → `api.iam.deleteAddress` ✓

**No issues.**

---

## 14. Account Settings (`/account/settings`)

**Status: Fully wired.**

- User profile → `api.iam.me` ✓
- Update profile → `api.iam.updateProfile` ✓
- Toggle 2FA → `api.iam.toggleTwoFactor` ✓

**No issues.**

---

## 15. Wallet (`/account/wallet`)

**Status: Fully wired.**

- Wallet balance → `api.payment.getWallet` ✓
- Fund wallet → `api.payment.fundWallet` ✓
- Withdraw → `api.payment.withdraw` ✓

**No issues.**

---

## 16. Reviews (`/account/reviews`)

**Status: Fully wired.**

- My past reviews → `api.review.listMyReviews` ✓
- Pending reviews (orders delivered, not yet reviewed) → `api.review.getPendingReviews` ✓

**No issues.**

---

## 17. Write Review (`/account/reviews/new`)

**Status: Fully wired.**

- Product info → `api.catalog.getProduct` ✓
- Submit review → `api.review.create` ✓
- Photo upload → `api.media.getUploadUrl` (presigned S3 URL) ✓

**No issues.**

---

## 18. Disputes (`/disputes`, `/disputes/new`, `/disputes/[id]`)

**Status: Fully wired.**

- My disputes list → `api.dispute.listMyDisputes` ✓
- Open dispute (requires picking an order) → `api.order.get` + `api.dispute.openDispute` ✓
- Dispute thread → `api.dispute.getThread` ✓
- Reply to thread → `api.dispute.respond` ✓
- Escalate → `api.dispute.escalate` ✓

**No issues.**

---

## 19. Notifications (`/notifications`)

**Status: BROKEN — page is fully hardcoded.**

The `/notifications` page has zero API calls. It renders a static list of fake notifications defined as a `const` array inside the file.

The backend has this fully implemented:
- `api.notification.getUnread` ✓ (used correctly in the navbar `NotificationInbox` dropdown)
- `api.notification.markAsRead` ✓
- `api.notification.listNotifications` ✓ (paginated, never called anywhere)

The full notifications page uses none of these. A user who clicks "See all" from the navbar inbox lands on a hardcoded list.

**Fix needed**: Wire `/notifications` page to `api.notification.listNotifications` with pagination.

---

## 20. Ad Banners (Homepage section)

**Status: BROKEN — hardcoded, backend ignored.**

The `AdBanners` component at the bottom of the homepage is a static array of two Unsplash images. It never calls the API.

The backend has `api.content.getHeroBanners` which is correctly used by the `HeroCarousel`. There is no separate endpoint for secondary/mid-page banners, but the `AdBanners` component could either reuse `getHeroBanners` (and show a different slice) or a new `getAdBanners` procedure can be added to the content router.

**Fix needed**: Either extend `getHeroBanners` to return banner type/placement metadata, or add a `content.getAdBanners` procedure.

---

## 21. Dead Navigation Links (pages that do not exist)

These links appear in the UI but have no corresponding page file in the app.

| Link shown | Where | Status |
| --- | --- | --- |
| `/track-order` | Top navbar | Page file does not exist |
| `/account/inbox` | Account sidebar | Page file does not exist |
| `/account/newsletter` | Account page | Page file does not exist |

Clicking these will result in a 404 in production. The backend has no matching procedures for inbox or newsletter preferences either.

**Fix needed**: Either build the pages or remove the links until they are built.

---

## Fix Priority

| Priority | Fix |
| --- | --- |
| High | Wire `/notifications` page to `api.notification.listNotifications` |
| High | Remove or redirect dead links (`/track-order`, `/account/inbox`, `/account/newsletter`) |
| Medium | Wire `AdBanners` to a real content endpoint |
| Medium | Add order verification call to `/checkout/success` |
| Low | Move shipping fee out of the hardcoded `500` constant and derive it from the backend |

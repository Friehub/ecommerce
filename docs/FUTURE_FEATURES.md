# Future Core Features & Architectural Specs

## 1. Follow Store Feature Spec

### Problem Description
The Seller Information panel on the product details page previously rendered a dead "Follow Store" button that lacked click event handlers and active backend endpoints. To maintain structural UI/UX integrity, the button was cleanly deprecated until proper infrastructure is implemented.

### Technical Design Requirements

#### A. Database Schema Extensions (Prisma)
A new relational join table is required in the main `schema.prisma` configuration to track user subscriptions to merchant stores:

```prisma
model SellerFollower {
  id        String   @id @default(uuid())
  userId    String
  sellerId  String
  createdAt DateTime @default(now())

  // Relations
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  seller    Seller   @relation(fields: [sellerId], references: [id], onDelete: Cascade)

  @@unique([userId, sellerId])
  @@index([userId])
  @@index([sellerId])
}
```

#### B. API Procedures (tRPC)
Add a new namespace to the backend seller router:
1. `api.seller.follow` (Protected Mutation): Follows a seller.
2. `api.seller.unfollow` (Protected Mutation): Unfollows a seller.
3. `api.seller.isFollowing` (Protected Query): Checks if the active session buyer currently follows the specified merchant.
4. `api.seller.getFollowersCount` (Public Query): Returns the total number of followers for a given merchant.

#### C. Notification Engine Hook
Following a merchant should integrate with the core Notification Service:
*   When a merchant adds new variants/products to their dynamic catalog, trigger a bulk worker job calling the notification dispatcher.
*   Enables targeted buyer alerts (`SELLER_UPDATE` notifications in standard inbox dropdowns).

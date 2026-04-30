import { createTRPCRouter } from './trpc'
import { iamRouter } from './modules/iam/router'
import { catalogRouter } from './modules/catalog/router'
import { inventoryRouter } from './modules/inventory/router'
import { cartRouter } from './modules/cart/router'
import { promoRouter } from './modules/promo/router'
import { orderRouter } from './modules/order/router'
import { paymentRouter } from './modules/payment/router'
import { sellerRouter } from './modules/seller/router'
import { logisticsRouter } from './modules/logistics/router'
import { reviewRouter } from './modules/review/router'
import { returnRouter } from './modules/return/router'
import { contentRouter } from './modules/content/router'
import { opsRouter } from './modules/ops/router'
import { revenueRouter } from './modules/revenue/router'
import { disputeRouter } from './modules/dispute/router'
import { adminRouter } from './modules/admin/router'
import { notificationRouter } from './modules/notification/router'

export const appRouter = createTRPCRouter({
  iam: iamRouter,
  catalog: catalogRouter,
  inventory: inventoryRouter,
  cart: cartRouter,
  promo: promoRouter,
  order: orderRouter,
  payment: paymentRouter,
  seller: sellerRouter,
  logistics: logisticsRouter,
  review: reviewRouter,
  return: returnRouter,
  content: contentRouter,
  ops: opsRouter,
  revenue: revenueRouter,
  dispute: disputeRouter,
  admin: adminRouter,
  notification: notificationRouter,
})

export type AppRouter = typeof appRouter

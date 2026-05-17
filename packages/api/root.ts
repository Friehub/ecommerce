import { createTRPCRouter } from './trpc.js'
import { iamRouter } from './modules/iam/router/index.js'
import { catalogRouter } from './modules/catalog/router/index.js'
import { inventoryRouter } from './modules/inventory/router/index.js'
import { cartRouter } from './modules/cart/router/index.js'
import { promoRouter } from './modules/promo/router/index.js'
import { orderRouter } from './modules/order/router/index.js'
import { paymentRouter } from './modules/payment/router/index.js'
import { sellerRouter } from './modules/seller/router/index.js'
import { logisticsRouter } from './modules/logistics/router/index.js'
import { reviewRouter } from './modules/review/router/index.js'
import { returnRouter } from './modules/return/router/index.js'
import { contentRouter } from './modules/content/router/index.js'
import { opsRouter } from './modules/ops/router/index.js'
import { revenueRouter } from './modules/revenue/router/index.js'
import { disputeRouter } from './modules/dispute/router/index.js'
import { adminRouter } from './modules/admin/router/index.js'
import { notificationRouter } from './modules/notification/router/index.js'
import { advertisingRouter } from './modules/advertising/router/index.js'
import { affiliateRouter } from './modules/affiliate/router/index.js'
import { mediaRouter } from './modules/media/router/index.js'
import { supportRouter } from './modules/support/router/index.js'

const _appRouter = createTRPCRouter({
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
  advertising: advertisingRouter,
  affiliate: affiliateRouter,
  media: mediaRouter,
  support: supportRouter,
});

export const appRouter = _appRouter;
export type AppRouter = typeof _appRouter;

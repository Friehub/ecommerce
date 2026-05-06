import { createTRPCRouter } from './trpc.js'
import { iamRouter, type IamRouter } from './modules/iam/router/index.js'
import { catalogRouter, type CatalogRouter } from './modules/catalog/router/index.js'
import { inventoryRouter, type InventoryRouter } from './modules/inventory/router/index.js'
import { cartRouter, type CartRouter } from './modules/cart/router/index.js'
import { promoRouter, type PromoRouter } from './modules/promo/router/index.js'
import { orderRouter, type OrderRouter } from './modules/order/router/index.js'
import { paymentRouter, type PaymentRouter } from './modules/payment/router/index.js'
import { sellerRouter, type SellerRouter } from './modules/seller/router/index.js'
import { logisticsRouter, type LogisticsRouter } from './modules/logistics/router/index.js'
import { reviewRouter, type ReviewRouter } from './modules/review/router/index.js'
import { returnRouter, type ReturnRouter } from './modules/return/router/index.js'
import { contentRouter, type ContentRouter } from './modules/content/router/index.js'
import { opsRouter, type OpsRouter } from './modules/ops/router/index.js'
import { revenueRouter, type RevenueRouter } from './modules/revenue/router/index.js'
import { disputeRouter, type DisputeRouter } from './modules/dispute/router/index.js'
import { adminRouter, type AdminRouter } from './modules/admin/router/index.js'
import { notificationRouter, type NotificationRouter } from './modules/notification/router/index.js'
import { advertisingRouter, type AdvertisingRouter } from './modules/advertising/router/index.js'
import { affiliateRouter, type AffiliateRouter } from './modules/affiliate/router/index.js'
import { mediaRouter, type MediaRouter } from './modules/media/router/index.js'

const _appRouter = createTRPCRouter({
  iam: iamRouter as IamRouter,
  catalog: catalogRouter as CatalogRouter,
  inventory: inventoryRouter as InventoryRouter,
  cart: cartRouter as CartRouter,
  promo: promoRouter as PromoRouter,
  order: orderRouter as OrderRouter,
  payment: paymentRouter as PaymentRouter,
  seller: sellerRouter as SellerRouter,
  logistics: logisticsRouter as LogisticsRouter,
  review: reviewRouter as ReviewRouter,
  return: returnRouter as ReturnRouter,
  content: contentRouter as ContentRouter,
  ops: opsRouter as OpsRouter,
  revenue: revenueRouter as RevenueRouter,
  dispute: disputeRouter as DisputeRouter,
  admin: adminRouter as AdminRouter,
  notification: notificationRouter as NotificationRouter,
  advertising: advertisingRouter as AdvertisingRouter,
  affiliate: affiliateRouter as AffiliateRouter,
  media: mediaRouter as MediaRouter,
});

export const appRouter = _appRouter as any;
export type AppRouter = typeof _appRouter;

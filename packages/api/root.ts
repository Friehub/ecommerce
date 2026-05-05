import { createTRPCRouter } from './trpc'
import { iamRouter, type IamRouter } from './modules/iam/router'
import { catalogRouter, type CatalogRouter } from './modules/catalog/router'
import { inventoryRouter, type InventoryRouter } from './modules/inventory/router'
import { cartRouter, type CartRouter } from './modules/cart/router'
import { promoRouter, type PromoRouter } from './modules/promo/router'
import { orderRouter, type OrderRouter } from './modules/order/router'
import { paymentRouter, type PaymentRouter } from './modules/payment/router'
import { sellerRouter, type SellerRouter } from './modules/seller/router'
import { logisticsRouter, type LogisticsRouter } from './modules/logistics/router'
import { reviewRouter, type ReviewRouter } from './modules/review/router'
import { returnRouter, type ReturnRouter } from './modules/return/router'
import { contentRouter, type ContentRouter } from './modules/content/router'
import { opsRouter, type OpsRouter } from './modules/ops/router'
import { revenueRouter, type RevenueRouter } from './modules/revenue/router'
import { disputeRouter, type DisputeRouter } from './modules/dispute/router'
import { adminRouter, type AdminRouter } from './modules/admin/router'
import { notificationRouter, type NotificationRouter } from './modules/notification/router'
import { advertisingRouter, type AdvertisingRouter } from './modules/advertising/router'
import { affiliateRouter, type AffiliateRouter } from './modules/affiliate/router'
import { mediaRouter, type MediaRouter } from './modules/media/router'

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

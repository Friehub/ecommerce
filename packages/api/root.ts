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
})

export type AppRouter = typeof appRouter

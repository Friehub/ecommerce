import { createTRPCRouter } from './trpc'
import { iamRouter } from './modules/iam/router'
import { catalogRouter } from './modules/catalog/router'
import { inventoryRouter } from './modules/inventory/router'
import { cartRouter } from './modules/cart/router'
import { promoRouter } from './modules/promo/router'

export const appRouter = createTRPCRouter({
  iam: iamRouter,
  catalog: catalogRouter,
  inventory: inventoryRouter,
  cart: cartRouter,
  promo: promoRouter,
})

export type AppRouter = typeof appRouter

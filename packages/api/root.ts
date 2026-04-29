import { createTRPCRouter } from './trpc'
import { iamRouter } from './modules/iam/router'
import { catalogRouter } from './modules/catalog/router'
import { inventoryRouter } from './modules/inventory/router'

export const appRouter = createTRPCRouter({
  iam: iamRouter,
  catalog: catalogRouter,
  inventory: inventoryRouter,
})

export type AppRouter = typeof appRouter

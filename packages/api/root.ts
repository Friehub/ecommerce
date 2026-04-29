import { createTRPCRouter } from './trpc'
import { iamRouter } from './modules/iam/router'
import { catalogRouter } from './modules/catalog/router'

export const appRouter = createTRPCRouter({
  iam: iamRouter,
  catalog: catalogRouter,
})

export type AppRouter = typeof appRouter

import { createTRPCRouter } from './trpc'
import { iamRouter } from './modules/iam/router'

export const appRouter = createTRPCRouter({
  iam: iamRouter,
})

export type AppRouter = typeof appRouter

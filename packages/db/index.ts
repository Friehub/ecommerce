import { PrismaClient, Prisma } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export { Prisma } from '@prisma/client'
export const Decimal = Prisma.Decimal
export type Decimal = Prisma.Decimal
export * from '@prisma/client'

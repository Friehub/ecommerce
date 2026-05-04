import { PrismaClient, Prisma } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const getDataSourceUrl = () => {
  const url = process.env.DATABASE_URL || '';
  if (!url) return url;
  const separator = url.includes('?') ? '&' : '?';
  // statement_timeout: 5s, connect_timeout: 10s
  return `${url}${separator}statement_timeout=5000&connect_timeout=10000`;
};

const client = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: getDataSourceUrl(),
    },
  },
});

// Safety Net Extension: Cap all findMany at 1000 if take is missing
export const prisma = client.$extends({
  query: {
    $allModels: {
      async findMany({ args, query }) {
        if (args.take === undefined || args.take > 1000) {
          args.take = 1000;
        }
        return query(args);
      },
    },
  },
}) as unknown as PrismaClient;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export { Prisma } from '@prisma/client'
export const Decimal = Prisma.Decimal
export type Decimal = Prisma.Decimal
export * from '@prisma/client'

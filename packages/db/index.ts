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

// Explicitly export commonly used types and enums for ESM/CJS compatibility
import pkg from '@prisma/client'

// Enums (Value + Type)
export type LedgerEntryType = import('@prisma/client').LedgerEntryType
export const LedgerEntryType = pkg.LedgerEntryType

export type LedgerStatus = import('@prisma/client').LedgerStatus
export const LedgerStatus = pkg.LedgerStatus

export type SellerStatus = import('@prisma/client').SellerStatus
export const SellerStatus = pkg.SellerStatus

export type SellerTier = import('@prisma/client').SellerTier
export const SellerTier = pkg.SellerTier

export type ProductStatus = import('@prisma/client').ProductStatus
export const ProductStatus = pkg.ProductStatus

export type OrderStatus = import('@prisma/client').OrderStatus
export const OrderStatus = pkg.OrderStatus

export type UserRole = import('@prisma/client').UserRole
export const UserRole = pkg.UserRole

export type DisputeStatus = import('@prisma/client').DisputeStatus
export const DisputeStatus = pkg.DisputeStatus

export type ReviewStatus = import('@prisma/client').ReviewStatus
export const ReviewStatus = pkg.ReviewStatus

export type PaymentStatus = import('@prisma/client').PaymentStatus
export const PaymentStatus = pkg.PaymentStatus

export type PackageStatus = import('@prisma/client').PackageStatus
export const PackageStatus = pkg.PackageStatus

export type ShipmentStatus = import('@prisma/client').ShipmentStatus
export const ShipmentStatus = pkg.ShipmentStatus

// Re-export all types from @prisma/client safely
export type * from '@prisma/client'

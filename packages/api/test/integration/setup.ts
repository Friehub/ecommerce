import { vi } from 'vitest';
import { prisma } from '@ecom/db';

// Ensure we are using the real Prisma client, not a mock from unit tests
vi.unmock('@ecom/db');

export async function clearDatabase() {
  await prisma.$connect();
  
  const tables = [
    'payment',
    'payout',
    'sellerLedgerEntry',
    'walletTransaction',
    'wallet',
    'orderLine',
    'orderPackage',
    'order',
    'stockReservation',
    'stockLevel',
    'cartItem',
    'cart',
    'productVariant',
    'productMedia',
    'product',
    'category',
    'brand',
    'seller',
    'warehouse',
    'userAddress',
    'user',
  ];

  for (const table of tables) {
    try {
      // Use double quotes for table names in case they are case-sensitive or reserved
      // We use the PascalCase names we saw in the DB inspection
      const pascalTable = table.charAt(0).toUpperCase() + table.slice(1);
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${pascalTable}" RESTART IDENTITY CASCADE;`);
    } catch (err) {
      // Ignore
    }
  }
}

export const TEST_DB_URL = 'postgresql://ecom_test:ecom_test@localhost:5434/ecom_test';

import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from 'vitest';
import { prisma, OrderStatus, LedgerStatus, LedgerEntryType } from '@ecom/db';
import { handleCronJob } from './cron.js';

// Mock shared redis to avoid connection issues during tests
vi.mock('@ecom/shared', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original as any,
    redis: {
      on: vi.fn(),
      set: vi.fn(),
      get: vi.fn(),
      quit: vi.fn(),
      connect: vi.fn(),
    }
  };
});

describe('Cron Job Integration Tests (Real DB)', () => {
  let sharedBrandId: string;
  let sharedCategoryId: string;

  beforeAll(async () => {
    await clearDatabase();
    
    const brand = await prisma.brand.create({
      data: { 
        name: 'Test Brand',
        slug: `brand-${Math.random().toString(36)}`
      }
    });
    sharedBrandId = brand.id;

    const category = await prisma.category.create({
      data: { 
        name: 'Test Category',
        slug: `cat-${Math.random().toString(36)}`,
        commissionRate: 5.0
      }
    });
    sharedCategoryId = category.id;
  });

  beforeEach(async () => {
    // Keep shared brand/category, clear everything else
    await prisma.commission.deleteMany();
    await prisma.payout.deleteMany();
    await prisma.sellerStatement.deleteMany();
    await prisma.sellerLedgerEntry.deleteMany();
    await prisma.orderLine.deleteMany();
    await prisma.orderPackage.deleteMany();
    await prisma.stockReservation.deleteMany();
    await prisma.order.deleteMany();
    await prisma.affiliateAgent.deleteMany();
    await prisma.stockLevel.deleteMany();
    await prisma.review.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.flashSale.deleteMany();
    await prisma.adConversion.deleteMany();
    await prisma.adCampaign.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.product.deleteMany();
    await prisma.sellerDocument.deleteMany();
    await prisma.seller.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.walletTransaction.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.user.deleteMany();
  });

  async function clearDatabase() {
    console.log('[TestSetup] Truncating database...');
    const tablenames = await prisma.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename NOT LIKE '_prisma_migrations'`;

    const tables = tablenames
      .map(({ tablename }) => `"${tablename}"`)
      .join(', ');

    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
      console.log('[TestSetup] Database truncated');
    } catch (error) {
      console.error('[TestSetup] Failed to truncate database:', error);
    }
  }

  describe('fraud-review-cleanup', () => {
    it('should auto-cancel orders in FRAUD_REVIEW for more than 48 hours', async () => {
      // 1. Setup stale order (49 hours ago)
      const staleDate = new Date();
      staleDate.setHours(staleDate.getHours() - 49);

      const user = await prisma.user.create({
        data: {
          email: `stale-${Date.now()}@example.com`,
          firstName: 'Stale',
          lastName: 'User'
        }
      });

      const orderStale = await prisma.order.create({
        data: {
          userId: user.id,
          status: OrderStatus.FRAUD_REVIEW,
          total: 1000,
          subtotal: 1000,
          shippingFee: 0,
          discount: 0,
          paymentMethod: 'CARD',
          createdAt: staleDate
        }
      });

      // 2. Setup fresh order (1 hour ago)
      const freshDate = new Date();
      freshDate.setHours(freshDate.getHours() - 1);

      const orderFresh = await prisma.order.create({
        data: {
          userId: user.id,
          status: OrderStatus.FRAUD_REVIEW,
          total: 1000,
          subtotal: 1000,
          shippingFee: 0,
          discount: 0,
          paymentMethod: 'CARD',
          createdAt: freshDate
        }
      });

      // 3. Run job
      await handleCronJob({ name: 'fraud-review-cleanup' });

      // 4. Verify stale order is CANCELLED
      const updatedStale = await prisma.order.findUnique({ where: { id: orderStale.id } });
      expect(updatedStale?.status).toBe(OrderStatus.CANCELLED);

      // 5. Verify fresh order is still FRAUD_REVIEW
      const updatedFresh = await prisma.order.findUnique({ where: { id: orderFresh.id } });
      expect(updatedFresh?.status).toBe(OrderStatus.FRAUD_REVIEW);
    });
  });

  describe('release-escrow', () => {
    it('should release mature escrow entries', async () => {
      // Setup seller, order, and ledger entries
      const user = await prisma.user.create({
        data: {
          email: `seller-${Date.now()}@example.com`,
          firstName: 'Seller',
          lastName: 'User'
        }
      });

      const seller = await prisma.seller.create({
        data: {
          userId: user.id,
          businessName: 'Cron Test Seller'
        }
      });

      const warehouse = await prisma.warehouse.create({
        data: { name: 'Test Hub', address: '123 Hub St' }
      });

      const product = await prisma.product.create({
        data: {
          title: `P-${Math.random().toString(36)}`,
          slug: `p-${Math.random().toString(36)}`,
          description: 'Desc',
          sellerId: seller.id,
          brandId: sharedBrandId,
          categoryId: sharedCategoryId,
        }
      });

      const variant = await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku: `SKU-${Date.now()}`,
          price: 1000,
          attributes: { color: 'Red' }
        }
      });

      const order = await prisma.order.create({
        data: {
          userId: user.id,
          status: OrderStatus.DELIVERED,
          subtotal: 1000,
          total: 1000,
          shippingFee: 0,
          discount: 0,
          paymentMethod: 'CARD'
        }
      });

      const pkg = await prisma.orderPackage.create({
        data: {
          orderId: order.id,
          sellerId: seller.id,
          warehouseId: warehouse.id,
          status: 'DELIVERED'
        }
      });

      const line = await prisma.orderLine.create({
        data: {
          packageId: pkg.id,
          variantId: variant.id,
          quantity: 1,
          unitPrice: 1000
        }
      });

      // 1. Setup mature entry (availableAt in past)
      const matureDate = new Date();
      matureDate.setHours(matureDate.getHours() - 1);

      const matureEntry = await prisma.sellerLedgerEntry.create({
        data: {
          sellerId: seller.id,
          orderLineId: line.id,
          amount: 1000,
          type: LedgerEntryType.SALE,
          status: LedgerStatus.PENDING,
          availableAt: matureDate
        }
      });

      // 2. Setup immature entry (availableAt in future)
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 24);

      const immatureEntry = await prisma.sellerLedgerEntry.create({
        data: {
          sellerId: seller.id,
          orderLineId: line.id,
          amount: 2000,
          type: LedgerEntryType.SALE,
          status: LedgerStatus.PENDING,
          availableAt: futureDate
        }
      });

      // 3. Run job
      await handleCronJob({ name: 'release-escrow' });

      // 4. Verify mature entry is AVAILABLE
      const updatedMature = await prisma.sellerLedgerEntry.findUnique({ where: { id: matureEntry.id } });
      expect(updatedMature?.status).toBe(LedgerStatus.AVAILABLE);

      // 5. Verify immature entry is still PENDING
      const updatedImmature = await prisma.sellerLedgerEntry.findUnique({ where: { id: immatureEntry.id } });
      expect(updatedImmature?.status).toBe(LedgerStatus.PENDING);
    });
  });

  describe('confirm-commissions', () => {
    it('should confirm mature affiliate commissions', async () => {
      // Setup affiliate agent
      const user = await prisma.user.create({
        data: {
          email: `agent-${Date.now()}@example.com`,
          firstName: 'Agent',
          lastName: 'User'
        }
      });

      const agent = await prisma.affiliateAgent.create({
        data: {
          userId: user.id,
          commissionRate: 5
        }
      });

      // Setup mature commission (Order COMPLETED and updated > 24h ago)
      const matureDate = new Date();
      matureDate.setHours(matureDate.getHours() - 25);

      const orderMature = await prisma.order.create({
        data: {
          userId: user.id,
          status: OrderStatus.COMPLETED,
          total: 1000,
          subtotal: 1000,
          shippingFee: 0,
          discount: 0,
          paymentMethod: 'CARD',
          updatedAt: matureDate
        }
      });

      const matureComm = await prisma.commission.create({
        data: {
          agentId: agent.id,
          orderId: orderMature.id,
          amount: 50,
          status: 'PENDING'
        }
      });

      // 3. Run job
      await handleCronJob({ name: 'confirm-commissions' });

      // 4. Verify mature commission is PAID
      const updatedComm = await prisma.commission.findUnique({ where: { id: matureComm.id } });
      expect(updatedComm?.status).toBe('PAID');
    });
  });
});

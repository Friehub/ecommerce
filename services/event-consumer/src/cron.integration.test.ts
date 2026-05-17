import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from 'vitest';
import { prisma, OrderStatus, LedgerStatus, LedgerEntryType } from '@ecom/db';
import { handleCronJob } from './cron.js';

const brandService = prisma.brand;
const categoryService = prisma.category;
const commissionService = prisma.commission;
const payoutService = prisma.payout;
const sellerStatementService = prisma.sellerStatement;
const sellerLedgerEntryService = prisma.sellerLedgerEntry;
const orderLineService = prisma.orderLine;
const orderPackageService = prisma.orderPackage;
const stockReservationService = prisma.stockReservation;
const orderService = prisma.order;
const affiliateAgentService = prisma.affiliateAgent;
const stockLevelService = prisma.stockLevel;
const reviewService = prisma.review;
const cartItemService = prisma.cartItem;
const flashSaleService = prisma.flashSale;
const adConversionService = prisma.adConversion;
const adCampaignService = prisma.adCampaign;
const productVariantService = prisma.productVariant;
const productService = prisma.product;
const sellerDocumentService = prisma.sellerDocument;
const sellerService = prisma.seller;
const cartService = prisma.cart;
const walletTransactionService = prisma.walletTransaction;
const walletService = prisma.wallet;
const userService = prisma.user;
const warehouseService = prisma.warehouse;

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
    
    const brand = await brandService.create({
      data: { 
        name: 'Test Brand',
        slug: `brand-${Math.random().toString(36)}`
      }
    });
    sharedBrandId = brand.id;

    const category = await categoryService.create({
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
    await commissionService.deleteMany();
    await payoutService.deleteMany();
    await sellerStatementService.deleteMany();
    await sellerLedgerEntryService.deleteMany();
    await orderLineService.deleteMany();
    await orderPackageService.deleteMany();
    await stockReservationService.deleteMany();
    await orderService.deleteMany();
    await affiliateAgentService.deleteMany();
    await stockLevelService.deleteMany();
    await reviewService.deleteMany();
    await cartItemService.deleteMany();
    await flashSaleService.deleteMany();
    await adConversionService.deleteMany();
    await adCampaignService.deleteMany();
    await productVariantService.deleteMany();
    await productService.deleteMany();
    await sellerDocumentService.deleteMany();
    await sellerService.deleteMany();
    await cartService.deleteMany();
    await walletTransactionService.deleteMany();
    await walletService.deleteMany();
    await userService.deleteMany();
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

      const user = await userService.create({
        data: {
          email: `stale-${Date.now()}@example.com`,
          firstName: 'Stale',
          lastName: 'User'
        }
      });

      const orderStale = await orderService.create({
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

      const orderFresh = await orderService.create({
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
      const updatedStale = await orderService.findUnique({ where: { id: orderStale.id } });
      expect(updatedStale?.status).toBe(OrderStatus.CANCELLED);

      // 5. Verify fresh order is still FRAUD_REVIEW
      const updatedFresh = await orderService.findUnique({ where: { id: orderFresh.id } });
      expect(updatedFresh?.status).toBe(OrderStatus.FRAUD_REVIEW);
    });
  });

  describe('release-escrow', () => {
    it('should release mature escrow entries', async () => {
      // Setup seller, order, and ledger entries
      const user = await userService.create({
        data: {
          email: `seller-${Date.now()}@example.com`,
          firstName: 'Seller',
          lastName: 'User'
        }
      });

      const seller = await sellerService.create({
        data: {
          userId: user.id,
          businessName: 'Cron Test Seller'
        }
      });

      const warehouse = await warehouseService.create({
        data: { name: 'Test Hub', address: '123 Hub St' }
      });

      const product = await productService.create({
        data: {
          title: `P-${Math.random().toString(36)}`,
          slug: `p-${Math.random().toString(36)}`,
          description: 'Desc',
          sellerId: seller.id,
          brandId: sharedBrandId,
          categoryId: sharedCategoryId,
        }
      });

      const variant = await productVariantService.create({
        data: {
          productId: product.id,
          sku: `SKU-${Date.now()}`,
          price: 1000,
          attributes: { color: 'Red' }
        }
      });

      const order = await orderService.create({
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

      const pkg = await orderPackageService.create({
        data: {
          orderId: order.id,
          sellerId: seller.id,
          warehouseId: warehouse.id,
          status: 'DELIVERED'
        }
      });

      const line = await orderLineService.create({
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

      const matureEntry = await sellerLedgerEntryService.create({
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

      const immatureEntry = await sellerLedgerEntryService.create({
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
      const updatedMature = await sellerLedgerEntryService.findUnique({ where: { id: matureEntry.id } });
      expect(updatedMature?.status).toBe(LedgerStatus.AVAILABLE);

      // 5. Verify immature entry is still PENDING
      const updatedImmature = await sellerLedgerEntryService.findUnique({ where: { id: immatureEntry.id } });
      expect(updatedImmature?.status).toBe(LedgerStatus.PENDING);
    });
  });

  describe('confirm-commissions', () => {
    it('should confirm mature affiliate commissions', async () => {
      // Setup affiliate agent
      const user = await userService.create({
        data: {
          email: `agent-${Date.now()}@example.com`,
          firstName: 'Agent',
          lastName: 'User'
        }
      });

      const agent = await affiliateAgentService.create({
        data: {
          userId: user.id,
          commissionRate: 5
        }
      });

      // Setup mature commission (Order COMPLETED and updated > 24h ago)
      const matureDate = new Date();
      matureDate.setHours(matureDate.getHours() - 25);

      const orderMature = await orderService.create({
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

      const matureComm = await commissionService.create({
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
      const updatedComm = await commissionService.findUnique({ where: { id: matureComm.id } });
      expect(updatedComm?.status).toBe('PAID');
    });
  });
});

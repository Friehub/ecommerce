import { vi } from 'vitest';
// IMPORTANT: Unmock database to use the real one
vi.unmock('@ecom/db');

import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@ecom/db';
import { paymentService } from '../../modules/payment/services/payment-service.js';
import { ledgerService } from '../../modules/revenue/services/ledger-service.js';
import { clearDatabase } from './setup.js';

describe('Payment & Revenue Integration Test (Real DB)', () => {
  let userId: string;
  let sellerId: string;
  let categoryId: string;
  let productId: string;
  let variantId: string;
  let orderId: string;

  beforeEach(async () => {
    console.log('Running test with DB:', process.env.DATABASE_URL);
    await clearDatabase();

    // 1. Setup User & Seller
    const timestamp = Date.now() + Math.random();
    const user = await prisma.user.create({
      data: { email: `buyer-${timestamp}@test.com`, firstName: 'Buyer' }
    });
    userId = user.id;

    const sellerUser = await prisma.user.create({
      data: { email: `seller-${Math.random()}@test.com`, firstName: 'Seller' }
    });
    const seller = await prisma.seller.create({
      data: { 
        userId: sellerUser.id, 
        businessName: 'Test Store',
        status: 'ACTIVE'
      }
    });
    sellerId = seller.id;

    // 2. Setup Catalog
    const brand = await prisma.brand.create({
      data: { name: 'Apple', slug: 'apple' }
    });

    const category = await prisma.category.create({
      data: { name: 'Electronics', slug: 'elec', commissionRate: 10 }
    });
    categoryId = category.id;

    const product = await prisma.product.create({
      data: {
        title: 'Smartphone',
        slug: 'phone',
        description: 'A great smartphone',
        brandId: brand.id,
        sellerId,
        categoryId,
        status: 'ACTIVE'
      }
    });
    productId = product.id;

    const warehouse = await prisma.warehouse.create({
      data: { name: 'Main', address: '123 Warehouse St' }
    });

    const variant = await prisma.productVariant.create({
      data: {
        productId,
        sku: 'PHONE-RED',
        price: 1000,
        attributes: { color: 'Red' },
        stockLevels: {
          create: {
            qtyOnHand: 10,
            sellerId,
            warehouseId: warehouse.id
          }
        }
      }
    });
    variantId = variant.id;

    // 3. Create Order
    const order = await prisma.order.create({
      data: {
        userId,
        status: 'PENDING_PAYMENT',
        subtotal: 1000,
        shippingFee: 0,
        discount: 0,
        total: 1000,
        paymentMethod: 'WALLET',
        packages: {
          create: {
            sellerId,
            warehouseId: warehouse.id,
            status: 'PENDING',
            lines: {
              create: {
                variantId,
                quantity: 1,
                unitPrice: 1000
              }
            }
          }
        }
      }
    });
    orderId = order.id;
  });

  describe('Wallet Payments', () => {
    it('should successfully pay for an order using wallet balance', async () => {
      // 1. Fund the wallet
      await paymentService.fundWallet(userId, 2000);

      // 2. Pay for order
      await paymentService.payWithWallet(userId, orderId, 1000);

      // 3. Verify balance
      const wallet = await prisma.wallet.findUnique({ where: { userId } });
      expect(wallet?.balance.toNumber()).toBe(1000);

      // 4. Verify order status
      const updatedOrder = await prisma.order.findUnique({ where: { id: orderId } });
      expect(updatedOrder?.status).toBe('PAID');

      // 5. Verify payment record
      const payment = await prisma.payment.findFirst({ where: { orderId } });
      expect(payment?.status).toBe('SUCCESS');
      expect(payment?.method).toBe('WALLET');
    });

    it('should fail if wallet balance is insufficient', async () => {
      await paymentService.fundWallet(userId, 500);
      await expect(paymentService.payWithWallet(userId, orderId, 1000)).rejects.toThrow('INSUFFICIENT_FUNDS');
    });
  });

  describe('Webhook & Revenue Integration', () => {
    it('should reconcile external payment and update seller ledger via webhook', async () => {
      const reference = 'PAY-REF-123';
      
      // 1. Create pending payment record
      await prisma.payment.create({
        data: {
          orderId,
          userId,
          amount: 1000,
          method: 'CARD',
          status: 'PENDING',
          providerRef: reference
        }
      });

      // 2. Handle successful webhook
      await paymentService.handleWebhook(reference, 'success');

      // 3. Verify order status
      const updatedOrder = await prisma.order.findUnique({ 
        where: { id: orderId },
        include: { packages: { include: { lines: true } } }
      });
      expect(updatedOrder?.status).toBe('PAID');

      // 4. Verify Revenue/Ledger Entries (Automatic)
      const lineId = updatedOrder?.packages[0].lines[0].id!;
      
      // Verify Sale Entry (Gross)
      const saleEntries = await prisma.sellerLedgerEntry.findMany({
        where: { sellerId, type: 'SALE', orderLineId: lineId }
      });
      expect(saleEntries.length).toBe(1);
      expect(saleEntries[0].amount.toNumber()).toBe(1000);
      expect(saleEntries[0].status).toBe('PENDING');

      // Verify Commission Entry (10%)
      const commissionEntries = await prisma.sellerLedgerEntry.findMany({
        where: { sellerId, type: 'COMMISSION', orderLineId: lineId }
      });
      expect(commissionEntries.length).toBe(1);
      expect(commissionEntries[0].amount.toNumber()).toBe(-100);

      // 5. Test Idempotency: Call recordSale again manually
      // This should NOT create new entries (Fix for BUG-2.3: Double Ledger)
      await ledgerService.recordSale(lineId);
      
      const saleEntriesAfter = await prisma.sellerLedgerEntry.findMany({
        where: { sellerId, type: 'SALE', orderLineId: lineId }
      });
      expect(saleEntriesAfter.length).toBe(1); // Still 1

      // 6. Verify Seller Balance (Net)
      const balance = await ledgerService.getSellerBalance(sellerId, 'PENDING');
      expect(balance.toNumber()).toBe(900);
    });

    it('should handle transfer webhooks with idempotency', async () => {
      // 1. Create a pending payout
      const payout = await prisma.payout.create({
        data: {
          sellerId,
          amount: 500,
          status: 'PENDING',
          bankRef: 'TRF-123'
        }
      });

      // 2. Handle first success webhook
      await paymentService.handleWebhook(payout.id, 'success', 'transfer.success');

      // 3. Verify payout status is COMPLETED
      const updatedPayout = await prisma.payout.findUnique({ where: { id: payout.id } });
      expect(updatedPayout?.status).toBe('COMPLETED');
      expect(updatedPayout?.processedAt).toBeDefined();

      // 4. Handle second success webhook (duplicate)
      // This should be a no-op due to idempotency guard
      const firstProcessedAt = updatedPayout?.processedAt;
      await paymentService.handleWebhook(payout.id, 'success', 'transfer.success');

      const finalPayout = await prisma.payout.findUnique({ where: { id: payout.id } });
      expect(finalPayout?.status).toBe('COMPLETED');
      // Verify processedAt didn't change (proving no-op)
      expect(finalPayout?.processedAt?.getTime()).toBe(firstProcessedAt?.getTime());
    });
  });
});

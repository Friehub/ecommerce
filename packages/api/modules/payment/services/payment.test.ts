import { describe, it, expect, vi, beforeEach } from 'vitest';
import { paymentService } from './payment-service.js';
import { prisma, Decimal } from '@ecom/db';
import { orderService } from '../../order/services/order-service.js';

// Mock Dependencies
vi.mock('@ecom/db', () => {
  const mockPrisma = {
    $transaction: vi.fn((cb) => cb(mockPrisma)),
    wallet: {
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    walletTransaction: {
      create: vi.fn(),
    },
    payment: {
      create: vi.fn(),
    },
    order: {
      findUnique: vi.fn(),
    },
    eventLog: {
      create: vi.fn(),
      updateMany: vi.fn(),
    },
  };
  return {
    prisma: mockPrisma,
    Decimal: class {
      val: number;
      constructor(v: any) { this.val = Number(v); }
      lt(v: any) { return this.val < (v.val ?? Number(v)); }
      gte(v: any) { return this.val >= (v.val ?? Number(v)); }
      toNumber() { return this.val; }
    }
  };
});

vi.mock('../../order/services/order-service.js', () => ({
  orderService: {
    updateStatus: vi.fn(),
  }
}));

describe('paymentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('payWithWallet', () => {
    it('should successfully pay with wallet if balance is sufficient', async () => {
      const userId = 'user_1';
      const orderId = 'order_1';
      const amount = 500;
      
      const mockOrder = { id: orderId, status: 'PENDING_PAYMENT' };
      const mockWallet = { id: 'w1', userId, balance: new Decimal(1000) };

      (orderService.findUnique as any).mockResolvedValue(mockOrder);
      (walletService.updateMany as any).mockResolvedValue({ count: 1 });
      (walletService.findUnique as any).mockResolvedValue(mockWallet);

      await paymentService.payWithWallet(userId, orderId, amount);

      expect(orderService.findUnique).toHaveBeenCalledWith({ where: { id: orderId } });
      expect(walletService.updateMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ userId, balance: { gte: amount } })
      }));
      expect(orderService.updateStatus).toHaveBeenCalledWith(orderId, 'PAID', expect.anything());
      expect(paymentService.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ status: 'SUCCESS' })
      }));
      expect(eventLogService.create).toHaveBeenCalled();
    });

    it('should throw if order is already processed', async () => {
      (orderService.findUnique as any).mockResolvedValue({ id: 'o1', status: 'PAID' });
      await expect(paymentService.payWithWallet('u1', 'o1', 500)).rejects.toThrow('ORDER_ALREADY_PROCESSED:PAID');
    });

    it('should throw if balance is insufficient (updateMany returns count 0)', async () => {
      (orderService.findUnique as any).mockResolvedValue({ id: 'o1', status: 'PENDING_PAYMENT' });
      (walletService.updateMany as any).mockResolvedValue({ count: 0 });
      await expect(paymentService.payWithWallet('u1', 'o1', 500)).rejects.toThrow('INSUFFICIENT_FUNDS');
    });
  });
});

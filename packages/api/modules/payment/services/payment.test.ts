import { describe, it, expect, vi, beforeEach } from 'vitest';
import { paymentService } from './payment-service.js';
import { prisma, Decimal } from '@ecom/db';
import { orderService } from '../../order/services/order-service.js';

// Mock Dependencies
vi.mock('@ecom/db', () => ({
  prisma: {
    $transaction: vi.fn((cb) => cb(prisma)),
    wallet: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    walletTransaction: {
      create: vi.fn(),
    },
    payment: {
      create: vi.fn(),
    },
  },
  Decimal: class {
    val: number;
    constructor(v: any) { this.val = Number(v); }
    lt(v: any) { return this.val < (v.val ?? Number(v)); }
    toNumber() { return this.val; }
  }
}));

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
      
      const mockWallet = { id: 'w1', userId, balance: new Decimal(1000) };
      const mockUpdatedWallet = { id: 'w1', balance: new Decimal(500) };

      (prisma.wallet.findUnique as any).mockResolvedValue(mockWallet);
      (prisma.wallet.update as any).mockResolvedValue(mockUpdatedWallet);

      await paymentService.payWithWallet(userId, orderId, amount);

      expect(prisma.wallet.update).toHaveBeenCalled();
      expect(orderService.updateStatus).toHaveBeenCalledWith(orderId, 'PAID', expect.anything());
      expect(prisma.payment.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ status: 'SUCCESS' })
      }));
    });

    it('should throw if initial balance is insufficient', async () => {
      (prisma.wallet.findUnique as any).mockResolvedValue({ balance: new Decimal(100) });
      await expect(paymentService.payWithWallet('u1', 'o1', 500)).rejects.toThrow('INSUFFICIENT_FUNDS');
    });

    it('should throw and rollback if balance becomes negative during update (race condition)', async () => {
      const mockWallet = { id: 'w1', balance: new Decimal(1000) };
      const mockUpdatedWallet = { id: 'w1', balance: new Decimal(-50) }; // Overdrafted by concurrent transaction

      (prisma.wallet.findUnique as any).mockResolvedValue(mockWallet);
      (prisma.wallet.update as any).mockResolvedValue(mockUpdatedWallet);

      await expect(paymentService.payWithWallet('u1', 'o1', 500)).rejects.toThrow('INSUFFICIENT_FUNDS');
    });
  });
});

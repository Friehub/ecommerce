import { describe, it, expect, vi, beforeEach } from 'vitest';
import { orderService } from './order-service';
import { prisma, Decimal } from '@ecom/db';

// Mock Dependencies
vi.mock('@ecom/db', () => ({
  prisma: {
    order: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    orderPackage: {
      findUnique: vi.fn(),
    },
    orderLine: {
      findMany: vi.fn(),
    }
  },
  Decimal: class {
    val: number;
    constructor(v: any) { this.val = Number(v); }
    toNumber() { return this.val; }
    mul(v: any) { return new (this.constructor as any)(this.val * (v.val ?? Number(v))); }
    add(v: any) { return new (this.constructor as any)(this.val + (v.val ?? Number(v))); }
    sub(v: any) { return new (this.constructor as any)(this.val - (v.val ?? Number(v))); }
  },
  OrderStatus: {
    PENDING_PAYMENT: 'PENDING_PAYMENT',
    PAID: 'PAID',
    PROCESSING: 'PROCESSING',
    CANCELLED: 'CANCELLED',
  }
}));

vi.mock('@ecom/shared', () => ({
  publishEvent: vi.fn(),
  queues: {
    orderQueue: { add: vi.fn() }
  }
}));

vi.mock('../../inventory/services/inventory-service.js', () => ({
  inventoryService: {
    releaseStockByOrderId: vi.fn(),
    confirmStock: vi.fn(),
  }
}));

describe('orderService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getOrder', () => {
    it('should return a deeply nested structure as expected by the frontend', async () => {
      const mockOrder = {
        id: 'o1',
        userId: 'u1',
        status: 'PAID',
        packages: [
          {
            id: 'p1',
            lines: [
              {
                id: 'l1',
                unitPrice: new Decimal(1000),
                variant: {
                  id: 'v1',
                  product: { title: 'Product 1' }
                }
              }
            ]
          }
        ]
      };

      (prisma.order.findUnique as any).mockResolvedValue(mockOrder);

      const result = await orderService.getOrder('o1', 'u1');

      // Verify the depth and availability of price data
      expect(result.packages[0].lines[0]).toHaveProperty('unitPrice');
      expect(result.packages[0].lines[0].variant.product.title).toBe('Product 1');
    });
  });

  describe('cancelOrder', () => {
    it('should allow a user to cancel their own order', async () => {
      const mockOrder = { id: 'o1', userId: 'u1', status: 'PENDING_PAYMENT' };
      (prisma.order.findUnique as any).mockResolvedValue(mockOrder);
      (prisma.order.update as any).mockResolvedValue({ ...mockOrder, status: 'CANCELLED' });

      const result = await orderService.cancelOrder('o1', 'u1');
      expect(result.status).toBe('CANCELLED');
    });

    it('should throw if order does not belong to user', async () => {
      (prisma.order.findUnique as any).mockResolvedValue(null);
      await expect(orderService.cancelOrder('o1', 'wrong_user')).rejects.toThrow('ORDER_NOT_FOUND');
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { orderService } from './order-service';
import { prisma, Decimal } from '@ecom/db';
import { inventoryService } from '../../inventory/services/inventory-service.js';

// Mock Dependencies
vi.mock('@ecom/db', () => ({
  prisma: {
    order: {
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    orderPackage: {
      findUnique: vi.fn(),
    },
    orderLine: {
      findMany: vi.fn(),
    },
    userAddress: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
    cart: {
      findUnique: vi.fn(),
    },
    cartItem: {
      deleteMany: vi.fn(),
    },
    flashSale: {
      findFirst: vi.fn(),
      updateMany: vi.fn(),
    },
    stockLevel: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn((cb) => cb(prisma)),
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
    reserveStock: vi.fn(),
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

      (orderService.findUnique as any).mockResolvedValue(mockOrder);

      const result = await orderService.getOrder('o1', 'u1');

      // Verify the depth and availability of price data
      expect(result.packages[0].lines[0]).toHaveProperty('unitPrice');
      expect(result.packages[0].lines[0].variant.product.title).toBe('Product 1');
    });
  });

  describe('cancelOrder', () => {
    it('should allow a user to cancel their own order', async () => {
      const mockOrder = { id: 'o1', userId: 'u1', status: 'PENDING_PAYMENT' };
      (orderService.findUnique as any).mockResolvedValue(mockOrder);
      (orderService.update as any).mockResolvedValue({ ...mockOrder, status: 'CANCELLED' });

      const result = await orderService.cancelOrder('o1', 'u1');
      expect(result.status).toBe('CANCELLED');
    });

    it('should throw if order does not belong to user', async () => {
      (orderService.findUnique as any).mockResolvedValue(null);
      await expect(orderService.cancelOrder('o1', 'wrong_user')).rejects.toThrow('ORDER_NOT_FOUND');
    });
  });

  describe('createFromCart', () => {
    it('should throw if address does not belong to user (BUG-005 fix)', async () => {
      const userId = 'u1';
      const cartId = 'c1';
      const addressId = 'a1';

      (cartService.findUnique as any).mockResolvedValue({
        id: cartId,
        items: [{ id: 'item1', sellerId: 's1', variantId: 'v1', quantity: 1, priceSnapshot: new Decimal(100), variant: { price: new Decimal(100) } }]
      });

      // Mock address ownership failure
      (userAddressService.findFirst as any).mockResolvedValue(null);

      await expect(orderService.createFromCart(userId, cartId, 'CARD', addressId))
        .rejects.toThrow('ADDRESS_NOT_FOUND_OR_UNAUTHORIZED');
    });

    it('should successfully create order if address belongs to user', async () => {
      const userId = 'u1';
      const cartId = 'c1';
      const addressId = 'a1';

      (cartService.findUnique as any).mockResolvedValue({
        id: cartId,
        items: [{ id: 'item1', sellerId: 's1', variantId: 'v1', quantity: 1, priceSnapshot: new Decimal(100), variant: { price: new Decimal(100) } }]
      });

      (userAddressService.findFirst as any).mockResolvedValue({ id: addressId, userId });
      (userAddressService.findUnique as any).mockResolvedValue({ id: addressId, userId, state: 'Lagos' });
      
      (orderService.create as any).mockResolvedValue({ 
        id: 'o1', 
        total: new Decimal(600), 
        packages: [{ id: 'pkg1', lines: [{ id: 'l1' }] }] 
      });

      (stockLevelService.findFirst as any).mockResolvedValue({ id: 'sl1', warehouseId: 'w1' });
      (flashSaleService.findFirst as any).mockResolvedValue(null);
      (inventoryService.reserveStock as any).mockResolvedValue(true);

      const result = await orderService.createFromCart(userId, cartId, 'CARD', addressId);

      expect(result.id).toBe('o1');
      expect(orderService.create).toHaveBeenCalled();
    });
  });
});

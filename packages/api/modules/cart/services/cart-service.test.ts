import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cartService } from './cart-service';
import { prisma, Decimal } from '@ecom/db';
import { inventoryService } from '../../inventory/services/inventory-service.js';
import { promoService } from '../../promo/services/promo-service.js';

// Mock Dependencies
vi.mock('@ecom/db', () => ({
  prisma: {
    cart: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    cartItem: {
      upsert: vi.fn(),
    },
    productVariant: {
      findUnique: vi.fn(),
    },
  },
  Decimal: class {
    val: number;
    constructor(v: any) { this.val = Number(v); }
    toNumber() { return this.val; }
    toString() { return String(this.val); }
  }
}));

vi.mock('../../inventory/services/inventory-service.js', () => ({
  inventoryService: {
    syncStockFromDB: vi.fn(),
  }
}));

vi.mock('../../promo/services/promo-service.js', () => ({
  promoService: {
    getFlashSaleForVariant: vi.fn(),
  }
}));

describe('cartService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addItem', () => {
    it('should use flash sale price if active', async () => {
      const sessionId = 'session_1';
      const variantId = 'v_1';
      const mockCart = { id: 'cart_1' };
      const mockVariant = { 
        id: variantId, 
        price: new Decimal(1000),
        product: { sellerId: 's_1' } 
      };
      const mockFlashSale = { salePrice: new Decimal(800) };

      (cartService.upsert as any).mockResolvedValue(mockCart);
      (productVariantService.findUnique as any).mockResolvedValue(mockVariant);
      (inventoryService.syncStockFromDB as any).mockResolvedValue(10);
      (promoService.getFlashSaleForVariant as any).mockResolvedValue(mockFlashSale);

      await cartService.addItem(sessionId, variantId, 1);

      expect(cartItemService.upsert).toHaveBeenCalledWith(expect.objectContaining({
        create: expect.objectContaining({
          priceSnapshot: mockFlashSale.salePrice
        })
      }));
    });

    it('should fall back to regular price if no flash sale', async () => {
      const sessionId = 'session_1';
      const variantId = 'v_1';
      const mockCart = { id: 'cart_1' };
      const mockVariant = { 
        id: variantId, 
        price: new Decimal(1000),
        product: { sellerId: 's_1' } 
      };

      (cartService.upsert as any).mockResolvedValue(mockCart);
      (productVariantService.findUnique as any).mockResolvedValue(mockVariant);
      (inventoryService.syncStockFromDB as any).mockResolvedValue(10);
      (promoService.getFlashSaleForVariant as any).mockResolvedValue(null);

      await cartService.addItem(sessionId, variantId, 1);

      expect(cartItemService.upsert).toHaveBeenCalledWith(expect.objectContaining({
        create: expect.objectContaining({
          priceSnapshot: mockVariant.price
        })
      }));
    });

    it('should throw if insufficient stock', async () => {
      (cartService.upsert as any).mockResolvedValue({ id: 'c1' });
      (productVariantService.findUnique as any).mockResolvedValue({ price: new Decimal(100) });
      (inventoryService.syncStockFromDB as any).mockResolvedValue(0);

      await expect(cartService.addItem('s1', 'v1', 1)).rejects.toThrow('INSUFFICIENT_STOCK');
    });
  });
});

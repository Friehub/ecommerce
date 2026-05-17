import { describe, it, expect, vi, beforeEach } from 'vitest';
import { catalogService } from './catalog-service';
import { prisma, Decimal } from '@ecom/db';

// Mock Dependencies
vi.mock('@ecom/db', () => ({
  prisma: {
    productVariant: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
    product: {
      findUnique: vi.fn(),
    },
    category: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    brand: {
      findMany: vi.fn(),
    }
  },
  Decimal: class {
    val: number;
    constructor(v: any) { this.val = Number(v); }
    toNumber() { return this.val; }
  }
}));

vi.mock('../../../shared', () => ({
  publishEvent: vi.fn(),
}));

describe('catalogService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listProducts', () => {
    it('should return flattened results with numerical prices to prevent frontend ₦0 mismatch', async () => {
      const mockVariants = [
        {
          id: 'v1',
          price: new Decimal(1500.50),
          comparePrice: new Decimal(2000),
          product: {
            title: 'Test Product',
            slug: 'test-product',
            media: [{ url: 'image.jpg' }],
            brand: { name: 'Test Brand' },
            category: { name: 'Test Category' }
          }
        }
      ];

      (productVariantService.findMany as any).mockResolvedValue(mockVariants);
      (productVariantService.count as any).mockResolvedValue(1);

      const response = await catalogService.listProducts({});

      expect(response.results[0]).toHaveProperty('price', 1500.50);
      expect(typeof response.results[0].price).toBe('number');
      expect(response.results[0]).toHaveProperty('title', 'Test Product');
      expect(response.results[0]).toHaveProperty('media');
    });
  });

  describe('getCategoryTree', () => {
    it('should return a list of root categories', async () => {
      const mockCategories = [{ id: 'c1', name: 'Electronics' }];
      (categoryService.findMany as any).mockResolvedValue(mockCategories);

      const results = await catalogService.getCategoryTree();
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Electronics');
    });
  });
});

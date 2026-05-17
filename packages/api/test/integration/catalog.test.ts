import { vi, describe, it, expect, beforeAll } from 'vitest';
vi.unmock('@ecom/db');
import { prisma, Decimal } from '@ecom/db';
import { catalogService } from '../../modules/catalog/services/catalog-service';
import { clearDatabase, TEST_DB_URL } from './setup';

process.env.DATABASE_URL = TEST_DB_URL;

describe('Catalog Integration', () => {
  let sellerProfileId: string;
  let categoryId: string;
  let brandId: string;

  beforeAll(async () => {
    await clearDatabase();

    // 1. Setup Prerequisites
    const seller = await userService.create({
      data: { email: 'cat-seller@example.com', role: 'SELLER' }
    });
    
    const profile = await sellerService.create({
      data: { userId: seller.id, businessName: 'Catalog Shop', status: 'ACTIVE' }
    });
    sellerProfileId = profile.id;

    const category = await categoryService.create({
      data: { name: 'Smartphones', slug: 'smartphones', commissionRate: new Decimal(5) }
    });
    categoryId = category.id;

    const warehouse = await warehouseService.create({
      data: { name: 'Test Warehouse', address: '123 Test St' }
    });

    const brand = await brandService.create({
      data: { name: 'TechCo', slug: 'techco' }
    });
    brandId = brand.id;
  });

  it('should create a product with variants', async () => {
    const productData = {
      title: 'TechPhone X',
      description: 'The latest phone',
      brandId,
      categoryId,
      variants: [
        { sku: 'PH-X-BLK', price: new Decimal(50000), attributes: { color: 'Black' }, weightGrams: 200 }
      ],
      images: ['https://example.com/phone.jpg']
    };

    const product = await catalogService.createProduct(sellerProfileId, productData);

    expect(product.id).toBeDefined();
    expect(product.variants).toHaveLength(1);
    expect(product.variants[0].sku).toBe('PH-X-BLK');

    const dbProduct = await productService.findUnique({
      where: { id: product.id },
      include: { variants: true, media: true }
    });

    expect(dbProduct?.title).toBe('TechPhone X');
    expect(dbProduct?.media).toHaveLength(1);
  });
});

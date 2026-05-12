import { vi, describe, it, expect, beforeAll } from 'vitest';
vi.unmock('@ecom/db');
import { prisma, Decimal } from '@ecom/db';
import { cartService } from '../../modules/cart/services/cart-service';
import { clearDatabase, TEST_DB_URL } from './setup';

process.env.DATABASE_URL = TEST_DB_URL;

describe('Cart Integration', () => {
  let userId: string;
  let variantId: string;
  let sellerProfileId: string;

  beforeAll(async () => {
    await clearDatabase();

    // 1. Setup User
    const user = await prisma.user.create({
      data: { email: 'cart-user@example.com' }
    });
    userId = user.id;

    // 2. Setup Seller & Product
    const seller = await prisma.user.create({
      data: { email: 'cart-seller@example.com', role: 'SELLER' }
    });
    const profile = await prisma.seller.create({
      data: { userId: seller.id, businessName: 'Cart Shop', status: 'ACTIVE' }
    });
    sellerProfileId = profile.id;

    const category = await prisma.category.create({
      data: { name: 'Carts', slug: 'carts', commissionRate: new Decimal(10) }
    });
    const brand = await prisma.brand.create({
      data: { name: 'CartBrand', slug: 'cartbrand' }
    });

    const product = await prisma.product.create({
      data: {
        title: 'Cart Item',
        slug: 'cart-item',
        description: 'Testing carts',
        sellerId: sellerProfileId,
        brandId: brand.id,
        categoryId: category.id,
        status: 'ACTIVE'
      }
    });

    const variant = await prisma.productVariant.create({
      data: {
        productId: product.id,
        sku: 'CART-SKU',
        price: new Decimal(100),
        attributes: {}
      }
    });
    variantId = variant.id;

    const warehouse = await prisma.warehouse.create({
      data: { name: 'Cart Warehouse', address: 'Test' }
    });

    await prisma.stockLevel.create({
      data: {
        variantId,
        warehouseId: warehouse.id,
        sellerId: sellerProfileId,
        qtyOnHand: 100
      }
    });
  });

  it('should add an item to a new cart', async () => {
    // addItem(sessionId, variantId, quantity, userId?)
    await cartService.addItem('session-1', variantId, 2);

    const dbCart = await prisma.cart.findUnique({
      where: { sessionId: 'session-1' },
      include: { items: true }
    });

    expect(dbCart?.items).toHaveLength(1);
    expect(dbCart?.items[0].quantity).toBe(2);
    expect(dbCart?.items[0].variantId).toBe(variantId);
  });

  it('should merge guest cart into user cart on login', async () => {
    // 1. Create Guest Cart
    await cartService.addItem('guest-session', variantId, 1);

    // 2. Merge into User
    await cartService.mergeCart('guest-session', userId);

    const userCart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true }
    });

    expect(userCart?.items).toHaveLength(1);
    expect(userCart?.items[0].quantity).toBe(1);
  });
});

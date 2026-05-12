import { vi, describe, it, expect, beforeAll } from 'vitest';
vi.unmock('@ecom/db');
import { prisma, Decimal } from '@ecom/db';
import { orderService } from '../../modules/order/services/order-service';
import { clearDatabase, TEST_DB_URL } from './setup';

// Use the test database
process.env.DATABASE_URL = TEST_DB_URL;

describe('Order Integration Test (Real DB)', () => {
  let userId: string;
  let addressId: string;
  let sellerId: string;
  let sellerProfileId: string;
  let warehouseId: string;
  let variantId: string;

  beforeAll(async () => {
    // Cleanup using shared utility
    await clearDatabase();

    // Setup Test Data
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      },
    });
    userId = user.id;

    const address = await prisma.userAddress.create({
      data: {
        userId,
        firstName: 'Test',
        lastName: 'User',
        phone: '08012345678',
        streetAddress: '123 Test St',
        city: 'Lagos',
        state: 'Lagos',
        country: 'Nigeria',
      },
    });
    addressId = address.id;

    const seller = await prisma.user.create({
      data: {
        email: 'seller@example.com',
        role: 'SELLER',
      },
    });
    sellerId = seller.id;

    // Create Seller Profile
    const sellerProfile = await prisma.seller.create({
      data: {
        userId: sellerId,
        businessName: 'Test Shop',
        status: 'ACTIVE',
      },
    });
    sellerProfileId = sellerProfile.id;

    const category = await prisma.category.create({
      data: {
        name: 'Electronics',
        slug: 'electronics',
        commissionRate: new Decimal(10),
      },
    });

    const brand = await prisma.brand.create({
      data: {
        name: 'Test Brand',
        slug: 'test-brand',
      },
    });

    const warehouse = await prisma.warehouse.create({
      data: {
        name: 'Main Warehouse',
        address: 'Lagos',
      },
    });
    warehouseId = warehouse.id;

    const product = await prisma.product.create({
      data: {
        title: 'Test Product',
        slug: 'test-product',
        description: 'A test product',
        sellerId: sellerProfile.id,
        brandId: brand.id,
        categoryId: category.id,
        status: 'ACTIVE',
      },
    });

    const variant = await prisma.productVariant.create({
      data: {
        productId: product.id,
        sku: 'TEST-SKU',
        price: new Decimal(1000),
        weightGrams: 500,
        attributes: {},
      },
    });
    variantId = variant.id;

    await prisma.stockLevel.create({
      data: {
        variantId,
        sellerId: sellerProfileId,
        warehouseId,
        qtyOnHand: 100,
      },
    });
  });

  it('should create a real order from a cart', async () => {
    // 1. Create a cart with an item
    const cart = await prisma.cart.create({
      data: {
        userId,
        sessionId: 'test-session',
        items: {
          create: {
            variantId,
            sellerId: sellerProfileId,
            quantity: 1,
            priceSnapshot: new Decimal(1000),
          },
        },
      },
    });

    // 2. Execute order creation
    const order = await orderService.createFromCart(userId, cart.id, 'CARD', addressId);

    // 3. Verify Database State
    expect(order).toBeDefined();
    expect(order.userId).toBe(userId);
    expect(order.total.toNumber()).toBeGreaterThan(1000); // Price + Shipping

    const dbOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: { 
        packages: { 
          include: { lines: true } 
        } 
      },
    });

    expect(dbOrder).toBeDefined();
    expect(dbOrder?.packages.length).toBe(1);
    expect(dbOrder?.packages[0].warehouseId).toBe(warehouseId);
    expect(dbOrder?.packages[0].lines.length).toBe(1);
  });
});

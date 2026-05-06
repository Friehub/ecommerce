import { orderService } from './services/order-service.js';
import { packageService } from './services/package-service.js';
import { prisma } from '@ecom/db';

async function verifyOMS() {
  console.log('🚀 Starting OMS Verification...');

  try {
    // 1. Setup mock data
    const user = await prisma.user.findFirst();
    if (!user) throw new Error('No user found');
    
    const address = await prisma.userAddress.create({
      data: {
        userId: user.id,
        firstName: 'Test',
        lastName: 'Buyer',
        phone: '08012345678',
        streetAddress: '123 Fake Street',
        city: 'Lagos',
        state: 'Lagos',
        isDefault: true
      }
    });

    const variant = await prisma.productVariant.findFirst({ include: { product: true } });
    if (!variant) throw new Error('No variant found');

    await prisma.$transaction(async (tx) => {
      const existingCart = await tx.cart.findUnique({ where: { userId: user.id } });
      if (existingCart) {
        await tx.cartItem.deleteMany({ where: { cartId: existingCart.id } });
        await tx.cart.delete({ where: { id: existingCart.id } });
      }
    });
    const cart = await prisma.cart.create({ data: { sessionId: 'test-session-' + Date.now(), userId: user.id } });
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        variantId: variant.id,
        sellerId: variant.product.sellerId,
        quantity: 1,
        priceSnapshot: variant.price
      }
    });

    // 2. Create Order
    console.log('Step 1: Creating order from cart...');
    const order = await orderService.createFromCart(user.id, cart.id, 'PAYSTACK', address.id);
    console.log(`✅ Order created: ${order.id}, status: ${order.status}`);

    // 3. Mark as PAID
    console.log('Step 2: Marking order as PAID...');
    const paidOrder = await orderService.updateStatus(order.id, 'PAID');
    console.log(`✅ Order paid: ${paidOrder.id}, status: ${paidOrder.status}`);

    // 4. Seller Confirms (PROCESSING)
    console.log('Step 3: Seller confirming order...');
    const processingOrder = await orderService.updateStatus(order.id, 'PROCESSING');
    console.log(`✅ Order processing: ${processingOrder.id}, status: ${processingOrder.status}`);

    // 5. Seller Ships Package
    console.log('Step 4: Seller shipping package...');
    const pkg = processingOrder.packages[0];
    await packageService.updateStatus(pkg.id, 'IN_TRANSIT', 'TRK123456');
    console.log(`✅ Package shipped: ${pkg.id}`);

    // 6. Verify parent order is now SHIPPED
    const shippedOrder = await prisma.order.findUnique({ where: { id: order.id } });
    console.log(`✅ Parent order status: ${shippedOrder?.status}`);

    // 7. Delivery
    console.log('Step 5: Marking package as DELIVERED...');
    await packageService.updateStatus(pkg.id, 'DELIVERED');
    const deliveredOrder = await prisma.order.findUnique({ where: { id: order.id } });
    console.log(`✅ Parent order status: ${deliveredOrder?.status}`);

    console.log('✨ OMS Verification Successful!');
  } catch (error) {
    console.error('❌ OMS Verification Failed:', error);
    process.exit(1);
  }
}

verifyOMS();

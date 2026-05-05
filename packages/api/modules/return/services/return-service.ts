import { prisma } from '@ecom/db'
import { paymentService } from '../../payment/services/payment-service'
import { publishEvent } from '@ecom/shared'

export const returnService = {
  async initiateReturn(userId: string, orderLineId: string, reason: string) {
    const line = await prisma.orderLine.findUnique({
      where: { id: orderLineId },
      include: { package: { include: { order: true } } }
    });

    if (!line || line.package.order.userId !== userId) throw new Error('ORDER_NOT_FOUND');
    
    // B02: Also allow if parent order is DELIVERED
    const isDelivered = line.package.status === 'DELIVERED' || line.package.order.status === 'DELIVERED';
    if (!isDelivered) throw new Error('NOT_DELIVERED');

    // E03: Check if the return window has expired (7 days)
    const RETURN_WINDOW_DAYS = 7;
    const deliveredAt = line.package.order.updatedAt; // Using updatedAt as a proxy for delivery time
    const daysSinceDelivery = (Date.now() - deliveredAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceDelivery > RETURN_WINDOW_DAYS) {
      throw new Error('RETURN_WINDOW_EXPIRED');
    }

    // E04: Prevent duplicate return requests for the same order line
    const existing = await prisma.returnShipment.findFirst({
      where: { 
        orderLineId, 
        status: { in: ['PENDING', 'APPROVED'] } 
      }
    });
    if (existing) throw new Error('RETURN_ALREADY_REQUESTED');

    return prisma.returnShipment.create({
      data: {
        orderLineId,
        reason,
        status: 'PENDING'
      }
    });
  },

  async approveReturn(returnId: string, adminId: string) {
    const request = await prisma.returnShipment.findUnique({
      where: { id: returnId },
      include: { orderLine: { include: { package: { include: { order: true } } } } }
    });

    if (!request) throw new Error('REQUEST_NOT_FOUND');

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update status
      await tx.returnShipment.update({
        where: { id: returnId },
        data: { 
          status: 'APPROVED',
          qcResult: 'PASS',
          refundTriggered: true
        }
      });

      // 2. Process Refund to Wallet (B01: pass tx)
      const refundAmount = request.orderLine.unitPrice.mul(request.orderLine.quantity);
      await paymentService.fundWallet(request.orderLine.package.order.userId, refundAmount.toNumber(), tx);

      // 3. Create Refund record (B03)
      const payment = await tx.payment.findFirst({
        where: { orderId: request.orderLine.package.order.id, status: 'SUCCESS' }
      });
      if (payment) {
        await tx.refund.create({
          data: {
            paymentId: payment.id,
            orderId: request.orderLine.package.order.id,
            amount: refundAmount,
            status: 'PROCESSED',
            reason: request.reason,
          }
        });
      }

      // 4. Mark line as returned
      await tx.orderLine.update({
        where: { id: request.orderLineId },
        data: { isReturned: true }
      });

      return refundAmount;
    });

    await publishEvent('refund.processed', {
      userId: request.orderLine.package.order.userId,
      orderId: request.orderLine.package.order.id,
      amount: result.toNumber()
    });
  }
};

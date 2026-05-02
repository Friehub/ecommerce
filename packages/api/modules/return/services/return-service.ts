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
    if (line.package.status !== 'DELIVERED') throw new Error('NOT_DELIVERED');

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

      // 2. Process Refund to Wallet
      const refundAmount = request.orderLine.unitPrice.mul(request.orderLine.quantity);
      await paymentService.fundWallet(request.orderLine.package.order.userId, refundAmount.toNumber());

      // 3. Mark line as returned
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

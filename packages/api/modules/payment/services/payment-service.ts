import { prisma, Decimal } from '@ecom/db'
import { publishEvent } from '@ecom/shared'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'sk_test_placeholder';

export const paymentService = {
  async initializePaystack(orderId: string, email: string, amount: number) {
    // In a real app, we'd call Paystack API here
    // const res = await fetch('https://api.paystack.co/transaction/initialize', ...)
    
    const reference = `ORD-${orderId}-${Date.now()}`;
    
    // Create payment record
    await prisma.payment.create({
      data: {
        orderId,
        userId: email, // Placeholder logic: normally we'd have the actual userId
        amount: new Decimal(amount),
        method: 'CARD',
        status: 'PENDING',
        providerRef: reference,
      }
    });

    return {
      authorization_url: `https://checkout.paystack.com/${reference}`,
      reference
    };
  },

  async handleWebhook(reference: string, status: string) {
    const payment = await prisma.payment.findFirst({
      where: { providerRef: reference }
    });

    if (!payment) return;

    if (status === 'success') {
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: 'SUCCESS' }
        });

        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: 'PAID' }
        });
      });

      await publishEvent('payment.confirmed', { orderId: payment.orderId, amount: payment.amount });
    }
  },

  async fundWallet(userId: string, amount: number) {
    return prisma.wallet.upsert({
      where: { userId },
      update: {
        balance: { increment: amount },
        transactions: {
          create: {
            type: 'CREDIT',
            amount: new Decimal(amount),
            description: 'Wallet funding'
          }
        }
      },
      create: {
        userId,
        balance: new Decimal(amount),
        transactions: {
          create: {
            type: 'CREDIT',
            amount: new Decimal(amount),
            description: 'Initial wallet funding'
          }
        }
      }
    });
  },

  async payWithWallet(userId: string, orderId: string, amount: number) {
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet || wallet.balance.lt(amount)) throw new Error('INSUFFICIENT_FUNDS');

    return prisma.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: amount } }
      });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'DEBIT',
          amount: new Decimal(amount),
          description: `Payment for order ${orderId}`
        }
      });

      await tx.order.update({
        where: { id: orderId },
        data: { status: 'PAID' }
      });

      await tx.payment.create({
        data: {
          orderId,
          userId,
          amount: new Decimal(amount),
          method: 'WALLET',
          status: 'SUCCESS'
        }
      });
    });
  }
};

import { prisma, Decimal } from '@ecom/db'
import { publishEvent } from '@ecom/shared'
import * as crypto from 'crypto'
import { orderService } from '../../order/services/order-service'
import { fraudManager } from '../../shared/services/managers/fraud-manager'
import { secretManager } from '../../shared/services/managers/secret-manager'
import { getPaymentAdapter } from '../adapters'

export const paymentService = {
  async initializeTransaction(provider: string, orderId: string, userId: string, email: string, amount: number, ipAddress: string = 'unknown') {
    // 1. Centralized Fraud Check (DRY)
    await fraudManager.verifyTransaction({
      userId,
      amount,
      currency: 'NGN',
      ipAddress,
      shippingCountry: 'NG'
    });

    // 2. Delegate to Adapter (DIP)
    const adapter = getPaymentAdapter(provider);
    const callbackUrl = `${secretManager.nextAuthUrl}/checkout/success?orderId=${orderId}`;

    const initResult = await adapter.initializeTransaction({
      orderId,
      userId,
      email,
      amountInSubunit: amount * 100,
      currency: 'NGN',
      callbackUrl,
    });

    // 3. Persistent Record
    await prisma.payment.create({
      data: {
        orderId,
        userId, 
        amount: new Decimal(amount),
        method: provider.toUpperCase(),
        status: 'PENDING',
        providerRef: initResult.providerRef,
      }
    });

    return {
      authorization_url: initResult.authorizationUrl,
      reference: initResult.reference
    };
  },

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const secret = secretManager.get('PAYSTACK_WEBHOOK_SECRET', 'whsec_test_placeholder');
    const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
    return hash === signature;
  },

  async handleWebhook(reference: string, status: string) {
    const payment = await prisma.payment.findFirst({
      where: { providerRef: reference }
    });

    if (!payment || payment.status === 'SUCCESS') return; // Idempotency check

    if (status === 'success' || status === 'SUCCESS') {
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: 'SUCCESS' }
        });
        await orderService.updateStatus(payment.orderId, 'PAID', tx);
      });

      await publishEvent('payment.confirmed', { orderId: payment.orderId, amount: payment.amount.toNumber() });
    }
  },

  async fundWallet(userId: string, amount: number) {
    return prisma.wallet.upsert({
      where: { userId },
      update: {
        balance: { increment: amount },
        transactions: {
          create: { type: 'CREDIT', amount: new Decimal(amount), description: 'Wallet funding' }
        }
      },
      create: {
        userId,
        balance: new Decimal(amount),
        transactions: {
          create: { type: 'CREDIT', amount: new Decimal(amount), description: 'Initial wallet funding' }
        }
      }
    });
  },

  async payWithWallet(userId: string, orderId: string, amount: number) {
    const { lockManager } = await import('../../shared/services/managers/lock-manager');
    
    // Critical Section: Use Distributed Lock to prevent double-spending
    return await lockManager.withLock(`wallet:${userId}`, async () => {
      const wallet = await prisma.wallet.findUnique({ where: { userId } });
      const decimalAmount = new Decimal(amount);
      if (!wallet || wallet.balance.lt(decimalAmount)) throw new Error('INSUFFICIENT_FUNDS');

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

        await orderService.updateStatus(orderId, 'PAID', tx);

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
    });
  }
};

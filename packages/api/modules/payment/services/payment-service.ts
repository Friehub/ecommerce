import { prisma, Decimal } from '@ecom/db'
import { publishEvent } from '@ecom/shared'
import { RustClient } from '../../../rust-client'
import * as crypto from 'crypto'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'sk_test_placeholder';
const PAYSTACK_WEBHOOK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET || 'whsec_test_placeholder';

import { getPaymentAdapter } from '../adapters'

export const paymentService = {
  async initializeTransaction(provider: string, orderId: string, userId: string, email: string, amount: number, ipAddress: string = 'unknown') {
    // 1. Perform Fraud Check via Rust Fraud Service
    try {
      const fraudCheck = await RustClient.fraud.check({
        user_id: userId,
        amount,
        currency: 'NGN',
        ip_address: ipAddress,
        shipping_country: 'NG',
        device_id: 'unknown'
      });

      if (fraudCheck.recommendation === 'BLOCK') {
        throw new Error('FRAUD_DETECTION_BLOCKED');
      }
    } catch (e: any) {
      if (e.message === 'FRAUD_DETECTION_BLOCKED') throw e;
      console.warn('Rust fraud service unavailable, proceeding with caution:', e);
    }

    const adapter = getPaymentAdapter(provider);
    const callbackUrl = `${process.env.NEXTAUTH_URL}/checkout/success?orderId=${orderId}`;

    const initResult = await adapter.initializeTransaction({
      orderId,
      userId,
      email,
      amountInSubunit: amount * 100,
      currency: 'NGN',
      callbackUrl,
    });

    // Create payment record
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

  async initializePaystack(orderId: string, userId: string, email: string, amount: number, ipAddress: string = 'unknown') {
    // 1. Perform Fraud Check via Rust Fraud Service
    try {
      const fraudCheck = await RustClient.fraud.check({
        user_id: userId,
        amount,
        currency: 'NGN',
        ip_address: ipAddress,
        shipping_country: 'NG',
        device_id: 'unknown'
      });

      if (fraudCheck.recommendation === 'BLOCK') {
        throw new Error('FRAUD_DETECTION_BLOCKED');
      }
    } catch (e: any) {
      if (e.message === 'FRAUD_DETECTION_BLOCKED') throw e;
      console.warn('Rust fraud service unavailable, proceeding with caution:', e);
    }

    const amountInKobo = amount * 100; // Paystack expects amount in kobo
    const reference = `ORD-${orderId}-${Date.now()}`;
    
    // Call Paystack API
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amountInKobo,
        reference,
        callback_url: `${process.env.NEXTAUTH_URL}/checkout/success?orderId=${orderId}`,
        metadata: {
          orderId,
          custom_fields: [
            {
              display_name: "Order ID",
              variable_name: "order_id",
              value: orderId
            }
          ]
        }
      }),
    });

    const data = await response.json();
    if (!data.status) {
      throw new Error(`PAYSTACK_INIT_FAILED: ${data.message}`);
    }

    // Create payment record
    await prisma.payment.create({
      data: {
        orderId,
        userId, 
        amount: new Decimal(amount),
        method: 'CARD',
        status: 'PENDING',
        providerRef: reference,
      }
    });

    return {
      authorization_url: data.data.authorization_url,
      reference
    };
  },

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const hash = crypto.createHmac('sha512', PAYSTACK_WEBHOOK_SECRET).update(rawBody).digest('hex');
    return hash === signature;
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

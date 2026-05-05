import { prisma, Decimal } from '@ecom/db'
import { publishEvent } from '@ecom/shared'
import { RustClient } from '../../../rust-client'
import type { Service } from '../../../types'
import * as crypto from 'crypto'
import { orderService } from '../../order/services/order-service'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'sk_test_placeholder';
const PAYSTACK_WEBHOOK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET || 'whsec_test_placeholder';

import { getPaymentAdapter } from '../adapters'

export const paymentService: Service = {
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

    if (!payment) {
      console.warn(`[PaymentService] Webhook received for unknown reference: ${reference}`);
      return;
    }

    // Idempotency check: Skip if already success
    if (payment.status === 'SUCCESS') {
      console.log(`[PaymentService] Payment ${reference} already marked as SUCCESS, skipping.`);
      return;
    }

    if (status === 'success') {
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: 'SUCCESS' }
        });

        // Use orderService to ensure side effects are triggered
        await orderService.updateStatus(payment.orderId, 'PAID', tx);
      });

      await publishEvent('payment.confirmed', { orderId: payment.orderId, amount: payment.amount });
    } else {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' }
      });
    }
  },

  async fundWallet(userId: string, amount: number, tx?: any) {
    const db = tx || prisma;
    return db.wallet.upsert({
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
    return prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet || wallet.balance.lt(amount)) throw new Error('INSUFFICIENT_FUNDS');

      // E06: Atomic balance decrement and re-verify
      const updated = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: amount } }
      });

      if (updated.balance.lt(0)) {
        throw new Error('INSUFFICIENT_FUNDS'); // Rollback if concurrent spend caused overdraft
      }

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'DEBIT',
          amount: new Decimal(amount),
          description: `Payment for order ${orderId}`
        }
      });

      // Use orderService to ensure side effects are triggered
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
  }
};

import { prisma, Decimal } from '@ecom/db'
import { publishEvent } from '@ecom/shared'
import { RustClient } from '../../../rust-client.js'
import * as crypto from 'crypto'
import { orderService } from '../../order/services/order-service.js'
import { createBreaker } from '../../../utils/resilience.js'

const fraudCheckBreaker = createBreaker(
  (data: any) => RustClient.fraud.check(data),
  'fraud-check'
);

const paystackInitBreaker = createBreaker(
  async (params: any) => {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${params.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params.body),
    });
    const data = await response.json();
    if (!data.status) throw new Error(data.message);
    return data;
  },
  'paystack-init'
);

import { config } from '../../../config.js';

const PAYSTACK_SECRET_KEY = config.PAYSTACK_SECRET_KEY;
const PAYSTACK_WEBHOOK_SECRET = config.PAYSTACK_WEBHOOK_SECRET;

import { getPaymentAdapter } from '../adapters/index.js'

export const paymentService = {
  async initializeTransaction(provider: string, orderId: string, userId: string, email: string, amount: number, ipAddress: string = 'unknown') {
    // 1. Perform Fraud Check via Rust Fraud Service
    try {
      const fraudCheck = await fraudCheckBreaker.fire({
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
    const reference = `ORD-${orderId}-${Date.now()}`;

    // Create payment record BEFORE calling processor (Fix BUG-001)
    await prisma.payment.create({
      data: {
        orderId,
        userId, 
        amount: new Decimal(amount),
        method: provider.toUpperCase(),
        status: 'PENDING',
        providerRef: reference,
      }
    });

    const initResult = await adapter.initializeTransaction({
      orderId,
      userId,
      email,
      amountInSubunit: amount * 100,
      currency: 'NGN',
      callbackUrl,
      reference, // Pass our reference
    });

    return {
      authorization_url: initResult.authorizationUrl,
      reference
    };
  },

  async initializePaystack(orderId: string, userId: string, email: string, amount: number, ipAddress: string = 'unknown') {
    // 1. Perform Fraud Check via Rust Fraud Service
    try {
      const fraudCheck = await fraudCheckBreaker.fire({
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
    
    // Create payment record BEFORE calling processor (Fix BUG-001)
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

    // Call Paystack API via breaker
    const data = await paystackInitBreaker.fire({
      secretKey: PAYSTACK_SECRET_KEY,
      body: {
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
      }
    });

    return {
      authorization_url: data.data.authorization_url,
      reference
    };
  },

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const hash = crypto.createHmac('sha512', PAYSTACK_WEBHOOK_SECRET).update(rawBody).digest('hex');
    try {
      return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(signature, 'hex'));
    } catch {
      return false;
    }
  },

  async handleWebhook(reference: string, status: string, eventType?: string) {
    // Handle Payout Transfers
    if (eventType === 'transfer.success' || eventType === 'transfer.failed') {
      const payout = await prisma.payout.findFirst({
        where: { id: reference } // We use payout ID as reference for transfers
      });

      if (!payout) return;
      
      // Idempotency guard: Skip if already COMPLETED or FAILED (Fix BUG-2.10)
      if (payout.status === 'COMPLETED' || payout.status === 'FAILED') {
        console.log(`[PaymentService] Payout ${payout.id} already processed with status ${payout.status}, skipping.`);
        return;
      }

      await prisma.payout.update({
        where: { id: payout.id },
        data: { 
          status: eventType === 'transfer.success' ? 'COMPLETED' : 'FAILED',
          processedAt: new Date()
        }
      });

      if (eventType === 'transfer.success') {
        await publishEvent('payout.completed', { payoutId: payout.id });
      } else {
        await publishEvent('payout.failed', { payoutId: payout.id });
      }
      return;
    }

    // Handle Charge Events (Payments)
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
        if (payment.orderId === 'WALLET_FUND') {
          await this.fundWallet(payment.userId, payment.amount.toNumber(), tx);
        } else {
          await orderService.updateStatus(payment.orderId, 'PAID', tx);
        }
      });

      if (payment.orderId === 'WALLET_FUND') {
        await publishEvent('wallet.funded', { userId: payment.userId, amount: payment.amount });
      } else {
        await publishEvent('payment.confirmed', { orderId: payment.orderId, amount: payment.amount });
      }
    } else {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' }
      });
      // Optionally notify order service that payment failed
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
  
  async requestWalletFunding(userId: string, email: string, amount: number) {
     const reference = `WALLET-FUND-${userId}-${Date.now()}`;
     
     // Create a payment record to track the funding attempt
     await prisma.payment.create({
       data: {
         orderId: 'WALLET_FUND', // Sentinel for wallet funding
         userId,
         amount: new Decimal(amount),
         method: 'CARD',
         status: 'PENDING',
         providerRef: reference,
       }
     });

     const adapter = getPaymentAdapter('paystack');
     const initResult = await adapter.initializeTransaction({
       orderId: 'WALLET_FUND',
       userId,
       email,
       amountInSubunit: amount * 100,
       currency: 'NGN',
       callbackUrl: `${process.env.NEXTAUTH_URL}/wallet`,
       reference,
     });

     return initResult;
  },

  async initiateWithdrawal(userId: string, amount: number) {
    return prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet || wallet.balance.lt(amount)) {
        throw new Error('INSUFFICIENT_FUNDS');
      }

      // 1. Deduct from wallet immediately (escrow-style)
      await tx.wallet.update({
        where: { userId },
        data: { balance: { decrement: amount } }
      });

      // 2. Create withdrawal record (Reusing Payout table or specific table if available)
      // Since we don't have a Withdrawal table, we check schema or use a generic settlement flow.
      // For now, we'll log it as a DEBIT transaction and publish an event for admin approval.
      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'DEBIT',
          amount: new Decimal(amount),
          description: 'Withdrawal request'
        }
      });

      await publishEvent('wallet.withdrawal_requested', {
        userId,
        amount,
        transactionId: transaction.id
      });

      return transaction;
    });
  },

  async payWithWallet(userId: string, orderId: string, amount: number) {
    return prisma.$transaction(async (tx) => {
      // Fix BUG-002: Atomic decrement with guard in WHERE clause
      const result = await tx.wallet.updateMany({
        where: { 
          userId, 
          balance: { gte: amount } 
        },
        data: { 
          balance: { decrement: amount } 
        }
      });

      if (result.count === 0) {
        throw new Error('INSUFFICIENT_FUNDS');
      }

      // Get wallet ID for transaction log
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) throw new Error('WALLET_NOT_FOUND');

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
          status: 'SUCCESS',
          providerRef: `WAL-${orderId}-${Date.now()}`
        }
      });
    });

    await publishEvent('payment.confirmed', { orderId, amount });
  },

  async setupPayoutAccount(sellerId: string, params: { bankCode: string, accountNumber: string, accountName: string }) {
    const adapter = getPaymentAdapter('paystack');
    const { recipientCode } = await adapter.createTransferRecipient({
      ...params,
      currency: 'NGN'
    });

    return await prisma.seller.update({
      where: { id: sellerId },
      data: {
        bankCode: params.bankCode,
        bankAccountNumber: params.accountNumber,
        bankAccountName: params.accountName,
        transferRecipientCode: recipientCode
      }
    });
  },

  async initiatePayout(payoutId: string) {
    const payout = await prisma.payout.findUnique({
      where: { id: payoutId },
      include: { seller: true }
    });

    if (!payout || !payout.seller.transferRecipientCode) {
      throw new Error('PAYOUT_OR_RECIPIENT_NOT_FOUND');
    }

    const adapter = getPaymentAdapter('paystack');
    const result = await adapter.initiatePayout({
      recipientCode: payout.seller.transferRecipientCode,
      amountInSubunit: payout.amount.mul(100).toNumber(),
      reason: `Payout for ${payout.seller.businessName}`,
      reference: payout.id // Use payout ID as our reference
    });

    return await prisma.payout.update({
      where: { id: payoutId },
      data: {
        status: 'PROCESSING', // Move to PROCESSING until webhook confirms
        bankRef: result.transferRef
      }
    });
  }
};

// packages/api/modules/payment/adapters/paystack.adapter.ts
import * as crypto from 'crypto';
import type {
  PaymentAdapter,
  InitParams,
  InitResult,
  WebhookResult,
  RefundParams,
  RefundResult,
  PayoutParams,
  PayoutResult,
} from './types';

import { secretManager } from '../../shared/services/managers/secret-manager';

const PAYSTACK_BASE = 'https://api.paystack.co';

function getHeaders() {
  return {
    Authorization: `Bearer ${secretManager.paystackSecret}`,
    'Content-Type': 'application/json',
  };
}

export class PaystackAdapter implements PaymentAdapter {
  readonly name = 'paystack';

  async initializeTransaction(params: InitParams): Promise<InitResult> {
    const reference = `ORD-${params.orderId}-${Date.now()}`;

    const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        email: params.email,
        amount: params.amountInSubunit,
        reference,
        callback_url: params.callbackUrl,
        metadata: {
          orderId: params.orderId,
          ...(params.metadata ?? {}),
        },
      }),
    });

    const data = await res.json();
    if (!data.status) {
      throw new Error(`PAYSTACK_INIT_FAILED: ${data.message}`);
    }

    return {
      authorizationUrl: data.data.authorization_url,
      reference,
      providerRef: data.data.reference,
    };
  }

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const hash = crypto
      .createHmac('sha512', secretManager.paystackWebhookSecret)
      .update(rawBody)
      .digest('hex');
    return hash === signature;
  }

  parseWebhookEvent(payload: Record<string, unknown>): WebhookResult | null {
    const event = payload.event as string | undefined;
    const data = payload.data as Record<string, unknown> | undefined;

    if (!event || !data) return null;

    if (event === 'charge.success') {
      return {
        orderId: (data.metadata as any)?.orderId ?? '',
        reference: data.reference as string,
        status: 'success',
        amount: (data.amount as number) / 100, // kobo → NGN
      };
    }

    if (event === 'charge.failed') {
      return {
        orderId: (data.metadata as any)?.orderId ?? '',
        reference: data.reference as string,
        status: 'failed',
        amount: (data.amount as number) / 100,
      };
    }

    return null;
  }

  async initiateRefund(params: RefundParams): Promise<RefundResult> {
    const body: Record<string, unknown> = {
      transaction: params.providerRef,
    };
    if (params.amount) body.amount = params.amount; // partial refund in kobo

    const res = await fetch(`${PAYSTACK_BASE}/refund`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!data.status) {
      throw new Error(`PAYSTACK_REFUND_FAILED: ${data.message}`);
    }

    return {
      refundRef: data.data.id as string,
      status: 'pending',
    };
  }

  async initiatePayout(params: PayoutParams): Promise<PayoutResult> {
    const res = await fetch(`${PAYSTACK_BASE}/transfer`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        source: 'balance',
        reason: params.reason,
        amount: params.amountInSubunit,
        recipient: params.recipientCode,
        reference: params.reference,
      }),
    });

    const data = await res.json();
    if (!data.status) {
      throw new Error(`PAYSTACK_PAYOUT_FAILED: ${data.message}`);
    }

    return {
      transferRef: data.data.reference as string,
      status: 'pending',
    };
  }
}

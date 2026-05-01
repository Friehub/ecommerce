// packages/api/modules/payment/adapters/flutterwave.adapter.ts
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

const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY || 'FLWSECK_test_placeholder';
const FLW_WEBHOOK_SECRET = process.env.FLW_WEBHOOK_SECRET || 'flw_whsec_placeholder';
const FLW_BASE = 'https://api.flutterwave.com/v3';

function headers() {
  return {
    Authorization: `Bearer ${FLW_SECRET_KEY}`,
    'Content-Type': 'application/json',
  };
}

export class FlutterwaveAdapter implements PaymentAdapter {
  readonly name = 'flutterwave';

  async initializeTransaction(params: InitParams): Promise<InitResult> {
    const reference = `FLW-ORD-${params.orderId}-${Date.now()}`;

    const res = await fetch(`${FLW_BASE}/payments`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        tx_ref: reference,
        amount: params.amountInSubunit / 100, // Flutterwave takes normal amount in major unit
        currency: params.currency || 'NGN',
        redirect_url: params.callbackUrl,
        customer: {
          email: params.email,
        },
        meta: {
          orderId: params.orderId,
          ...(params.metadata ?? {}),
        },
        customizations: {
          title: 'Jumia Checkout',
          description: `Payment for Order #${params.orderId}`,
        },
      }),
    });

    const data = await res.json();
    if (data.status !== 'success') {
      throw new Error(`FLUTTERWAVE_INIT_FAILED: ${data.message}`);
    }

    return {
      authorizationUrl: data.data.link,
      reference,
      providerRef: reference,
    };
  }

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    // Flutterwave signature is often passed in the 'verif-hash' header
    return signature === FLW_WEBHOOK_SECRET;
  }

  parseWebhookEvent(payload: Record<string, unknown>): WebhookResult | null {
    const event = payload.event as string | undefined;
    const data = payload.data as Record<string, unknown> | undefined;

    if (!event || !data) return null;

    if (event === 'charge.completed' && data.status === 'successful') {
      return {
        orderId: (data.meta as any)?.orderId ?? '',
        reference: data.tx_ref as string,
        status: 'success',
        amount: data.amount as number,
      };
    }

    return null;
  }

  async initiateRefund(params: RefundParams): Promise<RefundResult> {
    // Flutterwave refund endpoint
    const res = await fetch(`${FLW_BASE}/transactions/${params.providerRef}/refund`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        amount: params.amount ? params.amount / 100 : undefined,
      }),
    });

    const data = await res.json();
    if (data.status !== 'success') {
      throw new Error(`FLUTTERWAVE_REFUND_FAILED: ${data.message}`);
    }

    return {
      refundRef: data.data.id ? String(data.data.id) : `RFD-${Date.now()}`,
      status: 'success',
    };
  }

  async initiatePayout(params: PayoutParams): Promise<PayoutResult> {
    const res = await fetch(`${FLW_BASE}/transfers`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        account_bank: params.recipientCode, // bank code
        account_number: params.reference, // account number
        amount: params.amountInSubunit / 100,
        currency: 'NGN',
        narration: params.reason,
        reference: `PAY-${Date.now()}`,
      }),
    });

    const data = await res.json();
    if (data.status !== 'success') {
      throw new Error(`FLUTTERWAVE_PAYOUT_FAILED: ${data.message}`);
    }

    return {
      transferRef: String(data.data.id),
      status: 'pending',
    };
  }
}

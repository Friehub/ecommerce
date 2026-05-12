import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { paymentService } from '@ecom/api/modules/payment/services/payment-service';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'sk_test_placeholder';

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-paystack-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Verify signature (Fix BUG-004 & BUG-017: Delegation to service with timing-safe check)
    if (!paymentService.verifyWebhookSignature(body, signature, 'paystack')) {
      console.warn('[Paystack Webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    console.log(`[Paystack Webhook] Received event: ${event.event}`);

    if (event.event === 'charge.success') {
      const { reference } = event.data;
      await paymentService.handleWebhook(reference, 'success', event.event);
    } else if (event.event === 'charge.failed') {
      const { reference } = event.data;
      await paymentService.handleWebhook(reference, 'failed', event.event);
    } else if (event.event === 'transfer.success' || event.event === 'transfer.failed') {
      const { transfer_code, reference } = event.data;
      // reference for transfers should be our payout ID
      await paymentService.handleWebhook(reference || transfer_code, 'success', event.event);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[Paystack Webhook] Error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

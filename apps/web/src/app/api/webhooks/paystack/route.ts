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

    // Verify signature
    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET_KEY)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      console.warn('[Paystack Webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    console.log(`[Paystack Webhook] Received event: ${event.event}`);

    if (event.event === 'charge.success') {
      const { reference } = event.data;
      await paymentService.handleWebhook(reference, 'success');
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[Paystack Webhook] Error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

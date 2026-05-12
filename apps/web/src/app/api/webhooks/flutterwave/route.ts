import { NextResponse } from 'next/server';
import { paymentService } from '@ecom/api/modules/payment/services/payment-service';

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('verif-hash');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    if (!paymentService.verifyWebhookSignature(body, signature, 'flutterwave')) {
      console.warn('[Flutterwave Webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    console.log(`[Flutterwave Webhook] Received event: ${event.event}`);

    // Flutterwave payload structure differs from Paystack
    // Success: event: "charge.completed", data.status: "successful"
    if (event.event === 'charge.completed') {
      const { tx_ref, status } = event.data;
      await paymentService.handleWebhook(tx_ref, status === 'successful' ? 'success' : 'failed', event.event);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[Flutterwave Webhook] Error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

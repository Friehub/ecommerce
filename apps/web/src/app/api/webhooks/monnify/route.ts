import { NextResponse } from 'next/server';
import { paymentService } from '@ecom/api/modules/payment/services/payment-service';

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('monnify-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    if (!paymentService.verifyWebhookSignature(body, signature, 'monnify')) {
      console.warn('[Monnify Webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    console.log(`[Monnify Webhook] Received event: ${event.eventType}`);

    // Monnify payload structure
    // eventType: "SUCCESSFUL_TRANSACTION", eventData.paymentReference
    if (event.eventType === 'SUCCESSFUL_TRANSACTION') {
      const { paymentReference } = event.eventData;
      await paymentService.handleWebhook(paymentReference, 'success', event.eventType);
    } else if (event.eventType === 'FAILED_TRANSACTION') {
      const { paymentReference } = event.eventData;
      await paymentService.handleWebhook(paymentReference, 'failed', event.eventType);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[Monnify Webhook] Error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getPaymentAdapter } from '@ecom/api/modules/payment/adapters';
import { paymentService } from '@ecom/api/modules/payment/services/payment-service';

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('monnify-signature');
    const bodyText = await req.text();
    
    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    const adapter = getPaymentAdapter('monnify');
    if (!adapter.verifyWebhookSignature(bodyText, signature)) {
      console.warn('[Monnify Webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    const body = JSON.parse(bodyText);
    const event = adapter.parseWebhookEvent(body);
    
    if (event && event.status === 'success') {
      await paymentService.handleWebhook(event.reference, 'success', body.eventType);
    } else if (event && event.status === 'failed') {
      await paymentService.handleWebhook(event.reference, 'failed', body.eventType);
    }
    
    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    console.error('[Monnify Webhook] Error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

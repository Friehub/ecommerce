import { NextRequest, NextResponse } from 'next/server';
import { getPaymentAdapter } from '@ecom/api/modules/payment/adapters';
import { paymentService } from '@ecom/api/modules/payment/services/payment-service';

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('verif-hash');
    const bodyText = await req.text();
    
    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    const adapter = getPaymentAdapter('flutterwave');
    if (!adapter.verifyWebhookSignature(bodyText, signature)) {
      console.warn('[Flutterwave Webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    const body = JSON.parse(bodyText);
    const event = adapter.parseWebhookEvent(body);
    
    if (event && event.status === 'success') {
      await paymentService.handleWebhook(event.reference, 'success', 'charge.completed');
    } else if (event && event.status === 'failed') {
      await paymentService.handleWebhook(event.reference, 'failed', 'charge.failed');
    }
    
    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    console.error('[Flutterwave Webhook] Error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

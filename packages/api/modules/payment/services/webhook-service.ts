// packages/api/modules/payment/services/webhook-service.ts
import { prisma } from '@ecom/db';
import { paymentService } from './payment-service.js';
import { getPaymentAdapter } from '../adapters/index.js';
import { config } from '../../../config.js';

export const webhookService = {
  async processWebhook(provider: string, rawBody: string, signature: string) {
    const adapter = getPaymentAdapter(provider);
    
    // 1. Verify Signature
    const isValid = adapter.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      throw new Error(`INVALID_WEBHOOK_SIGNATURE: ${provider}`);
    }

    // 2. Parse Event
    const payload = JSON.parse(rawBody);
    const result = adapter.parseWebhookEvent(payload);

    if (!result) {
      // Return success to provider even if we don't handle the event type
      return { handled: false };
    }

    // 3. Handle Payout (Transfer) Events
    // Note: This logic might differ per provider, but for now we follow the existing pattern
    const eventType = (payload.event || payload.eventType) as string;
    if (eventType?.includes('transfer')) {
       await paymentService.handleWebhook(result.reference, result.status, eventType);
       return { handled: true };
    }

    // 4. Handle Charge (Payment) Events
    await paymentService.handleWebhook(result.reference, result.status);
    
    return { handled: true };
  }
};

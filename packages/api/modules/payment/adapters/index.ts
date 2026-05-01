// packages/api/modules/payment/adapters/index.ts
import type { PaymentAdapter } from './types';
import { PaystackAdapter } from './paystack.adapter';
import { FlutterwaveAdapter } from './flutterwave.adapter';
import { MonnifyAdapter } from './monnify.adapter';

export * from './types';

const adapters: Record<string, PaymentAdapter> = {
  paystack: new PaystackAdapter(),
  flutterwave: new FlutterwaveAdapter(),
  monnify: new MonnifyAdapter(),
};

export function getPaymentAdapter(provider: string): PaymentAdapter {
  const adapter = adapters[provider.toLowerCase()];
  if (!adapter) {
    throw new Error(`UNKNOWN_PAYMENT_PROVIDER: ${provider}`);
  }
  return adapter;
}

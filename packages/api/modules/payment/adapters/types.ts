// packages/api/modules/payment/adapters/types.ts
// Provider-agnostic payment adapter interface.
// Every new payment provider must implement this contract.

export interface InitParams {
  orderId: string;
  userId: string;
  email: string;
  /** Amount in the smallest currency unit (e.g. kobo for NGN). */
  amountInSubunit: number;
  currency: string;
  callbackUrl: string;
  reference?: string;
  metadata?: Record<string, unknown>;
}

export interface InitResult {
  authorizationUrl: string;
  reference: string;
  providerRef: string;
}

export interface WebhookResult {
  orderId: string;
  reference: string;
  status: 'success' | 'failed' | 'pending';
  amount: number;
}

export interface RefundParams {
  providerRef: string;
  /** Amount in kobo/subunit. If omitted the full amount is refunded. */
  amount?: number;
  reason?: string;
}

export interface RefundResult {
  refundRef: string;
  status: 'pending' | 'success' | 'failed';
}

export interface PayoutParams {
  recipientCode: string;
  amountInSubunit: number;
  reason: string;
  reference: string;
}

export interface PayoutResult {
  transferRef: string;
  status: 'pending' | 'success' | 'failed';
}

export interface PaymentAdapter {
  /** Unique identifier for this provider stored in the Payment.provider column. */
  readonly name: string;

  initializeTransaction(params: InitParams): Promise<InitResult>;

  verifyWebhookSignature(rawBody: string, signature: string): boolean;

  /**
   * Parse a verified webhook payload and return a normalized result.
   * Only called after verifyWebhookSignature passes.
   */
  parseWebhookEvent(payload: Record<string, unknown>): WebhookResult | null;

  initiateRefund(params: RefundParams): Promise<RefundResult>;

  initiatePayout(params: PayoutParams): Promise<PayoutResult>;

  createTransferRecipient(params: {
    accountName: string;
    accountNumber: string;
    bankCode: string;
    currency: string;
  }): Promise<{ recipientCode: string }>;

  verifyTransaction(reference: string): Promise<WebhookResult>;
}

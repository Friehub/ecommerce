import { RustClient } from '../../../../rust-client';

export interface FraudCheckInput {
  userId: string;
  amount: number;
  currency: string;
  ipAddress: string;
  shippingCountry: string;
  deviceId?: string;
}

export class FraudManager {
  /**
   * Orchestrates multi-layer fraud detection.
   * Calls Rust microservice and enforces block recommendation.
   */
  async verifyTransaction(input: FraudCheckInput) {
    try {
      const fraudCheck = await RustClient.fraud.check({
        user_id: input.userId,
        amount: input.amount,
        currency: input.currency || 'NGN',
        ip_address: input.ipAddress || 'unknown',
        shipping_country: input.shippingCountry || 'NG',
        device_id: input.deviceId || 'unknown'
      });

      if (fraudCheck.recommendation === 'BLOCK') {
        throw new Error('FRAUD_DETECTION_BLOCKED');
      }

      return fraudCheck;
    } catch (e: any) {
      if (e.message === 'FRAUD_DETECTION_BLOCKED') throw e;
      
      // Resiliency: In production, we might want to flag for manual review 
      // instead of failing open if the service is down.
      console.warn('[FraudManager] Service unavailable, allowing with flag:', e);
      return { recommendation: 'ALLOW', score: 0, flags: ['SERVICE_DOWN'] };
    }
  }
}

export const fraudManager = new FraudManager();

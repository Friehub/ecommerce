export class SecretManager {
  private readonly isProd = process.env.NODE_ENV === 'production';

  /**
   * Safely retrieve a secret, enforcing presence in production.
   */
  get(key: string, fallback?: string): string {
    const value = process.env[key];
    
    if (!value || value.includes('placeholder')) {
      if (this.isProd) {
        console.error(`[SecretManager] FATAL: Missing critical secret ${key} in production!`);
        process.exit(1);
      }
      
      if (fallback) return fallback;
      throw new Error(`MISSING_SECRET: ${key}`);
    }

    return value;
  }

  /**
   * Helper for common secrets.
   */
  get jwtSecret() { return this.get('JWT_SECRET', 'dev_default_jwt_secret'); }
  get internalToken() { return this.get('INTERNAL_API_TOKEN', 'dev_internal_token'); }
  get redisUrl() { return this.get('REDIS_URL', 'redis://localhost:6379'); }
  get databaseUrl() { return this.get('DATABASE_URL'); }

  // Payment Gateways
  get paystackSecret() { return this.get('PAYSTACK_SECRET_KEY', 'sk_test_placeholder'); }
  get paystackWebhookSecret() { return this.get('PAYSTACK_WEBHOOK_SECRET', 'whsec_test_placeholder'); }
  get flutterwaveSecret() { return this.get('FLUTTERWAVE_SECRET_KEY', 'flw_test_placeholder'); }
  get monnifySecret() { return this.get('MONNIFY_SECRET_KEY', 'mon_test_placeholder'); }
  get monnifyApiKey() { return this.get('MONNIFY_API_KEY', 'mk_test_placeholder'); }

  // Media / Storage
  get r2Bucket() { return this.get('R2_BUCKET', 'ecom-media'); }
  get r2PublicUrl() { return this.get('R2_PUBLIC_URL', 'http://localhost:9000/ecom-media'); }

  // Notifications
  get resendApiKey() { return this.get('RESEND_API_KEY', 're_placeholder'); }
  get resendFromEmail() { return this.get('RESEND_FROM_EMAIL', 'help@friehub.cloud'); }

  // App Config
  get logLevel() { return process.env.LOG_LEVEL || 'info'; }
  get isDevelopment() { return process.env.NODE_ENV !== 'production'; }
  get nextAuthUrl() { return process.env.NEXTAUTH_URL || 'http://localhost:3000'; }
  get storageBaseUrl() { return process.env.STORAGE_BASE_URL || 'https://storage.jumia-clone.com'; }
  get enablePublicSwagger() { return process.env.ENABLE_PUBLIC_SWAGGER === 'true'; }
}

export const secretManager = new SecretManager();

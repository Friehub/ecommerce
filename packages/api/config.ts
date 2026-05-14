import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  
  // Database
  DATABASE_URL: z.string().url(),
  
  // Authentication
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url().default('http://localhost:3000'),
  
  // Payments (Required)
  PAYSTACK_SECRET_KEY: z.string().min(1),
  PAYSTACK_WEBHOOK_SECRET: z.string().min(1),
  
  // Media / Storage
  R2_ACCESS_KEY_ID: z.string().default('placeholder'),
  R2_SECRET_ACCESS_KEY: z.string().default('placeholder'),
  R2_BUCKET: z.string().default('ecom-media'),
  R2_ENDPOINT: z.string().url().default('http://localhost:9000'),
  R2_PUBLIC_URL: z.string().url().optional(),
  
  // Notifications
  RESEND_API_KEY: z.string().default('re_placeholder'),
  RESEND_FROM_EMAIL: z.string().email().default('help@friehub.cloud'),
  
  // Redis (for inventory/queues)
  REDIS_URL: z.string().url().default('redis://localhost:6379'),

  // SMS Providers
  TERMII_API_KEY: z.string().default('placeholder'),
  TERMII_SENDER_ID: z.string().default('Friehub'),
  AFRICAS_TALKING_USERNAME: z.string().default('sandbox'),
  AFRICAS_TALKING_API_KEY: z.string().default('placeholder'),
  
  // Flutterwave
  FLW_SECRET_KEY: z.string().default('FLWSECK_test_placeholder'),
  FLW_WEBHOOK_SECRET: z.string().default('flw_whsec_placeholder'),

  // Monnify
  MONNIFY_API_KEY: z.string().default('MK_TEST_placeholder'),
  MONNIFY_SECRET_KEY: z.string().default('test_secret_placeholder'),
  MONNIFY_CONTRACT_CODE: z.string().default('contract_code'),
  
  // Internal
  INTERNAL_API_TOKEN: z.string().default('token_placeholder'),
});

const parseConfig = () => {
  try {
    const envData = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
      PAYSTACK_WEBHOOK_SECRET: process.env.PAYSTACK_WEBHOOK_SECRET,
      R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
      R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
      R2_ENDPOINT: process.env.R2_ENDPOINT,
      R2_BUCKET: process.env.R2_BUCKET,
      R2_PUBLIC_URL: process.env.R2_PUBLIC_URL,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
      REDIS_URL: process.env.REDIS_URL,
      TERMII_API_KEY: process.env.TERMII_API_KEY,
      TERMII_SENDER_ID: process.env.TERMII_SENDER_ID,
      AFRICAS_TALKING_USERNAME: process.env.AFRICAS_TALKING_USERNAME,
      AFRICAS_TALKING_API_KEY: process.env.AFRICAS_TALKING_API_KEY,
      FLW_SECRET_KEY: process.env.FLW_SECRET_KEY,
      FLW_WEBHOOK_SECRET: process.env.FLW_WEBHOOK_SECRET,
      MONNIFY_API_KEY: process.env.MONNIFY_API_KEY,
      MONNIFY_SECRET_KEY: process.env.MONNIFY_SECRET_KEY,
      MONNIFY_CONTRACT_CODE: process.env.MONNIFY_CONTRACT_CODE,
      INTERNAL_API_TOKEN: process.env.INTERNAL_API_TOKEN,
    };

    const validated = configSchema.parse(envData);

    // B12: Production Assertions - prevent placeholder keys in prod
    if (validated.NODE_ENV === 'production' && process.env.SKIP_ENV_VALIDATION !== 'true') {
      const placeholders = [
        'sk_placeholder', 'whsec_placeholder', 're_placeholder', 'test_secret_placeholder',
        'FLWSECK_test_placeholder', 'MK_TEST_placeholder', 'placeholder', 'token_placeholder'
      ];
      
      const configEntries = Object.entries(validated);
      const invalidEntries = configEntries.filter(([key, value]) => 
        typeof value === 'string' && placeholders.includes(value)
      );

      if (invalidEntries.length > 0) {
        const keys = invalidEntries.map(([k]) => k).join(', ');
        console.error(`❌ Production Safety Error: Placeholder values detected for production: ${keys}`);
        process.exit(1);
      }
    }

    return validated;
  } catch (error) {
    if (error instanceof z.ZodError) {
      if (process.env.SKIP_ENV_VALIDATION === 'true' || process.env.NEXT_PHASE === 'phase-production-build') {
        console.warn('⚠️  Warning: Missing environment variables during build phase. Skipping validation.');
        return {} as any;
      }
      const missingKeys = error.errors.map(e => e.path.join('.')).join(', ');
      console.error(`❌ Configuration Error: Missing or invalid environment variables: ${missingKeys}`);
      process.exit(1);
    }
    throw error;
  }
};

export const config = parseConfig();

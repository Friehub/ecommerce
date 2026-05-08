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
  
  // Payments (Optional for boot)
  PAYSTACK_SECRET_KEY: z.string().default('sk_placeholder'),
  PAYSTACK_WEBHOOK_SECRET: z.string().default('whsec_placeholder'),
  
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
    };

    return configSchema.parse(envData);
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

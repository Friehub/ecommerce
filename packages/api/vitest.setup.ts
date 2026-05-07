import { vi } from 'vitest';

// Mock the config module globally
vi.mock('./config.js', () => ({
  config: {
    DATABASE_URL: 'postgres://mock:mock@localhost:5432/mock',
    NEXTAUTH_SECRET: 'mock_secret',
    PAYSTACK_SECRET_KEY: 'sk_test_mock',
    RESEND_API_KEY: 're_mock',
    RESEND_FROM_EMAIL: 'mock@example.com',
    AWS_S3_ACCESS_KEY_ID: 'mock_access_key',
    AWS_S3_SECRET_ACCESS_KEY: 'mock_secret_key',
    AWS_S3_REGION: 'us-east-1',
    AWS_S3_BUCKET_NAME: 'mock-bucket',
    AWS_S3_ENDPOINT: 'https://mock-endpoint.com'
  }
}));

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
    AWS_S3_ENDPOINT: 'https://mock-endpoint.com',
    INTERNAL_API_TOKEN: 'mock_internal_token'
  }
}));

// Mock Rust inter-service client to prevent timeouts in CI
vi.mock('./rust-client.js', () => ({
  RustClient: {
    search: {
      upsert: vi.fn().mockResolvedValue({}),
      query: vi.fn().mockResolvedValue([]),
      autocomplete: vi.fn().mockResolvedValue([]),
      health: vi.fn().mockResolvedValue({ status: 'ok' }),
    },
    inventory: {
      reserve: vi.fn().mockResolvedValue({ reservation_id: 'mock_res_123' }),
      confirm: vi.fn().mockResolvedValue({}),
      sync: vi.fn().mockResolvedValue({}),
    },
    fraud: {
      check: vi.fn().mockResolvedValue({ score: 0.1, is_fraud: false }),
    },
    recommendations: {
      forProduct: vi.fn().mockResolvedValue([]),
      forUser: vi.fn().mockResolvedValue([]),
    },
    imageProcessor: {
      processUrl: vi.fn().mockImplementation((url) => `https://mock-cdn.com/proc?url=${url}`),
    },
    auction: {
      bid: vi.fn().mockResolvedValue([]),
    },
    analysis: {
      sentiment: vi.fn().mockResolvedValue({ score: 0.8, label: 'POSITIVE' }),
    }
  }
}));

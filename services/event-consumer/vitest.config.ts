import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    env: {
      DATABASE_URL: 'postgresql://ecom_test:ecom_test@localhost:5434/ecom_test'
    },
    define: {
      'process.env.DATABASE_URL': JSON.stringify('postgresql://ecom_test:ecom_test@localhost:5434/ecom_test')
    },
    alias: {
      '@ecom/api': path.resolve(__dirname, '../../packages/api/index.ts'),
      '@ecom/db': path.resolve(__dirname, '../../packages/db/index.ts'),
      '@ecom/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
    },
  },
  resolve: {
    alias: {
      '@ecom/api': path.resolve(__dirname, '../../packages/api/index.ts'),
      '@ecom/db': path.resolve(__dirname, '../../packages/db/index.ts'),
      '@ecom/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
    }
  }
});

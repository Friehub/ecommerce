import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node20',
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  external: [
    '@prisma/client',
    'fsevents',
    'mock-aws-s3',
    'aws-sdk',
    'nock',
    'bullmq',
    'ioredis',
    'pino',
    'pino-pretty',
    'sharp',
    '@aws-sdk/client-s3',
    'opossum',
    'bcryptjs',
    'node-cron',
    'trpc-openapi',
    'zod-to-json-schema',
    'superjson',
    '@trpc/server',
    '@aws-sdk/s3-request-presigner'
  ],
  noExternal: [
    '@ecom/api',
    '@ecom/db',
    '@ecom/shared'
  ],
});

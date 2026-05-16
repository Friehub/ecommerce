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
    'socket.io',
    'fastify'
  ],
  noExternal: [
    '@ecom/api',
    '@ecom/db',
    '@ecom/shared'
  ],
});

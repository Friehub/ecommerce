import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  test: {
    environment: 'node',
    alias: {
      '@': resolve(__dirname, './src'),
      '@ecom/db': resolve(__dirname, '../db/index.ts'),
      '@ecom/shared': resolve(__dirname, '../shared/src/index.ts'),
    },
    // We mock the config module globally for tests
    setupFiles: [resolve(__dirname, './vitest.setup.ts')],
    deps: {
      inline: [/@ecom/],
    },
  },
});

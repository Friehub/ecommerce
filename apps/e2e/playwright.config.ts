import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from root .env or staging
dotenv.config({ path: path.resolve(__dirname, '../../.env.staging') });

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.WEB_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Setup project for shared auth state
    { name: 'setup', testMatch: /.*\.setup\.ts/ },

    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome', // Use system chrome
        storageState: 'apps/e2e/playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    /*
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        storageState: 'apps/e2e/playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    */
  ],
});

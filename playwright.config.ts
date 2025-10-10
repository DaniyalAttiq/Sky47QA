import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    trace: 'on-first-retry',
    baseURL: 'https://r08sgs0k08gw0sgccscoo4o8.49.13.228.64.sslip.io',
    headless: false, // Helpful for setup step
  },

  projects: [
    // ✅ 1️⃣ Google Auth Setup project
    {
      name: 'setup',
      testMatch: 'tests/setup/google-auth.setup.ts', // Path to your setup test
    },

    // ✅ 2️⃣ Regular browser projects that reuse the saved session
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/.auth/google-auth.json', // Auth state file
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'tests/.auth/google-auth.json',
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: 'tests/.auth/google-auth.json',
      },
    },
  ],
});

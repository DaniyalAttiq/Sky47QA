import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // ✅ Reporters: HTML + Allure
  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['allure-playwright', { outputFolder: 'allure-results' }],
  ],

  use: {
    baseURL: 'https://r08sgs0k08gw0sgccscoo4o8.49.13.228.64.sslip.io',
    headless: false,
    trace: 'on-first-retry',

    // ✅ Video for every test
    video: 'on', // <---- this ensures every test gets a video
    screenshot: 'on', // ✅ Capture screenshots for every test
  },

  // ✅ Chromium only
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

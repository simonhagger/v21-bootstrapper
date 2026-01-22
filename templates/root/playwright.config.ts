import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright End-to-End Testing Configuration
 *
 * Configures Playwright for testing Angular application
 * - Local development testing against dev server
 * - CI/CD pipeline testing against built artifacts
 * - Cross-browser testing (Chromium, Firefox, WebKit)
 * - Screenshot/trace artifacts for debugging
 */

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['line'],
  ],

  use: {
    // Base URL for navigation in tests
    baseURL: 'http://localhost:4200',
    
    // Screenshots and traces for debugging
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    
    // Playwright defaults
    actionTimeout: 0,
  },

  // Configure projects (browsers)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Optional: Mobile testing
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  // Configure web server for local testing
  // This starts `pnpm dev` automatically during test runs
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2 minutes for dev server startup
  },
});

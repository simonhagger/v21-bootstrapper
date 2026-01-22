/**
 * Playwright Test Configuration and Utilities
 *
 * Common fixtures and helpers for E2E tests
 */

import { test as base, expect } from '@playwright/test';

export type TestFixtures = {
  authenticatedPage: void;
};

/**
 * Extended test fixture with authentication
 * Usage: test('authenticated test', async ({ authenticatedPage }) => { ... })
 */
export const test = base.extend<TestFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Example: Add common setup (e.g., login, set localStorage, etc.)
    // await page.goto('/login');
    // await page.fill('input[name="email"]', 'test@example.com');
    // await page.fill('input[name="password"]', 'password');
    // await page.click('button[type="submit"]');
    // await page.waitForURL('/dashboard');

    // Pass fixture to test
    await use();

    // Cleanup after test if needed
    // await page.context().clearCookies();
  },
});

export { expect };

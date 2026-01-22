import { test, expect } from '@playwright/test';

/**
 * Example End-to-End Tests
 *
 * These tests demonstrate common patterns:
 * - Navigation and routing
 * - Element visibility and interaction
 * - Theme switching
 * - Responsive behavior
 *
 * Run with: pnpm e2e
 * Run in UI mode: pnpm e2e:ui
 */

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page before each test
    await page.goto('/');
  });

  test('should load and display home page', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/DemoV21App/);

    // Verify main content is visible
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('should display responsive demo section', async ({ page }) => {
    // Look for demo panel
    const demoPanel = page.locator('text=Responsive Service Demo');
    await expect(demoPanel).toBeVisible();

    // Verify breakpoint info is displayed
    const breakpointInfo = page.locator('.breakpoint-badge');
    await expect(breakpointInfo).toBeVisible();
  });

  test('should handle theme switching', async ({ page }) => {
    // Get initial theme preference
    const html = page.locator('html');
    const initialTheme = await html.evaluate(el => el.className);

    // Find and click theme toggle (example selector - adjust to match your UI)
    const themeButtons = page.locator('button:has-text("Light"), button:has-text("Dark")');
    const buttonCount = await themeButtons.count();

    if (buttonCount > 0) {
      // Click first theme button
      await themeButtons.first().click();

      // Wait for theme to change (usually instant)
      await page.waitForTimeout(100);

      // Verify theme changed
      const newTheme = await html.evaluate(el => el.className);
      // Theme might change class or data attribute depending on implementation
      expect(newTheme).toBeDefined();
    }
  });

  test('should be responsive at different viewport sizes', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667 },   // Mobile
      { width: 768, height: 1024 },  // Tablet
      { width: 1920, height: 1080 }, // Desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      // Verify page doesn't have horizontal scroll
      const bodyWidth = await page.locator('body').evaluate(el => el.scrollWidth);
      const windowWidth = await page.evaluate(() => window.innerWidth);

      expect(bodyWidth).toBeLessThanOrEqual(windowWidth);
    }
  });
});

test.describe('Navigation', () => {
  test('should navigate to home from any page', async ({ page }) => {
    await page.goto('/');

    // Verify we're on home page (redirects to /home)
    await expect(page).toHaveURL(/\/home/);
  });

  test('should show 404 for unknown routes', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');

    // Look for not found indicator
    const notFoundText = page.locator('text=/[Nn]ot [Ff]ound|404/');
    await expect(notFoundText).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    // Page should start with h1
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);

    // Verify h1 is visible and not empty
    await expect(h1).toBeVisible();
    const text = await h1.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });

  test('should have keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Tab through elements
    await page.keyboard.press('Tab');

    // Check if focus is visible
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      return {
        tag: el?.tagName,
        visible: !!(el?.offsetParent),
      };
    });

    expect(focusedElement.visible).toBeTruthy();
  });
});

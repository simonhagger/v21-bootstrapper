# E2E Testing with Playwright

End-to-End (E2E) tests validate your application from a user's perspective, testing complete workflows and interactions across your entire application stack.

## Getting Started

### Installation

Playwright is pre-configured in the project. No additional setup needed!

### Running Tests

```bash
# Run all E2E tests in headless mode
pnpm e2e

# Run tests in UI mode (recommended for development)
pnpm e2e:ui

# Run a specific test file
pnpm e2e example.spec.ts

# Run tests in a specific browser
pnpm e2e --project=chromium
pnpm e2e --project=firefox
pnpm e2e --project=webkit

# Run with debugging
pnpm e2e --debug

# Generate and view HTML report
pnpm e2e:report
```

## Test Organization

```
e2e/
├── fixtures.ts              # Shared test fixtures and utilities
├── example.spec.ts          # Example tests demonstrating patterns
└── [feature].spec.ts        # Feature-specific test files
```

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test('should perform some action', async ({ page }) => {
  // Navigate
  await page.goto('/');

  // Interact
  await page.click('button:has-text("Click me")');

  // Assert
  await expect(page.locator('text=Success')).toBeVisible();
});
```

### Common Patterns

#### Navigation and URLs

```typescript
// Navigate to a page
await page.goto('/features/dashboard');

// Check current URL
await expect(page).toHaveURL('/features/dashboard');

// Go back/forward
await page.goBack();
await page.goForward();
```

#### Finding Elements

```typescript
// By text
page.locator('text=Sign In');
page.locator('button:has-text("Submit")');

// By CSS
page.locator('[data-testid="submit-btn"]');
page.locator('.card-title');

// By role (accessible)
page.locator('role=button[name="Submit"]');
page.locator('role=textbox[name="Email"]');

// By XPath (last resort)
page.locator('xpath=//div[@class="card"]');
```

#### Interactions

```typescript
// Click
await page.click('button');
await page.locator('button').click();

// Fill text
await page.fill('input[type="email"]', 'user@example.com');
await page.locator('input[name="email"]').fill('user@example.com');

// Select option
await page.selectOption('select#country', 'US');

// Check/uncheck
await page.check('input[type="checkbox"]');
await page.uncheck('input[type="checkbox"]');

// Keyboard
await page.keyboard.press('Enter');
await page.keyboard.type('Hello, world!');
```

#### Assertions

```typescript
// Visibility
await expect(page.locator('text=Welcome')).toBeVisible();
await expect(page.locator('.error')).not.toBeVisible();

// Text content
await expect(page.locator('h1')).toContainText('Dashboard');
await expect(page.locator('span')).toHaveText('Exact text');

// Value
await expect(page.locator('input')).toHaveValue('typed text');

// Count
await expect(page.locator('li')).toHaveCount(5);

// Attributes
await expect(page.locator('button')).toHaveAttribute('disabled');
await expect(page.locator('a')).toHaveAttribute('href', '/about');

// CSS class
await expect(page.locator('div')).toHaveClass('active');

// URL and title
await expect(page).toHaveURL('/dashboard');
await expect(page).toHaveTitle('Dashboard');
```

### Test Hooks

```typescript
test.describe('Feature Group', () => {
  test.beforeAll(async () => {
    // Run once before all tests in group
  });

  test.beforeEach(async ({ page }) => {
    // Run before each test
    await page.goto('/');
  });

  test.afterEach(async () => {
    // Run after each test
  });

  test.afterAll(async () => {
    // Run once after all tests in group
  });

  test('should do something', async ({ page }) => {
    // Test code
  });
});
```

### Testing Theme and Responsive Behavior

```typescript
// Test theme switching
test('should switch theme', async ({ page }) => {
  await page.goto('/');

  // Click dark mode button
  await page.click('button:has-text("Dark")');

  // Verify theme class on html element
  const htmlClass = await page.locator('html').getAttribute('class');
  expect(htmlClass).toContain('dark');
});

// Test responsive breakpoints
test('should be responsive', async ({ page }) => {
  // Mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page.locator('.mobile-menu')).toBeVisible();

  // Desktop viewport
  await page.setViewportSize({ width: 1920, height: 1080 });
  await expect(page.locator('.desktop-menu')).toBeVisible();
});
```

### Testing with Custom Fixtures

Use `e2e/fixtures.ts` to create reusable test setup:

```typescript
import { test, expect } from './fixtures';

test('authenticated test', async ({ authenticatedPage }) => {
  // Page is already authenticated
  await expect(page).toHaveURL('/dashboard');
});
```

## Best Practices

1. **Use Data Attributes** - Add `data-testid` to elements for reliable selection
   ```html
   <button data-testid="submit-btn">Submit</button>
   ```
   ```typescript
   await page.click('[data-testid="submit-btn"]');
   ```

2. **Test User Workflows** - Focus on real user interactions, not implementation details
   ```typescript
   // Good: Tests user workflow
   await page.fill('input[name="email"]', 'user@example.com');
   await page.click('button:has-text("Sign In")');

   // Avoid: Tests implementation details
   await page.evaluate(() => store.dispatch('login', ...));
   ```

3. **Wait for Elements** - Don't add arbitrary delays
   ```typescript
   // Good: Wait for element to appear
   await expect(page.locator('.success-message')).toBeVisible();

   // Avoid: Arbitrary delay
   await page.waitForTimeout(2000);
   ```

4. **Isolate Tests** - Each test should be independent
   ```typescript
   test.beforeEach(async ({ page }) => {
     // Setup fresh state
     await page.goto('/');
     await page.context().clearCookies();
   });
   ```

5. **Be Specific with Selectors** - More specific selectors are more reliable
   ```typescript
   // Good: Specific selector
   await page.click('button[data-testid="submit"]:has-text("Save")');

   // Avoid: Generic selector that might match wrong element
   await page.click('button');
   ```

## Debugging

### UI Mode (Recommended)

```bash
pnpm e2e:ui
```

- Step through tests interactively
- Inspect elements and network
- Time travel through test execution
- View logs and errors

### Inspector and Console

```typescript
test('debug test', async ({ page }) => {
  await page.pause();  // Pauses execution, opens inspector
  
  // Or use breakpoints in VS Code with --debug flag
  await page.goto('/');
});
```

### Screenshots and Traces

```bash
# View HTML report with screenshots
pnpm e2e:report

# Traces are automatically saved on test failure
# Open with: npx playwright show-trace trace.zip
```

## CI/CD Integration

Playwright tests run automatically in GitHub Actions on:
- Every push to `main` and `develop` branches
- All pull requests

See `.github/workflows/ci.yml` for configuration.

## Performance Tips

1. **Parallel Execution** - Tests run in parallel by default
2. **Reuse Authentication** - Use fixtures to avoid repeated login
3. **Mock Slow APIs** - Use route handlers for consistent test speed
4. **Visual Debugging** - Use `--headed` to watch tests run

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Selectors Guide](https://playwright.dev/docs/selectors)
- [Debugging Guide](https://playwright.dev/docs/debug)

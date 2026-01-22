# Testing Guide

Testing Angular with Vitest and following best practices for Angular 21.

## Principles

- Prefer async/await and real Promises over fakeAsync
- Use `vi.spyOn()` for spies/mocks
- Keep tests deterministic:
  - Avoid real timers unless needed
  - If using timers, prefer `vi.useFakeTimers()` and advance time explicitly
- Prefer shallow component tests unless integration is necessary
- Test behavior, not implementation details

## Running Tests

```bash
# CI mode (no watch)
pnpm test

# Watch mode
pnpm test:watch

# With coverage
pnpm test:coverage
```

## Coverage Thresholds

Coverage thresholds are configured in `vitest.config.ts` and enforced automatically.

### Current Targets (Bootstrap Phase)
- **Lines**: 50%
- **Functions**: 50%
- **Branches**: 50%
- **Statements**: 50%

These are intentionally **low** to enable rapid development while establishing testing patterns.

### Recommended Progression

Increase thresholds as your codebase matures. Update `vitest.config.ts`:

| Phase | Lines | Functions | Branches | Goal |
|-------|-------|-----------|----------|------|
| **Bootstrap** | 50% | 50% | 50% | Establish patterns |
| **Growth** | 60% | 60% | 55% | Core logic coverage |
| **Stable** | 75% | 75% | 70% | High confidence |
| **Production** | 85%+ | 85%+ | 80%+ | Enterprise standards |

---

## Coverage

Coverage is provided by `@vitest/coverage-v8` (included in dev dependencies).

To view detailed coverage report:
```bash
pnpm test:coverage
# Open coverage/index.html in browser
```

Coverage outputs are excluded from git and should not be committed.

## Patterns

### Service Test

```ts
import { TestBed } from '@angular/core/testing';
import { MyService } from './my.service';

describe('MyService', () => {
  let service: MyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
```

If the service has no dependencies, you can instantiate directly:

```ts
const service = new MyService();
```

### Component Test

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyComponent } from './my.component';

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

### Testing with Signals

```ts
it('should update signal value', () => {
  component.mySignal.set('new value');
  expect(component.mySignal()).toBe('new value');
});
```

### Testing HTTP Services

```ts
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [MyDataService, provideHttpClient(), provideHttpClientTesting()],
  });

  httpMock = TestBed.inject(HttpTestingController);
  service = TestBed.inject(MyDataService);
});

afterEach(() => {
  httpMock.verify();
});

it('should fetch data', () => {
  service.getData().subscribe((data) => {
    expect(data).toEqual({ id: 1, name: 'Test' });
  });

  const req = httpMock.expectOne('/api/data');
  expect(req.request.method).toBe('GET');
  req.flush({ id: 1, name: 'Test' });
});
```

## Anti-Patterns

### ❌ Snapshotting Large DOM Trees

Snapshots are brittle and make tests fragile to unrelated changes.

### ❌ Over-Mocking Angular Internals

Don't mock framework internals like `ChangeDetectorRef`, `ElementRef`, etc. unless absolutely necessary.

### ❌ Asserting on Material Component Internals

Material components are tested by the Angular team. Test your component's behavior, not Material's.

### ❌ Testing Implementation Details

```ts
// ❌ Bad - testing implementation
expect(component.privateMethod).toHaveBeenCalled();

// ✅ Good - testing behavior
expect(component.isVisible).toBe(true);
```

## Feature-Specific Testing

### Testing Route Components

Route components (`.page.ts` files) should test:

- Initial state setup
- User interactions
- State transitions
- Route parameter handling

```ts
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

beforeEach(() => {
  await TestBed.configureTestingModule({
    imports: [MyPage],
    providers: [
      {
        provide: ActivatedRoute,
        useValue: {
          params: of({ id: '123' }),
        },
      },
    ],
  }).compileComponents();
});
```

### Testing with Theme Service

```ts
import { signal } from '@angular/core';

const mockThemeService = {
  mode: signal('light' as const),
  brand: signal('brandA' as const),
  setMode: vi.fn(),
  setBrand: vi.fn(),
};

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [{ provide: ThemeService, useValue: mockThemeService }],
  });
});
```

## End-to-End (E2E) Testing

E2E testing validates user workflows across the entire application using Playwright.

### Running E2E Tests

```bash
# Run all tests headless (CI mode)
pnpm e2e

# Interactive UI mode (recommended for development)
pnpm e2e:ui

# Debug mode with trace
pnpm e2e:debug

# Run specific browser
pnpm e2e --project=chromium
pnpm e2e --project=firefox
pnpm e2e --project=webkit
```

### E2E Test Structure

Tests are located in `e2e/` directory and organized by feature:

```
e2e/
├── example.spec.ts          # Template tests (reference)
├── home.spec.ts             # Home page workflows
├── feature.spec.ts          # Feature-specific tests
└── shared/                  # Reusable helpers
    └── test-utils.ts
```

### Writing E2E Tests

```typescript
import { test, expect } from '@playwright/test';

test('user can navigate to home page', async ({ page }) => {
  // Arrange
  await page.goto('http://localhost:4200');

  // Act
  await page.click('text=Home');

  // Assert
  await expect(page).toHaveTitle(/Home/);
});

test('responsive design adjusts for mobile', async ({ page, context }) => {
  // Set mobile viewport
  await context.clearCookies();
  await page.goto('http://localhost:4200', { waitUntil: 'networkidle' });
  await page.setViewportSize({ width: 375, height: 667 });

  // Assert mobile layout
  const menu = page.locator('[data-test="mobile-menu"]');
  await expect(menu).toBeVisible();
});
```

### Multi-Browser Testing

Tests run automatically on:
- **Chromium** (Chrome/Edge)
- **Firefox**
- **WebKit** (Safari)

Configure in `playwright.config.ts` if running browser-specific tests.

### Test Artifacts

Test results and traces are generated in:
- `test-results/` - Failure artifacts
- `playwright-report/` - HTML test report
- `.upgrade/` - Upgrade reports

These are excluded from git and should not be committed.

View the report:
```bash
npx playwright show-report
```

### For Comprehensive E2E Testing Guide

See [E2E Testing Guide](./E2E_TESTING.md) for:
- Advanced selectors and patterns
- Fixtures and reusable test setup
- Authentication testing
- API mocking
- Visual regression testing
- Performance testing with metrics

## CI Integration

The `pnpm verify` script includes:
- `pnpm test:ci` - Unit tests
- `pnpm e2e` - E2E tests (CI mode, headless)

All tests must pass before merge. Pre-push hooks do not run tests to keep local iteration fast.

## Resources

- [Angular Testing Guide](https://angular.dev/guide/testing)
- [Vitest Documentation](https://vitest.dev)
- [Angular Testing API](https://angular.dev/api/core/testing)
- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)

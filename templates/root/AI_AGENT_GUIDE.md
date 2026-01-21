# AI Agent Development Guide

> Quick orientation for AI agents working in this codebase

## Critical Context

This is an **Angular 21+ workspace** using:

- **Standalone components** (no NgModules)
- **Route-first vertical slices** (features organized by route)
- **Material Design 3 + Tailwind CSS v4** (shared token system)
- **Signals** for reactive state
- **Strict TypeScript** + type-aware ESLint
- **Vitest** for testing

## Core Principles (Non-Negotiable)

### 1. Feature Structure

Every feature MUST have this structure:

```
src/app/features/<feature-name>/
├── <feature-name>.routes.ts    # Route definition with providers
├── <feature-name>.page.ts      # Routed component
├── <feature-name>.data.ts      # HTTP/data access only
├── <feature-name>.state.ts     # Feature state (signals/stores)
├── <feature-name>.models.ts    # TypeScript types
└── README.md                   # Feature documentation
```

### 2. HTTP Boundary

**HttpClient ONLY allowed in:**

- `*.data.ts` files
- `projects/core/src/lib/api/*` files

**NEVER in:**

- Components (`.page.ts`, `.component.ts`)
- Guards
- State management files
- Resolvers

### 3. Routing Rules

**App Routes (app.routes.ts):**

```typescript
// ✅ CORRECT - Use loadChildren
{
  path: 'dashboard',
  loadChildren: () =>
    import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES)
}

// ❌ FORBIDDEN - No static imports
import { DashboardPage } from './features/dashboard/dashboard.page';
{ path: 'dashboard', component: DashboardPage }
```

**Feature Routes (<feature>.routes.ts):**

```typescript
// ✅ CORRECT - Define providers array
export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    providers: [
      // Route-scoped services here
    ],
    loadComponent: () => import('./dashboard.page').then((m) => m.DashboardPage),
  },
];
```

### 4. Dependency Injection

**Feature services:**

```typescript
// ❌ FORBIDDEN
@Injectable({ providedIn: 'root' })
export class FeatureStore {}

// ✅ CORRECT - Provide in route
@Injectable()
export class DashboardStore {}

// In dashboard.routes.ts:
providers: [DashboardStore];
```

**Shared/Core services:**

```typescript
// ✅ CORRECT for core/shared
@Injectable({ providedIn: 'root' })
export class ThemeService {}
```

### 5. Import Restrictions

**FORBIDDEN:**

```typescript
// ❌ No cross-feature imports
import { SomeService } from '../other-feature/other-feature.service';
```

**ALLOWED:**

```typescript
// ✅ Core and shared only
import { ThemeService } from '@core/theme/theme.service';
import { ButtonComponent } from '@shared/components/button';
```

## Common Tasks

### Generate a New Feature

```bash
pnpm gen:feature FeatureName --route feature-name --register
```

This creates the complete feature structure and registers the route.

### Error Handling & Loading States

**Use Resource API (Angular v17+) for automatic state**:

```typescript
import { Component } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

@Component({
  template: `
    @if (products.isLoading()) {
      <mat-spinner />
    } @else if (products.error()) {
      <div class="bg-error-container text-on-error-container rounded-md p-4">
        {{ products.error() }}
      </div>
    } @else {
      @for (product of products.value(); track product.id) {
        <mat-card>{{ product.name }}</mat-card>
      }
    }
  `,
})
export class ProductsPage {
  readonly products = rxResource({
    loader: () => inject(ProductData).loadProducts(),
  });
}
```

**Or manual signal-based state**:

```typescript
type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export class MyPage {
  private readonly _state = signal<LoadingState>('idle');
  private readonly _items = signal<Item[]>([]);
  private readonly _error = signal<string>('');

  readonly state = this._state.asReadonly();
  readonly items = this._items.asReadonly();

  loadItems() {
    this._state.set('loading');

    this.data.loadItems().subscribe({
      next: (items) => {
        this._items.set(items);
        this._state.set('success');
      },
      error: (err) => {
        this._error.set(err.message);
        this._state.set('error');
      },
    });
  }
}
```

See [PATTERNS.md](PATTERNS.md) for complete error handling patterns.

### Working with Forms

**Use typed reactive forms**:

```typescript
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

interface UserForm {
  name: FormControl<string>;
  email: FormControl<string>;
}

@Component({
  imports: [ReactiveFormsModule, MatFormFieldModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-form-field>
        <input matInput formControlName="name" />
        @if (form.controls.name.invalid && form.controls.name.touched) {
          <mat-error>Name is required</mat-error>
        }
      </mat-form-field>

      <button mat-raised-button [disabled]="isSubmitting() || form.invalid">
        @if (isSubmitting()) {
          Saving...
        } @else {
          Save
        }
      </button>
    </form>
  `,
})
export class UserFormComponent {
  readonly isSubmitting = signal(false);

  readonly form = inject(FormBuilder).group<UserForm>({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.email] }),
  });

  onSubmit() {
    if (this.form.invalid) return;

    this.isSubmitting.set(true);
    this.data.createUser(this.form.getRawValue()).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.form.reset();
      },
      error: () => this.isSubmitting.set(false),
    });
  }
}
```

See [PATTERNS.md](PATTERNS.md) for form validation patterns.

### Guards & Interceptors

**Functional guards (Angular v15+)**:

```typescript
// auth.guard.ts
import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) return true;

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};

// In routes:
{
  path: 'admin',
  canActivate: [authGuard],
  loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
}
```

**HTTP Interceptors** (configured in app.config.ts):

```typescript
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '@core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(withInterceptors([authInterceptor]))],
};
```

See [API_GUIDE.md](API_GUIDE.md) for complete interceptor implementations.

### Route Parameters

**Using input() for route params (Angular v16+)**:

```typescript
import { Component, input, effect } from '@angular/core';

// Route: { path: 'product/:id', component: ProductDetailPage }

@Component({
  template: `<h1>Product {{ id() }}</h1>`,
})
export class ProductDetailPage {
  readonly id = input.required<string>(); // Auto-bound from route

  ngOnInit() {
    effect(() => {
      const productId = this.id();
      this.data.loadProduct(productId).subscribe((product) => this.store.setProduct(product));
    });
  }
}
```

**Query parameters**:

```typescript
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';

readonly searchTerm = toSignal(
  inject(ActivatedRoute).queryParams.pipe(map(p => p['q'] as string))
);
```

See [PATTERNS.md](PATTERNS.md) for pagination and filtering patterns.

### Add HTTP Data Access

**In `<feature>.data.ts`:**

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { MyModel } from './<feature>.models';

@Injectable()
export class FeatureData {
  private readonly http = inject(HttpClient);

  loadItems(): Observable<MyModel[]> {
    return this.http.get<MyModel[]>('/api/items');
  }
}
```

**Provide in routes:**

```typescript
providers: [FeatureData];
```

**Inject in page:**

```typescript
export class FeaturePage {
  private readonly data = inject(FeatureData);
}
```

### Add Feature State

**In `<feature>.state.ts`:**

```typescript
import { Injectable, signal, computed } from '@angular/core';
import type { MyModel } from './<feature>.models';

@Injectable()
export class FeatureStore {
  private readonly _items = signal<MyModel[]>([]);

  readonly items = this._items.asReadonly();
  readonly itemCount = computed(() => this._items().length);

  setItems(items: MyModel[]) {
    this._items.set(items);
  }

  addItem(item: MyModel) {
    this._items.update((current) => [...current, item]);
  }
}
```

### Working with Material + Tailwind

**Material components for behavior:**

```typescript
import { MatButtonModule } from '@angular/material/button';

@Component({
  imports: [MatButtonModule],
  template: `<button mat-raised-button color="primary">Click</button>`
})
```

**Tailwind for layout:**

```typescript
@Component({
  template: `
    <div class="flex gap-4 p-6">
      <button mat-raised-button>Material Button</button>
    </div>
  `
})
```

**Use design tokens (CSS variables):**

```css
/* ✅ Use tokens */
.my-surface {
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
}

/* ❌ No hardcoded colors */
.my-surface {
  background: #ffffff;
  color: #000000;
}
```

### Theme Service Usage

```typescript
import { inject } from '@angular/core';
import { ThemeService } from '@core/theme/theme.service';

export class MyComponent {
  private readonly theme = inject(ThemeService);

  readonly currentMode = this.theme.mode; // Signal<'light' | 'dark'>
  readonly currentBrand = this.theme.brand; // Signal<'brandA' | 'brandB'>

  toggleTheme() {
    this.theme.toggleMode();
  }
}
```

### Design Token Workflow

**After modifying tokens:**

```bash
# 1. Edit source files
vim tokens/src/source/tokens.light.json

# 2. Regenerate CSS
pnpm tokens:build

# 3. Verify everything
pnpm verify:tokens
pnpm verify:theme-contract

# 4. Commit both source and dist
git add tokens/src/source tokens/dist
git commit -m "feat(tokens): update primary color"
```

## Verification Scripts

Before committing, ensure these pass:

```bash
pnpm verify:structure              # Feature structure validation
pnpm verify:app-routes             # App routing composition
pnpm verify:feature-routes         # Feature route structure
pnpm verify:no-cross-feature-imports # Import boundary enforcement
pnpm verify:theme-contract         # Token mappings valid
pnpm verify:no-raw-colors          # No hardcoded hex colors
pnpm verify:tokens                 # Token dist in sync
```

Run all at once:

```bash
pnpm verify
```

## Testing Patterns

### Component Test

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyPage } from './my.page';

describe('MyPage', () => {
  let component: MyPage;
  let fixture: ComponentFixture<MyPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyPage],
    }).compileComponents();

    fixture = TestBed.createComponent(MyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

### Service Test with HTTP

```typescript
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [MyDataService, provideHttpClient(), provideHttpClientTesting()],
  });

  httpMock = TestBed.inject(HttpTestingController);
  service = TestBed.inject(MyDataService);
});
```

## File Naming Conventions

```
feature.routes.ts           # Route definitions
feature.page.ts             # Routed components
feature.component.ts        # Child components
feature.data.ts             # HTTP data access
feature.state.ts            # State management
feature.models.ts           # TypeScript types
feature.page.spec.ts        # Tests
feature.page.css            # Styles (prefer inline when small)
```

## Import Aliases

```typescript
import { ... } from '@core/...';        // projects/core/src/lib/...
import { ... } from '@ui/...';          // projects/ui/src/lib/...
import { ... } from '@tokens/...';      // tokens/src/...
import { ... } from '@a11y/...';        // projects/a11y/src/lib/...
import { ... } from '@shell/...';       // projects/shell/src/lib/...
```

## Common Pitfalls

## RxJS vs Signals Decision Guide

### Use RxJS When:

- ✅ Making HTTP calls (HttpClient returns Observable)
- ✅ Complex async pipelines (debounce, throttle, switchMap)
- ✅ Event streams (scroll, resize, keyboard)
- ✅ WebSockets or SSE

```typescript
searchTerm$ = new Subject<string>();

results$ = this.searchTerm$.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap((term) => this.api.search(term)),
);
```

### Use Signals When:

- ✅ Component state (UI flags, form state)
- ✅ Derived data (computed values)
- ✅ Synchronous updates
- ✅ Simple reactive values

```typescript
readonly searchTerm = signal('');
readonly results = signal<Product[]>([]);
readonly resultCount = computed(() => this.results().length);
```

### Converting Between Them:

```typescript
import { toSignal, toObservable } from '@angular/core/rxjs-interop';

// Observable → Signal
readonly user = toSignal(this.auth.currentUser$, { initialValue: null });

// Signal → Observable
readonly results$ = toObservable(this.searchTerm).pipe(
  debounceTime(300),
  switchMap(term => this.api.search(term))
);
```

See [API_GUIDE.md](API_GUIDE.md) and [PATTERNS.md](PATTERNS.md) for complete examples.

## Common Pitfalls

### ❌ Violating HTTP Boundary

```typescript
// WRONG - HttpClient in page component
export class DashboardPage {
  private http = inject(HttpClient); // NO!
}

// CORRECT - HttpClient in data service
export class DashboardData {
  private http = inject(HttpClient); // YES
}
```

### ❌ Static Imports in app.routes.ts

```typescript
// WRONG
import { DashboardPage } from './features/dashboard/dashboard.page';
const routes = [{ path: '', component: DashboardPage }];

// CORRECT
const routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
  },
];
```

### ❌ Missing Route Providers

```typescript
// WRONG
export const ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./feature.page').then((m) => m.FeaturePage),
  },
];

// CORRECT
export const ROUTES: Routes = [
  {
    path: '',
    providers: [FeatureData, FeatureStore], // Route-scoped DI
    loadComponent: () => import('./feature.page').then((m) => m.FeaturePage),
  },
];
```

### ❌ Hardcoded Colors

```typescript
// WRONG
template: `<div style="background: #6750A4">...</div>`;

// CORRECT
template: `<div class="bg-primary">...</div>`;
// or
styles: `.surface { background: var(--md-sys-color-surface); }`;
```

### ❌ Creating Child Components Too Early

**Only extract to child component when:**

- Used 3+ times
- Complex logic (50+ lines)
- Reusable across features

```typescript
// ❌ Premature extraction
<app-single-use-header /> // Used once, 10 lines

// ✅ Inline until needed
<header class="flex justify-between p-4">
  <h1>{{ title() }}</h1>
</header>
```

**When extracting, use signal inputs/outputs (v17.1+)**:

```typescript
@Component({
  selector: 'app-product-card',
  template: `
    <mat-card>
      <h3>{{ product().name }}</h3>
      <button (click)="selected.emit(product())">View</button>
    </mat-card>
  `,
})
export class ProductCardComponent {
  readonly product = input.required<Product>();
  readonly selected = output<Product>();
}
```

See [PATTERNS.md](PATTERNS.md) for more component composition patterns.

## Quick Decision Tree

**Adding a new feature?**
→ Use `pnpm gen:feature`

**Need to fetch data?**
→ Add to `*.data.ts`, provide in routes

**Need state management?**
→ Add to `*.state.ts` with signals, provide in routes

**Building UI?**
→ Material components + Tailwind layout classes

**Need theming?**
→ Inject `ThemeService` or use CSS variables

**Modifying tokens?**
→ Edit JSON → `pnpm tokens:build` → commit both source and dist

**Before committing?**
→ `pnpm verify`

## Resources

- [ARCHITECTURE.md](ARCHITECTURE.md) - Full architectural rules
- [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) - Detailed workflows
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Testing patterns
- [THEMING_GUIDE.md](THEMING_GUIDE.md) - Design system integration
- [PATTERNS.md](PATTERNS.md) - Common implementation patterns (errors, forms, pagination, etc.)
- [API_GUIDE.md](API_GUIDE.md) - Backend integration (interceptors, type safety, RxJS)

## Emergency Debugging

**Verifiers failing?**

```bash
# Run individually to isolate
pnpm verify:structure
pnpm verify:app-routes
pnpm verify:no-cross-feature-imports
```

**Linting issues?**

```bash
pnpm lint:fix
```

**Token mismatch?**

```bash
pnpm tokens:build
git add tokens/dist
```

**Tests failing?**

```bash
pnpm test:watch  # Interactive debugging
```

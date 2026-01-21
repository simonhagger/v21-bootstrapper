# Architecture Guide (Authoritative)

This document defines non-negotiable architectural rules for this repository.

## Principles

- **Route-first vertical slices** (features)
- **Composition-only app routing** (no static page imports)
- **HTTP boundary via `*.data.ts` or `core/api`** (no HttpClient outside these)
- **Standalone-only** (no NgModules)
- **Route-scoped DI for feature state** (no `providedIn: 'root'` in features)

## Feature Structure

Each feature lives in `src/app/features/<name>/` and must contain:

- `<name>.routes.ts` – Route definition with `providers: [...]`
- `<name>.page.ts` – Routed component (standalone)
- `<name>.data.ts` – HTTP boundary (data access only)
- `<name>.state.ts` – Feature store/state management
- `<name>.models.ts` – TypeScript interfaces/types
- `README.md` – Feature documentation

## Rules

### 1. No Cross-Feature Imports

```typescript
// ❌ FORBIDDEN
import { SomeService } from '../dashboard/dashboard.service';

// ✅ ALLOWED
import { SomeDataService } from './some-feature.data';
import { SomeComponent } from '@shared/components';
```

### 2. App Routes Must Use Composition

```typescript
// ❌ FORBIDDEN
import { DashboardPage } from './features/dashboard/dashboard.page';

export const APP_ROUTES = [{ path: 'dashboard', component: DashboardPage }];

// ✅ ALLOWED
export const APP_ROUTES = [
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
  },
];
```

### 3. Feature Routes Must Define Providers

```typescript
// ❌ FORBIDDEN
export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard.page').then((m) => m.DashboardPage),
  },
];

// ✅ ALLOWED
export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    providers: [provideDashboardData(), provideDashboardState()],
    loadComponent: () => import('./dashboard.page').then((m) => m.DashboardPage),
  },
];
```

### 4. HttpClient Only in `*.data.ts` or `core/api`

```typescript
// ❌ FORBIDDEN in pages/stores/guards
import { HttpClient } from '@angular/common/http';

export class DashboardPage {
  constructor(private http: HttpClient) {} // NO!
}

// ✅ ALLOWED in data files
export class DashboardData {
  constructor(private http: HttpClient) {} // YES
}
```

### 5. No `providedIn: 'root'` in Features

```typescript
// ❌ FORBIDDEN
@Injectable({ providedIn: 'root' })
export class FeatureStore {}

// ✅ ALLOWED
@Injectable()
export class FeatureStore {}

export function provideFeatureStore(): Provider {
  return FeatureStore;
}
```

## Enforcement

- **ESLint rules** (`eslint.config.mjs`) enforce import boundaries
- **Verifier scripts** (`tools/scripts/verify-*.mjs`) validate structure on pre-push
- **Generators** (`pnpm gen:feature`) enforce convention from the start

## Generation

Create new features via:

```bash
pnpm gen:feature Dashboard --route dashboard --register
```

This scaffolds the entire feature structure and registers the route automatically.

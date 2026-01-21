# Verification System Guide

> Understanding the automatic verification gates that ensure code quality and architectural integrity.

## The Five Verification Gates

Your project has **5 automatic verification gates** that run on every pre-push. They exist to prevent architectural violations and catch common mistakes early.

### Gate 1: Structure Validation

**What it checks:** Every feature folder has the required files.

**Required files in each feature:**
- `feature.routes.ts` – Route definition
- `feature.page.ts` – Routed component  
- `feature.data.ts` – Data access layer
- `feature.state.ts` – State management
- `feature.models.ts` – Type definitions

**When it fails:**
```
❌ Feature 'dashboard' missing: dashboard.state.ts
```

**How to fix:**
```bash
# Regenerate the feature with proper scaffolding
pnpm gen:feature Dashboard --route dashboard
```

### Gate 2: App Routes Composition

**What it checks:** App routes use lazy loading, not static imports.

**Correct pattern:**
```typescript
// ✅ CORRECT
export const routes: Routes = [
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
  },
];
```

**Wrong pattern:**
```typescript
// ❌ WRONG
import { DashboardPage } from './features/dashboard/dashboard.page';
export const routes: Routes = [
  { path: 'dashboard', component: DashboardPage },
];
```

**When it fails:**
```
❌ app.routes.ts does not use lazy loading (loadChildren)
```

**How to fix:**
```bash
# Review app.routes.ts and ensure all routes use loadChildren
# Example: Check that you're not importing page components statically
```

### Gate 3: Feature Routes Providers

**What it checks:** Feature routes define providers for dependency injection.

**Correct pattern:**
```typescript
// ✅ CORRECT
export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    providers: [
      provideDashboardData(),
      provideDashboardState(),
    ],
    loadComponent: () =>
      import('./dashboard.page').then((m) => m.DashboardPage),
  },
];
```

**Wrong pattern:**
```typescript
// ❌ WRONG
export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./dashboard.page').then((m) => m.DashboardPage),
  },
];
```

**When it fails:**
```
❌ Feature 'dashboard' routes missing providers
```

**How to fix:**
```bash
# Edit feature.routes.ts and add providers array
# Example providers:
export function provideDashboardData(): Provider {
  return DashboardData;
}

export function provideDashboardState(): Provider {
  return DashboardStore;
}
```

### Gate 4: No Cross-Feature Imports

**What it checks:** Features don't import from each other using relative paths.

**Correct patterns:**
```typescript
// ✅ CORRECT - Import from shared
import { SharedComponent } from '@shared/components';
import { UtilityFunction } from '@shared/utils';

// ✅ CORRECT - Import from absolute path alias
import { CoreApi } from '@core/api';
```

**Wrong pattern:**
```typescript
// ❌ WRONG - Relative import from another feature
import { DashboardService } from '../dashboard/dashboard.service';
```

**When it fails:**
```
❌ Cross-feature import detected:
   src/app/features/home/home.service.ts imports from ../dashboard/dashboard.service.ts
```

**How to fix:**
```bash
# Move the shared code to src/app/shared/
# Then import from @shared/... instead
# Example:
mv src/app/features/dashboard/shared-service.ts src/app/shared/services/
# Update imports
import { SharedService } from '@shared/services';
```

### Gate 5: No Raw Colors

**What it checks:** Code doesn't contain hardcoded color values.

**Correct patterns:**
```typescript
// ✅ CORRECT - Use Tailwind classes
<div class="bg-blue-500 text-white">Content</div>

// ✅ CORRECT - Use CSS variables from theme
<div style="background-color: var(--primary)">Content</div>

// ✅ CORRECT - Use Angular Material colors
<button mat-raised-button color="primary">Click</button>
```

**Wrong pattern:**
```typescript
// ❌ WRONG - Hardcoded color value
const bgColor = '#FF5733';
<div style="color: #FF5733">Text</div>
```

**When it fails:**
```
❌ Raw color found: '#FF5733' in src/app/features/home/home.page.ts
```

**How to fix:**
```bash
# Replace hardcoded colors with Tailwind classes or CSS variables
# Search for hex colors: grep -r "#[0-9A-Fa-f]\{6\}" src/
# Replace with Tailwind equivalents
# Examples:
#FF5733 → bg-red-500
#0000FF → bg-blue-500
#00FF00 → bg-green-500
```

## Running Verifications Manually

Run individual verifications anytime:

```bash
# All verifications (same as pre-push hook)
pnpm verify

# Individual verifications
pnpm verify:structure
pnpm verify:app-routes
pnpm verify:feature-routes
pnpm verify:no-cross-feature-imports
pnpm verify:no-raw-colors
```

## When Verification Blocks Your Push

The pre-push hook runs all verifications before allowing a push. If one fails:

1. **Read the error message** – It tells you exactly what's wrong
2. **Fix the issue** – See the specific gate above for solutions
3. **Verify locally** – Run `pnpm verify` to confirm it passes
4. **Try pushing again** – `git push`

## Why These Gates Exist

| Gate | Prevents |
|------|----------|
| **Structure** | Inconsistent feature organization |
| **App Routes** | Performance problems (static imports don't tree-shake) |
| **Feature Routes** | Memory leaks (services not properly scoped) |
| **Cross-Feature** | Tight coupling between features |
| **Raw Colors** | Design system violations and maintenance issues |

## Common Mistakes

### Mistake 1: Forgetting to use `loadChildren`

```typescript
// ❌ WRONG
import { FeaturePage } from './features/feature/feature.page';
export const routes = [
  { path: 'feature', component: FeaturePage }  // Fails Gate 2
];

// ✅ RIGHT
export const routes = [
  {
    path: 'feature',
    loadChildren: () =>
      import('./features/feature/feature.routes').then((m) => m.FEATURE_ROUTES)
  }
];
```

### Mistake 2: Creating a feature folder without scaffolding

```bash
# ❌ WRONG
mkdir -p src/app/features/manual-feature
# Creates files manually
# → Fails Gate 1 (structure validation)

# ✅ RIGHT
pnpm gen:feature ManualFeature --route manual-feature
# Scaffolds with all required files
```

### Mistake 3: Sharing code between features

```typescript
// ❌ WRONG
// In src/app/features/dashboard/dashboard.service.ts
export class DashboardService { ... }

// In src/app/features/home/home.page.ts
import { DashboardService } from '../dashboard/dashboard.service';
// → Fails Gate 4 (cross-feature import)

// ✅ RIGHT
// Move to src/app/shared/services/dashboard.service.ts
export class DashboardService { ... }

// In any feature
import { DashboardService } from '@shared/services';
```

### Mistake 4: Hardcoded colors in styles

```typescript
// ❌ WRONG
@Component({
  template: `<div style="color: #FF0000">Error</div>`
})
// → Fails Gate 5 (raw color)

// ✅ RIGHT
@Component({
  template: `<div class="text-red-500">Error</div>`
})
```

### Mistake 5: Missing providers in feature routes

```typescript
// ❌ WRONG
export const FEATURE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./feature.page').then((m) => m.FeaturePage)
  }
];
// → Fails Gate 3 (missing providers)

// ✅ RIGHT
export const FEATURE_ROUTES: Routes = [
  {
    path: '',
    providers: [provideFeatureData()],
    loadComponent: () =>
      import('./feature.page').then((m) => m.FeaturePage)
  }
];
```

## Quick Reference

| Need to... | Run... |
|---|---|
| Check all gates | `pnpm verify` |
| Check structure | `pnpm verify:structure` |
| Check app routes | `pnpm verify:app-routes` |
| Check feature routes | `pnpm verify:feature-routes` |
| Check imports | `pnpm verify:no-cross-feature-imports` |
| Check colors | `pnpm verify:no-raw-colors` |
| Generate feature properly | `pnpm gen:feature Name --route name` |

## Prevention

The gates are easier to pass from the start:

1. **Always use `pnpm gen:feature`** – Never create feature folders manually
2. **Always use `loadChildren`** – Never import page components statically
3. **Always add providers** – Every feature route needs a providers array
4. **Use `src/app/shared/`** – Don't import between feature folders
5. **Use Tailwind classes** – No hardcoded colors

Following these practices, all gates pass automatically! ✅

---

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed fixes when gates fail.

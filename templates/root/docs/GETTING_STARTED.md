# Getting Started Guide

> From bootstrap to your first feature in 10 minutes.

## After Bootstrap

The bootstrap script has set up your complete Angular workspace. Here's what's installed:

✅ Angular 21 with standalone components  
✅ Tailwind CSS 4.1.18 + Angular Material 21.1.0  
✅ Prettier, ESLint, Vitest configured  
✅ Git hooks (pre-commit, commit-msg, pre-push)  
✅ Feature scaffolding tool  
✅ Verification gates for code quality  

## Step 1: Start Development Server

```bash
pnpm dev
```

Open http://localhost:4200 in your browser. You should see the Angular startup page.

## Step 2: Understand the Project Structure

```
src/app/
├── app.ts              # Root component
├── app.routes.ts       # Route composition
├── app.config.ts       # Configuration
├── features/           # Your features go here
│   └── home/           # Example feature
│       ├── home.routes.ts     # Feature routes
│       ├── home.page.ts       # Routed component
│       ├── home.data.ts       # Data access
│       ├── home.state.ts      # State management
│       └── home.models.ts     # Types
└── shared/             # Shared components
    ├── layout/
    └── pages/
```

**Key principle**: Features are **route-based vertical slices**, not organized by type.

## Step 3: Generate Your First Feature

```bash
pnpm gen:feature Dashboard --route dashboard
```

This creates a new feature with:
- ✅ Route definition
- ✅ Page component
- ✅ Data access layer
- ✅ State management setup
- ✅ TypeScript types
- ✅ Example test

The feature is **automatically** registered in your routes!

## Step 4: Make Your Changes

Edit the generated files in `src/app/features/dashboard/`:

```typescript
// dashboard.page.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardData } from './dashboard.data';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8">
      <h1 class="text-3xl font-bold">Dashboard</h1>
      <!-- Your content here -->
    </div>
  `,
})
export class DashboardPage {
  protected data = inject(DashboardData);
}
```

Hot reload automatically updates your browser as you save.

## Step 5: Commit Your Changes

```bash
git add src/app/features/dashboard
git commit -m "feat: add dashboard feature"
```

The **pre-commit hook** automatically:
- ✓ Formats your code
- ✓ Fixes linting issues
- ✓ Re-formats after linting

## Step 6: Push Your Changes

```bash
git push origin feature/dashboard
```

The **pre-push hook** automatically:
- ✓ Runs tests
- ✓ Validates structure
- ✓ Validates routes
- ✓ Checks feature isolation
- ✓ Detects hardcoded colors

If any check fails, the push is blocked. Fix the issues and try again.

## Common Commands

### Development

```bash
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm test             # Run tests once
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Coverage report
```

### Quality Gates

```bash
pnpm format           # Format all files
pnpm lint             # Check code style
pnpm lint:fix         # Auto-fix issues
pnpm typecheck        # TypeScript checking
pnpm verify           # Run all gates
```

### Feature Management

```bash
# Generate a feature
pnpm gen:feature FeatureName --route feature-name

# List available commands
pnpm gen:feature --help
```

## Understanding the Verification Gates

Your project has **5 automatic verification gates** that run on pre-push:

| Gate | What It Checks | Common Fix |
|------|---|---|
| **Structure** | Feature folders have required files | Run generator again |
| **App routes** | Routes are lazy-loaded, not imported | Check `app.routes.ts` |
| **Feature routes** | Features define providers for DI | Add providers to feature routes |
| **No cross-feature imports** | Features don't import from each other | Move shared code to `shared/` |
| **No raw colors** | No hardcoded colors in code | Use Tailwind classes or theme colors |

See [docs/VERIFICATION.md](../docs/VERIFICATION.md) for detailed information.

## Styling Your Feature

Use **Tailwind CSS utility classes**:

```typescript
template: `
  <div class="grid grid-cols-3 gap-4 p-8">
    <div class="rounded-lg bg-white shadow p-4">
      <h2 class="text-lg font-semibold mb-2">Card Title</h2>
      <p class="text-gray-600">Card content</p>
    </div>
  </div>
`
```

For component styling, use **Angular Material** and **Tailwind** together:

```typescript
import { MatButtonModule } from '@angular/material/button';

@Component({
  imports: [CommonModule, MatButtonModule],
  template: `<button mat-raised-button class="bg-blue-500">Click me</button>`
})
```

See [docs/STYLING.md](../docs/STYLING.md) for detailed styling guide.

## Fetching Data from Your Backend

Use the `*.data.ts` file for HTTP calls:

```typescript
// dashboard.data.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class DashboardData {
  private http = inject(HttpClient);
  
  getDashboardStats() {
    return this.http.get('/api/dashboard/stats');
  }
}

// dashboard.page.ts
export class DashboardPage {
  protected data = inject(DashboardData);
  stats = this.data.getDashboardStats();
}
```

See [docs/API.md](../docs/API.md) for detailed API integration patterns.

## Testing Your Feature

```bash
# Run tests in watch mode
pnpm test:watch

# Run tests once
pnpm test

# View coverage
pnpm test:coverage
```

See [docs/TESTING.md](../docs/TESTING.md) for testing patterns and examples.

## When Something Breaks

**Pre-commit hook failed?**
```bash
pnpm format           # Fix formatting
pnpm lint:fix         # Fix linting
git add . && git commit -m "fix: resolve issues"
```

**Pre-push hook blocked?**
```bash
pnpm test             # Check tests
pnpm verify           # Run all verifiers
git push              # Try again
```

See [docs/TROUBLESHOOTING.md](../docs/TROUBLESHOOTING.md) for more help.

## Next Steps

1. **Generate a feature** – `pnpm gen:feature MyFeature --route my-feature`
2. **Read the architecture rules** – [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)
3. **Learn common patterns** – [docs/DEVELOPMENT.md](../docs/DEVELOPMENT.md)
4. **Understand verification** – [docs/VERIFICATION.md](../docs/VERIFICATION.md)

## Key Rules to Remember

✅ **One feature = one route**  
✅ **Data access in `*.data.ts` files only**  
✅ **No cross-feature imports**  
✅ **Use `shared/` for truly shared code**  
✅ **Routes are lazy-loaded, not imported**  
✅ **Commit messages follow Conventional Commits**

See [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) for the complete architectural ruleset.

## Getting Help

- **Daily development** → [docs/DEVELOPMENT.md](../docs/DEVELOPMENT.md)
- **Architectural rules** → [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)
- **Testing** → [docs/TESTING.md](../docs/TESTING.md)
- **Backend integration** → [docs/API.md](../docs/API.md)
- **Styling** → [docs/STYLING.md](../docs/STYLING.md)
- **Verification gates** → [docs/VERIFICATION.md](../docs/VERIFICATION.md)
- **Problems** → [docs/TROUBLESHOOTING.md](../docs/TROUBLESHOOTING.md)

---

**You're all set!** Run `pnpm dev` and start building. The project will guide you with automatic checks at every step. 🚀

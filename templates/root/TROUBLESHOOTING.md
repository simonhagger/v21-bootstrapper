# Troubleshooting Guide

> Common problems and their solutions.

## Pre-Commit Hook Issues

### "Pre-commit hook failed"

The hook runs Prettier and ESLint before allowing commits. This is a feature, not a bug!

**Solution:**
```bash
pnpm format           # Auto-format code
pnpm lint:fix         # Auto-fix linting issues
git add .             # Stage the fixes
git commit -m "fix: resolve formatting and linting"
```

### "Modified files in hooks" warning

Husky might show this if files were modified by formatters.

**Solution:**
```bash
git add .
git commit -m "your message"  # Try committing again
```

## Pre-Push Hook Issues

### "Pre-push hook blocked my push"

The hook ran verifications and something failed. This is intentional—it prevents broken code from reaching the remote.

**Solution depends on which check failed:**

#### Tests Failed

```bash
pnpm test             # Run tests locally to see errors
# Fix the failing tests
git push              # Try again
```

#### Structure Verification Failed

```bash
# Check your feature folders match the pattern
pnpm verify:structure

# If you manually created a feature, regenerate it properly
pnpm gen:feature FeatureName --route feature-name
```

#### Route Verification Failed

```bash
# Check that app.routes.ts uses loadChildren (lazy loading)
pnpm verify:app-routes

# Example of correct pattern:
# {
#   path: 'dashboard',
#   loadChildren: () => import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
# }
```

#### Feature Routes Verification Failed

```bash
# Check that feature routes have providers
pnpm verify:feature-routes

# Example of correct pattern:
# export const DASHBOARD_ROUTES: Routes = [
#   {
#     path: '',
#     providers: [provideDashboardData()],
#     loadComponent: () => import('./dashboard.page').then((m) => m.DashboardPage),
#   },
# ];
```

#### Cross-Feature Import Detected

```bash
pnpm verify:no-cross-feature-imports

# ❌ WRONG
import { SomeService } from '../dashboard/dashboard.service';

# ✅ RIGHT
import { SomeComponent } from '@shared/components';
```

**Solution**: Move the shared code to `src/app/shared/` and import from there.

#### Raw Color Detected

```bash
pnpm verify:no-raw-colors

# ❌ WRONG
const bgColor = '#FF5733';  // Hardcoded color!
<div style="color: #FF5733">Text</div>

# ✅ RIGHT
<div class="bg-blue-500">Content</div>  // Tailwind class
<div class="bg-primary">Content</div>   // CSS variable
```

## TypeScript Errors

### "Type 'X' is not assignable to type 'Y'"

You have a type mismatch. TypeScript is catching this correctly.

**Solution:**
```typescript
// Wrong
const items: Item[] = response;  // response is Observable<Item[]>

// Right
const items$ = response;  // Stay in observable world
// Then in template: @if (items$ | async as items)

// Or convert to signal
const items = toSignal(response);
```

### "Type 'any' is not allowed"

ESLint is enforcing strict TypeScript mode. Define your types:

```typescript
// ❌ Wrong
const data: any = response.json();

// ✅ Right
interface ApiResponse {
  status: string;
  data: Item[];
}
const data: ApiResponse = response;
```

## ESLint / Formatting Issues

### "ESLint maximum warnings exceeded"

You have code style issues. Fix them:

```bash
pnpm lint:fix         # Auto-fix what's possible
pnpm lint             # See remaining issues
```

Address any manual fixes, then commit.

### "File not formatted according to Prettier"

```bash
pnpm format           # Auto-format everything
git add .
git commit -m "style: format code"
```

### "Unused imports"

ESLint found imports you're not using:

```typescript
// ❌ Wrong
import { Component, OnInit } from '@angular/core';  // OnInit unused
import { unused } from './helper';

export class MyComponent {
  // ...
}

// ✅ Right
import { Component } from '@angular/core';

export class MyComponent {
  // ...
}
```

Use `pnpm lint:fix` to auto-remove them, or remove them manually.

## Development Server Issues

### "Port 4200 already in use"

Another process is using the port:

**Solution 1: Kill the process**
```bash
# Windows
netstat -ano | findstr :4200
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :4200
kill -9 <PID>
```

**Solution 2: Use a different port**
```bash
pnpm dev -- --port 4201
```

### "Cannot find module '@angular/...' or similar"

Your `node_modules` might be corrupted:

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm dev
```

### "Compilation errors in template"

Angular template issues usually show in your browser console:

```typescript
// ❌ Wrong
@Component({
  template: `<button (click)="save()">Save</button>`
})
export class MyComponent {
  handleSave() { }  // Method name is different!
}

// ✅ Right
@Component({
  template: `<button (click)="handleSave()">Save</button>`
})
export class MyComponent {
  handleSave() { }
}
```

## Feature Generation Issues

### "pnpm gen:feature command not found"

The npm scripts might not be loaded:

```bash
# Verify the script exists in package.json
npm pkg get scripts.gen:feature

# Try again
pnpm gen:feature Dashboard --route dashboard
```

### "Feature folder already exists"

You tried to generate a feature that already exists:

```bash
# Use a different name
pnpm gen:feature Dashboard2 --route dashboard2

# Or delete the existing feature
rm -rf src/app/features/dashboard
pnpm gen:feature Dashboard --route dashboard
```

### "Feature not automatically registered in routes"

You need to use the `--register` flag:

```bash
pnpm gen:feature Dashboard --route dashboard --register
```

Or manually add to `app.routes.ts`:
```typescript
{
  path: 'dashboard',
  loadChildren: () =>
    import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
}
```

## Testing Issues

### "Tests fail but they pass locally"

This usually means:
1. Environment differences (dev vs CI)
2. Test isolation problems
3. Timing issues (async operations not awaited)

**Solution:**
```bash
# Run tests the same way CI does
pnpm test              # Not watch mode
pnpm test:coverage     # With coverage to see uncovered code
```

### "Component not rendering in test"

You likely forgot to import required modules:

```typescript
import { TestBed } from '@angular/core/testing';
import { MyComponent } from './my.component';
import { CommonModule } from '@angular/common';

describe('MyComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent, CommonModule],  // Include required imports
    }).compileComponents();
  });

  it('renders', () => {
    const component = TestBed.createComponent(MyComponent);
    component.detectChanges();
    expect(component.nativeElement).toBeTruthy();
  });
});
```

## API / Backend Integration Issues

### "404 Not Found" or "CORS error"

Your backend API might not be running or configured incorrectly:

**Solution:**
1. Check backend is running: `curl http://localhost:3000/api/health`
2. Check environment config: `src/environments/environment.ts`
3. Check CORS headers from backend
4. Check network tab in browser DevTools

### "Authorization failed (401)"

Your auth token might be missing or expired:

```typescript
// Make sure token is being sent
export class AuthInterceptor implements HttpInterceptor {
  private auth = inject(AuthService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getToken();
    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    }
    return next.handle(req);
  }
}
```

### "Request timeout"

Set a longer timeout or check your backend performance:

```typescript
getStats(): Observable<DashboardStats> {
  return this.http.get<DashboardStats>(`${this.baseUrl}/stats`, {
    params: new HttpParams().set('timeout', '60000'),
  });
}
```

## Git / Commit Issues

### "Commit message rejected"

commitlint requires Conventional Commits format:

```bash
# ❌ Wrong
git commit -m "fixed dashboard"

# ✅ Right
git commit -m "fix: dashboard layout issues"
git commit -m "feat: add export functionality"
git commit -m "docs: update API guide"
git commit -m "refactor: simplify state management"
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `style`

### "Git merge conflicts"

This happens when multiple branches modify the same lines:

```bash
# See conflicts in files
git status

# Edit files to resolve conflicts
# Look for <<<<<<, ======, >>>>>>
# Keep the changes you want

git add <resolved-file>
git commit -m "merge: resolve conflicts"
```

## Still Stuck?

1. **Run `pnpm verify`** – This runs all checks and shows what's wrong
2. **Check the docs** – Read [ARCHITECTURE.md](./ARCHITECTURE.md) or [DEVELOPMENT.md](./DEVELOPMENT.md)
3. **Review the error message** – It usually tells you exactly what's wrong
4. **Search online** – Most Angular errors have Stack Overflow answers
5. **Check git hooks** – See what ran: `cat .husky/pre-push`

## Getting Help with Specific Tools

- **Angular issues** → https://angular.io/guide
- **Tailwind CSS** → https://tailwindcss.com/docs
- **Angular Material** → https://material.angular.io
- **Vitest** → https://vitest.dev
- **ESLint** → https://eslint.org/docs
- **TypeScript** → https://www.typescriptlang.org/docs

---

**Remember:** The verification gates are your friends. They catch problems early and prevent bad code from being pushed. When a gate blocks you, it's saving you from a production bug! 🛡️

# Development Context & Collaboration Rules

**Last Updated:** January 22, 2026  
**Purpose:** Consolidate working patterns, conventions, and rules for rapid context recovery

---

## 1. Git & Branch Workflow

### Branch Strategy
- **Main Branch Only for GitHub**: All commits pushed to GitHub must be from `main` branch only
- **Feature Branches Local Only**: Work on feature branches (`feature/e2e-testing`, etc.) locally without pushing to remote
- **Merge Before Push**: 
  1. Complete feature work and testing locally
  2. Switch to `main` and merge feature branch
  3. Delete local feature branch
  4. Then push `main` to GitHub

### Commit Messages
- Use conventional commits format: `type: description`
- Types: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
- Include detailed body explaining "why" for complex changes
- Example: `feat: add Playwright E2E testing setup`

---

## 2. Repository Structure & Lock-Step Pattern

### Two Repositories (In Sync)
- **v21-bootstrapper** (`e:\ANGULAR\v21\tools\bootstrap`): Template source
- **demo-v21-app** (`e:\workspace\demo-v21-app`): Real project for validation

### Key Pattern
- Templates always represent what a fresh bootstrap should produce
- Demo app is upgraded via `upgrade-deployment.ps1` to validate templates work in practice
- This ensures **reproducibility**: Any developer cloning the repo gets a working project

### Bootstrap Flow
```
Template changes → Commit to bootstrap → Run upgrade-deployment.ps1 → 
Test demo-v21-app → If all pass, push both repos to GitHub
```

---

## 3. Documentation Requirements

### Critical Rule
**Update documentation during automation cycles** - Don't defer docs to "later"

### Documentation Files
- **README.md** (root): Project overview, quick start
- **docs/**: 9 consolidated guides
  - `GETTING_STARTED.md` - First-time setup
  - `ARCHITECTURE.md` - Core rules & structure
  - `DEVELOPMENT.md` - Daily workflows
  - `TESTING.md` - Unit testing with Vitest
  - `E2E_TESTING.md` - Playwright E2E tests
  - `STYLING.md` - Tailwind + Material integration
  - `API.md` - Backend/HTTP integration
  - `VERIFICATION.md` - Verification gates
  - `TROUBLESHOOTING.md` - Common issues

### Bootstrap Changes Trigger Doc Updates
- When adding service → Update relevant docs (DEVELOPMENT, API, etc.)
- When changing patterns → Update ARCHITECTURE or style guides
- When adding tools → Add new docs/ file if significant

---

## 4. Project Architecture & Patterns

### Angular 21 Stack
- **Framework**: Angular 21 standalone components (no NgModule)
- **CSS**: Tailwind CSS 4 (no separate config needed - uses defaults)
- **UI Library**: Material Angular 21 (auto dark mode support)
- **Breakpoint Detection**: Angular CDK BreakpointObserver
- **Platform Detection**: CDK Platform.isBrowser for SSR, userAgent parsing for browser/OS
- **Routing**: Route-first architecture with lazy loading
- **State**: Services with Angular Signals public API
  - **Rule**: RxJS allowed in service internals, but public API must expose Signals
  - Use `toSignal()` or similar to convert observables to Signals at the boundary
  - Ensures consistent signal-based consumption in components
- **Testing**: Vitest for unit tests, Playwright for E2E

### Core Services (Bootstrap Templates)
1. **ThemeService** (`theme.service.ts`)
   - Manages light/dark/auto modes
   - Persists to localStorage
   - Exposes `scheme` signal
   - Applies `dark` class to `<html>` element

2. **ResponsiveService** (`responsive.service.ts`)
   - Tailwind breakpoint detection (xs/sm/md/lg/xl/2xl) via CDK BreakpointObserver
   - Device classification (mobile/tablet/desktop)
   - Browser detection (Chrome, Firefox, Safari, Edge)
   - OS detection (Windows, macOS, Linux, iOS, Android)
   - Applies semantic HTML classes: `bp-*`, `browser-*`, `platform-*`
   - **Public API**: Signals - `isMobile()`, `currentBreakpoint()`, `state()`, etc.
   - **Internal**: RxJS observables for reactive logic, converted to signals via `toSignal()`

### Feature Structure
```
src/app/
├── app.ts              # Bootstrap component
├── app.routes.ts       # Feature routing (lazy-loaded)
├── app.config.ts       # Angular config, providers
├── features/
│   ├── home/           # Feature module (lazy route)
│   │   ├── home.page.ts
│   │   ├── home.routes.ts
│   │   ├── home.page.spec.ts
│   │   ├── README.md   # Feature documentation
│   │   └── [data.ts, state.ts, models.ts]
│   └── README.md       # Feature guide
├── shared/
│   ├── services/       # App-wide services (theme, responsive, http)
│   ├── layout/         # App shell layout component
│   ├── pages/          # Shared pages (404, error)
│   └── README.md
└── app.scss            # Global styles
```

### Verification Gates (Run Before Push)
```bash
pnpm verify:structure           # Feature folder layout
pnpm verify:app-routes          # App routing valid
pnpm verify:feature-routes      # Feature routing valid
pnpm verify:no-cross-feature    # No cross-feature imports
pnpm verify:no-raw-colors       # No hardcoded colors (use tokens)
```

---

## 5. Bootstrap Process

### What Bootstrap Does
1. Creates Angular 21 workspace with `ng new`
2. Adds Tailwind CSS + Angular Material
3. Installs Playwright for E2E testing
4. Copies curated templates (app structure, services, configs)
5. Installs verification scripts and git hooks
6. Runs post-bootstrap verification (format, lint, build, test, verify gates)

### Key Bootstrap Files
- **bootstrap.ps1**: Main scaffolding script
- **templates/root/**: Root-level config & setup
- **templates/web-app/src/**: Application source templates
- **templates/tools-scripts/**: Verification & generation scripts

### Important Detail
- No `tailwind.config.js` needed (Tailwind v4 defaults used)
- ESLint config ignores: playwright files, vitest config, e2e/
- Pre-push hooks run: tests, linting, verification gates

---

## 6. Testing & Verification

### Unit Tests (Vitest)
```bash
pnpm test           # Run tests once
pnpm test:watch     # Watch mode
pnpm test:coverage  # Coverage report
```

### E2E Tests (Playwright)
```bash
pnpm e2e            # Run all tests headless
pnpm e2e:ui         # Interactive UI mode (recommended for dev)
pnpm e2e:debug      # Debug with inspector
pnpm e2e:report     # View HTML report
```

### Fresh Clone Validation
Always test with:
```bash
git clone <repo>
cd <app>
pnpm install        # Validate dependencies
pnpm build          # Validate build
pnpm test           # Validate tests
pnpm verify         # Validate all gates
```

---

## 7. Deployment & Upgrade Workflow

### upgrade-deployment.ps1 Pattern
Used to apply template changes to demo-v21-app:

```powershell
# Compare mode (shows what would change)
.\upgrade-deployment.ps1 -compare

# Apply mode (updates files)
.\upgrade-deployment.ps1 -upgrade-force

# Run tests and verification after
pnpm test
pnpm verify
```

### GitHub Workflows
- **CI workflow** (`.github/workflows/ci.yml`):
  - Runs on push to main/develop and PRs
  - Validates: format, lint, typecheck, tests, build, E2E tests, verification gates
  - Uploads build artifacts and test reports
  - Must pass before merging

---

## 8. Development Commands Reference

```bash
# Development
pnpm dev              # Start dev server (localhost:4200)
pnpm build            # Production build
pnpm typecheck        # TypeScript validation

# Code Quality
pnpm format           # Auto-format code
pnpm format:check     # Check formatting
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix linting issues

# Testing
pnpm test             # Unit tests (Vitest)
pnpm e2e              # E2E tests (Playwright)
pnpm verify           # All verification gates

# Feature Generation
pnpm gen:feature      # Scaffold new feature with proper structure
```

---

## 9. Key Lessons & Patterns

### CDK Platform Service
- Use `Platform.isBrowser` for SSR safety checks only
- Use userAgent parsing for actual browser/OS detection (more reliable)
- Document when integrating CDK services in JSDoc

### Theme & Responsive Indicators
- Separate **System Preference** (OS preference) from **Applied Theme** (current active theme)
- Show theme indicators as "active" when in explicit light/dark mode, not just dark
- Active state binding: `themeScheme() !== 'auto'`

### Tailwind v4 Simplification
- No separate `tailwind.config.js` needed (uses defaults)
- Dark mode: Always uses `class` mode (configured in Material)
- Breakpoints: Use CDK BreakpointObserver, not custom Tailwind config

### Fresh Clone Testing
- Validates entire system works for new developers
- Catches missing dependencies, config errors, broken scripts early
- Run before declaring feature complete

### Responsive Service Pattern
- Combine CDK BreakpointObserver (breakpoints) + userAgent (browser/OS)
- Use RxJS observables internally for reactive logic
- Expose Signals via `toSignal()` for component consumption: `isMd()`, `isMobile()`, `state()`
- Apply semantic HTML classes for CSS targeting: `bp-md`, `mobile`, `browser-safari`
- Components access via signals: `responsive.isMobile()`, `responsive.currentBreakpoint()`

---

## 10. Common Issues & Solutions

### ESLint TypeScript Errors on Config Files
**Problem**: `playwright.config.ts` or `vitest.config.ts` not found by TypeScript
**Solution**: Add to ESLint ignores array
```javascript
ignores: [..., 'playwright.config.ts', 'e2e/**', 'vitest.config.ts', ...]
```

### Pre-push Hooks Failing
**Common causes**:
- Tests failing → Fix tests before push
- Linting errors → Run `pnpm lint:fix`
- Formatting issues → Run `pnpm format`
- Verification gates → Run `pnpm verify:*` individually to debug

### Fresh Clone Package Install Issues
**Always use**: `pnpm install --frozen-lockfile`
Ensures exact versions from `pnpm-lock.yaml`

---

## 11. Workflow Checklist for Features

- [ ] Create local feature branch: `git checkout -b feature/name`
- [ ] Make changes with regular commits
- [ ] Run `pnpm verify` - all gates pass
- [ ] Test with fresh clone if major changes
- [ ] Checkout main: `git checkout main`
- [ ] Merge feature: `git merge feature/name`
- [ ] Delete local branch: `git branch -d feature/name`
- [ ] Push to GitHub: `git push origin main`
- [ ] If templates changed, run `upgrade-deployment.ps1 -upgrade-force` on demo app

---

## 12. Development Environment & Operational Notes

### Platform & Shell
- **Operating System**: Windows
- **IDE**: VS Code
- **Shell**: PowerShell (pwsh)
  - ✅ Use PowerShell commands (`Get-ChildItem`, `Copy-Item`, `Remove-Item`, etc.)
  - ❌ Bash commands will NOT work (`ls`, `cp`, `rm`, `grep`, `tail`, etc.)
  - Use PowerShell equivalents or native Windows commands

### Critical Command Rules
1. **ALWAYS verify current directory before running commands**
   - Use `Get-Location` or check terminal context
   - Change directory explicitly: `cd "e:\ANGULAR\v21\tools\bootstrap"`
   - Never assume current directory

2. **Server processes block terminals**
   - Starting dev server (`pnpm dev`) blocks the terminal
   - Cannot run additional commands in same terminal while server is running
   - To test server responses (curl, etc.), use a different terminal
   - Use `isBackground: true` in run_in_terminal for long-running processes

3. **PowerShell Syntax Conventions**
   - Parameters use `-ParameterName` format
   - File paths with spaces: Use quotes `"e:\path with spaces\file.txt"`
   - Pipe operations: `|` works but different from bash
   - Command chaining: Use `;` between commands
   - Recursion: `-Recurse` flag (not `-r`)
   - Force operations: `-Force` flag (not `-f`)

### Example Corrections
```powershell
# ❌ Bash (won't work)
ls -la | grep "pattern" | tail -10
rm -rf ./folder

# ✅ PowerShell equivalent
Get-ChildItem -Recurse | Where-Object { $_.Name -match "pattern" } | Select-Object -First 10
Remove-Item -Path ".\folder" -Recurse -Force
```

---

## 13. File Organization (Key Locations)

```
e:\ANGULAR\v21\tools\bootstrap/
├── bootstrap.ps1                    # Main scaffolding script
├── upgrade-deployment.ps1           # Apply template updates to demo-v21-app
├── templates/
│   ├── root/                        # Root-level templates
│   │   ├── .github/workflows/ci.yml
│   │   ├── playwright.config.ts
│   │   ├── eslint.config.mjs
│   │   ├── docs/                    # 9 documentation files
│   │   ├── e2e/                     # Example E2E tests
│   │   └── tools/scripts/           # Verification & generation scripts
│   ├── web-app/src/                 # Application source templates
│   └── token-structure/             # Design token system
└── docs/                            # Bootstrap documentation

e:\workspace\demo-v21-app/           # Real project for validation
├── src/app/
├── e2e/                             # E2E tests
├── .github/workflows/               # GitHub Actions
└── package.json                     # Updated via upgrade script
```

---

## 14. Next Context Recovery

**When resuming work:**
1. Read this document first
2. **Verify current directory**: `Get-Location` (CRITICAL)
3. Check current git status: `git status`
4. Identify which branch you're on
5. Review recent commit history: `git log --oneline -10`
6. Run `pnpm verify` to validate current state
7. Check demo-v21-app for any pending upgrades

---

**Document Owner**: Development Workflow System  
**Last Session**: January 22, 2026 - E2E Testing + Signals Refactor  
**Status**: Active - Bootstrap system production-ready, E2E + signals features on local branch
**Environment**: Windows, VS Code, PowerShell


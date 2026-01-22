# Project Overview

Production-ready Angular 21 workspace with **Tailwind CSS 4.1.18** and **Angular Material 21.1.0** installed and configured by default.

## What You Get

✅ **Instant productivity** – Zero configuration needed  
✅ **Code quality** – Automatic formatting, linting, unit testing, and E2E testing  
✅ **Architectural integrity** – Enforced via git hooks and verification gates  
✅ **Feature scaffolding** – Generate features with routes, state, data access in seconds  
✅ **Comprehensive guides** – Documentation for every aspect of development  
✅ **E2E Testing** – Multi-browser testing with Playwright (Chrome, Firefox, Safari)

## Quick Start

```bash
# Install dependencies (already done during bootstrap)
pnpm install

# Start development server
pnpm dev

# Run all quality gates
pnpm verify

# Generate a new feature
pnpm gen:feature Dashboard --route dashboard
```

## Project Structure

```
src/app/
├── app.ts                 # Root component
├── app.routes.ts          # Route composition (lazy-loaded features)
├── app.config.ts          # App configuration
├── features/              # Route-based vertical slices
│   └── home/
│       ├── home.routes.ts       # Feature route definition
│       ├── home.page.ts         # Routed component
│       ├── home.data.ts         # Data access/HTTP boundary
│       ├── home.state.ts        # State management
│       ├── home.models.ts       # TypeScript types
│       └── README.md            # Feature documentation
├── shared/                # Shared components and utilities
│   ├── layout/
│   ├── pages/
│   └── ...
└── styles.scss            # Global styles

tools/
└── scripts/               # Verification and feature generation

e2e/                       # End-to-end tests (Playwright)
├── example.spec.ts        # Example tests
└── *.spec.ts              # Feature-specific E2E tests

docs/                      # Developer documentation (9 guides)
├── GETTING_STARTED.md     # Zero-to-first-feature onboarding
├── ARCHITECTURE.md        # Non-negotiable architectural rules
├── DEVELOPMENT.md         # Daily development workflows
├── TESTING.md             # Unit and E2E testing patterns
├── E2E_TESTING.md         # Comprehensive E2E testing guide
├── STYLING.md             # Tailwind + Material theming
├── API.md                 # Backend API integration patterns
├── VERIFICATION.md        # Verification gates system
└── TROUBLESHOOTING.md     # Common problems and solutions
```

## Key Commands

### Development

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start development server (port 4200) |
| `pnpm build` | Build for production |
| `pnpm test` | Run unit tests (Vitest) |
| `pnpm test:watch` | Run unit tests in watch mode |
| `pnpm test:coverage` | Run unit tests with coverage report |
| `pnpm e2e` | Run E2E tests headless (all browsers) |
| `pnpm e2e:ui` | Run E2E tests with interactive UI |
| `pnpm e2e:debug` | Run E2E tests with debugging tools |

### Quality Gates

| Command | Purpose |
|---------|---------|
| `pnpm format` | Auto-format all files (Prettier) |
| `pnpm format:check` | Check formatting without changes |
| `pnpm lint` | Check code style (ESLint) |
| `pnpm lint:fix` | Auto-fix linting issues |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm verify:*` | Run specific verification gates |
| **Quality Hardening** | Optional gates are commented out; see docs/QUALITY_GATES.md to enable over time |

### Feature Management

| Command | Purpose |
|---------|---------|
| `pnpm gen:feature <name> --route <path>` | Generate new feature |
| `pnpm gen:feature <name> --route <path> --register` | Generate and register in routes |

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Angular 21+ (standalone components) |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS 4.1.18 + Angular Material 21.1.0 |
| **Package Manager** | pnpm |
| **Unit Testing** | Vitest 4.0.17 (jsdom environment) |
| **E2E Testing** | Playwright 1.57.0 (Chrome, Firefox, WebKit) |
| **Linting** | ESLint 9.39.2 (flat config, TypeScript strict) |
| **Formatting** | Prettier 3.8.1 (with Tailwind plugin) |
| **Git Hooks** | Husky 9.1.7 (pre-commit, commit-msg, pre-push) |
| **Commits** | commitlint 20.3.1 (Conventional Commits) |

## Architecture Highlights

### Route-First Organization

Features are organized by **route**, not by type. Each feature is a self-contained vertical slice with:
- Route definition (`*.routes.ts`)
- Routed component (`*.page.ts`)
- Data access (`*.data.ts`)
- State management (`*.state.ts`)
- Type definitions (`*.models.ts`)

### Quality Gates by Default

The repository enforces quality at every step:

| Gate | When | Enforces |
|------|------|----------|
| **Pre-commit** | Before commit | Code formatting and linting |
| **Commit-msg** | During commit | Conventional commit format |
| **Pre-push** | Before push | Tests, structure, routes, imports |
| **CI** | On pull request | All gates must pass |

## CI/CD (GitHub Actions)

- Server-side checks run on push/PR to `main` and `develop` via [ .github/workflows/ci.yml ](.github/workflows/ci.yml)
- Steps match local hooks: format check, lint, typecheck, unit tests, E2E tests, build, and all five verification gates
- E2E tests run on all browsers (Chrome, Firefox, WebKit) to catch cross-browser issues
- Uses pnpm cache for faster runs and uploads build artifacts
- To enforce merges, enable branch protection and require the `Validate Code Quality` check
- CODEOWNERS is shipped as commented examples; uncomment and add real handles when you are ready to enforce code-owner reviews (see [ .github/CODEOWNERS ](.github/CODEOWNERS))
- More detail: [ docs/GITHUB_ACTIONS.md ](docs/GITHUB_ACTIONS.md)

### Verification System

Automatic verification prevents common mistakes:

- ✓ **Structure** – Validates feature folder layout
- ✓ **App routes** – Ensures lazy-loaded route composition
- ✓ **Feature routes** – Validates route providers and loaders
- ✓ **Cross-feature imports** – Prevents feature isolation violations
- ✓ **Raw colors** – Detects hardcoded colors

## Documentation

All documentation lives in the `docs/` folder. Start with **ARCHITECTURE.md** to understand the core principles:

| Document | Purpose |
|----------|---------|
| **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** | Non-negotiable architectural rules (READ THIS FIRST) |
| **[docs/GETTING_STARTED.md](docs/GETTING_STARTED.md)** | Zero-to-first-feature onboarding in 10 minutes |
| **[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)** | Daily development workflows and best practices |
| **[docs/TESTING.md](docs/TESTING.md)** | Unit and E2E testing patterns, utilities, and coverage guidance |
| **[docs/E2E_TESTING.md](docs/E2E_TESTING.md)** | Comprehensive E2E testing with Playwright (advanced patterns, fixtures, API mocking) |
| **[docs/STYLING.md](docs/STYLING.md)** | Tailwind CSS + Angular Material integration |
| **[docs/API.md](docs/API.md)** | Backend API integration patterns and examples |
| **[docs/VERIFICATION.md](docs/VERIFICATION.md)** | Verification gates: what they check and how to pass |
| **[docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** | Solutions to common problems by category |
| **[docs/GITHUB_ACTIONS.md](docs/GITHUB_ACTIONS.md)** | CI setup, branch protection, CODEOWNERS (commented by default) |
| **[docs/QUALITY_GATES.md](docs/QUALITY_GATES.md)** | Optional hardening gates (coverage, lint warnings, audit, bundle budgets) |
| **[tools/scripts/README.md](tools/scripts/README.md)** | Verification and feature generation scripts |

## Core Services

The app includes shared services for common functionality:

### ThemeService

Manages theme switching and detection (light/dark mode):

```typescript
import { ThemeService } from './shared/services/theme.service';

export class MyComponent {
  private theme = inject(ThemeService);
  
  toggleTheme() {
    this.theme.toggleTheme();
  }
  
  getCurrentTheme() {
    return this.theme.getTheme();
  }
}
```

**See:** [docs/STYLING.md](docs/STYLING.md) for comprehensive theming guide

### ResponsiveService

Provides Tailwind-aligned breakpoint detection and device/platform information:

```typescript
import { ResponsiveService } from './shared/services/responsive.service';

export class MyComponent {
  private responsive = inject(ResponsiveService);
  
  // Observable for reactive breakpoint changes
  constructor() {
    this.responsive.currentBreakpoint$.subscribe(bp => {
      console.log('Current breakpoint:', bp); // 'sm', 'md', 'lg', etc.
    });
  }
  
  // Get complete responsive state
  state$ = this.responsive.state$; // isMobile, isTablet, isDesktop, etc.
}
```

**CSS Usage:** The service applies semantic classes to `<html>` element:
```css
/* Styles only apply on md breakpoint and above */
html.bp-md .sidebar { display: block; }
html.bp-sm .sidebar { display: none; }
```

**See:** Home page component for live demo of responsive features

## Getting Started

1. **Review** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) to understand architectural rules
2. **Follow** [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for daily workflows
4. **Generate** your first feature with `pnpm gen:feature MyFeature --route my-feature`
5. **Code** with confidence – gates will catch errors at commit/push time

## Git Workflow

```bash
# Create a feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: add my feature"  # Pre-commit hook runs automatically

# Push when ready
git push origin feature/my-feature    # Pre-push hook runs all verifiers

# Create pull request
# CI validates all gates before merge
```

## Progressive QA Hardening

- **Baseline (default):** format:check, lint, typecheck, test, build, verification gates.
- **Optional local gates (commented in Husky):** strict lint (`--max-warnings=0`), prettier check, coverage, audit, outdated report.
- **Optional CI gates (commented in .github/workflows/ci.yml):** coverage run, strict lint, audit, outdated report, bundle size budget.
- **How to enable:** uncomment the gate in Husky and/or CI, then (for CI) add the check to branch protection. See [docs/QUALITY_GATES.md](docs/QUALITY_GATES.md) for stepwise guidance.

## Development Workflow Example

```bash
# Start development
pnpm dev

# In another terminal, generate a feature
pnpm gen:feature Dashboard --route dashboard

# Edit the generated feature files
# Hot reload automatically updates your browser

# Run unit tests as you develop
pnpm test:watch

# Run E2E tests to validate workflows (interactive UI mode)
pnpm e2e:ui

# When ready to commit
git add src/app/features/dashboard
git commit -m "feat: add dashboard feature"

# Pre-commit hook runs:
# ✓ Prettier formatting
# ✓ ESLint linting
# ✓ Auto-fixes applied

# When ready to push
git push origin feature/dashboard

# Pre-push hook runs:
# ✓ Unit tests
# ✓ E2E tests (headless)
# ✓ Structure verification
# ✓ Route verification
# ✓ Feature isolation verification
# ✓ Color verification
```

## Support

- **Stuck on something?** → See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)
- **Need architectural guidance?** → Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Testing questions?** → See [docs/TESTING.md](docs/TESTING.md)
- **Troubleshooting** → Use [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)

## Quick Reference

```bash
# Development
pnpm dev              # Start dev server
pnpm test:watch       # Run unit tests in watch mode
pnpm e2e:ui           # Run E2E tests in interactive UI mode

# Quality
pnpm verify           # Run all gates
pnpm format           # Format code
pnpm lint:fix         # Fix linting issues

# Features
pnpm gen:feature Dashboard --route dashboard
pnpm gen:feature Dashboard --route dashboard --register

# Commits
git commit -m "feat: add dashboard"  # Conventional Commits format
```

## Troubleshooting

**"Pre-commit hook failed"**
```bash
pnpm format           # Fix formatting
pnpm lint:fix         # Fix linting
git add . && git commit -m "fix: resolve issues"
```

**"Pre-push hook blocked my push"**
```bash
pnpm test             # Check tests
pnpm verify           # Run all verifiers
git push              # Try again
```

**"Feature generation didn't work"**
```bash
pnpm gen:feature FeatureName --route feature-name
```

## Resources

- [Angular Documentation](https://angular.io)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Angular Material Documentation](https://material.angular.io)
- [ESLint Documentation](https://eslint.org)
- [Vitest Documentation](https://vitest.dev)
- [Playwright Documentation](https://playwright.dev) – Multi-browser E2E testing

---

**Ready to develop?** Start with `pnpm dev` and read [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md)! 🚀

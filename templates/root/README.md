# Project Overview

Production-ready Angular 21 workspace with **Tailwind CSS 4.1.18** and **Angular Material 21.1.0** installed and configured by default.

## What You Get

✅ **Instant productivity** – Zero configuration needed  
✅ **Code quality** – Automatic formatting, linting, and testing  
✅ **Architectural integrity** – Enforced via git hooks and verification gates  
✅ **Feature scaffolding** – Generate features with routes, state, data access in seconds  
✅ **Comprehensive guides** – Documentation for every aspect of development

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

docs/                      # Developer documentation (8 guides)
├── GETTING_STARTED.md     # Zero-to-first-feature onboarding
├── ARCHITECTURE.md        # Non-negotiable architectural rules
├── DEVELOPMENT.md         # Daily development workflows
├── TESTING.md             # Testing patterns and guidelines
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
| `pnpm test` | Run unit tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Run tests with coverage report |

### Quality Gates

| Command | Purpose |
|---------|---------|
| `pnpm format` | Auto-format all files (Prettier) |
| `pnpm format:check` | Check formatting without changes |
| `pnpm lint` | Check code style (ESLint) |
| `pnpm lint:fix` | Auto-fix linting issues |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm verify:*` | Run specific verification gates |

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
| **Testing** | Vitest 4.0.17 (jsdom environment) |
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
- Steps match local hooks: format check, lint, typecheck, test, build, and all five verification gates
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
| **[docs/TESTING.md](docs/TESTING.md)** | Testing patterns, utilities, and coverage guidance |
| **[docs/STYLING.md](docs/STYLING.md)** | Tailwind CSS + Angular Material integration |
| **[docs/API.md](docs/API.md)** | Backend API integration patterns and examples |
| **[docs/VERIFICATION.md](docs/VERIFICATION.md)** | Verification gates: what they check and how to pass |
| **[docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** | Solutions to common problems by category |
| **[tools/scripts/README.md](tools/scripts/README.md)** | Verification and feature generation scripts |

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

## Development Workflow Example

```bash
# Start development
pnpm dev

# In another terminal, generate a feature
pnpm gen:feature Dashboard --route dashboard

# Edit the generated feature files
# Hot reload automatically updates your browser

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
pnpm test:watch       # Run tests in watch mode

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

---

**Ready to develop?** Start with `pnpm dev` and read [docs/DEVELOPMENT_GUIDE.md](docs/DEVELOPMENT_GUIDE.md)! 🚀

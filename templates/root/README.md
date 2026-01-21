# Project Name

> Industrial-strength Angular workspace with unified M3 Material Design theming for Angular Material and Tailwind CSS, plus comprehensive quality gates.

## Quick Start

```bash
# Install dependencies
pnpm install

# Generate tokens (creates M3 + Material system tokens + Tailwind theme)
pnpm tokens:build

# Start development server
pnpm start

# Run all quality gates
pnpm verify
```

## Project Structure

```
├── projects/
│   ├── core/              # Singleton services, HTTP clients, theme service
│   ├── ui/                # Shared UI components and design system wrappers
│   ├── tokens/            # M3 design tokens → CSS variables
│   ├── a11y/              # Accessibility utilities
│   └── shell/             # App shell components
├── src/app/
│   ├── features/          # Route-based vertical slices
│   │   └── <feature>/
│   │       ├── <feature>.routes.ts
│   │       ├── <feature>.page.ts
│   │       ├── <feature>.data.ts
│   │       ├── <feature>.state.ts
│   │       └── <feature>.models.ts
│   ├── core/              # App-wide singleton providers
│   ├── shared/            # Stateless utilities and components
│   ├── app.config.ts      # Application configuration
│   └── app.routes.ts      # Root route composition
└── tools/
    └── scripts/           # Verification and generation scripts
```

## Documentation

### Getting Started

- **[docs/POST_BOOTSTRAP_GUIDE.md](docs/POST_BOOTSTRAP_GUIDE.md)** - Validation checklist and troubleshooting (START HERE after bootstrap)
- **[docs/VERIFICATION_SYSTEM.md](docs/VERIFICATION_SYSTEM.md)** - How the verification system works

### Architecture & Development

- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Authoritative architectural rules and patterns
- **[docs/DEVELOPMENT_GUIDE.md](docs/DEVELOPMENT_GUIDE.md)** - Day-to-day development workflows
- **[docs/TESTING_GUIDE.md](docs/TESTING_GUIDE.md)** - Testing patterns and best practices
- **[docs/PATTERNS.md](docs/PATTERNS.md)** - Common implementation patterns (errors, forms, pagination, etc.)
- **[docs/API_GUIDE.md](docs/API_GUIDE.md)** - Backend integration (interceptors, environment, type safety)

### Design System & Theming

- **[docs/THEMING_GUIDE.md](docs/THEMING_GUIDE.md)** - Unified M3 theming for Material + Tailwind (CSS-only, no Sass)
- **[tokens/src/README.md](tokens/src/README.md)** - Token system architecture and workflow
- **[tokens/DIST_STRATEGY.md](tokens/DIST_STRATEGY.md)** - Why token outputs are committed

### AI Agent Development

- **[docs/AI_AGENT_GUIDE.md](docs/AI_AGENT_GUIDE.md)** - Quick orientation for AI-assisted development

### Tools & Scripts

- **[tools/scripts/README.md](tools/scripts/README.md)** - Verification script documentation

## Key Commands

### Development

```bash
pnpm start                 # Start dev server
pnpm build                 # Production build
pnpm test                  # Run tests (no watch)
pnpm test:watch            # Run tests in watch mode
```

### Quality Gates

```bash
pnpm format                # Format all files
pnpm format:check          # Check formatting
pnpm lint                  # Lint with max warnings = 0
pnpm lint:fix              # Auto-fix linting issues
pnpm typecheck             # TypeScript compilation check
pnpm verify                # Run all gates (CI equivalent)
```

### Feature Generation

```bash
pnpm gen:feature Dashboard --route dashboard --register
```

### Design Tokens

```bash
pnpm tokens:build          # Generate CSS from token sources
pnpm verify:theme-contract # Validate mappings against sources
pnpm verify:no-raw-colors  # Ensure no hardcoded hex values
pnpm verify:tokens         # Verify dist is in sync
```

## Git Hooks

Pre-configured hooks enforce quality at commit/push time:

- **pre-commit**: Format and lint staged files
- **commit-msg**: Validate commit message format (Conventional Commits)
- **pre-push**: Run all verifiers (structure, routes, imports, theme, typecheck)

## Technology Stack

- **Framework**: Angular 21+ (standalone components)
- **Language**: TypeScript (strict mode)
- **Package Manager**: pnpm
- **Testing**: Vitest (Angular CLI default)
- **Linting**: ESLint 9 (flat config) + Angular ESLint
- **Formatting**: Prettier with Tailwind plugin
- **Design System**: Angular Material (M3) + Tailwind CSS v4
- **State Management**: Signals + route-scoped providers
- **CI/CD**: GitHub Actions with semantic-release

## Architecture Highlights

### Route-First Vertical Slices

Features are organized by route, not by type. Each feature is a self-contained vertical slice with its own routes, components, data access, and state.

### Unified M3 Theming

Material Design 3 tokens are the single source of truth for both Angular Material and custom UI:

- **Material components** use M3 tokens via `material.system.css` (75+ `--mat-sys-*` mappings)
- **Tailwind utilities** use M3 tokens via `tailwind.theme.css`
- **No Sass compilation** required - pure CSS variable redefinition
- **Single theme change** updates both Material and custom components automatically

### Quality Gates by Default

The repository enforces quality through:

- Pre-commit formatting and linting
- Pre-push structural verification
- CI validation of all gates before merge
- Type-aware ESLint rules
- Comprehensive test coverage

### Explicit Boundaries

- HTTP calls only in `*.data.ts` files
- No cross-feature imports
- Route-scoped dependency injection
- Component isolation via ESLint rules

## Multi-Brand Support

The theme system supports multiple brands with light/dark modes:

```typescript
// Toggle theme mode
themeService.setMode('dark');

// Switch brand
themeService.setBrand('brandB');

// Follow system preference
themeService.setFollowSystem(true);
```

Theme classes are applied to `<html>`:

```html
<html class="theme-brandA theme-light"></html>
```

## Getting Help

- Check **[AI_AGENT_GUIDE.md](AI_AGENT_GUIDE.md)** for AI-assisted development patterns
- Review **[ARCHITECTURE.md](ARCHITECTURE.md)** for structural constraints
- See **[DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)** for common tasks
- Run `pnpm verify` to catch issues early

## Contributing

1. Create a feature branch from `main`
2. Follow architectural patterns in `ARCHITECTURE.md`
3. Ensure `pnpm verify` passes
4. Use conventional commit messages
5. Create a pull request

All PRs require:

- Passing CI checks
- Code review approval
- Up-to-date token outputs (if modified)

## License

[Specify License]

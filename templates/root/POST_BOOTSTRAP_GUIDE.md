# Post-Bootstrap Verification Guide

> Complete guide to validating your bootstrapped Angular workspace

## Overview

After running the bootstrap script, you have a fully configured Angular 21+ workspace. Before starting development, run the post-bootstrap verification to ensure everything is set up correctly.

## Automated Verification

### Run Complete Post-Bootstrap Check

```bash
# All-in-one verification
pnpm verify:post-bootstrap
```

This runs:

- ✅ Angular build compilation
- ✅ TypeScript type checking
- ✅ ESLint code linting
- ✅ Prettier format verification
- ✅ Unit tests
- ✅ Structure verification gates
- ✅ Git initialization
- ✅ First commit creation

### Expected Output

**Success (Green):**

```
✓ Build passed
✓ Type check passed
✓ Linting passed
✓ Format check passed
✓ Tests passed
✓ Verification gates passed
✓ Git initialized
✓ First commit created

============================================================
VERIFICATION SUMMARY
============================================================

✓ All critical checks passed!
✓ Project is ready for development!

Next steps:
  1. Start development: pnpm start
  2. Generate features: pnpm gen:feature FeatureName
  3. Check documentation: Review README.md and AI_AGENT_GUIDE.md
```

**Failure (Red):**

```
✗ Build failed (CRITICAL)

Please fix the errors above and run verification again:
  pnpm verify:post-bootstrap
```

## Individual Verification Steps

Run these separately if needed:

```bash
# 1. Build check
pnpm build

# 2. Type checking
pnpm typecheck

# 3. Linting
pnpm lint              # Check only
pnpm lint:fix          # Auto-fix issues

# 4. Format verification
pnpm format:check      # Check only
pnpm format            # Auto-format all files

# 5. Unit tests
pnpm test              # Run once
pnpm test:watch        # Watch mode for development

# 6. Structure verification gates
pnpm verify:structure
pnpm verify:app-routes
pnpm verify:feature-routes
pnpm verify:no-cross-feature-imports

# 7. All gates at once
pnpm verify
```

## Manual Verification Checklist

If the automated verification succeeds, check these manually:

### ✓ Project Structure

```bash
# Verify expected directories exist
ls -la src/core
ls -la src/shared
ls -la tokens
ls -la src/app/features
```

Expected structure:

```
projects/
├── core/                  # Singleton services (present)
├── ui/                    # Shared components (present)
├── tokens/                # Design tokens (present)
├── shell/                 # App shell (present)
└── a11y/                  # Accessibility (present)

src/app/
├── app.config.ts          # (present)
├── app.routes.ts          # (present)
└── features/              # (present, may be empty)
```

### ✓ Package.json Scripts

Verify all required npm scripts are present:

```bash
# Check all scripts
pnpm run | grep -E "start|build|test|lint|format|verify|gen:feature|tokens:build"
```

Should output:

```
start                          ng serve
build                          ng build
test                           ng test --watch=false
test:watch                     ng test
lint                           eslint . --max-warnings 0
lint:fix                       eslint . --fix
format                         prettier --write .
format:check                   prettier --check .
typecheck                      ng build --configuration development --no-progress
verify                         pnpm format:check && pnpm lint && ...
verify:post-bootstrap          node tools/scripts/post-bootstrap-verify.mjs
gen:feature                    node tools/scripts/generate-feature.mjs
tokens:build                   node tokens/src/generators/build-tokens.ts
```

### ✓ Git Setup

```bash
# Verify git is initialized
git status

# Should output something like:
# On branch main
# nothing to commit, working tree clean

# Verify first commit exists
git log --oneline | head -1
# Should output: chore: initial bootstrap commit

# Verify git config
git config user.name    # Should output: Developer
git config user.email   # Should output: dev@example.com
```

### ✓ Configuration Files

Verify all configuration files exist:

```bash
# Root configs
ls -la | grep -E "\.editorconfig|\.prettier|eslint|tsconfig|angular.json"

# Should show:
# .editorconfig
# .prettierrc.json
# eslint.config.mjs
# tsconfig.json
# angular.json

# GitHub
ls -la .github/workflows/

# Should show:
# ci.yml
# release.yml

# Git hooks
ls -la .husky/

# Should show:
# pre-commit
# commit-msg
# pre-push
```

### ✓ Dependencies Installed

```bash
# Verify pnpm-lock.yaml exists
ls -la pnpm-lock.yaml

# Verify node_modules is populated
ls node_modules | head -10
# Should list installed packages

# Verify key packages
pnpm list @angular/core
pnpm list @angular/material
pnpm list tailwindcss
pnpm list typescript
```

### ✓ Design Tokens

```bash
# Verify token files exist
ls tokens/src/source/
# Should show: tokens.light.json, tokens.dark.json

# Verify generated CSS
ls tokens/dist/
# Should show: *.css files

# Verify mappings
ls tokens/src/mappings/
# Should show: colors.ts, radii.ts, types.ts, index.ts
```

### ✓ Theme Service

```bash
# Verify theme service exists
ls projects/core/src/lib/theme/
# Should show:
# theme.service.ts
# theme.types.ts
# theme.storage.ts
```

## Troubleshooting

### Build Fails

```bash
# Clear cache and reinstall
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install

# Try building again
pnpm build
```

**Common causes:**

- Missing dependencies → `pnpm install`
- Angular version mismatch → Check `angular.json` and package.json
- TypeScript version incompatibility → Delete node_modules and reinstall

### Linting Fails

```bash
# Auto-fix linting issues
pnpm lint:fix

# Then verify
pnpm lint
```

**Common issues:**

- Unused imports → `pnpm lint:fix` auto-removes them
- Import order → ESLint plugin auto-fixes
- Line length → Auto-format with Prettier

### Type Checking Fails

```bash
# Run TypeScript compiler
pnpm typecheck

# Check specific file
ng build --configuration development --no-progress
```

**Common causes:**

- Missing type definitions → `pnpm add -D @types/node`
- Strict mode violations → Add type annotations
- Import path issues → Check `tsconfig.json` path aliases

### Tests Fail

```bash
# Run tests in watch mode for debugging
pnpm test:watch

# Run specific test file
ng test --include='src/app/features/my-feature/**/*.spec.ts'
```

**Common causes:**

- Missing test setup → Angular CLI auto-generates
- Mocked dependencies → Verify TestBed configuration
- Async operations → Use `fakeAsync` and `tick()`

### Git Commit Fails

```bash
# Check git status
git status

# Verify pre-commit hook
cat .husky/pre-commit

# Run pre-commit manually
./.husky/pre-commit

# Check lint-staged config
cat package.json | grep -A 10 "lint-staged"
```

**Common causes:**

- Formatting issues → `pnpm format`
- Linting issues → `pnpm lint:fix`
- Commit message format → Use conventional commits (feat:, fix:, etc.)

### Verification Gates Fail

```bash
# Run individual gates
pnpm verify:structure
pnpm verify:app-routes
pnpm verify:feature-routes
pnpm verify:no-cross-feature-imports

# See detailed output
pnpm verify:structure --verbose
```

**Common causes:**

- Feature structure mismatch → Follow template in docs
- Route configuration → Check route files match expected pattern
- Cross-feature imports → Move shared code to projects/core or projects/ui
- Missing files → Generate features with `pnpm gen:feature`

## Next Steps

Once verification passes:

1. **Read Documentation** (5 min)
   - [README.md](README.md) - Overview
   - [AI_AGENT_GUIDE.md](AI_AGENT_GUIDE.md) - Core patterns

2. **Generate First Feature** (10 min)

   ```bash
   pnpm gen:feature Dashboard --route dashboard --register
   ```

3. **Start Development Server** (5 min)

   ```bash
   pnpm start
   # Navigate to http://localhost:4200
   ```

4. **Review Architecture** (15 min)
   - [ARCHITECTURE.md](ARCHITECTURE.md) - Rules and patterns
   - [PATTERNS.md](PATTERNS.md) - Common implementations
   - [API_GUIDE.md](API_GUIDE.md) - Backend integration

5. **Make Your First Feature**
   - Follow [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)
   - Use [PATTERNS.md](PATTERNS.md) for code snippets
   - Run `pnpm verify` before committing

## Verification Cheat Sheet

```bash
# Quick health check (< 1 min)
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test:ci

# Full verification (3-5 min)
pnpm verify

# Post-bootstrap only (2-3 min)
pnpm verify:post-bootstrap

# Before committing
pnpm verify

# Auto-fix issues
pnpm format && pnpm lint:fix && pnpm verify
```

## CI/CD Verification

The same checks run in GitHub Actions on every push/PR:

```yaml
# See .github/workflows/ci.yml
- Format check (pnpm format:check)
- Linting (pnpm lint)
- Type checking (pnpm typecheck)
- Unit tests (pnpm test:ci)
- Verification gates (pnpm verify:structure, etc.)
```

To verify locally before pushing:

```bash
pnpm verify  # This runs the same checks as CI
```

## References

- [ARCHITECTURE.md](ARCHITECTURE.md) - Core architecture rules
- [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) - Daily development
- [PATTERNS.md](PATTERNS.md) - Common patterns
- [AI_AGENT_GUIDE.md](AI_AGENT_GUIDE.md) - AI development
- [README.md](README.md) - Project overview

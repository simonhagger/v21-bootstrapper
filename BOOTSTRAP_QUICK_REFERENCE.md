# Bootstrap Quick Reference

## One-Command Setup

```powershell
# From repo root, verify environment then bootstrap
pwsh tools/bootstrap/verify-env.ps1
pwsh tools/bootstrap/bootstrap.ps1 -Name my-app -Cli 21
pwsh tools/bootstrap/setup-git.ps1
```

## What Gets Installed

| Category | What | Purpose |
|----------|------|---------|
| **Framework** | Angular CLI v21+ | Web application framework |
| **Package Mgr** | pnpm | Fast, efficient Node package manager |
| **Linting** | ESLint v9 (flat config) | JavaScript/TypeScript linting |
|  | TypeScript ESLint | Type-aware linting rules |
|  | Angular ESLint | Angular-specific rules |
| **Formatting** | Prettier | Opinionated code formatter |
|  | prettier-plugin-tailwindcss | Tailwind class sorting |
| **Commit Hooks** | Husky | Git hook manager |
|  | lint-staged | Run linters on staged files |
|  | commitlint | Commit message validation |
| **Versioning** | Semantic-release | Automated versioning & releases |
| **Testing** | Vitest | Fast unit testing framework |
| **CI/CD** | GitHub Actions | Automated pipelines |

## Key Scripts

```bash
# Code quality
pnpm format              # Prettier format all files
pnpm lint                # ESLint with architecture rules
pnpm typecheck           # ng build (TypeScript check)
pnpm test                # Run tests

# Architectural verification (runs on pre-push)
pnpm verify              # MASTER GATE - all checks combined

# Feature generation
pnpm gen:feature Dashboard --route dashboard --register

# Release management
pnpm release             # Create version + changelog + tag
```

## Feature Template Generated

```
feature-name/
├── feature-name.routes.ts    # Route with providers
├── feature-name.page.ts      # Routed component
├── feature-name.data.ts      # HTTP boundary (only HttpClient here)
├── feature-name.state.ts     # Feature store/signals
├── feature-name.models.ts    # Interfaces & types
└── README.md                 # Feature docs
```

## Architecture Constraints (Enforced)

1. **No cross-feature imports** – Features are isolated
2. **HttpClient boundary** – Only in `*.data.ts` or `core/api`
3. **Route-scoped DI** – No `providedIn: 'root'` in features
4. **Standalone-only** – No NgModules
5. **Composition routing** – App routes use `loadChildren` only
6. **No raw colors** – All colors from token system

## Template Files Generated

```
Root configs:
  .editorconfig, .gitattributes, .prettierrc.json, 
  commitlint.config.cjs, eslint.config.mjs, .releaserc.cjs,
  ARCHITECTURE.md, .gitmessage.txt

GitHub workflows:
  .github/workflows/ci.yml        (verify on push/PR)
  .github/workflows/release.yml   (semantic-release on main)
  .github/pull_request_template.md
  .github/CODEOWNERS

Tool scripts (workspace-aware):
  tools/scripts/verify-structure.mjs
  tools/scripts/verify-app-routes.mjs
  tools/scripts/verify-feature-routes.mjs
  tools/scripts/verify-no-cross-feature-imports.mjs
  tools/scripts/verify-theme-contract.mjs
  tools/scripts/verify-no-raw-colors.mjs
  tools/scripts/verify-tokens.mjs
  tools/scripts/generate-feature.mjs
  tools/scripts/_workspace.mjs (shared helper)

Husky hooks:
  .husky/pre-commit   (lint-staged)
  .husky/commit-msg   (commitlint)
  .husky/pre-push     (all verifiers)
```

## Customization

### Change Project Name
App defaults to `web`. To rename:
1. Update ESLint rules in `eslint.config.mjs` (replace `projects/web` with your name)
2. Verifiers auto-discover from `angular.json` (no changes needed)

### Add More Verifiers
1. Create script in `tools/scripts/my-verifier.mjs`
2. Add to `package.json` scripts
3. Add to `pnpm verify` command chain
4. Add to `.husky/pre-push` if needed

### Customize Library List
In `bootstrap.ps1`, change:
```powershell
$libs = @("core","ui","tokens","a11y","shell")  # Edit this
```

## CI/CD Behavior

### On Pull Request
- Runs `pnpm verify` (all quality gates)
- Caches Node/Angular build
- Fails if any gate fails

### On Merge to Main
- Runs `pnpm verify` again (quality gates)
- Runs `pnpm release` (semantic-release)
- Automatically:
  - Determines version bump (major/minor/patch)
  - Generates CHANGELOG.md
  - Creates Git tag
  - Creates GitHub release
  - Pushes changes back to main

## Pre-Push Verification Chain

When you push, Husky runs:
```
✓ pnpm verify:structure
✓ pnpm verify:app-routes
✓ pnpm verify:feature-routes
✓ pnpm verify:no-cross-feature-imports
✓ pnpm verify:theme-contract
✓ pnpm verify:no-raw-colors
✓ pnpm verify:tokens
✓ pnpm lint
✓ pnpm typecheck
```

All must pass to push successfully.

## File Locations

| Item | Location |
|------|----------|
| Bootstrap scripts | `tools/bootstrap/` |
| Templates | `tools/bootstrap/templates/` |
| Generated scripts | `tools/scripts/` (after bootstrap) |
| Config files | Root directory (after bootstrap) |
| Workflows | `.github/workflows/` (after bootstrap) |
| Hooks | `.husky/` (after bootstrap) |

## Common Workflow

```bash
# 1. Create feature
pnpm gen:feature UserProfile --route profile --register

# 2. Implement feature (edit files)
# ... edit src/app/features/user-profile/* ...

# 3. Test locally
pnpm test:watch

# 4. Commit
git add .
git commit -m "feat(user-profile): add user profile page"
# Husky will format, lint, type-check automatically

# 5. Push
git push
# Husky pre-push will run all verifiers

# 6. Merge PR
# CI runs on PR, semantic-release runs on merge to main
# Version auto-bumps, changelog auto-generates
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot find module" in verifiers | Ensure `node_modules/.bin` is in PATH or use `pnpm exec node` |
| ESLint errors in generated files | Run `pnpm lint:fix` |
| Husky hooks not running | Run `pnpm prepare` to install git hooks |
| Want to skip a hook | Use `git commit --no-verify` (use sparingly) |
| Re-run bootstrap | Use `-Force` flag: `bootstrap.ps1 -Force` |

## Key Differences from Manual Setup

| Aspect | This Bootstrap | Manual Setup |
|--------|---|---|
| Time to prod-ready | ~5 minutes | Hours |
| Consistency | 100% identical across repos | Varies |
| Maintenance | Update templates once | Manual updates per repo |
| CI/CD | Fully configured | Manual setup |
| Quality gates | Pre-configured + enforced | If you remember to set them up |
| Feature generation | Automated with `gen:feature` | Manual folder creation |

---

**All files are in**: `E:\ANGULAR\v21\tools\bootstrap\`
**Documentation**: `BOOTSTRAP_IMPLEMENTATION.md`

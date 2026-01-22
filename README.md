# Angular Bootstrap System

A **one-command production-ready Angular workspace bootstrapper** that generates fully-configured applications with comprehensive development infrastructure, code quality gates, and architectural enforcement.

## ✨ What It Does

```powershell
pwsh bootstrap.ps1 -Name my-app -TargetPath "C:\workspace"
```

Creates a complete Angular 21 application with:

- ✅ **Tailwind CSS 4.1.18** – Utility-first styling
- ✅ **Angular Material 21.1.0** – Component library
- ✅ **Prettier 3.8.1** – Code formatting
- ✅ **ESLint 9.39.2** – Linting with TypeScript strict mode
- ✅ **Husky 9.1.7** – Git hooks (pre-commit, commit-msg, pre-push)
- ✅ **Vitest 4.0.17** – Unit testing with jsdom
- ✅ **Verification gates** – Structural, routing, import, and color validation
- ✅ **Feature generator** – Scaffold new features with routes
- ✅ **Developer documentation** – Architecture, patterns, testing guides

**Time**: ~2-3 minutes | **Consistency**: 100% | **Quality**: Guaranteed

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ with `node` command available
- pnpm installed globally (`npm install -g pnpm`)
- PowerShell 5+ (Windows) or pwsh (cross-platform)

### Create an App

```powershell
# From the bootstrap directory, run:
pwsh bootstrap.ps1 -Name my-app -TargetPath "C:\workspace"

# Or from elsewhere, reference the bootstrap.ps1 with a path:
pwsh ./path/to/bootstrap.ps1 -Name my-app -TargetPath "C:\workspace"

# Start development
cd C:\workspace\my-app
pnpm dev
```

**Safe to use against existing directories**: You can run bootstrap multiple times in the same parent directory. Each app gets its own folder. Use `-Force` only if you want to regenerate an existing app.

### Generate a Feature

```powershell
cd my-app
pnpm gen:feature Dashboard --route dashboard
```

---

## 📦 What's Included

### Development Tools

| Tool             | Version | Purpose               |
| ---------------- | ------- | --------------------- |
| Angular CLI      | 21      | Framework scaffolding |
| Tailwind CSS     | 4.1.18  | Styling               |
| Angular Material | 21.1.0  | Components            |
| Prettier         | 3.8.1   | Formatting            |
| ESLint           | 9.39.2  | Linting               |
| TypeScript       | Latest  | Type safety           |
| Husky            | 9.1.7   | Git hooks             |
| commitlint       | 20.3.1  | Conventional commits  |
| Vitest           | 4.0.17  | Testing               |
| GitHub Actions   | n/a     | Server-side CI (mirrors local gates) |

### Code Quality

**Pre-commit hook** (automatic):

- Auto-format with Prettier
- Auto-fix ESLint violations
- Re-format after linting

**Pre-push hook** (automatic):

- Run all tests
- Verify project structure
- Validate app routes
- Validate feature routes
- Check for cross-feature imports
- Check for raw colors

**Manual commands** (on-demand):

```bash
pnpm format           # Auto-format code
pnpm lint             # Check linting
pnpm lint:fix         # Auto-fix linting
pnpm test             # Run tests
pnpm build            # Build for production
pnpm verify:*         # Run all verification gates
pnpm gen:feature      # Generate new feature
```

### Architectural Validation

Generated apps include these **verification gates**:

1. **Structure** – Validates feature folder layout
2. **App routes** – Ensures `export const routes` convention
3. **Feature routes** – Validates route providers and loaders
4. **Cross-feature imports** – Prevents feature isolation violations
5. **Raw colors** – Detects hardcoded colors
6. **GitHub Actions** – CI workflow runs the same checks on push/PR (format, lint, typecheck, test, build, all gates)

## 🛰️ CI/CD & Git Setup

### Configure Git Remote (new scaffold)

The bootstrap script automatically initializes git and creates the first commit, so your working tree is clean.

1. **Create a new repository** on GitHub and note the URL (`https://github.com/<org>/<repo>.git`)
2. **Add the remote** and push:

```powershell
# From the generated app directory
git remote add origin https://github.com/<org>/<repo>.git
git push -u origin main
```

**If you made local changes** before pushing:

```powershell
git add .
git commit -m "your commit message"
git push -u origin main
```

### Enable GitHub Actions (server-side checks)

- The scaffold ships with [.github/workflows/ci.yml](.github/workflows/ci.yml) which mirrors local Husky hooks:
    - format:check, lint, typecheck, test, build
    - verification gates: structure, app-routes, feature-routes, no-cross-feature-imports, no-raw-colors
- CI runs on push/PR to `main` and `develop` and uploads build artifacts.

### Branch Protection (recommended)

Configure in GitHub Settings → Branches:
- Require pull request before merge (1–2 approvals)
- Require status check: `Validate Code Quality` (from ci.yml)
- Require conversation resolution; block force-push/deletion

### CODEOWNERS (optional, off by default)

- The scaffold ships `.github/CODEOWNERS` fully commented as examples. Uncomment and replace with real handles when ready.
- Enable “Require review from Code Owners” in branch protection after you set real owners.

### PR Template

- `.github/pull_request_template.md` guides submitters on testing, architecture compliance, performance, and deployment notes.

### Progressive QA (opt-in)

- Baseline (on by default): format:check, lint, typecheck, test, build, verification gates (structure, routes, imports, colors).
- Optional Husky gates (commented): strict lint (`--max-warnings=0`), prettier check, coverage, audit, outdated report.
- Optional CI gates (commented in `.github/workflows/ci.yml`): coverage, strict lint, audit, outdated report, bundle size budget.
- Enable by uncommenting the steps (local and/or CI) and, for CI, marking the check as required in branch protection.
- Docs: [templates/root/docs/GITHUB_ACTIONS.md](templates/root/docs/GITHUB_ACTIONS.md), [templates/root/docs/QUALITY_GATES.md](templates/root/docs/QUALITY_GATES.md)

All gates run automatically on:

- Every commit (pre-commit hook)
- Before push (pre-push hook)
- Manual `pnpm verify:*` commands
- Post-bootstrap verification

---

## 📂 Generated App Structure

```
my-app/
├── src/
│   ├── app/
│   │   ├── app.ts                 # Main component
│   │   ├── app.routes.ts          # Route composition
│   │   ├── app.config.ts          # App configuration
│   │   ├── features/              # Feature modules
│   │   │   └── home/              # Example feature
│   │   │       ├── home.routes.ts
│   │   │       ├── home.page.ts
│   │   │       └── ...
│   │   └── shared/                # Shared components/services
│   │       ├── layout/
│   │       └── pages/
│   ├── index.html
│   ├── main.ts
│   ├── styles.scss
│   └── test.ts
├── tools/
│   └── scripts/                   # Verification + generation
│       ├── verify-structure.mjs
│       ├── verify-app-routes.mjs
│       ├── verify-feature-routes.mjs
│       ├── verify-no-cross-feature-imports.mjs
│       ├── verify-no-raw-colors.mjs
│       ├── generate-feature.mjs
│       └── _workspace.mjs
├── .husky/                        # Git hooks
│   ├── pre-commit
│   ├── commit-msg
│   └── pre-push
├── .vscode/                       # VS Code settings
├── angular.json
├── package.json
├── tsconfig.json
├── eslint.config.mjs
├── .prettierrc.json
├── vitest.config.ts
└── docs/
    ├── README.md                  # Project overview
    ├── DEVELOPMENT_GUIDE.md       # Daily workflows
    ├── ARCHITECTURE.md            # Architecture docs
    ├── PATTERNS.md                # Common patterns
    ├── TESTING_GUIDE.md           # Testing documentation
    ├── THEMING_GUIDE.md           # Theming documentation
    ├── API_GUIDE.md               # Backend integration
    ├── AI_AGENT_GUIDE.md          # For AI-assisted development
    └── VERIFICATION_SYSTEM.md     # Verification gates reference
```

---

## 📖 Documentation

Each generated app includes comprehensive documentation:

- **README.md** – Project overview and getting started
- **DEVELOPMENT_GUIDE.md** – Daily development workflows
- **ARCHITECTURE.md** – System architecture and structure
- **PATTERNS.md** – Common development patterns
- **TESTING_GUIDE.md** – Testing approach and examples
- **THEMING_GUIDE.md** – Theming with Tailwind + Material
- **API_GUIDE.md** – Backend API integration
- **AI_AGENT_GUIDE.md** – Prompts for AI-assisted development
- **VERIFICATION_SYSTEM.md** – Verification gates and validation rules

---

## 🔧 Bootstrap Parameters

```powershell
pwsh bootstrap.ps1 [options]
```

| Parameter     | Default                     | Description                              |
| ------------- | --------------------------- | ---------------------------------------- |
| `-Name`       | `"acme-web"`                | App name (used as folder name)           |
| `-Cli`        | `21`                        | Angular CLI major version                |
| `-TargetPath` | `"E:\ANGULAR\bootstrapped"` | Parent directory for app                 |
| `-Force`      | `$false`                    | Overwrite if app folder already exists   |

**Important**: `-Force` only deletes the specific app folder (TargetPath/Name), not the entire TargetPath directory. This prevents accidental data loss when bootstrapping multiple apps in the same parent directory.

### Examples

```powershell
# Create app in current directory (creates ./my-app)
pwsh bootstrap.ps1 -Name my-app -TargetPath $PWD

# Create in existing projects folder (creates C:\projects\my-app)
pwsh bootstrap.ps1 -Name my-app -TargetPath "C:\projects"

# Regenerate existing app (use -Force only for this)
pwsh bootstrap.ps1 -Name my-app -TargetPath "C:\projects" -Force

# Use specific Angular version
pwsh bootstrap.ps1 -Name my-app -Cli 18 -TargetPath "C:\projects"

# Running from a different directory? Use a relative or absolute path to bootstrap.ps1:
pwsh ../bootstrap.ps1 -Name my-app -TargetPath "C:\projects"
```

**Note**: TargetPath is the **parent directory** where the app folder will be created. The app is created at `TargetPath\Name`. If TargetPath ends with the app name, it's automatically normalized to prevent redundant nesting (e.g., `dashboard/dashboard`).

---

## 📋 Development Workflow

### 1. Create Feature

```bash
pnpm gen:feature Dashboard --route dashboard
```

Generates:

- Route definition with lazy loading
- Page component with styling
- Data service and state management
- Type definitions
- Unit test example
- README

### 2. Develop

```bash
pnpm dev              # Start dev server (http://localhost:4200)
pnpm test             # Watch mode testing
pnpm lint:fix         # Auto-fix issues
```

Hooks auto-format on save.

### 3. Commit

```bash
git add .
git commit -m "feat: add dashboard"
```

**Pre-commit hook runs**:

- ✓ Format code
- ✓ Fix linting
- ✓ Re-format

### 4. Push

```bash
git push origin my-feature
```

**Pre-push hook runs**:

- ✓ All tests pass
- ✓ Structure verified
- ✓ Routes validated
- ✓ Features isolated
- ✓ No raw colors

If any check fails, push is blocked. Fix and retry.

---

## 🛠️ Troubleshooting

### "Bootstrap didn't create an app"

Check that you have:

- ✓ `node` available: `node --version`
- ✓ `pnpm` available: `pnpm --version`
- ✓ PowerShell 5+: `$PSVersionTable.PSVersion`
- ✓ Write access to target directory
- ✓ ~2GB free disk space

### "Pre-commit hook failed"

Common causes:

```bash
# File formatting issues
pnpm format

# ESLint violations
pnpm lint:fix

# Then commit again
git add . && git commit -m "fix: resolve linting"
```

### "Pre-push hook blocked my push"

Hook is preventing broken code. Fix issues:

```bash
# Run tests
pnpm test

# Run all verifiers
pnpm verify:structure
pnpm verify:app-routes
pnpm verify:feature-routes
pnpm verify:no-cross-feature-imports
pnpm verify:no-raw-colors

# Then push again
git push
```

### "Can't run pnpm commands"

Ensure pnpm is installed globally:

```bash
npm install -g pnpm
pnpm --version
```

Then regenerate node_modules:

```bash
rm -r node_modules pnpm-lock.yaml
pnpm install
```

---

## 📊 Bootstrap Process

The script runs these steps automatically:

1. **Scaffold** – `ng new` with Angular CLI defaults
2. **Add Tailwind** – `ng add tailwindcss` with skip confirmation
3. **Add Material** – `ng add @angular/material` with custom theme
4. **Apply templates** – Copy architecture, configs, and examples
5. **Install tools** – Prettier, ESLint, commitlint
6. **Initialize git** – Git init + config (`core.eol=lf`, `core.safecrlf=false`)
7. **Setup hooks** – Husky initialization with three hooks
8. **Normalize line endings** – Enforce LF across all files
9. **Install Vitest** – Testing framework + configuration
10. **Add npm scripts** – 15+ scripts for common tasks
11. **Post-bootstrap verification** – Run 9 checks to validate everything
12. **First commit** – Initial repo state committed

**Result**: Production-ready app in your directory, ready to `pnpm dev`

---

## ✅ Quality Assurance

Every generated app passes:

- ✓ ESLint validation (zero violations)
- ✓ Prettier formatting (100% compliant)
- ✓ TypeScript type checking (strict mode)
- ✓ Unit tests (2+ tests included)
- ✓ Build compilation
- ✓ Structure verification
- ✓ Architecture validation
- ✓ Feature isolation checks
- ✓ Color validation

Post-bootstrap verification runs all checks and confirms "ready for development" before completion.

---

## 🚫 What Gets Reset

When using `-Force` to overwrite an existing app:

- **Only the existing app folder at TargetPath/Name is deleted**
- Other files and folders in TargetPath are **not affected**
- Git history within that folder is removed
- Fresh app is created from scratch at that location

Use `-Force` only when you want to regenerate the specific app, not to clear the entire parent directory.

---

## 💡 Tips

### Multiple Projects

Bootstrap creates independent apps. Each has its own:

- `node_modules`
- `.git` repository
- Configuration
- Hooks

Multiple projects don't interfere.

### Shared Templates

Edit `templates/` folder in bootstrap directory to customize:

- Code style preferences
- Material theme colors
- Default feature layout
- Documentation content

Run bootstrap again with `-Force` to regenerate.

### Skip Installation

Bootstrap automatically installs, but you can skip pnpm install:

```powershell
# Create app structure only
ng new app-name --skip-install
```

Then bootstrap separately.

---

## 📞 Support

Each generated app includes documentation:

```bash
cd my-app
cat README.md                  # Project overview
cat DEVELOPMENT_GUIDE.md       # How to develop
cat docs/ARCHITECTURE.md       # System design
cat docs/VERIFICATION_SYSTEM.md # Verification gates
```

For bootstrap issues, check:

- `bootstrap.ps1` comments
- Verify all prerequisites installed
- Check Windows/Unix line endings
- Ensure ample disk space

---

## 🎊 Ready to Bootstrap?

```powershell
pwsh bootstrap.ps1 -Name my-app -TargetPath "C:\my-projects" -Force
cd my-app
pnpm dev
```

Your production-ready Angular 21 app is ready! 🚀

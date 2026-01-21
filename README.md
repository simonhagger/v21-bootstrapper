# Angular Bootstrap System

A **one-command production-ready Angular workspace bootstrapper** that generates fully-configured applications with comprehensive development infrastructure, code quality gates, and architectural enforcement.

## ✨ What It Does

```powershell
pwsh bootstrap.ps1 -Name my-app -TargetPath "C:\workspace" -Force
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
# Navigate to desired parent directory
cd C:\workspace

# Run bootstrap
pwsh E:\ANGULAR\v21\tools\bootstrap\bootstrap.ps1 -Name my-app -Force

# Start development
cd my-app
pnpm dev
```

### Generate a Feature

```powershell
cd my-app
pnpm gen:feature Dashboard --route dashboard
```

---

## 📦 What's Included

### Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| Angular CLI | 21 | Framework scaffolding |
| Tailwind CSS | 4.1.18 | Styling |
| Angular Material | 21.1.0 | Components |
| Prettier | 3.8.1 | Formatting |
| ESLint | 9.39.2 | Linting |
| TypeScript | Latest | Type safety |
| Husky | 9.1.7 | Git hooks |
| commitlint | 20.3.1 | Conventional commits |
| Vitest | 4.0.17 | Testing |

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

| Parameter | Default | Description |
|-----------|---------|-------------|
| `-Name` | `"acme-web"` | App name (used as folder name) |
| `-Cli` | `21` | Angular CLI major version |
| `-TargetPath` | `"E:\ANGULAR\bootstrapped"` | Parent directory for app |
| `-Force` | `$false` | Overwrite if target exists |

### Examples

```powershell
# Create app in current directory
pwsh bootstrap.ps1 -Name my-app -TargetPath $PWD -Force

# Use specific Angular version
pwsh bootstrap.ps1 -Name my-app -Cli 18

# Create with full paths
pwsh bootstrap.ps1 -Name dashboard -TargetPath "C:\projects\dashboard" -Force
```

**Note**: If TargetPath ends with the app name, it's automatically detected and normalized to prevent redundant nesting (e.g., `dashboard/dashboard`).

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

When using `-Force` to overwrite an existing target:

- All files in TargetPath are deleted
- All git history is removed
- Fresh app is created from scratch

Use `-Force` with caution on existing projects!

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

# Bootstrap Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ONE-SHOT BOOTSTRAP SYSTEM                            │
│                  (Industrial Strength Angular Setup)                     │
└─────────────────────────────────────────────────────────────────────────┘

                              ENTRY POINTS
                                  │
                ┌─────────────────┼─────────────────┐
                │                 │                 │
        ┌───────▼────────┐ ┌──────▼──────┐ ┌──────▼──────┐
        │  verify-env.ps1│ │bootstrap.ps1│ │setup-git.ps1│
        │  (preflight)   │ │ (main flow) │ │ (git config)│
        └────────────────┘ └──────┬──────┘ └─────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │ Bootstrap Orchestration   │
                    │ (Runs 7 stages)          │
                    └─────────────┬─────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
   ┌────▼─────┐     ┌────────────▼────────────┐     ┌─────▼────────┐
   │ Stage 1  │     │      Stage 2-3          │     │ Stage 4-7    │
   │ Git Init │     │  Create Angular CLI     │     │ Install deps │
   │ Angular  │     │  Generate Libraries     │     │ Deploy files │
   │ Setup    │     │  (core, ui, tokens...)  │     │ Setup hooks  │
   └──────────┘     └────────────┬────────────┘     │ Run gates    │
                                  │                 └──────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │   write-files.ps1         │
                    │  (Copy-based deployer)    │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │    TEMPLATES COPIED       │
                    └─────────────┬─────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
    ┌───▼───────────┐     ┌──────▼──────┐     ┌──────────▼─┐
    │  Root Configs │     │ GitHub CI   │     │ Tool Scripts
    │  (9 files)    │     │ (5 files)   │     │ (9 scripts)
    │               │     │             │     │
    │ • editorconfig│     │ • ci.yml    │     │ • _workspace.mjs
    │ • prettier    │     │ • release   │     │ • verify-structure
    │ • eslint      │     │ • PR template     │ • verify-routes
    │ • commitlint  │     │ • CODEOWNERS      │ • verify-features
    │ • semantic-   │     │             │     │ • verify-imports
    │   release     │     │             │     │ • verify-themes
    │ • gitattributes     │             │     │ • generate-feature
    │ • git message │     │             │     │ • templates...
    │ • ARCHITECTURE     │             │     │
    └───────────────┘     └─────────────┘     └────────────┘
```

## Development Workflow

```
┌──────────────────────────────────────────────────────────────┐
│           Development Workflow with Bootstrap                │
└──────────────────────────────────────────────────────────────┘

   Developer                     Git Hooks                 CI/CD
      │                              │                      │
      │  $ pnpm gen:feature         │                      │
      │  Dashboard --route ...       │                      │
      ├──────────────────────────────────────────────────────┤
      │                              │                      │
      │  Edit feature code           │                      │
      │  (10+ files created)         │                      │
      ├──────────────────────────────────────────────────────┤
      │                              │                      │
      │  $ git add .                 │                      │
      │  $ git commit                │                      │
      ├──────────────► pre-commit hook runs                 │
      │                ✓ prettier format                     │
      │                ✓ lint-staged                         │
      │                └─ Auto-fixes code                    │
      │                              │                      │
      │  (Commit created)            │                      │
      ├──────────────────────────────────────────────────────┤
      │                              │                      │
      │  $ git push                  │                      │
      │  origin feature-branch       │                      │
      ├──────────────► pre-push hook runs                    │
      │                ✓ verify:structure                    │
      │                ✓ verify:app-routes                   │
      │                ✓ verify:feature-routes               │
      │                ✓ verify:no-cross-imports             │
      │                ✓ verify:theme-contract               │
      │                ✓ verify:no-raw-colors                │
      │                ✓ verify:tokens                       │
      │                ✓ lint (ESLint)                       │
      │                ✓ typecheck (ng build)                │
      │                └─ All gates pass or push blocked     │
      │                              │                      │
      │  Push succeeds               │                      │
      │                              │                      ├─► GitHub Actions
      │                              │                          │
      │                              │                          ├─ Install deps
      │  Create Pull Request         │                          ├─ Cache build
      │  (Architectural checklist)   │                          ├─ Run verify
      │                              │                          ├─ Report status
      │                              │                          │
      │                              │                          └─ Poll for merge
      │                              │
      │  Review & Merge to main      │                      ├─► semantic-release
      │                              │                          │
      │                              │                          ├─ Analyze commits
      │                              │                          ├─ Bump version
      │                              │                          ├─ Generate changelog
      │                              │                          ├─ Create tag
      │                              │                          ├─ Create release
      │                              │                          ├─ Push to main
      │                              │                          │
      │                              │                          └─ ✓ Release complete
      │                              │                      │
      └──────────────────────────────────────────────────────┘

   Result: Code is verified at every stage, releases are automated
```

## Verifier Chain (Pre-Push)

```
┌─────────────────────────────────────────────────────────────┐
│         Husky Pre-Push Verification Chain                   │
│            (Must all pass to push)                          │
└─────────────────────────────────────────────────────────────┘

   START ($ git push)
      │
      ├─► pnpm verify:structure
      │   │ Checks: Feature folders have required files
      │   │ Files: routes, page, data, state, models
      │   │ Validates: No static page imports in app.routes
      │   └─ ✓ PASS or ✗ FAIL
      │
      ├─► pnpm verify:app-routes
      │   │ Checks: app.routes.ts is properly composed
      │   │ Validates: Uses loadChildren (no component imports)
      │   │ Ensures: Exactly 1 wildcard route for not-found
      │   └─ ✓ PASS or ✗ FAIL
      │
      ├─► pnpm verify:feature-routes
      │   │ Checks: Each feature exports Routes array
      │   │ Validates: First route has providers: [...]
      │   │ Ensures: loadComponent points to *.page
      │   └─ ✓ PASS or ✗ FAIL
      │
      ├─► pnpm verify:no-cross-feature-imports
      │   │ Checks: No feature imports from other features
      │   │ Uses: Relative path analysis + AST parsing
      │   │ Enforces: Vertical slices with no cross-coupling
      │   └─ ✓ PASS or ✗ FAIL
      │
      ├─► pnpm verify:theme-contract
      │   │ Checks: Theme tokens are properly defined
      │   │ Validates: Color system compliance
      │   └─ ✓ PASS or ✗ FAIL (placeholder)
      │
      ├─► pnpm verify:no-raw-colors
      │   │ Checks: No hardcoded colors in code
      │   │ Validates: All colors come from tokens
      │   └─ ✓ PASS or ✗ FAIL (placeholder)
      │
      ├─► pnpm verify:tokens
      │   │ Checks: Design tokens are generated correctly
      │   │ Validates: Token distribution
      │   └─ ✓ PASS or ✗ FAIL (placeholder)
      │
      ├─► pnpm lint
      │   │ Checks: ESLint rules (import boundaries, no-any, etc.)
      │   │ Enforces: TypeScript strict type checking
      │   │ Reports: All issues must be fixed (--max-warnings 0)
      │   └─ ✓ PASS or ✗ FAIL
      │
      ├─► pnpm typecheck
      │   │ Checks: TypeScript compilation (ng build dev)
      │   │ Validates: All type errors resolved
      │   └─ ✓ PASS or ✗ FAIL
      │
      ├─ All gates passed?
      │  │
      │  ├─ YES ──────────────────► PUSH ALLOWED
      │  │                          │
      │  │                          └─► PR created
      │  │                              │
      │  │                              └─► CI runs on PR
      │  │
      │  └─ NO ───────────────────► PUSH BLOCKED
      │                              │
      │                              └─ Developer must fix & retry
      │
      └─ END
```

## Feature Generation Flow

```
┌─────────────────────────────────────────────────────────────┐
│         pnpm gen:feature <Name> --register                  │
│            (Generates complete feature scaffold)            │
└─────────────────────────────────────────────────────────────┘

   INPUT:
   $ pnpm gen:feature UserProfile --route profile --register
                          │                │              │
                          │                │              └─ Auto-register route
                          │                └─ Route path
                          └─ Feature name
      │
      ├─ Parse arguments
      │  ├─ Name: UserProfile
      │  ├─ Route: profile
      │  └─ Register: true
      │
      ├─ Workspace discovery (_workspace.mjs)
      │  ├─ Find angular.json
      │  ├─ Read app project config
      │  └─ Resolve: /src/app/features
      │
      ├─ Name transformation
      │  ├─ UserProfile → kebab-case → user-profile
      │  ├─ user-profile → PascalCase → UserProfile
      │  └─ user-profile → CONST_CASE → USER_PROFILE
      │
      ├─ Create folder: src/app/features/user-profile/
      │
      ├─ Generate files:
      │  ├─ user-profile.routes.ts
      │  │  └─ export const USER_PROFILE_ROUTES: Routes = [
      │  │        { path: '', providers: [...], loadComponent: ... }
      │  │     ]
      │  │
      │  ├─ user-profile.page.ts
      │  │  └─ @Component({ standalone: true, imports: [...] })
      │  │     export class UserProfilePage { ... }
      │  │
      │  ├─ user-profile.data.ts
      │  │  └─ @Injectable()
      │  │     export class UserProfileData {
      │  │       constructor(private http: HttpClient) { ... }
      │  │     }
      │  │
      │  ├─ user-profile.state.ts
      │  │  └─ @Injectable()
      │  │     export class UserProfileStore { ... }
      │  │
      │  ├─ user-profile.models.ts
      │  │  └─ export interface UserProfile { ... }
      │  │
      │  └─ README.md
      │     └─ Feature documentation
      │
      ├─ Register route (--register flag)
      │  └─ Modify src/app/app.routes.ts
      │     └─ Add route entry before wildcard:
      │        {
      │          path: 'profile',
      │          loadChildren: () => import('./features/user-profile/...').then(...)
      │        }
      │
      └─ OUTPUT:
         ✓ Feature created: user-profile
         ✓ Route registered: /profile in app.routes.ts
         ✓ Ready to implement logic
         └─ Next: $ pnpm verify (gate check)
```

## CI/CD Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│              GitHub Actions CI/CD Pipeline                  │
└─────────────────────────────────────────────────────────────┘

   ON PUSH TO FEATURE BRANCH / PULL REQUEST:
   │
   ├─ Trigger: CI workflow (ci.yml)
   │  │
   │  ├─ Setup:
   │  │  ├─ Checkout code
   │  │  ├─ Setup Node from .nvmrc
   │  │  ├─ Cache node_modules (pnpm)
   │  │  └─ Cache .angular/ build cache
   │  │
   │  └─ Run verification:
   │     └─ $ pnpm verify
   │        (All quality gates in parallel/sequential)
   │
   └─ Report status to GitHub
      ├─ ✓ All checks pass → Merge allowed
      └─ ✗ Any check fails → Merge blocked


   ON MERGE TO MAIN:
   │
   ├─ Trigger: Release workflow (release.yml)
   │  │
   │  ├─ Checkout with full history (for semantic analysis)
   │  │
   │  ├─ Setup & install (same as CI)
   │  │
   │  ├─ Run verification: $ pnpm verify
   │  │  (Quality gates must pass before release)
   │  │
   │  ├─ Run release: $ pnpm release
   │  │  │
   │  │  ├─ Analyze commits since last tag
   │  │  │  └─ BREAKING CHANGE → major bump
   │  │  │  └─ feat: → minor bump
   │  │  │  └─ fix: → patch bump
   │  │  │
   │  │  ├─ Generate CHANGELOG.md
   │  │  │
   │  │  ├─ Create git tag
   │  │  │
   │  │  ├─ Create GitHub release
   │  │  │
   │  │  └─ Push updated main branch
   │  │
   │  └─ ✓ Release complete
   │     └─ Package published with new version
   │
   └─ GitHub Release created
      ├─ Version number
      ├─ Release notes
      └─ Download artifacts
```

---

**All systems fully integrated and automated.**

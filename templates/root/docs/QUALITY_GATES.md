# Quality Gates Roadmap (Opt-in)

These gates are optional and **disabled by default**. Enable them gradually as your team is ready.

## Baseline (already enabled)
- Format: `pnpm format:check`
- Lint: `pnpm lint`
- Type check: `pnpm typecheck`
- Tests: `pnpm test`
- Build: `pnpm build`
- Verification gates: structure, app-routes, feature-routes, no-cross-feature-imports, no-raw-colors

## Step 1: Strengthen linting
- Enforce zero warnings: `pnpm lint --max-warnings=0`
- How to enable in CI: uncomment the lint step in `.github/workflows/ci.yml`.

## Step 2: Test coverage
- Raise coverage thresholds in `vitest.config.ts` (e.g., 80%+).
- Add CI step: `pnpm test:coverage` (commented in `.github/workflows/ci.yml`).
- Block merges if coverage fails.

## Step 3: Dependency health
- Add `pnpm audit --prod` (commented in CI) for vulnerability checks.
- Add `pnpm outdated` (commented in CI) to report stale packages (non-blocking).
- Consider Renovate/Dependabot for automated updates.

## Step 4: Bundle/performance budgets
- Add size-limit or Lighthouse CI (commented example in CI).
- Set budgets for main bundle (e.g., <500KB transfer). Fail CI on regression.

## Step 5: Release quality
- Keep Conventional Commits (already enforced).
- Add changelog/semantic-release gates if desired.
- Require PR approvals + status checks in branch protection.

## How to turn on a gate
1) Uncomment the relevant step in `.github/workflows/ci.yml`.
2) If needed, adjust project config (coverage thresholds, budgets).
3) Enable/require the check in branch protection (GitHub Settings → Branches).

## Notes
- CODEOWNERS ships commented; enable when you have real owners.
- Server-side CI cannot be bypassed; local Husky hooks can (via `--no-verify`).
- Introduce gates incrementally to avoid blocking critical releases.

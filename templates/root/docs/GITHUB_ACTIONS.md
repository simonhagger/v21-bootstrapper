# GitHub Actions CI/CD

This project includes automated CI/CD pipelines using GitHub Actions that mirror and enforce the local development quality gates.

## Workflows

### CI Workflow (`.github/workflows/ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests targeting `main` or `develop`

**Steps:**
1. **Code Formatting** - Validates Prettier compliance (`pnpm format:check`)
2. **Linting** - Runs ESLint validation (`pnpm lint`)
3. **Type Checking** - Validates TypeScript types (`pnpm typecheck`)
4. **Unit Tests** - Runs all unit tests (`pnpm test`)
5. **Build** - Compiles production build (`pnpm build`)
6. **Architecture Gates** - Runs all verification scripts:
   - Structure validation
   - App routes validation
   - Feature routes validation  
   - Cross-feature import detection
   - Raw color detection
7. **Artifact Upload** - Saves build output for review

**Optional (commented out by default):**
- Coverage run: `pnpm test:coverage`
- Lint strict: `pnpm lint --max-warnings=0`
- Dependency audit: `pnpm audit --prod`
- Outdated report: `pnpm outdated`
- Bundle budget example: `size-limit` action

**Cache Strategy:**
- pnpm store is cached per lock file hash
- Significantly reduces installation time on subsequent runs

## Branch Protection

To enforce these checks, configure branch protection rules in GitHub:

### Main Branch Protection

**Settings → Branches → Add rule**

1. **Branch name pattern**: `main`
2. **Require pull request before merging**: ✅
   - Required approvals: 1-2
3. **Require status checks to pass**: ✅
   - Required checks:
     - `Validate Code Quality`
4. **Require conversation resolution**: ✅
5. **Do not allow bypassing**: ✅
6. **Restrict who can push**: ✅ (CI/CD only)

### Develop Branch Protection

Similar to main, but may allow:
- Direct pushes from maintainers
- Auto-merge for dependabot PRs

## Code Owners (`.github/CODEOWNERS`)

Defines who must review changes to specific paths:

```
/src/app/shared/     @platform-team
/.github/workflows/  @devops-team
/tools/scripts/      @platform-team
```

**Setup:**
1. Update team handles in `.github/CODEOWNERS`
2. Enable "Require review from Code Owners" in branch protection
3. Team members must be GitHub organization members

## Pull Request Template

All PRs use the template in `.github/pull_request_template.md` which includes:

- Change description
- Type of change checkboxes
- Testing checklist
- Architecture compliance verification
- Performance impact assessment
- Deployment notes

## Local vs Server-Side Validation

| Check | Local (Husky) | Server (GitHub Actions) | Bypass-able? |
|-------|---------------|-------------------------|--------------|
| Format | pre-commit | CI workflow | Local: Yes (--no-verify) |
| Lint | pre-commit | CI workflow | Local: Yes (--no-verify) |
| Tests | pre-push | CI workflow | Local: Yes (--no-verify) |
| Build | ❌ | CI workflow | N/A |
| Verification Gates | pre-push | CI workflow | Local: Yes (--no-verify) |
| Code Review | ❌ | Branch protection | Server: No |

**Key Point**: Server-side checks cannot be bypassed, making them essential for team environments.

## Troubleshooting

### CI Failing But Local Passes

**Common causes:**
1. **Cache issue** - Clear GitHub Actions cache
2. **Lock file mismatch** - Commit updated `pnpm-lock.yaml`
3. **Environment differences** - Check Node.js version alignment

**Solutions:**
```bash
# Regenerate lock file
rm pnpm-lock.yaml
pnpm install
git add pnpm-lock.yaml
git commit -m "chore: update lock file"
```

### Slow CI Runs

**Optimization tips:**
1. **Use cache** - Already configured for pnpm
2. **Parallel jobs** - Split testing into separate job if needed
3. **Skip redundant steps** - Use `paths` filters for specific files

### Required Checks Not Appearing

1. Go to **Settings → Branches**
2. Edit branch protection rule
3. Click "Require status checks to pass before merging"
4. Search for `Validate Code Quality`
5. Check must have run at least once to appear in list

## Extending Workflows

### Add Code Coverage Reporting

```yaml
- name: Run tests with coverage
  run: pnpm test:coverage

- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v4
  with:
    files: ./coverage/coverage-final.json
```

### Enforce Zero Lint Warnings

```yaml
- name: Lint (no warnings)
  run: pnpm lint --max-warnings=0
```

### Add Deployment Step

```yaml
deploy:
  needs: validate
  if: github.ref == 'refs/heads/main'
  runs-on: ubuntu-latest
  steps:
    - name: Deploy to production
      run: pnpm run deploy:prod
```

### Add Performance Budget

```yaml
- name: Check bundle size
  uses: andresz1/size-limit-action@v1
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
```

## Best Practices

1. **Keep CI fast** - Target < 5 minutes total runtime
2. **Fail fast** - Put quick checks (lint, format) first
3. **Cache aggressively** - Use caching for dependencies
4. **Run locally first** - Use `pnpm verify` before pushing
5. **Monitor failures** - Set up notifications for broken builds
6. **Update regularly** - Keep GitHub Actions versions current

## Security Considerations

1. **Use frozen lockfile** - `pnpm install --frozen-lockfile`
2. **Pin action versions** - Use SHA or major version tags
3. **Limit secrets scope** - Only expose needed secrets
4. **Review dependabot PRs** - Auto-merge with caution
5. **Audit workflow changes** - Require review for `.github/workflows/`

## Related Documentation

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)
- [Code Owners](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)

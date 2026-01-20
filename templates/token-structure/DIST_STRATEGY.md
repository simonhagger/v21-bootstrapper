# Dist Strategy (Committed)

We **commit** `projects/tokens/dist` to make the token contract reviewable in pull requests.

## Why Commit Generated Files?

1. **PR Reviewability**: Token changes are visible in diffs
2. **Contract Clarity**: Teams can see what CSS variables are available
3. **Build Validation**: CI can detect drift between source and output
4. **Zero Build Requirement**: Consumers can use tokens without running generators

## Rules

### ✅ DO

- Run `pnpm tokens:build` after changing source tokens or mappings
- Commit the updated `dist/` files in the same commit as source changes
- Review token output changes in PRs just like source code

### ❌ DON'T

- Manually edit files in `dist/` (they will be overwritten)
- Commit `dist/` changes without corresponding source/mapping changes
- Skip token generation before committing

## CI Verification

The `pnpm verify:tokens` script ensures dist is in sync:

```bash
# Regenerates tokens
node projects/tokens/src/generators/build-tokens.ts

# Fails if dist has uncommitted changes
git diff --exit-code projects/tokens/dist
```

If this fails in CI, it means:

- Source tokens or mappings changed
- `pnpm tokens:build` was not run
- The updated dist was not committed

**Fix**: Run `pnpm tokens:build` locally and commit the changes.

## Git Ignore Strategy

We **do not** ignore `dist/` in this library because it's an intentional contract artifact.

Other build outputs (like `node_modules/`, `.angular/`, coverage reports) remain gitignored.

## Multi-Brand Consideration

If supporting multiple brands:

- Each brand should have separate JSON sources
- Generator produces separate CSS outputs per brand
- All brand outputs are committed
- Review process ensures brand token parity

## File Structure

```
projects/tokens/
├─ src/
│  ├─ source/
│  │  ├─ tokens.light.json    # Source (manual or tool-generated)
│  │  └─ tokens.dark.json
│  ├─ mappings/                 # Source (hand-maintained)
│  │  ├─ colors.ts
│  │  └─ radii.ts
│  └─ generators/
│     └─ build-tokens.ts
└─ dist/                        # Output (generated, committed)
   ├─ themes.css
   ├─ m3.css
   └─ tailwind.theme.css
```

## Maintenance Workflow

1. Update source tokens (`tokens.light.json`, `tokens.dark.json`)
2. Update mappings if adding new bridge variables
3. Run `pnpm tokens:build`
4. Review generated CSS in `dist/`
5. Commit both source and dist changes together
6. CI validates dist matches source

This keeps the token contract explicit and reviewable while maintaining automation.

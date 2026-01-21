# Token Source Files

This directory contains the **single source of truth** for Material Design 3 system tokens used across all frameworks.

## Files

- `tokens.light.json` - M3 tokens for light theme
- `tokens.dark.json` - M3 tokens for dark theme

## Token Format

All tokens are flat CSS custom properties with the `--md-sys-*` prefix:

```json
{
  "--md-sys-color-primary": "#6750A4",
  "--md-sys-color-on-primary": "#FFFFFF",
  "--md-sys-color-surface": "#FEF7FF",
  "--md-sys-shape-corner-medium": "12px"
}
```

## Token Categories

### Colors (`--md-sys-color-*`)

Material Design 3 semantic color roles:

- **Primary**: Main brand color and variants (`primary`, `on-primary`, `primary-container`, `on-primary-container`)
- **Secondary**: Supporting color for less prominent elements
- **Tertiary**: Accent color for highlights and emphasis
- **Error**: Error states and destructive actions
- **Surface**: Background colors at various elevations
- **Outline**: Borders and dividers

### Shape (`--md-sys-shape-*`)

Border radius tokens (not yet fully implemented):

- `corner-none`: 0px
- `corner-extra-small`: 4px
- `corner-small`: 8px  
- `corner-medium`: 12px
- `corner-large`: 16px
- `corner-extra-large`: 28px

### Future Categories

- Typography (`--md-sys-typography-*`)
- Elevation (`--md-sys-elevation-*`)
- Motion (`--md-sys-motion-*`)

## Theme Synchronization

**Critical Rule**: Both light and dark JSON files **must have identical keys**.

Only values differ between themes:

**tokens.light.json**:
```json
{
  "--md-sys-color-primary": "#6750A4",
  "--md-sys-color-surface": "#FEF7FF"
}
```

**tokens.dark.json**:
```json
{
  "--md-sys-color-primary": "#D0BCFF",
  "--md-sys-color-surface": "#1C1B1F"
}
```

The build process validates this and will fail if keys don't match.

## Usage

These files are consumed by `generators/build-tokens.ts` to generate:

1. **themes.css** - Theme class wrappers (`.theme-light`, `.theme-dark`)
2. **m3.css** - M3 variables scoped to theme classes
3. **material.system.css** - Material Angular system token overrides
4. **tailwind.theme.css** - Tailwind `@theme` utilities via mappings

All frameworks consume the same token values, ensuring visual consistency.

## Maintenance Workflow

### Adding New Tokens

1. Add to **both** `tokens.light.json` and `tokens.dark.json` with same key
2. Use M3 naming conventions (`--md-sys-color-*`, `--md-sys-shape-*`)
3. Run `pnpm tokens:build` to regenerate outputs
4. Review generated CSS in `dist/`
5. Commit both source and dist changes together

### Changing Token Values

1. Update value in `tokens.light.json` and/or `tokens.dark.json`
2. Run `pnpm tokens:build`
3. Verify changes in generated `dist/` files
4. Test in application (color changes propagate to all frameworks)
5. Commit source + dist together

### Removing Tokens

1. Check if token is referenced in any mapping (search `mappings/*.ts`)
2. Remove from both `tokens.light.json` and `tokens.dark.json`
3. Run `pnpm tokens:build` (will fail if mappings still reference it)
4. Update/remove mappings as needed
5. Commit all changes together

## Material Design 3 Resources

- [M3 Color System](https://m3.material.io/styles/color/system/overview)
- [M3 Color Roles](https://m3.material.io/styles/color/roles)
- [Material Theme Builder](https://material-foundation.github.io/material-theme-builder/) - Generate M3 color schemes

## CI Validation

The `pnpm verify:tokens` script ensures:

- Dist files are up-to-date with source
- No uncommitted token changes
- Light and dark themes have matching keys (via build validation)

If build fails with "Missing M3 vars", it means a mapping references a token that doesn't exist in one or both theme files.

# Token Source Files

This directory contains the **source of truth** for Material Design 3 system tokens.

## Files

- `tokens.light.json` - M3 tokens for light theme
- `tokens.dark.json` - M3 tokens for dark theme

## Token Format

All tokens are flat CSS custom properties:

```json
{
  "--md-sys-color-primary": "#6750A4",
  "--md-sys-shape-corner-medium": "12px"
}
```

## Usage

These files are consumed by `projects/tokens/src/generators/build-tokens.ts` to generate:

1. `themes.css` - Scoped theme classes (`.theme-light`, `.theme-dark`)
2. `m3.css` - Material 3 variables for Angular Material components
3. `tailwind.theme.css` - Tailwind v4 `@theme` bridge using mappings

## Maintenance

- Keep tokens synchronized between light and dark (same keys, different values)
- Use Material Design 3 color roles and naming conventions
- Validate with `pnpm tokens:build` after changes

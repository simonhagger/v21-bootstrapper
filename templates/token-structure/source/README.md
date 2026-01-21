# Token Source Files

This directory contains the **single source of truth** for Material Design 3 system tokens in **Material Theme Builder format**.

## Files

- `material-theme.json` - Official Material Theme Builder export with full M3 color system

## Material Theme Builder Format

The `material-theme.json` file is exported from the official Material Theme Builder:
- **Figma Plugin**: https://www.figma.com/community/plugin/1034969338659738588/material-theme-builder
- **Web Tool**: https://material-foundation.github.io/material-theme-builder/

This format provides **complete Material Design 3 token coverage** including:
- All semantic color roles (primary, secondary, tertiary, error)
- All surface and container tokens
- All fixed and inverse tokens
- Multiple contrast levels (normal, medium, high)
- Complete color palettes for system and extended colors

## File Structure

```json
{
  "description": "Material Theme Builder export...",
  "seed": "#002038",
  "coreColors": { "primary": "#002038" },
  "extendedColors": [/* custom colors */],
  "schemes": {
    "light": { "primary": "#31628D", "onPrimary": "#FFFFFF", ... },
    "dark": { "primary": "#9DCBFB", "onPrimary": "#003354", ... },
    "light-medium-contrast": { ... },
    "light-high-contrast": { ... },
    "dark-medium-contrast": { ... },
    "dark-high-contrast": { ... }
  },
  "palettes": {
    "primary": { "0": "#000000", "5": "#001223", ... "100": "#FFFFFF" },
    "secondary": { ... },
    "tertiary": { ... },
    "neutral": { ... },
    "neutral-variant": { ... }
  }
}
```

## Available Schemes

The Material Theme Builder generates multiple contrast levels for accessibility:

- **light** - Standard light theme
- **light-medium-contrast** - Light theme with enhanced contrast
- **light-high-contrast** - Light theme with maximum contrast
- **dark** - Standard dark theme
- **dark-medium-contrast** - Dark theme with enhanced contrast
- **dark-high-contrast** - Dark theme with maximum contrast

The token system currently uses **light** and **dark** schemes. To use a different scheme, modify `readThemeTokens()` in `generators/token-io.ts`.

## Token Extraction

The build process converts Material Theme Builder camelCase tokens to M3 CSS variable format:

```
Material Theme Builder: { "primary": "#31628D", "surfaceContainerLowest": "#FFFFFF" }
              ↓
M3 Format: { 
  "--md-sys-color-primary": "#31628D",
  "--md-sys-color-surface-container-lowest": "#FFFFFF"
}
```

## Creating Your Own Theme

1. **Option A**: Use the Material Theme Builder Figma plugin
   - Open Figma
   - Search for "Material Theme Builder" in community plugins
   - Create your theme with color seed
   - Export JSON

2. **Option B**: Use the web tool
   - Go to https://material-foundation.github.io/material-theme-builder/
   - Customize your theme
   - Export JSON

3. **Replace the file**: Copy the exported `material-theme.json` into this directory

4. **Regenerate tokens**: Run `pnpm tokens:build`

## Token Categories in Material Theme Builder

### Semantic Colors

**Primary Color Family**
- `primary`, `onPrimary`
- `primaryContainer`, `onPrimaryContainer`
- `primaryFixed`, `onPrimaryFixed`
- `onPrimaryFixedVariant`, `primaryFixedDim`
- `inversePrimary`

**Secondary Color Family**
- `secondary`, `onSecondary`
- `secondaryContainer`, `onSecondaryContainer`
- `secondaryFixed`, `onSecondaryFixed`
- `onSecondaryFixedVariant`, `secondaryFixedDim`

**Tertiary Color Family**
- `tertiary`, `onTertiary`
- `tertiaryContainer`, `onTertiaryContainer`
- `tertiaryFixed`, `onTertiaryFixed`
- `onTertiaryFixedVariant`, `tertiaryFixedDim`

**Error Color Family**
- `error`, `onError`
- `errorContainer`, `onErrorContainer`

**Surface Color Family**
- `surface`, `onSurface`
- `surfaceVariant`, `onSurfaceVariant`
- `surfaceTint`
- `surfaceDim`, `surfaceBright`
- `surfaceContainerLowest`, `surfaceContainerLow`
- `surfaceContainer`, `surfaceContainerHigh`, `surfaceContainerHighest`
- `inverseSurface`, `inverseOnSurface`

**Outline Colors**
- `outline`, `outlineVariant`

**Utility Colors**
- `background`, `onBackground`
- `shadow`, `scrim`

## Maintenance Workflow

### Updating Token Values

1. Open the Material Theme Builder (Figma plugin or web tool)
2. Customize colors and export JSON
3. Replace `material-theme.json` with the new export
4. Run `pnpm tokens:build` to regenerate all outputs
5. Commit both source and dist changes

### Switching Contrast Levels

To use a different contrast level (e.g., high-contrast for accessibility):

Edit `generators/token-io.ts` and change:
```typescript
// From:
const schemeData = themeBuilder.schemes['light'];

// To:
const schemeData = themeBuilder.schemes['light-high-contrast'];
```

Then run `pnpm tokens:build` and test in your application.

## Material Design 3 Resources

- [M3 Color System](https://m3.material.io/styles/color/system/overview)
- [M3 Color Roles](https://m3.material.io/styles/color/roles)
- [Material Theme Builder](https://material-foundation.github.io/material-theme-builder/)
- [Material Design 3 Docs](https://m3.material.io/)

## CI Validation

The `pnpm verify:tokens` script ensures:

- Source file (`material-theme.json`) exists and is valid JSON
- All required schemes exist (light, dark)
- All Material system tokens have corresponding M3 tokens
- Generated dist files are up-to-date



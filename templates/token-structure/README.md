# Token Structure

This directory contains the **complete design token system** that provides a single source of truth for theming across multiple frameworks (Material Angular, Tailwind, custom CSS).

## Purpose

The token structure enables:

1. **Single Source of Truth**: M3 design tokens defined once in JSON
2. **Multi-Framework Support**: Generates CSS for Material Angular, Tailwind, and custom components
3. **Theme Consistency**: All frameworks use the same color values
4. **Runtime Theme Editing**: Pure CSS variables support live theme switching
5. **Type Safety**: TypeScript mappings ensure correct token references

## Directory Structure

```
token-structure/
├── source/                     # Source of truth (M3 design tokens)
│   ├── tokens.light.json      # Light theme token values
│   ├── tokens.dark.json       # Dark theme token values
│   └── README.md
│
├── mappings/                   # Framework bridges (hand-maintained)
│   ├── colors.ts              # Tailwind color utilities → M3 tokens
│   ├── material.ts            # Material Angular system tokens → M3 tokens
│   ├── radii.ts               # Tailwind border radius → M3 tokens
│   ├── types.ts               # TypeScript mapping types
│   ├── index.ts               # Mapping exports + helpers
│   └── README.md
│
├── generators/                 # Build pipeline
│   ├── build-tokens.ts        # Main generator orchestrator
│   ├── css-writers.ts         # CSS output formatters
│   └── token-io.ts            # JSON file I/O utilities
│
└── DIST_STRATEGY.md           # Why we commit generated CSS

OUTPUT (generated → projects/tokens/dist/):
├── themes.css                  # Theme class wrappers (.theme-light, .theme-dark)
├── m3.css                      # M3 system tokens scoped to theme classes
├── material.system.css         # Material Angular system token overrides
└── tailwind.theme.css          # Tailwind @theme utilities
```

## How It Works

### 1. Source Tokens (JSON)

Human-maintained M3 design tokens in `source/tokens.{light,dark}.json`:

```json
{
  "--md-sys-color-primary": "#6750A4",
  "--md-sys-color-on-primary": "#FFFFFF"
}
```

### 2. Mappings (TypeScript)

Define how frameworks consume M3 tokens:

**Tailwind Bridge** (`mappings/colors.ts`):
```typescript
{
  'color-primary': '--md-sys-color-primary',  // Generates: --color-primary: var(--md-sys-color-primary);
}
```

**Material Angular Bridge** (`mappings/material.ts`):
```typescript
{
  'mat-sys-primary': '--md-sys-color-primary',  // Material components use --mat-sys-primary
}
```

### 3. Generation (TypeScript)

Run `pnpm tokens:build` or `tsx generators/build-tokens.ts`:

- Reads source tokens (light + dark)
- Reads all mappings
- Validates mapping references exist in both themes
- Generates CSS output files

### 4. Output (CSS)

**themes.css** - Theme class definitions:
```css
.theme-light { color-scheme: light; }
.theme-dark { color-scheme: dark; }
```

**m3.css** - M3 tokens scoped to themes:
```css
.theme-light {
  --md-sys-color-primary: #6750A4;
  --md-sys-color-on-primary: #FFFFFF;
}
.theme-dark {
  --md-sys-color-primary: #D0BCFF;
  --md-sys-color-on-primary: #381E72;
}
```

**material.system.css** - Material Angular overrides:
```css
.theme-light {
  --mat-sys-primary: var(--md-sys-color-primary);
  --mat-sys-on-primary: var(--md-sys-color-on-primary);
}
.theme-dark {
  --mat-sys-primary: var(--md-sys-color-primary);
  --mat-sys-on-primary: var(--md-sys-color-on-primary);
}
```

**tailwind.theme.css** - Tailwind utilities:
```css
@theme {
  --color-primary: var(--md-sys-color-primary);
  --color-on-primary: var(--md-sys-color-on-primary);
}
```

## Usage in Application

**Global styles (styles.css)**:
```css
@import '../tokens/dist/material.system.css';  /* Material components */
@import '../tokens/dist/m3.css';               /* M3 tokens */
/* Tailwind utilities are auto-imported via @tailwindcss/postcss */
```

**HTML theme switching**:
```html
<html class="theme-light">  <!-- or theme-dark -->
```

**Component usage**:
```typescript
// Material components automatically use --mat-sys-* tokens
<mat-button color="primary">Click</mat-button>

// Custom components use M3 CSS variables directly
<div style="background: var(--md-sys-color-primary)">

// Tailwind utilities use bridged M3 values
<div class="bg-primary text-on-primary">
```

## Maintenance Workflow

### Adding/Changing Tokens

1. Edit `source/tokens.light.json` and `source/tokens.dark.json`
2. Keep same keys in both files (different values)
3. Run `pnpm tokens:build`
4. Review generated CSS in `dist/`
5. Commit source + dist together

### Adding New Framework Bridge

1. Create `mappings/your-framework.ts`
2. Export `MappingGroup` with type + token map
3. Add to `ALL_MAPPINGS` in `mappings/index.ts`
4. Update `MappingType` union in `mappings/types.ts`
5. Add writer function in `generators/css-writers.ts` (if custom format needed)
6. Call writer in `generators/build-tokens.ts`
7. Run `pnpm tokens:build`

### Adding Tokens to Existing Mapping

1. Edit mapping file (e.g., `mappings/colors.ts`)
2. Add new entry: `'tailwind-var': '--md-sys-color-your-token'`
3. Ensure token exists in both light and dark JSON files
4. Run `pnpm tokens:build` (validates token existence)
5. Review generated output

## Validation

The generator validates:

- ✅ All mapped M3 tokens exist in both light AND dark themes
- ✅ No duplicate Tailwind variable names across mappings
- ✅ Proper CSS variable format (`--` prefix)

Build fails fast with clear error messages if validation fails.

## CI Integration

```bash
# Regenerate tokens
pnpm tokens:build

# Verify dist matches source (fails if uncommitted changes)
pnpm verify:tokens
```

## Benefits of This Architecture

1. **Single Source**: Change color once, updates everywhere
2. **Type Safety**: TypeScript mappings prevent typos
3. **Framework Agnostic**: Add new framework without touching source tokens
4. **Runtime Theming**: CSS variables enable live theme switching
5. **Reviewable Contract**: Generated CSS committed for PR visibility
6. **No Build Required**: Consumers can use CSS without running generators
7. **Validation**: Prevents light/dark drift automatically

## Related Documentation

- [DIST_STRATEGY.md](./DIST_STRATEGY.md) - Why we commit generated CSS
- [source/README.md](./source/README.md) - Token source file format
- [mappings/README.md](./mappings/README.md) - How to create mappings

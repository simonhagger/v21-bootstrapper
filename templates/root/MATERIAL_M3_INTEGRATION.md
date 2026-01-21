# Material Angular + M3 Token Integration Guide

## Problem Statement

Angular Material and Material Design 3 (M3) are both Google products, but they use **different theming systems**:

- **Material Angular** uses a Sass-based theming system with its own color palettes and mixins
- **M3 Design Tokens** use CSS custom properties (variables) with semantic naming

We cannot simply apply M3 CSS variables directly to Material components because Material has its own internal theming structure.

## Solution: Dual Theming Strategy

We implement a **bridge pattern** that allows both systems to coexist and share color values:

```
M3 Design Tokens (JSON)
         ↓
    ┌─────────┬──────────┐
    ↓         ↓          ↓
Material     M3 CSS    Tailwind
 Theme      Variables  Config
(Sass)    (CSS vars)  (JS config)
    ↓         ↓          ↓
Material   Custom    Utility
Components Components Classes
```

### Architecture

#### 1. **Material Theme Layer** (`material-theme.scss`)

- Defines Material theme using Sass
- Uses M3 color values in Material's palette format
- Provides proper styling for all Material components
- Supports light/dark mode via `html.dark-theme` class

```scss
// M3 values mapped to Material Sass palette
$m3-primary-palette: (
  500: #6750a4,
  // M3 primary color
  contrast: (
      500: #ffffff,
      // M3 on-primary color
    ),
);

$light-theme: mat.define-theme(
  (
    color: (
      theme-type: light,
      primary: $m3-primary-palette,
    ),
  )
);
```

#### 2. **M3 CSS Variables** (`m3.css`)

- Generated from `tokens.{light,dark}.json`
- Provides semantic design tokens as CSS custom properties
- Used by custom components and Tailwind utilities

```css
:root {
  --md-sys-color-primary: #6750a4;
  --md-sys-color-on-primary: #ffffff;
  /* ... more tokens */
}
```

#### 3. **Integration Point** (`styles.css`)

```css
/* Import order matters: */
@import './material-theme.scss'; /* Material components */
@import '../../tokens/dist/m3.css'; /* M3 CSS variables */
```

## Usage Patterns

### Material Components (Use Material Theme)

Material components automatically use the Sass theme:

```typescript
<mat-card>
  <button mat-raised-button color="primary">Button</button>
</mat-card>
```

**What happens:**

- `mat-card` gets styled by Material theme (Sass)
- Colors come from our M3-aligned palette definitions
- No manual theming needed

### Custom Components (Use M3 CSS Variables)

Custom components can use M3 tokens directly:

```typescript
<div class="custom-card">
  <h2 style="color: var(--md-sys-color-primary)">Title</h2>
</div>
```

```css
.custom-card {
  background: var(--md-sys-color-surface-container);
  color: var(--md-sys-color-on-surface);
}
```

### Tailwind Utilities (Use M3 via Config)

Tailwind references M3 variables in configuration:

```typescript
<div class="bg-surface text-on-surface">
  Content
</div>
```

This works because `tailwind.config.ts` maps colors to M3 variables:

```javascript
colors: {
  primary: 'var(--md-sys-color-primary)',
  surface: 'var(--md-sys-color-surface)',
}
```

## Theme Switching

Both systems respond to the same theme class:

```typescript
// Toggle between light and dark
document.documentElement.classList.toggle('dark-theme');
```

**What happens:**

1. Material theme switches via Sass (`:root` vs `html.dark-theme`)
2. M3 variables switch via CSS scoping (same class)
3. Both systems stay synchronized

## Color Palette Synchronization

To maintain consistency, M3 token values MUST be kept in sync with Material theme Sass values:

### Source of Truth

- **Primary source:** `projects/tokens/src/source/tokens.{light,dark}.json`
- **Material theme:** `material-theme.scss` (manually kept in sync)

### Update Process

1. Update color values in `tokens.{light,dark}.json`
2. Run `pnpm tokens:build` to generate `m3.css`
3. **Manually update** matching values in `material-theme.scss`
4. Rebuild application

## File Structure

```
projects/web/src/
├── styles.css                 # Main entry point
├── material-theme.scss        # Material Angular theme (Sass)
├── theme.css                  # M3 tokens (manual, for reference)
└── tokens/dist/
    ├── m3.css                 # Generated M3 CSS variables
    ├── tailwind.theme.css     # Generated Tailwind token bridge
    └── themes.css             # Brand variants (multi-brand support)
```

## Build Process

The theming system requires both Sass and CSS:

```bash
# 1. Build M3 tokens from source JSON
pnpm tokens:build

# 2. Angular build process compiles Sass (material-theme.scss)
#    This happens automatically during ng build/serve
pnpm build  # or pnpm start
```

### What Gets Compiled

1. **Sass Compilation** (automatic)
   - `material-theme.scss` → compiled CSS for Material components
   - Happens during Angular build via `@angular/material` styles

2. **Token Generation** (manual trigger)
   - `tokens.{light,dark}.json` → `m3.css`
   - Run explicitly with `pnpm tokens:build`

## Benefits

### ✅ **Material Components Work Properly**

- All Material components render with correct styling
- No missing styles or broken layouts

### ✅ **M3 Design System**

- Semantic color tokens available as CSS variables
- Easy to use in custom components

### ✅ **Synchronized Theming**

- Light/dark mode works consistently
- Single class toggle affects both systems

### ✅ **Type Safety**

- TypeScript config for Tailwind colors
- IntelliSense for M3 token names

### ✅ **Maintainability**

- Clear separation of concerns
- Each system can be updated independently (with manual sync)

## Limitations & Trade-offs

### ⚠️ **Manual Synchronization Required**

- M3 token values must be manually copied to Material Sass theme
- No automatic sync between JSON → Sass
- Risk of values drifting out of sync

**Mitigation:** Create a script to generate Sass palette from tokens.json

### ⚠️ **Dual Import Required**

- Both Sass theme and M3 CSS must be imported
- Slight increase in CSS bundle size

**Impact:** Minimal (~10-20KB after compression)

### ⚠️ **Learning Curve**

- Developers must understand which system to use when
- Material components = Material theme
- Custom components = M3 variables

**Mitigation:** Clear documentation and code examples

## Future Improvements

### 1. **Automated Palette Generation**

Create a build script to generate Material Sass palettes from `tokens.json`:

```javascript
// tools/generate-material-palette.mjs
const tokens = require('../tokens.light.json');
const sassOutput = generateMaterialPalette(tokens.color.primary);
// Write to material-theme.scss
```

### 2. **Material 3 Theme Builder Integration**

Use Material 3 theme builder to generate both:

- M3 design tokens
- Material Angular theme
- Guaranteed synchronization

### 3. **CSS Variables in Material**

Monitor Angular Material for CSS custom property support.
Future versions may support CSS variables directly, eliminating the need for Sass theming.

## Troubleshooting

### Material Components Not Styled

**Problem:** Material components appear unstyled or broken

**Solution:**

1. Verify `material-theme.scss` is imported in `styles.css`
2. Check that Sass compilation succeeded (check browser DevTools)
3. Ensure `@angular/material` is installed

### Colors Don't Match M3 Tokens

**Problem:** Material components use different colors than expected

**Solution:**

1. Check that Material Sass palette values match `tokens.json`
2. Update `material-theme.scss` manually if tokens changed
3. Rebuild application

### Theme Switching Doesn't Work

**Problem:** Dark mode doesn't affect Material components

**Solution:**

1. Verify `html.dark-theme` class is being toggled correctly
2. Check that dark theme Sass is included in `material-theme.scss`
3. Ensure both `:root` and `html.dark-theme` selectors are present

## References

- [Angular Material Theming Guide](https://material.angular.io/guide/theming)
- [Material Design 3 Color System](https://m3.material.io/styles/color/system/overview)
- [Material Theme Builder](https://material-foundation.github.io/material-theme-builder/)
- [Design Tokens Spec](https://tr.designtokens.org/)

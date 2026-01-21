# Theming Guide

## Overview

This project uses a **unified theming system** where Material Design 3 tokens are the single source of truth for both Angular Material components and custom UI:

- **Angular Material components**: Use M3 tokens via CSS variable redefinition (`material.system.css`)
- **Custom components & Tailwind**: Use M3 tokens directly via generated CSS variables

This approach provides a **single source of truth** for all theming, eliminating the need for separate Material themes or wrapper components.

```
M3 Token Sources (JSON)
    ↓
├─ M3 CSS Variables (.theme-light, .theme-dark)
├─ Material System Tokens (--mat-sys-*)  → Material Components
└─ Tailwind Theme Bridge (@theme)        → Custom Components + Utilities
```

## Architecture

### Token Layers

1. **Source Tokens** (`tokens/src/source/`)
   - `tokens.light.json` - Light theme M3 values
   - `tokens.dark.json` - Dark theme M3 values
   - Format: `{ "--md-sys-color-primary": "#6750A4" }`

2. **Mappings** (`tokens/src/mappings/`)
   - Bridge contract between M3 and framework tokens
   - `colors.ts` - Tailwind color utility mappings
   - `material.ts` - Material Angular `--mat-sys-*` system token mappings
   - `radii.ts` - Tailwind border radius mappings
   - Extensible for typography, elevation, etc.

3. **Generated Outputs** (`tokens/dist/`)
   - `themes.css` - Theme scope selectors (`.theme-light`, `.theme-dark`)
   - `m3.css` - M3 system variables scoped per theme
   - `material.system.css` - Material Angular system token overrides
   - `tailwind.theme.css` - Tailwind `@theme` variables

### Token Flow

```typescript
// 1. Source (tokens.light.json)
{
  "--md-sys-color-primary": "#6750A4",
  "--md-sys-color-surface": "#FEF7FF"
}

// 2. Material Mapping (mappings/material.ts)
{
  "mat-sys-primary": "--md-sys-color-primary",
  "mat-sys-surface": "--md-sys-color-surface"
}

// 3. Generated M3 CSS (m3.css)
.theme-light {
  --md-sys-color-primary: #6750A4;
  --md-sys-color-surface: #FEF7FF;
}

// 4. Generated Material System CSS (material.system.css)
.theme-light {
  --mat-sys-primary: var(--md-sys-color-primary);
  --mat-sys-surface: var(--md-sys-color-surface);
  /* ...75+ Material system token mappings */
}

// 5. Material Components Use System Tokens
<mat-button color="primary">
  <!-- Uses --mat-sys-primary which points to --md-sys-color-primary -->
</mat-button>

// 6. Custom Components Use M3 Tokens Directly
<div class="bg-primary text-on-primary">
  <!-- Uses Tailwind utility referencing --md-sys-color-primary -->
</div>
```

## Material Angular Integration

### How It Works

Angular Material v19+ components use **Material 3 system tokens** (`--mat-sys-*`). Instead of importing a prebuilt Sass theme, we:

1. **Generate `material.system.css`** that maps Material's 75+ system tokens to our M3 tokens
2. **Import it before M3 tokens** in `styles.css`:
   ```css
   @import '../tokens/dist/material.system.css';
   @import '../tokens/dist/m3.css';
   ```
3. **Material components automatically inherit** M3 theme values

### Benefits

- **No Sass compilation required** - Pure CSS variable redefinition
- **Single source of truth** - All theming comes from M3 token JSON files
- **Automatic theme switching** - Material components update when theme class changes
- **No wrapper components needed** - Material components work directly with M3 tokens
- **Framework parity** - Material and custom UI use identical color values

### Supported Material Components

All Angular Material components using M3 system tokens are supported:

- `mat-button`, `mat-fab`, `mat-icon-button`
- `mat-card`
- `mat-toolbar`
- `mat-form-field`, `mat-input`, `mat-select`
- `mat-checkbox`, `mat-radio-button`, `mat-slide-toggle`
- `mat-progress-bar`, `mat-progress-spinner`
- `mat-dialog`
- `mat-snack-bar`
- `mat-table`
- `mat-tabs`
- `mat-menu`
- And all other M3-compatible Material components

## Theme Service

### API

```typescript
import { inject } from '@angular/core';
import { ThemeService } from '@core/theme/theme.service';

export class MyComponent {
  private readonly theme = inject(ThemeService);

  // Read-only signals
  readonly mode = this.theme.mode; // 'light' | 'dark'
  readonly brand = this.theme.brand; // 'brandA' | 'brandB'
  readonly state = this.theme.state; // { mode, brand }
  readonly followSystem = this.theme.followSystem; // boolean

  // Actions
  toggleTheme() {
    this.theme.toggleMode();
  }

  setDarkMode() {
    this.theme.setMode('dark');
  }

  switchBrand() {
    this.theme.setBrand('brandB');
  }

  enableSystemFollow() {
    this.theme.setFollowSystem(true);
  }
}
```

### Theme Classes

The service applies classes to `<html>`:

```html
<!-- Light mode, Brand A -->
<html class="theme-brandA theme-light">
  <!-- Dark mode, Brand B -->
  <html class="theme-brandB theme-dark"></html>
</html>
```

Both Material components and custom components react to theme class changes via CSS variable scoping.

### Persistence

Theme preferences are saved to `localStorage`:

```json
{
  "brand": "brandA",
  "mode": "dark",
  "followSystem": false
}
```

### System Preference

When `followSystem` is `true`, the service watches `prefers-color-scheme`:

```typescript
// Automatically updates on OS theme change
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ...);
```

## Using Tokens in Components

### With Material Components

Material components **automatically use M3 tokens** via `material.system.css`:

```typescript
@Component({
  template: `
    <!-- Uses --mat-sys-primary → --md-sys-color-primary -->
    <button mat-raised-button color="primary">Primary Button</button>

    <!-- Uses --mat-sys-surface → --md-sys-color-surface -->
    <mat-card>
      <mat-card-header>
        <mat-card-title>Card Title</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        Content inherits M3 surface colors automatically
      </mat-card-content>
    </mat-card>

    <!-- Uses --mat-sys-surface-container → --md-sys-color-surface-container -->
    <mat-toolbar>
      Toolbar inherits M3 tokens
    </mat-toolbar>
  `,
})
export class MyComponent {}
```

**No wrapper components needed** - Material components work directly with M3 tokens.

**Theme switching works automatically:**

```typescript
// User toggles theme
themeService.setMode('dark');

// All Material components update via CSS variable scope:
// .theme-dark { --md-sys-color-primary: #D0BCFF; }
// .theme-dark { --mat-sys-primary: var(--md-sys-color-primary); }
```

### With Tailwind Utilities

Use semantic utility classes that reference M3 tokens:

```html
<!-- Background and text colors -->
<div class="bg-surface text-on-surface">Surface container</div>

<div class="bg-primary text-on-primary">Primary surface</div>

<div class="bg-error text-on-error">Error message</div>

<!-- Border radius -->
<div class="rounded-md">
  <!-- Uses --radius-md → --md-sys-shape-corner-medium -->
</div>

<!-- Borders -->
<div class="border border-outline">
  <!-- Uses --color-outline → --md-sys-color-outline -->
</div>
```

### With Custom CSS

Reference M3 tokens directly:

```css
.my-component {
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  border-radius: var(--md-sys-shape-corner-medium);
  border: 1px solid var(--md-sys-color-outline);
}

/* Dark mode automatically handled via theme classes */
.theme-dark .my-component {
  /* Variables update automatically - no manual overrides needed */
}
```

### Mixing Material and Custom UI

Material components and custom UI share the same token values:

```html
<mat-card class="flex items-center gap-4">
  <!-- Material component uses --mat-sys-surface → --md-sys-color-surface -->
  <mat-card-content>
    <!-- Custom div uses Tailwind bg-primary → --color-primary → --md-sys-color-primary -->
    <div class="rounded-md bg-primary p-4 text-on-primary">
      <!-- Both inherit from same M3 token values -->
      <button mat-button color="primary">Material Button</button>
    </div>
  </mat-card-content>
</mat-card>
```

## Available Tokens

### Colors (Semantic)

```
--md-sys-color-primary
--md-sys-color-on-primary
--md-sys-color-primary-container
--md-sys-color-on-primary-container

--md-sys-color-secondary
--md-sys-color-on-secondary
--md-sys-color-secondary-container
--md-sys-color-on-secondary-container

--md-sys-color-tertiary
--md-sys-color-on-tertiary
--md-sys-color-tertiary-container
--md-sys-color-on-tertiary-container

--md-sys-color-surface
--md-sys-color-on-surface
--md-sys-color-surface-variant
--md-sys-color-on-surface-variant
--md-sys-color-surface-container
--md-sys-color-surface-container-low
--md-sys-color-surface-container-high
--md-sys-color-surface-container-highest

--md-sys-color-error
--md-sys-color-on-error
--md-sys-color-error-container
--md-sys-color-on-error-container

--md-sys-color-outline
--md-sys-color-outline-variant
```

### Tailwind Mappings

```
bg-primary, text-on-primary
bg-primary-container, text-on-primary-container
bg-secondary, text-on-secondary
bg-secondary-container, text-on-secondary-container
bg-tertiary, text-on-tertiary
bg-surface, text-on-surface
bg-surface-variant, text-on-surface-variant
bg-error, text-on-error
border-outline, border-outline-variant
```

### Material System Tokens (Auto-Generated)

Material components use these internally (you don't reference them directly):

```
--mat-sys-primary, --mat-sys-on-primary
--mat-sys-secondary, --mat-sys-on-secondary
--mat-sys-tertiary, --mat-sys-on-tertiary
--mat-sys-surface, --mat-sys-on-surface
--mat-sys-error, --mat-sys-on-error
--mat-sys-outline, --mat-sys-outline-variant
... (75+ total Material system tokens)
```

### Shape (Border Radius)

```
--md-sys-shape-corner-extra-small  (4px)
--md-sys-shape-corner-small        (8px)
--md-sys-shape-corner-medium       (12px)
--md-sys-shape-corner-large        (16px)
--md-sys-shape-corner-extra-large  (28px)
```

### Tailwind Mappings

```
rounded-xs  (extra-small)
rounded-sm  (small)
rounded-md  (medium)
rounded-lg  (large)
rounded-xl  (extra-large)
```

## Modifying Tokens

### Updating Values

1. **Edit source files:**

   ```bash
   # Open M3 token sources
   code tokens/src/source/tokens.light.json
   code tokens/src/source/tokens.dark.json
   ```

2. **Update both themes** (light and dark must have same keys):

   ```json
   // tokens.light.json
   {
     "--md-sys-color-primary": "#6750A4"  // Purple
   }

   // tokens.dark.json
   {
     "--md-sys-color-primary": "#D0BCFF"  // Light purple
   }
   ```

3. **Regenerate:**

   ```bash
   pnpm tokens:build
   ```

4. **Verify:**
   ```bash
   pnpm verify:theme-contract
   pnpm verify:tokens
   ```

**Changes propagate to:**
- M3 CSS variables (m3.css)
- Material system tokens (material.system.css)
- Tailwind utilities (tailwind.theme.css)
- All Material components
- All custom components

### Adding New Tokens

1. **Add to both source files:**

   ```json
   {
     "--md-sys-color-custom": "#7D5260",
     "--md-sys-color-on-custom": "#FFFFFF"
   }
   ```

2. **Add Tailwind mapping** (optional, if exposing to utilities):

   ```typescript
   // tokens/src/mappings/colors.ts
   export const colors: MappingGroup = {
     type: 'colors',
     map: {
       'color-custom': '--md-sys-color-custom',
       'color-on-custom': '--md-sys-color-on-custom',
     },
   };
   ```

3. **Add Material mapping** (optional, if Material needs it):

   ```typescript
   // tokens/src/mappings/material.ts
   export const material: MappingGroup = {
     type: 'material',
     map: {
       'mat-sys-custom': '--md-sys-color-custom',
       'mat-sys-on-custom': '--md-sys-color-on-custom',
     },
   };
   ```

4. **Regenerate and verify:**
   ```bash
   pnpm tokens:build
   pnpm verify:theme-contract
   pnpm verify:tokens
   ```

### Extending Material System Tokens

The Material mapping in `tokens/src/mappings/material.ts` covers all standard M3 color roles. If Material adds new system tokens:

1. Add mapping entry:
   ```typescript
   'mat-sys-new-token': '--md-sys-color-source-token'
   ```

2. Regenerate:
   ```bash
   pnpm tokens:build
   ```

3. Verify Material components use the new token

## Multi-Brand Setup

### Defining Brands

Update `core/theme/theme.types.ts`:

```typescript
export type ThemeBrand = 'brandA' | 'brandB' | 'brandC';
```

### Brand Token Files

Create separate JSON files:

```
tokens.brandA.light.json
tokens.brandA.dark.json
tokens.brandB.light.json
tokens.brandB.dark.json
tokens.brandC.light.json
tokens.brandC.dark.json
```

### Generator Updates

Modify `tokens/src/generators/build-tokens.ts` to handle multiple brands:

```typescript
const brands = ['brandA', 'brandB', 'brandC'];
const modes = ['light', 'dark'];

for (const brand of brands) {
  for (const mode of modes) {
    const tokens = readThemeTokens(brand, mode);
    // Generate .theme-brandA.theme-light { ... }
  }
}
```

### Brand Switching

```typescript
// Switch to Brand B
themeService.setBrand('brandB');

// HTML updates: <html class="theme-brandB theme-light">
// All Material components and custom UI update via CSS variable scope
```

## Best Practices

### ✅ DO

- Use semantic color names (`primary`, `surface`, `error`)
- Reference tokens via CSS variables
- Keep mappings minimal and stable
- Update both light and dark themes together
- Run `pnpm tokens:build` after changes
- Commit both source and dist
- Let Material components use M3 tokens directly via `material.system.css`
- Use Tailwind utilities for custom components
- Trust the token generation system for theme consistency

### ❌ DON'T

- Hardcode hex colors in components
- Override Material component styles manually
- Import Material prebuilt Sass themes
- Use `@use '@angular/material' as mat` for theming
- Mix Material's default theme with M3 tokens
- Create wrapper components for Material theming
- Forget to update dark theme when changing light theme
- Use raw palette values directly
- Duplicate token definitions

## Troubleshooting

### Material components not using M3 colors

**Check import order in `styles.css`:**

```css
/* CORRECT - Material overrides before M3 base */
@import '../tokens/dist/material.system.css';
@import '../tokens/dist/m3.css';
@import '../tokens/dist/tailwind.theme.css';

/* WRONG - M3 tokens load before Material overrides */
@import '../tokens/dist/m3.css';
@import '../tokens/dist/material.system.css'; /* Too late! */
```

### Token mismatch errors

```bash
# Error: Token X exists in light but not dark
# Fix: Add missing token to tokens.dark.json
pnpm verify:theme-contract
```

### Dist out of sync

```bash
# Error: Token outputs are out of date
# Fix: Regenerate and commit
pnpm tokens:build
git add tokens/dist
git commit -m "chore(tokens): regenerate dist"
```

### Hardcoded colors detected

```bash
# Error: Raw hex colors detected in components
# Fix: Replace with token references
pnpm verify:no-raw-colors
```

### Theme not switching

**Check HTML class application:**

```typescript
// Verify ThemeService is setting classes
import { ThemeService } from '@core/theme/theme.service';

constructor(private theme: ThemeService) {
  console.log('Current mode:', theme.mode());
  console.log('Current brand:', theme.brand());
}
```

**Verify token scope in CSS:**

```css
/* Tokens must be scoped to theme classes */
.theme-light {
  --md-sys-color-primary: #6750A4;
}

.theme-dark {
  --md-sys-color-primary: #D0BCFF;
}
```

## Resources

- [Material Design 3 Tokens](https://m3.material.io/foundations/design-tokens)
- [Material Design 3 Color System](https://m3.material.io/styles/color/system/overview)
- [Material Theme Builder](https://material-foundation.github.io/material-theme-builder/) - Generate M3 color schemes
- [Tailwind CSS v4 Theme](https://tailwindcss.com/docs/theme)
- [Token System Documentation](tokens/src/README.md)
- [Angular Material M3 Guide](https://material.angular.io/guide/theming)

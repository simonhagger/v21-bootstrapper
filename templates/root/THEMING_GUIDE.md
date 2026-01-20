# Theming Guide

## Overview

This project uses a **unified theming system** where Material Design 3 tokens are the single source of truth, and Tailwind CSS utilities reference those same tokens.

```
Token Sources (JSON)
    ↓
M3 CSS Variables (.theme-light, .theme-dark)
    ↓
Tailwind Theme Bridge (@theme)
    ↓
Material Components + Tailwind Utilities
```

## Architecture

### Token Layers

1. **Source Tokens** (`projects/tokens/src/source/`)
   - `tokens.light.json` - Light theme values
   - `tokens.dark.json` - Dark theme values
   - Flat JSON format: `{ "--md-sys-color-primary": "#6750A4" }`

2. **Mappings** (`projects/tokens/src/mappings/`)
   - Bridge contract between M3 and Tailwind
   - `colors.ts` - Color mappings
   - `radii.ts` - Border radius mappings
   - Extensible for typography, elevation, etc.

3. **Generated Outputs** (`projects/tokens/dist/`)
   - `themes.css` - Theme scope selectors
   - `m3.css` - M3 system variables scoped per theme
   - `tailwind.theme.css` - Tailwind `@theme` variables

### Token Flow

```typescript
// 1. Source (tokens.light.json)
{
  "--md-sys-color-primary": "#6750A4"
}

// 2. Mapping (colors.ts)
{
  "color-primary": "--md-sys-color-primary"
}

// 3. Generated M3 CSS (m3.css)
.theme-light {
  --md-sys-color-primary: #6750A4;
}

// 4. Generated Tailwind CSS (tailwind.theme.css)
@theme {
  --color-primary: var(--md-sys-color-primary);
}

// 5. Usage
<div class="bg-primary text-on-primary">
  Uses --color-primary → --md-sys-color-primary
</div>
```

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

Material components automatically use M3 tokens:

```typescript
@Component({
  template: `
    <mat-toolbar color="primary">
      <!-- Uses --md-sys-color-primary -->
    </mat-toolbar>

    <mat-card>
      <!-- Uses --md-sys-color-surface -->
      <mat-card-content>
        Content uses on-surface color
      </mat-card-content>
    </mat-card>
  `
})
```

### With Tailwind Utilities

Use semantic utility classes that reference tokens:

```html
<!-- Background and text colors -->
<div class="bg-surface text-on-surface">Surface container</div>

<div class="bg-primary text-on-primary">Primary surface</div>

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

Reference tokens directly:

```css
.my-component {
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  border-radius: var(--md-sys-shape-corner-medium);
  border: 1px solid var(--md-sys-color-outline);
}

/* Dark mode automatically handled via theme classes */
.theme-dark .my-component {
  /* Variables update automatically */
}
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

--md-sys-color-surface
--md-sys-color-on-surface
--md-sys-color-surface-variant
--md-sys-color-on-surface-variant

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
bg-surface, text-on-surface
bg-error, text-on-error
border-outline
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
   vim projects/tokens/src/source/tokens.light.json
   vim projects/tokens/src/source/tokens.dark.json
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

### Adding New Tokens

1. **Add to both source files:**

   ```json
   {
     "--md-sys-color-tertiary": "#7D5260",
     "--md-sys-color-on-tertiary": "#FFFFFF"
   }
   ```

2. **Add mapping** (if exposing to Tailwind):

   ```typescript
   // projects/tokens/src/mappings/colors.ts
   export const colors: MappingGroup = {
     type: 'colors',
     map: {
       'color-tertiary': '--md-sys-color-tertiary',
       'color-on-tertiary': '--md-sys-color-on-tertiary',
     },
   };
   ```

3. **Regenerate and verify:**
   ```bash
   pnpm tokens:build
   pnpm verify:theme-contract
   ```

## Multi-Brand Setup

### Defining Brands

Update `theme.types.ts`:

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
```

### Generator Updates

Modify `build-tokens.ts` to handle multiple brands:

```typescript
const brands = ['brandA', 'brandB'];
const modes = ['light', 'dark'];

for (const brand of brands) {
  for (const mode of modes) {
    const tokens = readThemeTokens(brand, mode);
    // Generate .theme-brandA.theme-light { ... }
  }
}
```

## Best Practices

### ✅ DO

- Use semantic color names (`primary`, `surface`, `error`)
- Reference tokens via CSS variables
- Keep mappings minimal and stable
- Update both light and dark themes together
- Run `pnpm tokens:build` after changes
- Commit both source and dist

### ❌ DON'T

- Hardcode hex colors in components
- Map internal Material component tokens
- Override Material component styles with Tailwind
- Use raw palette values directly
- Forget to update dark theme

## Troubleshooting

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
git add projects/tokens/dist
git commit -m "chore(tokens): regenerate dist"
```

### Hardcoded colors detected

```bash
# Error: Raw hex colors detected
# Fix: Replace with token references
pnpm verify:no-raw-colors
```

## Resources

- [Material Design 3 Tokens](https://m3.material.io/foundations/design-tokens)
- [Tailwind CSS v4 Theme](https://tailwindcss.com/docs/theme)
- [Token Generation Docs](projects/tokens/README.md)
- [Dist Strategy](projects/tokens/DIST_STRATEGY.md)

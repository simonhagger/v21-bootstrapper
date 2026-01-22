# Theming Guide

This guide explains how to implement theming in your Angular application using **Tailwind CSS 4** and **Material Angular**, with patterns for overriding styles at both global and component levels.

## Overview

Our theming system uses two complementary approaches:

1. **Tailwind CSS 4** – Utility-first styling with theme configuration
2. **Material Angular** – Component library with Material Design theming

The key to maintainability is understanding **override patterns**: when to use Tailwind utilities, when to use Material's theme system, and how they work together.

---

## Theme Structure

### Global Theme (Tailwind + Material)

The application uses a **light theme by default** with **dark mode support**. Both are configured in:

- `tailwind.css` – Tailwind CSS v4 theme tokens via `@theme` directive
- `styles.scss` – Angular Material theming with Material 3 design system

### Tailwind Theme Configuration

`tailwind.css` uses Tailwind CSS v4's `@theme` directive to define custom design tokens:

```css
@import 'tailwindcss';

@theme {
  /* Brand colors - override or extend the Material theme with Tailwind tokens */
  --color-brand: oklch(0.72 0.11 178);
  --color-brand-contrast: white;
  
  /* Accent color - used to demonstrate Material token overrides */
  --color-accent: oklch(0.65 0.15 285);
  --color-accent-contrast: white;
}
```

These theme tokens can be integrated with Angular Material via `mat.theme-overrides()` in `styles.scss` (see Material Angular Theme section below).

### Material Angular Theme

`styles.scss` uses Material's `@use @angular/material as mat` with `mat.theme()` to:

1. Define Material 3 theme with palettes (primary, tertiary, etc.)
2. Generate Material CSS system variables (`--mat-sys-*`)
3. Apply dark mode support via `.dark` class
4. Import Tailwind CSS for utility styling

```scss
@use '@angular/material' as mat;

// Define Material theme with Material 3 palettes
html {
  height: 100%;
  @include mat.theme(
    (
      color: (
        primary: mat.$azure-palette,
        tertiary: mat.$blue-palette,
      ),
      typography: Roboto,
      density: 0,
    )
  );
}

// Light mode (default)
body {
  color-scheme: light;
  background-color: var(--mat-sys-surface);
  color: var(--mat-sys-on-surface);
  font: var(--mat-sys-body-medium);
  margin: 0;
  height: 100%;
}

// Dark mode
html.dark body {
  color-scheme: dark;
}

// Import Tailwind CSS
@import './tailwind.css';
```

Material theme automatically generates CSS variables (`--mat-sys-*`) for all Material Design 3 colors, typography, and system properties. These are available in components and can be overridden per component.

---

## Override Pattern 1: Global Styles (Tailwind Utilities)

Use Tailwind utilities for **layout, spacing, and non-semantic styling**.

### Example: Button Container

```html
<!-- Using Tailwind utilities for layout -->
<div class="flex gap-4 justify-between p-6">
  <button mat-button>Cancel</button>
  <button mat-raised-button color="primary">Submit</button>
</div>
```

### When to Use

- ✅ Layout and spacing (flexbox, grid, gaps, padding, margins)
- ✅ Responsive design (`sm:`, `md:`, `lg:` breakpoints)
- ✅ Non-semantic styling (borders, shadows, opacity)
- ❌ Semantic colors (use Material's color system instead)
- ❌ Component-specific styling (use component CSS instead)

### Advantages

- Rapid prototyping
- Consistent spacing scale
- Responsive utilities built-in
- No new CSS files needed

---

## Override Pattern 2: Component Styles (Material Angular)

Use Material's component theming for **semantic colors and component-specific styling**.

### Example: Custom Card Component

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-custom-card',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card [ngClass]="{ 'elevated': elevated }">
      <mat-card-header>
        <h2 class="text-lg font-semibold">{{ title }}</h2>
      </mat-card-header>
      <mat-card-content>
        <ng-content></ng-content>
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    :host {
      display: block;
    }

    mat-card {
      background-color: var(--mat-sys-surface);
      color: var(--mat-sys-on-surface);
    }

    mat-card.elevated {
      @apply shadow-md;
    }

    mat-card-header {
      padding: var(--spacing-md);
      @apply border-b;
      border-color: var(--mat-sys-outline);
    }

    mat-card-content {
      padding: var(--spacing-md);
    }
  `,
})
export class CustomCardComponent {
  @Input() title: string = '';
  @Input() elevated: boolean = false;
}
```

Where `--spacing-md` is defined in `tailwind.css`:

```css
@theme {
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;
  --spacing-sm: 0.75rem;
}
```

### When to Use

- ✅ Semantic colors (primary, surface, on-surface, outline, error)
- ✅ Component-specific styling (headers, borders, typography)
- ✅ Dark mode colors (automatically applied)
- ✅ Material component customization (buttons, cards, dialogs)
- ❌ Layout and spacing (use Tailwind instead)
- ❌ Utility-style classes (use Tailwind instead)

### Advantages

- **Automatic dark mode** – CSS variables switch based on theme
- **Type-safe colors** – Use Material's semantic palette
- **Component encapsulation** – Scoped styles don't leak
- **Material integration** – Works with Material components seamlessly

---

## Dark Mode Support

Dark mode is handled **automatically** via the `.dark` class on the `<html>` element and Material's system variables.

### How It Works

1. **Material theme generates** `--mat-sys-*` CSS variables for light mode (default)
2. **Dark class applied** to `<html>` when user toggles dark mode
3. **Material variables switch** to dark mode equivalents automatically
4. **Tailwind utilities** respond to `prefers-color-scheme: dark` media query

### Example: Component with Automatic Dark Mode

```typescript
@Component({
  selector: 'app-status-indicator',
  standalone: true,
  template: `
    <div [ngClass]="'status-' + status">
      {{ label }}
    </div>
  `,
  styles: `
    div {
      @apply px-4 py-2 rounded font-medium;
    }

    .status-success {
      background-color: var(--mat-sys-primary);
      color: var(--mat-sys-on-primary);
    }

    .status-error {
      background-color: var(--mat-sys-error);
      color: var(--mat-sys-on-error);
    }

    .status-warning {
      background-color: var(--mat-sys-warning);
      color: var(--mat-sys-on-warning);
    }
  `,
})
export class StatusIndicatorComponent {
  @Input() status: 'success' | 'error' | 'warning' = 'success';
  @Input() label: string = '';
}
```

No additional dark mode code needed—Material system variables handle it automatically.

---

## Customizing the Theme

### 1. Update Material Theme Colors

Edit `styles.scss` to change the primary and tertiary palettes:

```scss
@include mat.theme(
  (
    color: (
      primary: mat.$blue-palette,      // Change from $azure-palette
      tertiary: mat.$purple-palette,   // Change from $blue-palette
    ),
    // ... other theme properties
  )
);
```

Available palettes: `mat.$red-palette`, `mat.$pink-palette`, `mat.$purple-palette`, `mat.$deep-purple-palette`, `mat.$indigo-palette`, `mat.$blue-palette`, `mat.$cyan-palette`, `mat.$teal-palette`, `mat.$green-palette`, `mat.$light-green-palette`, `mat.$lime-palette`, `mat.$yellow-palette`, `mat.$amber-palette`, `mat.$orange-palette`, `mat.$deep-orange-palette`, `mat.$brown-palette`, `mat.$gray-palette`, `mat.$blue-gray-palette`, `mat.$azure-palette`

### 2. Update Tailwind Theme Tokens

Edit `tailwind.css` to add or modify design tokens in the `@theme` block:

```css
@theme {
  --color-brand: oklch(0.55 0.2 250);      /* Custom primary */
  --color-brand-contrast: white;
  --color-accent: oklch(0.65 0.15 285);    /* Custom accent */
  --color-accent-contrast: white;
  
  /* Add more custom tokens as needed */
  --spacing-custom: 2.5rem;
  --radius-lg: 1rem;
}
```

Use custom tokens in components:

```scss
.custom-element {
  background-color: var(--color-brand);
  color: var(--color-brand-contrast);
  padding: var(--spacing-custom);
  border-radius: var(--radius-lg);
}
```

### 3. Override Material Colors per Component

Use `mat.theme-overrides()` in component styles to override Material colors locally:

```typescript
@Component({
  selector: 'app-custom-card',
  styles: `
    :host {
      @include mat.theme-overrides((
        primary: var(--color-brand),
        on-primary: var(--color-brand-contrast),
      ));
    }
  `,
})
export class CustomCardComponent {}
```

### 4. Update Dark Mode Colors

Edit `styles.scss` to override colors for dark mode (if needed beyond Material's automatic handling):

```scss
html.dark {
  // Optional: Override specific colors for dark mode
  --mat-sys-primary: oklch(0.75 0.12 180);
  --mat-sys-surface: oklch(0.15 0 0);
}
```

---

## Typography

Material Angular provides typography scale via CSS classes. Use in templates:

```html
<h1 class="mat-headline-large">Page Title</h1>
<p class="mat-body-medium">Body text with Material typography</p>
<span class="mat-label-small">Label text</span>
```

### Typography Classes

| Class | Usage |
|-------|-------|
| `mat-headline-large` | Page titles |
| `mat-headline-medium` | Section headers |
| `mat-headline-small` | Sub-headers |
| `mat-title-large` | Component titles |
| `mat-title-medium` | Smaller component titles |
| `mat-body-large` | Large body text |
| `mat-body-medium` | Standard body text |
| `mat-body-small` | Smaller body text |
| `mat-label-large` | Large labels |
| `mat-label-medium` | Standard labels |
| `mat-label-small` | Small labels |

### Custom Typography

To customize typography in component styles:

```scss
:host {
  // Apply custom font weights or letter spacing
  @extend .mat-body-medium;
  font-weight: 600;
  letter-spacing: 0.02em;
}
```

---

## Common Patterns

### Pattern 1: Using Material System Variables

**Access Material's generated system variables:**

```typescript
@Component({
  selector: 'app-dashboard',
  template: `
    <div class="container mx-auto px-4 py-8">
      <app-custom-card title="Overview">
        <div class="grid grid-cols-3 gap-4">
          <!-- Content here -->
        </div>
      </app-custom-card>
    </div>
  `,
  styles: `
    :host {
      background-color: var(--mat-sys-background);
      color: var(--mat-sys-on-background);
      display: block;
    }
  `,
  standalone: true,
  imports: [CommonModule, CustomCardComponent],
})
export class DashboardComponent {}
```

Available `--mat-sys-*` variables: `primary`, `on-primary`, `surface`, `on-surface`, `background`, `on-background`, `error`, `on-error`, `outline`, `outline-variant`, and more.

### Pattern 2: Interactive Element with Tailwind + Material

**Material for base styling + Tailwind for layout:**

```typescript
@Component({
  selector: 'app-filter-chip',
  template: `
    <button
      mat-stroked-button
      [color]="isActive ? 'primary' : ''"
      [ngClass]="{ 'ring-2 ring-primary': isActive }"
      (click)="toggle()"
    >
      {{ label }}
    </button>
  `,
  styles: `
    button {
      transition: all 200ms ease-in-out;
    }

    button.ring-2 {
      --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0
        var(--tw-ring-offset-width) var(--tw-ring-offset-color);
      --tw-ring-shadow: var(--tw-ring-inset) 0 0 0
        calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
      box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow);
    }
  `,
  standalone: true,
  imports: [CommonModule, MatButtonModule],
})
export class FilterChipComponent {
  @Input() label: string = '';
  @Output() selected = new EventEmitter<void>();

  isActive = false;

  toggle() {
    this.isActive = !this.isActive;
    this.selected.emit();
  }
}
```

### Pattern 3: Form Field Styling

**Material for components + Tailwind for container layout:**

```typescript
@Component({
  selector: 'app-form-group',
  template: `
    <div class="mb-6">
      <label class="block mb-2 font-medium">{{ label }}</label>
      <mat-form-field appearance="outline" class="w-full">
        <input matInput [placeholder]="placeholder" />
      </mat-form-field>
      <p *ngIf="hint" class="text-xs mt-1" style="color: var(--mat-sys-on-surface-variant);">{{ hint }}</p>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    label {
      color: var(--mat-sys-on-background);
      font-weight: 500;
      margin-bottom: var(--spacing-sm);
      display: block;
    }

    ::ng-deep .mat-mdc-form-field {
      width: 100%;
    }
  `,
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule],
})
export class FormGroupComponent {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() hint: string = '';
}
```

Where spacing tokens are from `tailwind.css @theme`:

```css
@theme {
  --spacing-sm: 0.75rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;
}
```

---

## Best Practices

### ✅ Do

- Use **Tailwind utilities** for layout, spacing, and responsive design
- Use **Material system variables** (`--mat-sys-*`) for semantic colors
- Keep component styles **scoped** to avoid conflicts
- Use **Tailwind tokens** from `tailwind.css @theme` for custom design tokens
- Apply dark mode colors via Material system variables (automatic via `.dark` class)

## ❌ Don't

- Hardcode colors (use Material system variables or Tailwind tokens instead)
- Mix layout utilities with semantic styling in one selector
- Use Material components for layout (use Tailwind flexbox/grid instead)
- Override Material component styles globally (scope to components)
- Manually define dark mode styles (Material handles it via `--mat-sys-*` variables)

---

## Testing Theme Changes

### 1. Test Light Mode

Default behavior—no changes needed.

### 2. Test Dark Mode

In browser DevTools, add the `.dark` class to `<html>`:

```typescript
// In component or service
document.documentElement.classList.add('dark');
// or
document.documentElement.classList.remove('dark');
```

Or emulate in DevTools:
1. Open DevTools → More Tools → Rendering
2. Check **Emulate CSS media feature prefers-color-scheme**
3. Select **dark**

All Material system variables should update automatically.

### 3. Test Material System Variables

Create a test component:

```typescript
@Component({
  selector: 'app-theme-test',
  template: `
    <div class="p-8 space-y-4">
      <div class="p-4" style="background-color: var(--mat-sys-primary); color: var(--mat-sys-on-primary);">
        Primary
      </div>
      <div class="p-4" style="background-color: var(--mat-sys-surface); color: var(--mat-sys-on-surface);">
        Surface
      </div>
      <div class="p-4" style="background-color: var(--mat-sys-error); color: var(--mat-sys-on-error);">
        Error
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule],
})
export class ThemeTestComponent {}
```

Toggle dark mode to verify Material system variables change correctly.

---

## Troubleshooting

### Colors not changing in dark mode

**Check:**
- Is the `.dark` class applied to `<html>` element?
- Are you using `--mat-sys-*` variables (not custom variables)?
- Is `html.dark body` selector defined in `styles.scss`?
- Check DevTools to confirm `.dark` class is present on `<html>`

### Tailwind utilities not working

**Check:**
- Is `@import './tailwind.css';` imported in `styles.scss`?
- Is `tailwind.css` present in the `src/` folder with `@import 'tailwindcss'`?
- Is component using `[ngClass]` or `class` binding correctly?

### Material components unstyled

**Check:**
- Are Material modules imported in component `imports`?
- Is `styles.scss` imported in `angular.json` under `styles` array?
- Are Material icons configured in `index.html`?
- Is `mat.theme()` mixin applied in `styles.scss`?

### Material system variables not available

**Check:**
- Is `@use '@angular/material' as mat;` at top of `styles.scss`?
- Is `@include mat.theme(...)` applied to `html` selector?
- Are you using correct variable names (`--mat-sys-*`)?
- Check browser DevTools Computed styles to see available variables

---

## Further Reading

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Angular Material Theming](https://material.angular.io/guide/theming)
- [CSS Custom Properties (CSS Variables)](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)

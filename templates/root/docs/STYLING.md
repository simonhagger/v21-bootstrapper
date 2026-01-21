# Styling Guide

Styling with Angular Material 21 and Tailwind CSS 4 integrated together.

## Overview

This project uses both **Angular Material** for component theming and **Tailwind CSS** for utility-first styling. They work together to provide both beautiful default styling and fine-grained layout control.

- **Angular Material**: Component theming, typography, color system
- **Tailwind CSS**: Layout, spacing, responsive design, utilities

## Material Theming

### Default Theme

Angular Material 3 is configured with a default theme in `src/theme.scss`:

```scss
@use '@angular/material' as mat;

$theme: mat.define-theme((
  color: (
    theme-type: light,
    primary: mat.$indigo-palette,
    secondary: mat.$blue-palette,
    tertiary: mat.$purple-palette,
  ),
  typography: mat.define-typography-config(),
  density: 0,
));

html {
  color-scheme: light;
  @include mat.all-component-themes($theme);
  @include mat.system-level-colors($theme);
  @include mat.system-typography($theme);
}
```

### Adding Dark Mode

To add dark mode support, define a second theme:

```scss
// Light theme (default)
html {
  color-scheme: light;
  @include mat.all-component-themes($light-theme);
}

// Dark theme
html.dark-mode {
  color-scheme: dark;
  @include mat.all-component-themes($dark-theme);
}
```

Then toggle in your component:

```typescript
@Component({
  // ...
})
export class AppComponent {
  toggleDarkMode() {
    document.documentElement.classList.toggle('dark-mode');
  }
}
```

### Changing Color Palettes

Update the palette definitions in `src/theme.scss`:

```scss
$theme: mat.define-theme((
  color: (
    theme-type: light,
    primary: mat.$teal-palette,      // Change primary
    secondary: mat.$cyan-palette,    // Change secondary
    tertiary: mat.$orange-palette,   // Change tertiary
  ),
));
```

Available palettes: `$red`, `$pink`, `$purple`, `$deep-purple`, `$indigo`, `$blue`, `$light-blue`, `$cyan`, `$teal`, `$green`, `$light-green`, `$lime`, `$yellow`, `$amber`, `$orange`, `$deep-orange`, `$brown`, `$gray`, `$blue-gray`

### Design Tokens

Material 3 provides CSS variables for theming:

```css
/* Color tokens */
--md-sys-color-primary
--md-sys-color-secondary
--md-sys-color-tertiary
--md-sys-color-surface
--md-sys-color-on-surface
--md-sys-color-error

/* Shape tokens */
--md-sys-shape-corner-none
--md-sys-shape-corner-small
--md-sys-shape-corner-medium
--md-sys-shape-corner-large
```

Use in your styles:

```scss
.card {
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  border-radius: var(--md-sys-shape-corner-medium);
}
```

## Tailwind CSS

### Configuration

Tailwind v4 is configured in `tailwind.config.ts` for content detection:

```typescript
export default {
  content: [
    './src/**/*.{ts,html}',
    './src/**/*.component.ts',
  ],
};
```

### Input File

Customize Tailwind in `src/tailwind.input.css`:

```css
@import 'tailwindcss';

@layer base {
  /* Custom base styles */
}

@layer components {
  /* Custom component styles */
  .btn-custom {
    @apply px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600;
  }
}

@layer utilities {
  /* Custom utilities */
  .text-shadow {
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  }
}
```

### Common Utilities

```html
<!-- Layout -->
<div class="flex gap-4 p-6">

<!-- Spacing -->
<div class="mt-4 mb-2 px-6 py-4">

<!-- Colors -->
<div class="bg-blue-500 text-white">

<!-- Typography -->
<p class="text-lg font-semibold text-gray-700">

<!-- Responsive -->
<div class="w-full md:w-1/2 lg:w-1/3">

<!-- Hover/Focus -->
<button class="bg-blue-500 hover:bg-blue-600 focus:ring-2">
```

## Using Material Components with Tailwind

Material components provide behavior and theming; Tailwind provides layout:

### Example: Form Layout

```html
<!-- ✅ Good - Material controls + Tailwind layout -->
<div class="flex flex-col gap-4 p-6">
  <mat-form-field>
    <mat-label>Name</mat-label>
    <input matInput placeholder="Enter name" />
  </mat-form-field>

  <mat-form-field>
    <mat-label>Email</mat-label>
    <input matInput type="email" />
  </mat-form-field>

  <div class="flex gap-2">
    <button mat-raised-button color="primary">Submit</button>
    <button mat-button>Cancel</button>
  </div>
</div>
```

### Example: Card Layout

```html
<!-- ✅ Good - Material card + Tailwind spacing -->
<mat-card class="max-w-2xl mx-auto p-6">
  <mat-card-header class="mb-4">
    <mat-card-title class="text-xl font-bold">Card Title</mat-card-title>
  </mat-card-header>
  <mat-card-content class="space-y-4">
    <!-- Content -->
  </mat-card-content>
  <mat-card-actions class="flex gap-2 justify-end pt-4">
    <button mat-button>Action 1</button>
    <button mat-raised-button color="primary">Action 2</button>
  </mat-card-actions>
</mat-card>
```

## Best Practices

### ✅ Do This

- **Use Material components** for form fields, buttons, menus, dialogs
- **Use Tailwind utilities** for layout, spacing, alignment
- **Use design tokens** from Material for colors and shapes
- **Keep component styles scoped** with ViewEncapsulation
- **Use Tailwind plugins** for custom utilities

### ❌ Avoid This

```typescript
// ❌ Don't override Material component internals
<button mat-raised-button 
  class="!bg-red-500 !text-white"
  [style.padding.px]="16">
  Don't do this
</button>

// ✅ Instead use Material's theming
<button mat-raised-button color="warn">
  Use Material's color system
</button>
```

```scss
// ❌ Don't hardcode colors
.card {
  background: #ffffff;
  color: #000000;
  border-color: #e0e0e0;
}

// ✅ Use design tokens and Tailwind
.card {
  @apply bg-white text-black border border-gray-200;
  // Or use Material tokens
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
}
```

### Component-Scoped Styles

Keep component styles encapsulated:

```typescript
@Component({
  selector: 'app-dashboard',
  standalone: true,
  styles: [`
    .dashboard {
      @apply flex flex-col gap-6 p-6;
    }
    .card {
      @apply rounded-lg shadow;
    }
  `],
  template: `
    <div class="dashboard">
      <mat-card class="card">...</mat-card>
    </div>
  `,
})
export class DashboardComponent {}
```

### Global Styles

Keep global styles minimal:

```scss
// src/styles.scss - Global styles only
html, body {
  margin: 0;
  padding: 0;
  font-family: var(--md-sys-typescale-body-font-family);
}

// Wrap text with Material typography
body {
  @include mat.typography-level(body-medium);
}
```

## Extending Tailwind

### Custom Colors

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f8fafc',
          500: '#0066cc',
          900: '#001a4d',
        },
      },
    },
  },
};
```

Then use:

```html
<div class="bg-brand-500 text-brand-50">Custom brand color</div>
```

### Custom Utilities

```css
/* src/tailwind.input.css */
@layer utilities {
  .text-shadow {
    @apply [text-shadow:_2px_2px_4px_rgba(0,0,0,0.1)];
  }

  .highlight {
    @apply bg-yellow-200 px-1 rounded;
  }
}
```

## Typography

Material provides typography scales. Use them:

```typescript
// In your component styles
@use '@angular/material' as mat;

:host {
  @include mat.typography-level(body-medium);
}
```

Or apply via classes:

```html
<h1 class="mat-headline-medium">Main Heading</h1>
<h2 class="mat-title-large">Section Heading</h2>
<p class="mat-body-medium">Body text</p>
```

Available typography levels:
- `display-large`, `display-medium`, `display-small`
- `headline-large`, `headline-medium`, `headline-small`
- `title-large`, `title-medium`, `title-small`
- `body-large`, `body-medium`, `body-small`
- `label-large`, `label-medium`, `label-small`

## Responsive Design

Use Tailwind's responsive prefixes:

```html
<!-- Adapts to screen size -->
<div class="
  w-full
  md:w-1/2
  lg:w-1/3
  xl:w-1/4
  p-4 md:p-6 lg:p-8
">
  Responsive layout
</div>
```

Breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px), `2xl` (1536px)

## Resources

- [Material Design 3](https://m3.material.io)
- [Angular Material](https://material.angular.io)
- [Tailwind CSS](https://tailwindcss.com)
- [Material Color Tool](https://material-foundation.github.io/material-theme-builder)

# Styling Guide

Styling with Angular Material and Tailwind CSS v4 integrated together.

## Overview

This project uses both **Angular Material** for component theming and **Tailwind CSS v4** for utility-first styling. They work together to provide both beautiful default styling and fine-grained layout control.

- **Angular Material**: Component theming via `mat.theme()`, Material 3 design system
- **Tailwind CSS v4**: Layout, spacing, responsive design, utility classes, custom design tokens

## Material Theming

### Default Theme

Angular Material is configured with a default theme in `src/styles.scss` using the modern `mat.theme()` API:

```scss
@use '@angular/material' as mat;

html {
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

body {
  color-scheme: light; // or 'dark' or 'light dark'
}
```

### Adding Dark Mode

To add dark mode support, you can change the `color-scheme` property:

```scss
body {
  color-scheme: light dark; // Defers to user's system settings
  // or
  color-scheme: dark; // Force dark mode
}
```

Or toggle programmatically in your component:

```typescript
@Component({
  // ...
})
export class AppComponent {
  toggleDarkMode() {
    const body = document.body;
    const currentScheme = body.style.colorScheme;
    body.style.colorScheme = currentScheme === 'dark' ? 'light' : 'dark';
  }
}
```

### Changing Color Palettes

Update the palette definitions in `src/styles.scss`:

```scss
html {
  @include mat.theme(
    (
      color: (
        primary: mat.$teal-palette,      // Change primary
        tertiary: mat.$orange-palette,   // Change tertiary
      ),
      typography: Roboto,
      density: 0,
    )
  );
}
```

Available palettes: `$red`, `$pink`, `$purple`, `$deep-purple`, `$indigo`, `$blue`, `$light-blue`, `$cyan`, `$teal`, `$green`, `$light-green`, `$lime`, `$yellow`, `$amber`, `$orange`, `$deep-orange`, `$brown`, `$gray`, `$blue-gray`, `$azure`

### Integrating Tailwind Design Tokens with Material

You can override Angular Material's theme with Tailwind v4 design tokens using `mat.theme-overrides()`:

**Step 1:** Define custom design tokens in `src/tailwind.css`:

```css
@import 'tailwindcss';

@theme {
  /* Custom brand colors as Tailwind tokens */
  --color-brand: oklch(0.72 0.11 178);
  --color-brand-contrast: white;
  --color-accent: oklch(0.65 0.15 285);
  --color-accent-contrast: white;
}
```

**Step 2:** Override Material theme in `src/styles.scss`:

```scss
@use '@angular/material' as mat;

:root {
  @include mat.theme-overrides((
    primary: var(--color-brand),
    on-primary: var(--color-brand-contrast),
    tertiary: var(--color-accent),
    on-tertiary: var(--color-accent-contrast),
  ));
}
```

This approach lets you define colors in Tailwind and use them consistently across both Material components and Tailwind utilities:

```html
<!-- Material button uses overridden theme -->
<button mat-raised-button color="primary">Brand Button</button>

<!-- Tailwind utility uses same token -->
<div class="bg-[var(--color-brand)] text-[var(--color-brand-contrast)]">
  Matching brand color
</div>
```

## Tailwind CSS v4

### Configuration

Tailwind v4 uses `src/tailwind.css` as the entry point:

```css
@import 'tailwindcss';

@theme {
  /* Custom design tokens */
  --color-brand: oklch(0.72 0.11 178);
  --spacing-card: 1.5rem;
}
```

The CSS file is imported in `src/styles.scss` and automatically detects all template files.

### Custom Layers

Customize Tailwind in `src/tailwind.css`:

```css
@import 'tailwindcss';

@layer base {
  /* Custom base styles */
  body {
    @apply antialiased;
  }
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

// ✅ Use Tailwind utilities
.card {
  @apply bg-white text-black border border-gray-200;
}

// ✅ Or use custom Tailwind design tokens
.card {
  background: var(--color-surface);
  color: var(--color-on-surface);
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

Keep global styles minimal in `src/styles.scss`:

```scss
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

body {
  font-family: Roboto, sans-serif;
}
```

## Extending Tailwind

### Custom Design Tokens

Define custom tokens in `src/tailwind.css` using the `@theme` directive:

```css
@import 'tailwindcss';

@theme {
  /* Brand colors */
  --color-brand-50: oklch(0.98 0.02 178);
  --color-brand-500: oklch(0.72 0.11 178);
  --color-brand-900: oklch(0.32 0.09 178);
  
  /* Spacing scale */
  --spacing-card: 1.5rem;
  --spacing-section: 3rem;
  
  /* Custom radius */
  --radius-card: 0.75rem;
}
```

Then use in templates and styles:

```html
<div class="bg-[var(--color-brand-500)] text-white p-[var(--spacing-card)] rounded-[var(--radius-card)]">
  Custom brand card
</div>
```

### Custom Utilities

Add custom utilities in `src/tailwind.css`:

```css
@import 'tailwindcss';

@layer utilities {
  .text-shadow {
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  }

  .highlight {
    @apply bg-yellow-200 px-1 rounded;
  }
  
  .glass-effect {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
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

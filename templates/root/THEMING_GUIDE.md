## Theming Guide

This scaffold ships with Angular Material and Tailwind v4 without a token-generation pipeline. Keep styling simple and explicit.

### Material theme
Use the built-in palettes in `src/theme.scss`:

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

To add dark mode, define a second theme and scope it under `.dark` on `html`.

### Tailwind
- Edit `src/tailwind.input.css` for any base/components/utilities.
- Precompile once: `npx tailwindcss -i src/tailwind.input.css -o src/tailwind.gen.css --minify`.
- `tailwind.config.ts` is included for content globs and customization.

### Best practices
- Prefer component-scoped styles; keep globals light.
- Avoid mixing Tailwind tokens and Material tokens—treat them as separate layers.
- Introduce design tokens later only if you have a clear need.

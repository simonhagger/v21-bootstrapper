# Shared

The `shared` directory contains reusable layout and page-level components shared across features.

## Structure

```
shared/
├── pages/   # Full-page components (e.g., 404, error)
└── layout/  # Layout primitives (headers, footers, shells)
```

## Guidance

- Use `shared/pages` and `shared/layout` for UI reused across features.
- Keep feature-specific services/state/data inside each feature.
- Avoid creating cross-feature services; prefer composition in pages and layouts.
  Only add shared UI that benefits multiple features; keep business logic within features.
  For core services (theme, config), use the `core` library in `projects/core/`.

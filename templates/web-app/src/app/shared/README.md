# Shared

The `shared` directory contains components and utilities shared across features.

## Structure

```
shared/
├── pages/          # Full-page components (404, error, etc)
├── components/     # Reusable components within the app
├── directives/     # Reusable directives
├── pipes/          # Reusable pipes
└── services/       # App-level services (not feature-scoped)
```

## Notes

For reusable UI components, use the `ui` library in `projects/ui/`.
For core services (theme, config), use the `core` library in `projects/core/`.

Only use `shared/` for app-specific, non-generic utilities.

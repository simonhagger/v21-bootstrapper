# Features

Features are vertical slices of functionality using route-first architecture.

## Creating a Feature

Use the feature generator:

```bash
pnpm gen:feature FeatureName --route route-path
```

## Structure

Each feature has:

```
features/
├── feature-name/
│   ├── routes.ts                 # Feature routes
│   ├── index.ts                  # Feature barrel export
│   ├── components/               # Feature-scoped components
│   ├── services/                 # Feature-scoped services
│   └── pages/                    # Feature pages
```

## Architecture Rules

1. **Route-First**: Define routes first, then build pages/components
2. **Vertical Slice**: Each feature owns its routes, components, and services
3. **Feature-Scoped**: Services and components stay within the feature
4. **Shared Imports**: Only import from `core`, `ui`, `shell`, `tokens` libraries
5. **No Cross-Feature Imports**: Features cannot import from other features

See `tools/scripts/verify-no-cross-feature-imports.mjs` for enforcement.

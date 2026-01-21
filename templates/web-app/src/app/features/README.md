# Features

Features are vertical slices of functionality using a route-first, flat-file architecture.

## Creating a Feature

Generate a new feature:

```bash
pnpm gen:feature FeatureName --route route-path
```

Optionally register the route automatically:

```bash
pnpm gen:feature FeatureName --route route-path --register
```

## Structure

Each feature is a self-contained slice with these files:

```
features/
└── feature-name/
	├── feature-name.routes.ts   # Route definition and providers
	├── feature-name.page.ts     # Routed component
	├── feature-name.data.ts     # Data access (HTTP boundary)
	├── feature-name.state.ts    # State management
	├── feature-name.models.ts   # Types and interfaces
	└── README.md                # Feature documentation
```

## Architecture Rules

- **Route-first**: Define routes/providers first, then build pages/state/data
- **Vertical slice**: A feature owns its routes, page, state, data, and models
- **No cross-feature imports**: Do not import code from other features
- **Shared usage**: Only import from `src/app/shared/` for shared pages/layout
- **HTTP boundary**: Use `*.data.ts` for all HTTP calls; provide services in `*.routes.ts`

See `tools/scripts/verify-no-cross-feature-imports.mjs` and `tools/scripts/verify-feature-routes.mjs` for enforcement.

# Home Feature

Landing page feature demonstrating Material Design components with M3 tokens and Tailwind CSS utilities.

## Feature Structure

Every feature is a **vertical slice** with these files:

- `home.routes.ts` - Route definition and dependency injection
- `home.page.ts` - Routed component
- `home.data.ts` - Data access (HTTP boundary)
- `home.state.ts` - State management and store
- `home.models.ts` - TypeScript types and interfaces
- `README.md` - Feature documentation

## Demonstrates

- Material Cards, Buttons, Inputs, Chips
- M3 design token inheritance
- Tailwind utility classes for layout and spacing
- Responsive grid layouts
- Theme-aware styling

## Feature Rules

✓ This feature must not be imported by other features  
✓ Use only `src/app/shared/` components across features  
✓ All HTTP calls must go through `*.data.ts` files  
✓ Route-scoped providers are declared in `*.routes.ts`

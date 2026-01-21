# Token Mappings

This directory contains **human-maintained mappings** that bridge M3 design tokens to various framework-specific token systems.

## Purpose

Mapping files define the contract between:

- **Material Design 3** system tokens (`--md-sys-*`) - our single source of truth
- **Framework-specific tokens** - Tailwind utilities, Material Angular system tokens, etc.

Each mapping type generates a corresponding CSS output that references M3 tokens via CSS variables.

## Files

- `types.ts` - TypeScript types for mapping structure
- `index.ts` - Exports all mappings + `getMappingFor()` helper
- `colors.ts` - Tailwind color utility mappings (semantic colors only)
- `material.ts` - Material Angular `--mat-sys-*` system token mappings
- `radii.ts` - Tailwind border radius mappings

## Mapping Types

### Tailwind Mappings (colors.ts, radii.ts)

Maps Tailwind utility variables to M3 tokens:

```typescript
{
  'color-primary': '--md-sys-color-primary',
  // Generates: --color-primary: var(--md-sys-color-primary);
  // Used by: bg-primary, text-primary, border-primary
}
```

### Material Angular Mapping (material.ts)

Maps Material Angular system tokens to M3 tokens:

```typescript
{
  'mat-sys-primary': '--md-sys-color-primary',
  // Generates: --mat-sys-primary: var(--md-sys-color-primary);
  // Used by: Material components internally
}
```

## Maintenance Rules

### DO:

- Map only **semantic system tokens** (primary, surface, error, etc.)
- Keep mappings stable across Material/Tailwind updates
- Document intent/constraints in the `description` field
- Validate both light and dark themes have all referenced M3 tokens
- Use consistent naming that matches framework conventions

### DON'T:

- Map tonal palettes (Material manages these internally)
- Map component-specific tokens (use semantic slots instead)
- Map state-layer tokens directly
- Create utilities that override component internals
- Duplicate variable names across different mapping types

## Usage

The `getMappingFor()` function is used by the token generator:

```ts
import { getMappingFor } from '../mappings';

// Get all mappings
const all = getMappingFor();

// Get specific types
const colorMappings = getMappingFor('colors');
const materialMappings = getMappingFor('material');
const shapeMappings = getMappingFor(['radii', 'material']);
```

## Adding New Mappings

### New Token to Existing Mapping

1. Open the mapping file (e.g., `material.ts`)
2. Add entry: `'framework-var': '--md-sys-color-your-token'`
3. Ensure `--md-sys-color-your-token` exists in both `source/tokens.light.json` and `source/tokens.dark.json`
4. Run `pnpm tokens:build` to regenerate (will fail if token missing)
5. Validate with `pnpm verify:tokens`

### New Mapping Type (New Framework)

1. Create new file (e.g., `bootstrap.ts`)
2. Export a `MappingGroup`:
   ```typescript
   export const bootstrap: MappingGroup = {
     type: 'bootstrap',
     description: 'Bootstrap CSS variables mapped to M3 tokens',
     map: {
       'bs-primary': '--md-sys-color-primary',
       'bs-secondary': '--md-sys-color-secondary',
     },
   };
   ```
3. Add type to `MappingType` union in `types.ts`:
   ```typescript
   export type MappingType = 'colors' | 'material' | 'radii' | 'bootstrap';
   ```
4. Add to `ALL_MAPPINGS` array in `index.ts`:

   ```typescript
   import { bootstrap } from './bootstrap';

   export const ALL_MAPPINGS: readonly MappingGroup[] = [
     colors,
     material,
     radii,
     bootstrap, // Add here
   ];
   ```

5. Add writer function in `generators/css-writers.ts` if custom format needed
6. Call writer in `generators/build-tokens.ts`
7. Run `pnpm tokens:build` to generate output

## Validation

The build process validates:

- All M3 token references exist in **both** light and dark themes
- No duplicate variable names across all mappings (if using `assertNoDuplicateTailwindVars`)
- Proper M3 token format (`--md-sys-*` prefix)

## Output

Each mapping type generates CSS in `projects/tokens/dist/`:

- **Tailwind mappings** → `tailwind.theme.css` (combined colors + radii + others)
- **Material mapping** → `material.system.css`
- Future framework mappings → their own CSS files

All outputs reference the same M3 token values, ensuring visual consistency across frameworks.

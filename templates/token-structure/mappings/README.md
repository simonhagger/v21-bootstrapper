# Token Mappings

This directory contains **human-maintained mappings** between Tailwind utility names and M3 system tokens.

## Purpose

The mapping files define the bridge contract between:

- **Material Design 3** system tokens (`--md-sys-*`)
- **Tailwind v4** theme variables (used to generate utilities)

## Files

- `types.ts` - TypeScript types for mapping structure
- `colors.ts` - Color token mappings (semantic colors only)
- `radii.ts` - Shape/border radius mappings
- `index.ts` - Exports all mappings + `getMappingFor()` helper

## Maintenance Rules

### DO:

- Map only **semantic system tokens** (primary, surface, error, etc.)
- Keep mappings stable across Material updates
- Document intent/constraints in the `description` field
- Validate both light and dark themes have all referenced tokens

### DON'T:

- Map tonal palettes (Material manages these internally)
- Map component-specific tokens
- Map state-layer tokens
- Create Tailwind utilities that override Material component internals

## Usage

The `getMappingFor()` function is used by the token generator:

```ts
import { getMappingFor } from "../mappings";

// Get all mappings
const all = getMappingFor();

// Get specific types
const colorMappings = getMappingFor("colors");
const shapeMappings = getMappingFor(["radii", "elevation"]);
```

## Adding New Mappings

1. Create a new file (e.g., `typography.ts`)
2. Export a `MappingGroup` with type + map
3. Add to `ALL_MAPPINGS` array in `index.ts`
4. Run `pnpm tokens:build` to regenerate outputs
5. Validate with `pnpm verify:tokens`

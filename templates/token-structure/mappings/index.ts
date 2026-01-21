import type { MappingGroup, MappingType } from './types';
import { colors } from './colors';
import { radii } from './radii';

export type { MappingGroup, MappingType };

export const ALL_MAPPINGS: readonly MappingGroup[] = [
  colors,
  radii,
  // Add typography, elevation, spacing as needed...
] as const;

/**
 * Optional: enforce uniqueness of keys across groups if you prefer.
 */
export function assertNoDuplicateTailwindVars(groups: readonly MappingGroup[]) {
  const seen = new Set<string>();
  for (const g of groups) {
    for (const key of Object.keys(g.map)) {
      if (seen.has(key)) {
        throw new Error(`Duplicate Tailwind var key detected: "${key}"`);
      }
      seen.add(key);
    }
  }
}

/**
 * getMappingFor() - returns mapping groups for one or more top-level types.
 * If omitted, returns all mapping groups.
 */
export function getMappingFor(types?: MappingType | MappingType[]): MappingGroup[] {
  if (!types) return [...ALL_MAPPINGS];
  const want = new Set(Array.isArray(types) ? types : [types]);
  return ALL_MAPPINGS.filter((g) => want.has(g.type));
}

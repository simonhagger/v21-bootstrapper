import * as fs from 'node:fs';
import * as path from 'node:path';

export type FlatTokenMap = Record<string, string | number>;

/**
 * Material Theme Builder JSON format
 * See: https://www.figma.com/community/plugin/1034969338659738588/material-theme-builder
 */
export interface MaterialThemeBuilderJSON {
  description: string;
  seed: string;
  coreColors: Record<string, string>;
  extendedColors?: Array<{
    name: string;
    color: string;
    description?: string;
    harmonized?: boolean;
  }>;
  schemes: Record<string, Record<string, string>>;
  palettes: Record<string, Record<string, string>>;
  shapes?: Record<string, string>;
}

export function readJson<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw) as T;
}

/**
 * Ensure keys look like CSS custom properties.
 */
export function normalizeFlatTokens(input: unknown): FlatTokenMap {
  if (!input || typeof input !== 'object') {
    throw new Error('Token JSON must be an object at the top level.');
  }
  const out: FlatTokenMap = {};
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (!k.startsWith('--')) {
      throw new Error(`Token key "${k}" must start with "--" (CSS variable).`);
    }
    if (typeof v !== 'string' && typeof v !== 'number') {
      throw new Error(`Token "${k}" value must be string/number.`);
    }
    out[k] = v;
  }
  return out;
}

/**
 * Convert Material Theme Builder scheme to M3 CSS variable format.
 *
 * Scheme format: { "primary": "#31628D", "onPrimary": "#FFFFFF", ... }
 * M3 format: { "--md-sys-color-primary": "#31628D", "--md-sys-color-on-primary": "#FFFFFF", ... }
 */
function schemeToM3Vars(scheme: Record<string, string>): FlatTokenMap {
  const m3Vars: FlatTokenMap = {};

  for (const [key, value] of Object.entries(scheme)) {
    // camelCase → kebab-case
    const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    const m3Key = `--md-sys-color-${kebabKey}`;
    m3Vars[m3Key] = value;
  }

  return m3Vars;
}

/**
 * Read Material Theme Builder JSON and extract theme tokens."--md-sys-shape-corner-medium": "12px", ... }
 */
export function readThemeTokens(scheme: 'light' | 'dark'): FlatTokenMap {
  const filePath = path.resolve(process.cwd(), 'projects/tokens/src/source', 'material-theme.json');

  const themeBuilder = readJson<MaterialThemeBuilderJSON>(filePath);

  // Use "light" or "dark" scheme from the builder
  const schemeData = themeBuilder.schemes[scheme];
  if (!schemeData) {
    throw new Error(
      `Scheme "${scheme}" not found in material-theme.json. ` +
        `Available: ${Object.keys(themeBuilder.schemes).join(', ')}`,
    );
  }

  const colorTokens = schemeToM3Vars(schemeData);

  // Add shape tokens from the shapes section (these are the same for all schemes)
  const shapeTokens: FlatTokenMap = {};
  if (themeBuilder.shapes) {
    for (const [key, value] of Object.entries(themeBuilder.shapes)) {
      const m3Key = `--md-sys-shape-${key}`;
      shapeTokens[m3Key] = value;
    }
  }

  return { ...colorTokens, ...shapeTokens };
}

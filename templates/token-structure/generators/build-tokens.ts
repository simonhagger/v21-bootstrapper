import * as fs from 'node:fs';
import * as path from 'node:path';

import { readThemeTokens } from './token-io';
import {
  writeScopedVarsCss,
  writeTailwindThemeCss,
  writeThemesCss,
  writeMaterialSystemCss,
} from './css-writers';

import { getMappingFor, assertNoDuplicateTailwindVars, type MappingType } from '../mappings';

/**
 * Ensure every referenced M3 var exists in *both* themes.
 * This prevents "works in light, breaks in dark" drift.
 */
function validateMappingsAgainstThemes(params: {
  mappings: ReturnType<typeof getMappingFor>;
  light: Record<string, string | number>;
  dark: Record<string, string | number>;
}) {
  const { mappings, light, dark } = params;

  const missing: string[] = [];

  for (const group of mappings) {
    for (const [twVar, m3Var] of Object.entries(group.map)) {
      const inLight = Object.prototype.hasOwnProperty.call(light, m3Var);
      const inDark = Object.prototype.hasOwnProperty.call(dark, m3Var);
      if (!inLight || !inDark) {
        missing.push(`${group.type}: --${twVar} -> ${m3Var} (light=${inLight}, dark=${inDark})`);
      }
    }
  }

  if (missing.length) {
    const msg =
      `Token mapping validation failed. Missing M3 vars:\n` +
      missing.map((m) => `  - ${m}`).join('\n');
    throw new Error(msg);
  }
}

/**
 * CLI args:
 *   node build-tokens.ts
 *   node build-tokens.ts --only colors
 *   node build-tokens.ts --only colors,radii
 */
function parseOnlyArg(): MappingType[] | undefined {
  const onlyIndex = process.argv.findIndex((a) => a === '--only');
  if (onlyIndex === -1) return undefined;
  const raw = process.argv[onlyIndex + 1];
  if (!raw) throw new Error(`--only requires a value, e.g. "--only colors,radii"`);

  const parts = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return parts as MappingType[];
}

function ensureDistDir(distDir: string) {
  fs.mkdirSync(distDir, { recursive: true });
}

function writeFile(distDir: string, fileName: string, content: string) {
  fs.writeFileSync(path.join(distDir, fileName), content, 'utf8');
}

function main() {
  const only = parseOnlyArg(); // optional narrowing by mapping type
  const mappings = getMappingFor(only);

  // If you want to enforce uniqueness of Tailwind vars across groups:
  assertNoDuplicateTailwindVars(mappings);

  const light = readThemeTokens('light');
  const dark = readThemeTokens('dark');

  validateMappingsAgainstThemes({ mappings, light, dark });

  const distDir = path.resolve(process.cwd(), 'projects/tokens/dist');
  ensureDistDir(distDir);

  // themes.css
  writeFile(distDir, 'themes.css', writeThemesCss());

  // m3.css (scoped vars)
  writeFile(
    distDir,
    'm3.css',
    writeScopedVarsCss([
      { selector: '.theme-light', tokens: light },
      { selector: '.theme-dark', tokens: dark },
    ]),
  );

  // tailwind.theme.css (narrowed by mapping types if --only used)
  writeFile(distDir, 'tailwind.theme.css', writeTailwindThemeCss(mappings));

  // material.system.css (Material Angular system token overrides)
  writeFile(distDir, 'material.system.css', writeMaterialSystemCss(mappings));

  // optional README / manifest for debugging
  writeFile(
    distDir,
    'manifest.json',
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        mappingTypes: mappings.map((m) => m.type),
        mappingVarsCount: mappings.reduce((acc, g) => acc + Object.keys(g.map).length, 0),
      },
      null,
      2,
    ),
  );

  console.log(
    `Generated tokens to ${distDir}\n` +
      `- themes.css\n- m3.css\n- tailwind.theme.css\n- material.system.css\n` +
      `Mapping types: ${mappings.map((m) => m.type).join(', ')}`,
  );
}

main();

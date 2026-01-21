import type { FlatTokenMap } from './token-io';
import type { MappingGroup } from '../mappings/types';

export function writeThemesCss(): string {
  return [`.theme-light { color-scheme: light; }`, `.theme-dark { color-scheme: dark; }`, ``].join(
    '\n',
  );
}

export function writeScopedVarsCss(scopes: { selector: string; tokens: FlatTokenMap }[]): string {
  const lines: string[] = [];
  
  // First scope is the default (use :root)
  if (scopes.length > 0) {
    const { tokens: defaultTokens } = scopes[0];
    lines.push(`:root {`);
    for (const [key, value] of Object.entries(defaultTokens)) {
      lines.push(`  ${key}: ${String(value)};`);
    }
    lines.push(`}`);
    lines.push(``);
  }

  // Remaining scopes use their specified selectors (prefixed with html.)
  for (let i = 1; i < scopes.length; i++) {
    const { selector, tokens } = scopes[i];
    // Transform '.theme-light' to 'html.light-theme', '.theme-dark' to 'html.dark-theme'
    const themeClass = selector.replace('.theme-', '').replace('-', '-');
    const htmlSelector = `html.${themeClass}-theme`;
    
    lines.push(`${htmlSelector} {`);
    for (const [key, value] of Object.entries(tokens)) {
      lines.push(`  ${key}: ${String(value)};`);
    }
    lines.push(`}`);
    lines.push(``);
  }
  return lines.join('\n');
}

/**
 * Writes Material Angular system token overrides.
 * Each --mat-sys-* var references our M3 --md-sys-color-* var.
 * This allows Material components to use our M3 theme without Sass compilation.
 */
export function writeMaterialSystemCss(groups: MappingGroup[]): string {
  const materialGroup = groups.find((g) => g.type === 'material');
  if (!materialGroup) {
    return '/* No material mapping found */\n';
  }

  const lines: string[] = [];
  lines.push(`/**`);
  lines.push(` * Material Angular System Token Overrides`);
  lines.push(` * `);
  lines.push(` * Redefines Material's --mat-sys-* CSS variables to use our M3 design tokens.`);
  lines.push(` * Material components will automatically pick up these values.`);
  lines.push(` * `);
  lines.push(` * This file should be included in your global styles before Material components.`);
  lines.push(` * `);
  lines.push(` * Generated from: templates/token-structure/mappings/material.ts`);
  lines.push(` */`);
  lines.push(``);

  // Light theme overrides (applied to :root by default)
  lines.push(`:root {`);
  for (const [matVar, m3Var] of Object.entries(materialGroup.map)) {
    lines.push(`  --${matVar}: var(${m3Var});`);
  }
  lines.push(`}`);
  lines.push(``);

  // Dark theme overrides (only override in dark theme)
  lines.push(`html.dark-theme {`);
  for (const [matVar, m3Var] of Object.entries(materialGroup.map)) {
    lines.push(`  --${matVar}: var(${m3Var});`);
  }
  lines.push(`}`);
  lines.push(``);

  return lines.join('\n');
}

/**
 * Writes Tailwind v4 @theme vars. Each Tailwind var references an M3 var:
 *   --color-primary: var(--md-sys-color-primary);
 */
export function writeTailwindThemeCss(groups: MappingGroup[]): string {
  const lines: string[] = [];
  lines.push(`@theme {`);

  for (const group of groups) {
    if (group.description) {
      lines.push(`  /* ${group.type}: ${group.description} */`);
    } else {
      lines.push(`  /* ${group.type} */`);
    }

    for (const [twVar, m3Var] of Object.entries(group.map)) {
      lines.push(`  --${twVar}: var(${m3Var});`);
    }
    lines.push(``);
  }

  lines.push(`}`);
  lines.push(``);
  return lines.join('\n');
}

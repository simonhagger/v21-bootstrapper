import type { FlatTokenMap } from "./token-io";
import type { MappingGroup } from "../mappings/types";

export function writeThemesCss(): string {
  return [`.theme-light { color-scheme: light; }`, `.theme-dark { color-scheme: dark; }`, ``].join("\n");
}

export function writeScopedVarsCss(scopes: { selector: string; tokens: FlatTokenMap }[]): string {
  const lines: string[] = [];
  for (const { selector, tokens } of scopes) {
    lines.push(`${selector} {`);
    for (const [key, value] of Object.entries(tokens)) {
      lines.push(`  ${key}: ${String(value)};`);
    }
    lines.push(`}`);
    lines.push(``);
  }
  return lines.join("\n");
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
  return lines.join("\n");
}

import * as fs from "node:fs";
import * as path from "node:path";

export type FlatTokenMap = Record<string, string | number>;

export function readJson<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw) as T;
}

/**
 * Ensure keys look like CSS custom properties.
 */
export function normalizeFlatTokens(input: unknown): FlatTokenMap {
  if (!input || typeof input !== "object") {
    throw new Error("Token JSON must be an object at the top level.");
  }
  const out: FlatTokenMap = {};
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (!k.startsWith("--")) {
      throw new Error(`Token key "${k}" must start with "--" (CSS variable).`);
    }
    if (typeof v !== "string" && typeof v !== "number") {
      throw new Error(`Token "${k}" value must be string/number.`);
    }
    out[k] = v;
  }
  return out;
}

export function readThemeTokens(theme: "light" | "dark"): FlatTokenMap {
  const filePath = path.resolve(process.cwd(), "projects/tokens/src/source", `tokens.${theme}.json`);
  const json = readJson<unknown>(filePath);
  return normalizeFlatTokens(json);
}

export type ThemeMode = "light" | "dark";

/**
 * Keep this list small and explicit. Add brands intentionally.
 * You can also make this a string union based on an env config later.
 */
export type ThemeBrand = "brandA" | "brandB";

export interface ThemeState {
  brand: ThemeBrand;
  mode: ThemeMode;
}

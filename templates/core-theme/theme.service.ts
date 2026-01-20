import { Injectable, Signal, computed, effect, inject, signal } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { THEME_STORAGE } from "./theme.storage";
import type { ThemeBrand, ThemeMode, ThemeState } from "./theme.types";

const STORAGE_KEY = "app.theme.v1";

function isThemeMode(x: unknown): x is ThemeMode {
  return x === "light" || x === "dark";
}

function isThemeBrand(x: unknown): x is ThemeBrand {
  return x === "brandA" || x === "brandB";
}

function safeParse(json: string | null): unknown {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

@Injectable({ providedIn: "root" })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);
  private readonly storage = inject(THEME_STORAGE);

  private readonly _state = signal<ThemeState>({
    brand: "brandA",
    mode: "light",
  });

  /** Expose as read-only */
  readonly state: Signal<ThemeState> = this._state.asReadonly();
  readonly brand = computed(() => this._state().brand);
  readonly mode = computed(() => this._state().mode);

  /**
   * If true, the service will follow prefers-color-scheme unless user explicitly set a mode.
   * Once user sets mode explicitly, this becomes false.
   */
  private readonly _followSystem = signal(true);
  readonly followSystem = this._followSystem.asReadonly();

  constructor() {
    this.hydrateFromStorage();
    this.applyToDocument(); // initial
    this.setupReactiveApply(); // future changes
    this.setupPrefersColorSchemeListener();
  }

  setBrand(brand: ThemeBrand) {
    const curr = this._state();
    if (curr.brand === brand) return;
    this._state.set({ ...curr, brand });
    this.persist();
  }

  setMode(mode: ThemeMode) {
    const curr = this._state();
    if (curr.mode === mode) return;
    this._state.set({ ...curr, mode });
    // user explicitly chose => stop following system
    this._followSystem.set(false);
    this.persist();
  }

  setFollowSystem(value: boolean) {
    this._followSystem.set(value);
    if (value) {
      const sys = this.getSystemMode();
      if (sys) this._state.set({ ...this._state(), mode: sys });
    }
    this.persist();
  }

  toggleMode() {
    this.setMode(this.mode() === "dark" ? "light" : "dark");
  }

  /** Applies theme classes to <html> */
  private applyToDocument() {
    const el = this.doc?.documentElement;
    if (!el) return;

    // Contract: exactly one brand class, exactly one mode class
    const brands: ThemeBrand[] = ["brandA", "brandB"];
    const modes: ThemeMode[] = ["light", "dark"];

    for (const b of brands) el.classList.remove(`theme-${b}`);
    for (const m of modes) el.classList.remove(`theme-${m}`);

    const s = this._state();
    el.classList.add(`theme-${s.brand}`, `theme-${s.mode}`);
  }

  private setupReactiveApply() {
    effect(() => {
      // re-apply whenever state changes
      this._state();
      this.applyToDocument();
    });
  }

  private hydrateFromStorage() {
    const raw = this.storage.getItem(STORAGE_KEY);
    const parsed = safeParse(raw);

    if (!parsed || typeof parsed !== "object") {
      // default to system mode if possible
      const sys = this.getSystemMode();
      if (sys) this._state.set({ ...this._state(), mode: sys });
      return;
    }

    const obj = parsed as Record<string, unknown>;
    const brand = obj["brand"];
    const mode = obj["mode"];
    const followSystem = obj["followSystem"];

    const next: ThemeState = {
      brand: isThemeBrand(brand) ? brand : "brandA",
      mode: isThemeMode(mode) ? mode : (this.getSystemMode() ?? "light"),
    };

    this._state.set(next);
    this._followSystem.set(typeof followSystem === "boolean" ? followSystem : true);

    // If follow system is enabled, sync mode to current system
    if (this._followSystem()) {
      const sys = this.getSystemMode();
      if (sys) this._state.set({ ...next, mode: sys });
    }
  }

  private persist() {
    const payload = {
      ...this._state(),
      followSystem: this._followSystem(),
    };
    this.storage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  private getSystemMode(): ThemeMode | null {
    const win = this.doc?.defaultView;
    if (!win || !win.matchMedia) return null;
    return win.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  private setupPrefersColorSchemeListener() {
    const win = this.doc?.defaultView;
    if (!win || !win.matchMedia) return;

    const mql = win.matchMedia("(prefers-color-scheme: dark)");

    const handler = () => {
      if (!this._followSystem()) return;
      this._state.set({ ...this._state(), mode: mql.matches ? "dark" : "light" });
      this.persist();
    };

    // Modern browsers
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", handler);
      return;
    }

    // Legacy fallback
    mql.addListener(handler);
  }
}

/* global localStorage */
import { Injectable, effect, signal } from '@angular/core';

type ColorScheme = 'light' | 'dark' | 'auto';

/**
 * Service for managing theme (light/dark mode)
 *
 * Usage:
 * - Constructor inject the service: `private theme = inject(ThemeService);`
 * - Get current theme: `this.theme.scheme()`
 * - Toggle theme: `this.theme.toggle()`
 * - Set theme: `this.theme.set('dark')`
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly STORAGE_KEY = 'app-color-scheme';
  private themeSource: 'localStorage' | 'browser-preference' = 'browser-preference';

  // Signal to track the current color scheme
  private schemeSignal = signal<ColorScheme>(this.loadScheme());

  // Public read-only signal
  readonly scheme = this.schemeSignal.asReadonly();

  constructor() {
    // Apply initial theme synchronously before first render
    this.applyTheme(this.schemeSignal());

    // Effect to update body.style.colorScheme whenever scheme changes
    effect(() => {
      const scheme = this.schemeSignal();
      this.applyTheme(scheme);
      this.saveScheme(scheme);
    });
  }

  /**
   * Apply theme by adding/removing dark class on html element
   * Both Tailwind and Material Angular recognize the 'dark' class for dark mode
   */
  private applyTheme(scheme: ColorScheme): void {
    const html = document.documentElement;

    if (scheme === 'dark') {
      html.classList.add('dark');
    } else if (scheme === 'light') {
      html.classList.remove('dark');
    } else {
      // Auto mode: check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
    }
  }

  /**
   * Set the color scheme
   * @param scheme - 'light', 'dark', or 'auto' (respects system preference)
   */
  set(scheme: ColorScheme): void {
    this.schemeSignal.set(scheme);
  }

  /**
   * Toggle between light and dark mode
   * Respects the actual current state (including browser preference when in 'auto')
   */
  toggle(): void {
    const isDark = this.isDark();
    this.set(isDark ? 'light' : 'dark');
  }

  /**
   * Check if dark mode is active
   */
  isDark(): boolean {
    const scheme = this.schemeSignal();
    if (scheme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return scheme === 'dark';
  }

  /**
   * Load stored scheme from localStorage
   */
  private loadScheme(): ColorScheme {
    if (typeof localStorage === 'undefined') {
      this.themeSource = 'browser-preference';
      return 'auto';
    }
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'auto') {
      this.themeSource = 'localStorage';
      return stored;
    }
    this.themeSource = 'browser-preference';
    return 'auto';
  }

  /**
   * Get the source of the current theme setting
   */
  getThemeSource(): 'localStorage' | 'browser-preference' {
    return this.themeSource;
  }

  /**
   * Save scheme to localStorage
   */
  private saveScheme(scheme: ColorScheme): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(this.STORAGE_KEY, scheme);
    } catch (e) {
      console.warn('Failed to save theme to localStorage:', e);
    }
  }
}

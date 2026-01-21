import { InjectionToken, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/**
 * Default implementation uses localStorage when available.
 * Falls back to a no-op store in non-browser contexts.
 */
export const THEME_STORAGE = new InjectionToken<KeyValueStorage>('THEME_STORAGE', {
  factory: () => {
    const doc = inject(DOCUMENT);

    // If there's no defaultView, we're likely not in a browser
    const win = doc?.defaultView;
    if (!win || !win.localStorage) {
      return {
        getItem: () => null,
        setItem: () => undefined,
        removeItem: () => undefined,
      } satisfies KeyValueStorage;
    }

    return win.localStorage as unknown as KeyValueStorage;
  },
});

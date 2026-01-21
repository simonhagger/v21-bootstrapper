import type { ApplicationConfig } from '@angular/core';
import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { APP_ROUTES } from './app.routes';

/**
 * Angular application configuration
 * Includes:
 * - Router with route-first vertical slice pattern
 * - Browser error handling
 */
export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(), provideRouter(APP_ROUTES)],
};

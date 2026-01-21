import { Routes } from '@angular/router';

/**
 * Home feature routes
 *
 * Uses loadComponent for lazy loading optimization.
 * Providers array allows route-scoped DI.
 */
export const HOME_ROUTES: Routes = [
  {
    path: '',
    providers: [],
    loadComponent: () => import('./home.page').then((m) => m.HomePage),
    data: { title: 'Home' },
  },
];

import type { Routes } from '@angular/router';

/**
 * Application routes using composition-based routing pattern
 * Features are loaded lazily via route-first vertical slices
 */
export const routes: Routes = [
  // Root redirect to home
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  // Home feature - landing page
  {
    path: 'home',
    loadChildren: () => import('./features/home/home.routes').then((m) => m.HOME_ROUTES),
  },
  // Wildcard route must be last - catches all unmapped paths
  {
    path: '**',
    loadComponent: () => import('./shared/pages/not-found.page').then((m) => m.NotFoundPage),
  },
];

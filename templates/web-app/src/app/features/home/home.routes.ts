import { Routes } from '@angular/router';
import { provideHomeData } from './home.data';
import { provideHomeState } from './home.state';

/**
 * Home feature routes
 *
 * Uses loadComponent for lazy loading optimization.
 * Providers array allows route-scoped DI for data and state services.
 */
export const HOME_ROUTES: Routes = [
  {
    path: '',
    providers: [provideHomeData(), provideHomeState()],
    loadComponent: () => import('./home.page').then((m) => m.HomePage),
    data: { title: 'Home' },
  },
];

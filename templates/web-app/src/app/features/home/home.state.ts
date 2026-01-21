import { inject, signal } from '@angular/core';
import { HomeSummary } from './home.models';
import { HomeData } from './home.data';

/**
 * Home feature state management
 * Uses Angular signals for reactive state
 */

export interface HomeState {
  summary: HomeSummary | null;
  loading: boolean;
  error: string | null;
}

export const initialHomeState: HomeState = {
  summary: null,
  loading: false,
  error: null,
};

/**
 * Home feature state store
 */
export class HomeStore {
  private data = inject(HomeData);
  private state = signal<HomeState>(initialHomeState);

  readonly summary = () => this.state().summary;
  readonly loading = () => this.state().loading;
  readonly error = () => this.state().error;

  init(): void {
    this.setLoading(true);
    this.data.getSummary().subscribe({
      next: (summary) => this.setSummary(summary),
      error: (err: Error) => this.setError(err.message || 'Failed to load data'),
    });
  }

  setSummary(summary: HomeSummary): void {
    this.state.update((s) => ({ ...s, summary, loading: false }));
  }

  setLoading(loading: boolean): void {
    this.state.update((s) => ({ ...s, loading }));
  }

  setError(error: string): void {
    this.state.update((s) => ({ ...s, error, loading: false }));
  }
}

/**
 * Provider function for home state
 * Use in route providers array
 */
export function provideHomeState(): typeof HomeStore {
  return HomeStore;
}

import { Injectable, Provider } from '@angular/core';
import { of, delay } from 'rxjs';
import type { Observable } from 'rxjs';

import type { HomeSummary } from './home.models';

@Injectable()
export class HomeData {
  getSummary(): Observable<HomeSummary> {
    // TODO: Replace with actual HTTP call when backend is ready
    // Example: return this.http.get<HomeSummary>('/api/home/summary');
    return of({ updatedAt: new Date().toISOString() }).pipe(delay(300));
  }
}

export function provideHomeData(): Provider {
  return HomeData;
}

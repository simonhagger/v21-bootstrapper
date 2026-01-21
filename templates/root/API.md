# Backend API Integration Guide

> Patterns and best practices for integrating with backend APIs in Angular.

## Quick Principle

**All HTTP calls happen in `*.data.ts` files, not in components or state services.**

## Setting Up Your Environment

### Environment Configuration

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000/api',
  apiTimeout: 30000,
};

// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.example.com',
  apiTimeout: 30000,
};
```

## Creating a Data Access Service

The `*.data.ts` file is where you handle all HTTP communication:

```typescript
// src/app/features/dashboard/dashboard.data.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface DashboardStats {
  totalUsers: number;
  activeProjects: number;
  revenue: number;
}

@Injectable()
export class DashboardData {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/dashboard`;

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/stats`);
  }

  getRecentActivity(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/activity`);
  }

  updateSettings(settings: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/settings`, settings);
  }
}

// Export provider function for route-scoped DI
export function provideDashboardData(): Provider {
  return DashboardData;
}
```

## Using Data in Your Component

Inject the data service and use it:

```typescript
// src/app/features/dashboard/dashboard.page.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardData, DashboardStats } from './dashboard.data';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8">
      <h1 class="mb-6">Dashboard</h1>
      @if (stats$ | async as stats) {
        <div class="grid grid-cols-3 gap-4">
          <div class="bg-white p-4 rounded shadow">
            <div class="text-2xl font-bold">{{ stats.totalUsers }}</div>
            <div class="text-gray-600">Total Users</div>
          </div>
          <div class="bg-white p-4 rounded shadow">
            <div class="text-2xl font-bold">{{ stats.activeProjects }}</div>
            <div class="text-gray-600">Active Projects</div>
          </div>
          <div class="bg-white p-4 rounded shadow">
            <div class="text-2xl font-bold">{{ stats.revenue }}</div>
            <div class="text-gray-600">Revenue</div>
          </div>
        </div>
      }
    </div>
  `,
})
export class DashboardPage implements OnInit {
  private data = inject(DashboardData);
  stats$ = this.data.getStats();
}
```

## Handling Errors

Use RxJS operators to handle errors gracefully:

```typescript
import { catchError, throwError } from 'rxjs';

getStats(): Observable<DashboardStats> {
  return this.http.get<DashboardStats>(`${this.baseUrl}/stats`).pipe(
    catchError((error) => {
      console.error('Failed to load stats:', error);
      // Return fallback data or re-throw
      return throwError(() => new Error('Failed to load dashboard stats'));
    })
  );
}
```

## Loading and Error States

Use signals or async pipe with `pending()` and `error()`:

```typescript
import { toSignal } from '@angular/core/rxjs-interop';

export class DashboardPage {
  private data = inject(DashboardData);
  
  protected stats = toSignal(this.data.getStats(), {
    initialValue: null,
  });

  protected isLoading = toSignal(
    this.data.getStats().pipe(
      map(() => false),
      startWith(true),
      catchError(() => of(false))
    ),
    { initialValue: true }
  );
}
```

Or use the async pipe in your template with `@if`:

```html
@if (isLoading$ | async) {
  <div class="text-center py-8">Loading...</div>
}
@if (stats$ | async as stats) {
  <!-- Your stats here -->
}
@if (error$ | async) {
  <div class="bg-red-100 border border-red-400 text-red-700 p-4 rounded">
    Failed to load dashboard. Please try again.
  </div>
}
```

## Reusable HTTP Patterns

### Pattern 1: Simple GET with Caching

```typescript
import { shareReplay } from 'rxjs';

@Injectable()
export class DashboardData {
  private http = inject(HttpClient);
  private stats$ = this.http.get<DashboardStats>(`/api/stats`).pipe(
    shareReplay(1) // Cache and share results
  );

  getStats() {
    return this.stats$;
  }
}
```

### Pattern 2: Paginated Lists

```typescript
export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
}

getUsers(params: PaginationParams): Observable<{ users: User[]; total: number }> {
  let httpParams = new HttpParams();
  httpParams = httpParams.set('page', params.page.toString());
  httpParams = httpParams.set('limit', params.limit.toString());
  if (params.sort) {
    httpParams = httpParams.set('sort', params.sort);
  }

  return this.http.get<{ users: User[]; total: number }>(`${this.baseUrl}/users`, {
    params: httpParams,
  });
}
```

### Pattern 3: Mutations with Optimistic Updates

```typescript
updateUser(id: string, changes: Partial<User>): Observable<User> {
  return this.http.patch<User>(`${this.baseUrl}/users/${id}`, changes).pipe(
    tap((updatedUser) => {
      // Emit success message
      this.notificationService.success('User updated');
    }),
    catchError((error) => {
      this.notificationService.error('Failed to update user');
      return throwError(() => error);
    })
  );
}
```

## Headers and Authentication

Add custom headers for authentication:

```typescript
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private auth = inject(AuthService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getToken();
    
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(req);
  }
}
```

Register the interceptor in your app config:

```typescript
// app.config.ts
import { HTTP_INTERCEPTORS } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor]) // Angular 16+ functional interceptors
    ),
    // ... other providers
  ],
};
```

## Type Safety

Always define interfaces for your API responses:

```typescript
// dashboard.models.ts
export interface DashboardStats {
  totalUsers: number;
  activeProjects: number;
  revenue: number;
  lastUpdated: string;
}

export interface Activity {
  id: string;
  type: 'user_login' | 'project_created' | 'file_uploaded';
  timestamp: string;
  user: string;
}

// dashboard.data.ts
getStats(): Observable<DashboardStats> {
  return this.http.get<DashboardStats>(`${this.baseUrl}/stats`);
}

getActivity(): Observable<Activity[]> {
  return this.http.get<Activity[]>(`${this.baseUrl}/activity`);
}
```

## Testing API Calls

Mock the data service in tests:

```typescript
import { TestBed } from '@angular/core/testing';
import { DashboardPage } from './dashboard.page';
import { DashboardData } from './dashboard.data';
import { of } from 'rxjs';

describe('DashboardPage', () => {
  it('displays stats when loaded', () => {
    const mockData = {
      totalUsers: 100,
      activeProjects: 5,
      revenue: 10000,
    };

    const dataService = jasmine.createSpyObj('DashboardData', ['getStats']);
    dataService.getStats.and.returnValue(of(mockData));

    TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [{ provide: DashboardData, useValue: dataService }],
    });

    const component = TestBed.createComponent(DashboardPage);
    component.detectChanges();

    expect(component.nativeElement.textContent).toContain('100');
  });
});
```

## Summary

✅ **All HTTP calls in `*.data.ts`**  
✅ **Define interfaces for types**  
✅ **Use observables for async**  
✅ **Handle errors gracefully**  
✅ **Mock data services in tests**  
✅ **Use route-scoped DI providers**  

See [DEVELOPMENT.md](./DEVELOPMENT.md) for feature development patterns and [TESTING.md](./TESTING.md) for testing strategies.

# API Integration Guide

> Backend communication patterns for Angular v21 using modern best practices

## Environment Configuration

### Setup Environment Files

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000/api',
  apiTimeout: 30000,
  enableMockData: false,
  features: {
    analytics: false,
    betaFeatures: true,
  },
};

// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.example.com',
  apiTimeout: 30000,
  enableMockData: false,
  features: {
    analytics: true,
    betaFeatures: false,
  },
};
```

### Configure in angular.json

```json
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "configurations": {
            "production": {
              "fileReplacements": [
                {
                  "replace": "src/environments/environment.ts",
                  "with": "src/environments/environment.prod.ts"
                }
              ]
            }
          }
        }
      }
    }
  }
}
```

## Centralized API Client

### Base API Service (DRY)

```typescript
// projects/core/src/lib/api/base-api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface ApiRequestOptions {
  headers?: HttpHeaders | Record<string, string>;
  params?: HttpParams | Record<string, string | number | boolean>;
}

@Injectable({ providedIn: 'root' })
export class BaseApiService {
  protected readonly http = inject(HttpClient);
  protected readonly baseUrl = environment.apiBaseUrl;

  protected get<T>(endpoint: string, options?: ApiRequestOptions): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, this.buildOptions(options));
  }

  protected post<T>(endpoint: string, body: unknown, options?: ApiRequestOptions): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body, this.buildOptions(options));
  }

  protected put<T>(endpoint: string, body: unknown, options?: ApiRequestOptions): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, body, this.buildOptions(options));
  }

  protected patch<T>(endpoint: string, body: unknown, options?: ApiRequestOptions): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${endpoint}`, body, this.buildOptions(options));
  }

  protected delete<T>(endpoint: string, options?: ApiRequestOptions): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, this.buildOptions(options));
  }

  private buildOptions(options?: ApiRequestOptions) {
    return {
      headers:
        options?.headers instanceof HttpHeaders
          ? options.headers
          : new HttpHeaders(options?.headers || {}),
      params:
        options?.params instanceof HttpParams
          ? options.params
          : new HttpParams({ fromObject: (options?.params as Record<string, any>) || {} }),
    };
  }
}
```

### Feature-Specific API Client

```typescript
// features/products/products.api.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '@core/api/base-api.service';
import type { Product, ProductFilters } from './products.models';

@Injectable()
export class ProductsApi extends BaseApiService {
  getProducts(filters?: ProductFilters): Observable<Product[]> {
    return this.get<Product[]>('/products', {
      params: filters as Record<string, string>,
    });
  }

  getProduct(id: string): Observable<Product> {
    return this.get<Product>(`/products/${id}`);
  }

  createProduct(product: Omit<Product, 'id'>): Observable<Product> {
    return this.post<Product>('/products', product);
  }

  updateProduct(id: string, updates: Partial<Product>): Observable<Product> {
    return this.put<Product>(`/products/${id}`, updates);
  }

  deleteProduct(id: string): Observable<void> {
    return this.delete<void>(`/products/${id}`);
  }
}
```

## HTTP Interceptors

### Setup HTTP Client with Interceptors

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { errorInterceptor } from '@core/interceptors/error.interceptor';
import { loadingInterceptor } from '@core/interceptors/loading.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor, loadingInterceptor, errorInterceptor])),
  ],
};
```

### Auth Token Interceptor

```typescript
// projects/core/src/lib/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@core/auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  // Skip auth for public endpoints
  if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    return next(req);
  }

  // Add auth token to headers
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(authReq);
  }

  return next(req);
};
```

### Error Interceptor

```typescript
// projects/core/src/lib/interceptors/error.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '@core/notifications/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notifications = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle specific status codes
      switch (error.status) {
        case 401:
          // Unauthorized - redirect to login
          router.navigate(['/login']);
          notifications.error('Session expired. Please login again.');
          break;

        case 403:
          // Forbidden
          notifications.error('You do not have permission for this action.');
          break;

        case 404:
          // Not found
          notifications.error('Resource not found.');
          break;

        case 500:
          // Server error
          notifications.error('Server error. Please try again later.');
          break;

        default:
          // Generic error
          notifications.error(error.error?.message || 'An error occurred.');
      }

      return throwError(() => error);
    }),
  );
};
```

### Loading Interceptor

```typescript
// projects/core/src/lib/interceptors/loading.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '@core/loading/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);

  // Skip loading for certain requests
  if (req.headers.has('X-Skip-Loading')) {
    return next(
      req.clone({
        headers: req.headers.delete('X-Skip-Loading'),
      }),
    );
  }

  loading.increment();

  return next(req).pipe(finalize(() => loading.decrement()));
};
```

### Loading Service

```typescript
// projects/core/src/lib/loading/loading.service.ts
import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly _requestCount = signal(0);

  readonly isLoading = computed(() => this._requestCount() > 0);

  increment() {
    this._requestCount.update((count) => count + 1);
  }

  decrement() {
    this._requestCount.update((count) => Math.max(0, count - 1));
  }
}
```

### Global Loading Indicator

```typescript
// app.component.ts
import { Component, inject } from '@angular/core';
import { LoadingService } from '@core/loading/loading.service';

@Component({
  selector: 'app-root',
  template: `
    @if (loading.isLoading()) {
      <mat-progress-bar mode="indeterminate" class="fixed top-0 right-0 left-0 z-50" />
    }

    <router-outlet />
  `,
})
export class AppComponent {
  readonly loading = inject(LoadingService);
}
```

## Type Safety

### Runtime Type Validation

```typescript
// type-guards.ts
import type { Product } from './products.models';

export function isProduct(value: unknown): value is Product {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'price' in value &&
    typeof (value as Product).id === 'string' &&
    typeof (value as Product).name === 'string' &&
    typeof (value as Product).price === 'number'
  );
}

export function isProductArray(value: unknown): value is Product[] {
  return Array.isArray(value) && value.every(isProduct);
}

// Usage in API service:
getProducts(): Observable<Product[]> {
  return this.get<unknown>('/products').pipe(
    map(data => {
      if (!isProductArray(data)) {
        throw new Error('Invalid product data received from API');
      }
      return data;
    })
  );
}
```

### Zod Validation (Optional)

```bash
pnpm add zod
```

```typescript
// products.schema.ts
import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().positive(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  category: z.enum(['electronics', 'clothing', 'food']),
  inStock: z.boolean()
});

export const ProductArraySchema = z.array(ProductSchema);

export type Product = z.infer<typeof ProductSchema>;

// Usage:
getProducts(): Observable<Product[]> {
  return this.get<unknown>('/products').pipe(
    map(data => ProductArraySchema.parse(data))
  );
}
```

## RxJS vs Signals

### When to Use RxJS

- **HTTP calls**: Always use observables (HttpClient returns Observable)
- **Complex async pipelines**: Multiple operators, debouncing, throttling
- **Event streams**: Window resize, scroll, keyboard events
- **WebSockets**: Continuous data streams

```typescript
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

searchTerm$ = new Subject<string>();

results$ = this.searchTerm$.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap((term) => this.api.search(term)),
);
```

### When to Use Signals

- **Component state**: UI state, form state, loading flags
- **Derived data**: Computed values from other signals
- **Synchronous updates**: Immediate state changes
- **Simple reactive values**: No complex operators needed

```typescript
readonly searchTerm = signal('');
readonly results = signal<Product[]>([]);

// Computed value
readonly resultCount = computed(() => this.results().length);
```

### Converting Observable to Signal

```typescript
import { toSignal } from '@angular/core/rxjs-interop';

// Convert observable to signal
readonly user = toSignal(this.auth.currentUser$, {
  initialValue: null
});

// Use in template
@if (user(); as currentUser) {
  <p>Welcome, {{ currentUser.name }}</p>
}
```

### Converting Signal to Observable

```typescript
import { toObservable } from '@angular/core/rxjs-interop';

readonly searchTerm = signal('');

// Convert signal to observable for RxJS pipeline
readonly results$ = toObservable(this.searchTerm).pipe(
  debounceTime(300),
  switchMap(term => this.api.search(term))
);
```

## Pagination API

```typescript
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class ProductsApi extends BaseApiService {
  getProductsPaginated(params: PaginationParams): Observable<PaginatedResponse<Product>> {
    return this.get<PaginatedResponse<Product>>('/products', {
      params: params as Record<string, string | number>,
    });
  }
}

// Usage:
@Component({
  template: `
    @if (products(); as data) {
      @for (product of data.items; track product.id) {
        <mat-card>{{ product.name }}</mat-card>
      }

      <mat-paginator
        [length]="data.total"
        [pageSize]="data.pageSize"
        [pageIndex]="data.page - 1"
        (page)="onPageChange($event)"
      />
    }
  `,
})
export class ProductsPage {
  private readonly api = inject(ProductsApi);
  private readonly _params = signal<PaginationParams>({
    page: 1,
    pageSize: 10,
  });

  readonly products = rxResource({
    request: this._params,
    loader: ({ request }) => this.api.getProductsPaginated(request),
  });

  onPageChange(event: PageEvent) {
    this._params.update((params) => ({
      ...params,
      page: event.pageIndex + 1,
      pageSize: event.pageSize,
    }));
  }
}
```

## File Upload

```typescript
@Injectable()
export class UploadApi extends BaseApiService {
  uploadFile(file: File, metadata?: Record<string, string>): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    return this.post<{ url: string }>('/upload', formData);
  }

  uploadWithProgress(file: File): Observable<UploadProgress> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post('/upload', formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map(event => {
        if (event.type === HttpEventType.UploadProgress) {
          const progress = event.total
            ? Math.round(100 * event.loaded / event.total)
            : 0;
          return { status: 'uploading', progress };
        } else if (event.type === HttpEventType.Response) {
          return { status: 'complete', url: event.body.url };
        }
        return { status: 'uploading', progress: 0 };
      })
    );
  }
}

// Usage:
uploadFile(file: File) {
  const progress = signal(0);

  this.uploadApi.uploadWithProgress(file).subscribe({
    next: result => {
      if (result.status === 'uploading') {
        progress.set(result.progress);
      } else {
        console.log('Uploaded:', result.url);
      }
    },
    error: err => console.error('Upload failed:', err)
  });
}
```

## Notification Service

```typescript
// projects/core/src/lib/notifications/notification.service.ts
import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string, duration = 3000) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration = 5000) {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration = 4000) {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration = 3000) {
    this.show(message, 'info', duration);
  }

  private show(message: string, type: NotificationType, duration: number) {
    this.snackBar.open(message, 'Close', {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [`snackbar-${type}`]
    });
  }
}

// Add styles in global styles.css:
.snackbar-success {
  background-color: var(--md-sys-color-tertiary-container);
  color: var(--md-sys-color-on-tertiary-container);
}

.snackbar-error {
  background-color: var(--md-sys-color-error-container);
  color: var(--md-sys-color-on-error-container);
}
```

## Best Practices

### 1. Single Responsibility

- One API service per feature
- Separate concerns: API ← Data ← Store ← Page

### 2. Type Safety

- Use TypeScript interfaces for all API responses
- Validate runtime data with type guards or Zod
- Never use `any` for API responses

### 3. Error Handling

- Use interceptors for global error handling
- Use catchError in services for specific handling
- Always provide user feedback for errors

### 4. Loading States

- Use global loading interceptor for most requests
- Use `X-Skip-Loading` header for background requests
- Show skeleton loaders for important data

### 5. Cancellation

- Use `takeUntilDestroyed()` to cancel on component destroy
- Use `switchMap` to cancel previous requests on new input

```typescript
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export class MyComponent {
  private readonly destroyRef = inject(DestroyRef);

  loadData() {
    this.api
      .getData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => this.store.setData(data));
  }
}
```

### 6. Retry Logic

```typescript
import { retry, retryWhen, delay, take } from 'rxjs/operators';

getData(): Observable<Data> {
  return this.get<Data>('/data').pipe(
    retry({
      count: 3,
      delay: 1000
    })
  );
}
```

### 7. Caching

```typescript
@Injectable()
export class ProductsApi extends BaseApiService {
  private readonly cache = new Map<string, Observable<Product>>();

  getProduct(id: string): Observable<Product> {
    if (!this.cache.has(id)) {
      this.cache.set(
        id,
        this.get<Product>(`/products/${id}`).pipe(
          shareReplay(1), // Cache result
        ),
      );
    }
    return this.cache.get(id)!;
  }

  clearCache() {
    this.cache.clear();
  }
}
```

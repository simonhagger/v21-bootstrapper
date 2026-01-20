# Common Patterns

> Modern Angular v21 implementation patterns following DRY and best practices

## Error Handling

### HTTP Error Pattern (DRY)

**Create base error handler** in `projects/core/src/lib/errors/`:

```typescript
// error-handler.ts
import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
}

@Injectable({ providedIn: 'root' })
export class ErrorHandler {
  handleHttpError(error: HttpErrorResponse): Observable<never> {
    const appError: AppError = {
      message: this.getErrorMessage(error),
      code: error.status.toString(),
      details: error.error,
    };

    // Log to monitoring service
    console.error('HTTP Error:', appError);

    return throwError(() => appError);
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.error instanceof ErrorEvent) {
      return `Client Error: ${error.error.message}`;
    }

    switch (error.status) {
      case 400:
        return 'Invalid request';
      case 401:
        return 'Unauthorized';
      case 403:
        return 'Forbidden';
      case 404:
        return 'Not found';
      case 500:
        return 'Server error';
      default:
        return 'An error occurred';
    }
  }
}
```

**Use in data services:**

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorHandler } from '@core/errors/error-handler';
import type { Product } from './product.models';

@Injectable()
export class ProductData {
  private readonly http = inject(HttpClient);
  private readonly errorHandler = inject(ErrorHandler);

  loadProducts(): Observable<Product[]> {
    return this.http
      .get<Product[]>('/api/products')
      .pipe(catchError((error) => this.errorHandler.handleHttpError(error)));
  }
}
```

### Loading States with Signals

```typescript
import { Component, signal, computed } from '@angular/core';

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

@Component({
  template: `
    @switch (state()) {
      @case ('loading') {
        <mat-spinner />
      }
      @case ('error') {
        <div class="bg-error-container text-on-error-container p-4 rounded-md">
          {{ error() }}
        </div>
      }
      @case ('success') {
        <div class="grid gap-4">
          @for (item of items(); track item.id) {
            <mat-card>{{ item.name }}</mat-card>
          }
        </div>
      }
    }
  `,
})
export class MyPage {
  private readonly _state = signal<LoadingState>('idle');
  private readonly _items = signal<Item[]>([]);
  private readonly _error = signal<string>('');

  readonly state = this._state.asReadonly();
  readonly items = this._items.asReadonly();
  readonly error = this._error.asReadonly();

  loadItems() {
    this._state.set('loading');

    this.data.loadItems().subscribe({
      next: (items) => {
        this._items.set(items);
        this._state.set('success');
      },
      error: (err) => {
        this._error.set(err.message);
        this._state.set('error');
      },
    });
  }
}
```

### Resource API Pattern (Angular v17+)

```typescript
import { Component, resource, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

@Component({
  template: `
    @if (products.isLoading()) {
      <mat-spinner />
    } @else if (products.error()) {
      <div class="error">{{ products.error() }}</div>
    } @else {
      @for (product of products.value(); track product.id) {
        <mat-card>{{ product.name }}</mat-card>
      }
    }
  `,
})
export class ProductsPage {
  private readonly data = inject(ProductData);

  // Resource handles loading/error states automatically
  readonly products = rxResource({
    loader: () => this.data.loadProducts(),
  });
}
```

## Forms

### Reactive Forms with Signals

```typescript
import { Component, signal, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
      <mat-form-field>
        <mat-label>Name</mat-label>
        <input matInput formControlName="name" />
        @if (form.controls.name.invalid && form.controls.name.touched) {
          <mat-error>Name is required</mat-error>
        }
      </mat-form-field>

      <mat-form-field>
        <mat-label>Email</mat-label>
        <input matInput type="email" formControlName="email" />
        @if (form.controls.email.invalid && form.controls.email.touched) {
          <mat-error>Valid email is required</mat-error>
        }
      </mat-form-field>

      <button
        mat-raised-button
        color="primary"
        type="submit"
        [disabled]="isSubmitting() || form.invalid"
      >
        @if (isSubmitting()) {
          Saving...
        } @else {
          Save
        }
      </button>
    </form>
  `,
})
export class UserFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly data = inject(UserData);

  readonly isSubmitting = signal(false);

  readonly form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  // Convert form valueChanges to signal
  readonly formValue = toSignal(this.form.valueChanges, {
    initialValue: this.form.value,
  });

  onSubmit() {
    if (this.form.invalid) return;

    this.isSubmitting.set(true);

    this.data.createUser(this.form.value as User).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.form.reset();
      },
      error: () => {
        this.isSubmitting.set(false);
      },
    });
  }
}
```

### Typed Forms

```typescript
import { FormControl, FormGroup } from '@angular/forms';

interface UserForm {
  name: FormControl<string>;
  email: FormControl<string>;
  age: FormControl<number | null>;
}

export class UserFormComponent {
  readonly form = new FormGroup<UserForm>({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.email] }),
    age: new FormControl<number | null>(null),
  });

  // Type-safe value access
  onSubmit() {
    const value = this.form.value; // Typed as Partial<{name: string, email: string, age: number}>
    const rawValue = this.form.getRawValue(); // Typed as {name: string, email: string, age: number | null}
  }
}
```

## Route Parameters (Angular v16+)

### Using Route Input Binding

```typescript
import { Component, input, OnInit } from '@angular/core';

// In routes:
// { path: 'product/:id', component: ProductDetailPage }

@Component({
  template: `
    <h1>Product {{ id() }}</h1>

    @if (product(); as product) {
      <p>{{ product.name }}</p>
    }
  `,
})
export class ProductDetailPage implements OnInit {
  // Automatically bound from route params
  readonly id = input.required<string>();

  private readonly data = inject(ProductData);
  private readonly store = inject(ProductStore);

  readonly product = this.store.currentProduct;

  ngOnInit() {
    // React to route param signal
    effect(() => {
      const productId = this.id();
      this.data
        .loadProduct(productId)
        .subscribe((product) => this.store.setCurrentProduct(product));
    });
  }
}
```

### Query Parameters

```typescript
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

@Component({
  template: `
    <input [value]="searchTerm() ?? ''" (input)="updateSearch($event)" placeholder="Search..." />

    <p>Searching for: {{ searchTerm() }}</p>
  `,
})
export class SearchPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Convert query params to signal
  readonly searchTerm = toSignal(
    this.route.queryParams.pipe(map((params) => params['q'] as string | null)),
  );

  updateSearch(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    this.router.navigate([], {
      queryParams: { q: term },
      queryParamsHandling: 'merge',
    });
  }
}
```

## Child Components

### Extract When 3+ Uses or Complex Logic

```typescript
// products.components/product-card.component.ts
import { Component, input, output } from '@angular/core';
import type { Product } from '../products.models';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [MatCardModule, MatButtonModule],
  template: `
    <mat-card class="bg-surface">
      <img [src]="product().imageUrl" [alt]="product().name" />
      <mat-card-content>
        <h3>{{ product().name }}</h3>
        <p>{{ product().price | currency }}</p>
      </mat-card-content>
      <mat-card-actions>
        <button mat-button (click)="selected.emit(product())">View Details</button>
      </mat-card-actions>
    </mat-card>
  `,
})
export class ProductCardComponent {
  // Signal inputs (Angular v17.1+)
  readonly product = input.required<Product>();

  // Signal outputs (Angular v17.3+)
  readonly selected = output<Product>();
}
```

**Usage:**

```typescript
@Component({
  imports: [ProductCardComponent],
  template: `
    <div class="grid grid-cols-3 gap-4">
      @for (product of products(); track product.id) {
        <app-product-card [product]="product" (selected)="onProductSelected($event)" />
      }
    </div>
  `,
})
export class ProductsPage {
  onProductSelected(product: Product) {
    this.router.navigate(['/products', product.id]);
  }
}
```

## Pagination

```typescript
import { Component, signal, computed } from '@angular/core';

@Component({
  template: `
    <div class="grid gap-4">
      @for (item of paginatedItems(); track item.id) {
        <mat-card>{{ item.name }}</mat-card>
      }
    </div>

    <mat-paginator
      [length]="totalItems()"
      [pageSize]="pageSize()"
      [pageIndex]="pageIndex()"
      (page)="onPageChange($event)"
    />
  `,
})
export class ItemsPage {
  private readonly _allItems = signal<Item[]>([]);
  private readonly _pageIndex = signal(0);
  private readonly _pageSize = signal(10);

  readonly pageIndex = this._pageIndex.asReadonly();
  readonly pageSize = this._pageSize.asReadonly();
  readonly totalItems = computed(() => this._allItems().length);

  readonly paginatedItems = computed(() => {
    const start = this._pageIndex() * this._pageSize();
    const end = start + this._pageSize();
    return this._allItems().slice(start, end);
  });

  onPageChange(event: PageEvent) {
    this._pageIndex.set(event.pageIndex);
    this._pageSize.set(event.pageSize);
  }
}
```

## Filtering & Search

```typescript
import { Component, signal, computed } from '@angular/core';

@Component({
  template: `
    <mat-form-field>
      <input matInput [value]="searchTerm()" (input)="onSearch($event)" placeholder="Search..." />
    </mat-form-field>

    <div>Found {{ filteredItems().length }} items</div>

    @for (item of filteredItems(); track item.id) {
      <mat-card>{{ item.name }}</mat-card>
    }
  `,
})
export class ItemsPage {
  private readonly _items = signal<Item[]>([]);
  private readonly _searchTerm = signal('');

  readonly searchTerm = this._searchTerm.asReadonly();

  // Computed filtered list
  readonly filteredItems = computed(() => {
    const term = this._searchTerm().toLowerCase();
    if (!term) return this._items();

    return this._items().filter(
      (item) =>
        item.name.toLowerCase().includes(term) || item.description.toLowerCase().includes(term),
    );
  });

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this._searchTerm.set(value);
  }
}
```

## Sorting

```typescript
import { Component, signal, computed } from '@angular/core';

type SortField = 'name' | 'price' | 'date';
type SortDirection = 'asc' | 'desc';

@Component({
  template: `
    <mat-button-toggle-group [value]="sortField()" (change)="onSortChange($event)">
      <mat-button-toggle value="name">Name</mat-button-toggle>
      <mat-button-toggle value="price">Price</mat-button-toggle>
      <mat-button-toggle value="date">Date</mat-button-toggle>
    </mat-button-toggle-group>

    <button mat-icon-button (click)="toggleDirection()">
      <mat-icon>{{ sortDirection() === 'asc' ? 'arrow_upward' : 'arrow_downward' }}</mat-icon>
    </button>

    @for (item of sortedItems(); track item.id) {
      <mat-card>{{ item.name }} - {{ item.price }}</mat-card>
    }
  `,
})
export class ItemsPage {
  private readonly _items = signal<Item[]>([]);
  private readonly _sortField = signal<SortField>('name');
  private readonly _sortDirection = signal<SortDirection>('asc');

  readonly sortField = this._sortField.asReadonly();
  readonly sortDirection = this._sortDirection.asReadonly();

  readonly sortedItems = computed(() => {
    const items = [...this._items()];
    const field = this._sortField();
    const direction = this._sortDirection();

    return items.sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return direction === 'asc' ? comparison : -comparison;
    });
  });

  onSortChange(event: MatButtonToggleChange) {
    this._sortField.set(event.value as SortField);
  }

  toggleDirection() {
    this._sortDirection.update((dir) => (dir === 'asc' ? 'desc' : 'asc'));
  }
}
```

## Guards (Functional)

```typescript
// auth.guard.ts
import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  // Redirect to login with return URL
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};

// role.guard.ts
export const roleGuard = (requiredRole: string): CanActivateFn => {
  return (route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.hasRole(requiredRole)) {
      return true;
    }

    return router.createUrlTree(['/forbidden']);
  };
};

// Usage in routes:
{
  path: 'admin',
  canActivate: [authGuard, roleGuard('admin')],
  loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
}
```

## Skeleton Loaders

```typescript
@Component({
  template: `
    @if (isLoading()) {
      <!-- Skeleton -->
      <div class="grid gap-4">
        @for (_ of [1, 2, 3, 4]; track $index) {
          <div class="bg-surface-variant animate-pulse">
            <div class="h-48 bg-outline-variant rounded-t-md"></div>
            <div class="p-4 space-y-2">
              <div class="h-4 bg-outline-variant rounded w-3/4"></div>
              <div class="h-4 bg-outline-variant rounded w-1/2"></div>
            </div>
          </div>
        }
      </div>
    } @else {
      <!-- Actual content -->
      @for (item of items(); track item.id) {
        <mat-card>{{ item.name }}</mat-card>
      }
    }
  `,
})
export class ItemsPage {
  readonly isLoading = signal(true);
}
```

## Empty States

```typescript
@Component({
  template: `
    @if (items().length === 0 && !isLoading()) {
      <div class="flex flex-col items-center justify-center p-12 text-on-surface-variant">
        <mat-icon class="text-6xl mb-4">inbox</mat-icon>
        <h3 class="text-xl mb-2">No items found</h3>
        <p class="mb-4">Get started by creating your first item.</p>
        <button mat-raised-button color="primary" (click)="onCreate()">
          Create Item
        </button>
      </div>
    } @else {
      @for (item of items(); track item.id) {
        <mat-card>{{ item.name }}</mat-card>
      }
    }
  `
})
```

## DRY Principles

### Reusable State Base Class

```typescript
// base-store.ts
export abstract class BaseStore<T> {
  private readonly _items = signal<T[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly items = this._items.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly isEmpty = computed(() => this._items().length === 0);

  setItems(items: T[]) {
    this._items.set(items);
  }

  addItem(item: T) {
    this._items.update((current) => [...current, item]);
  }

  updateItem(id: string, updates: Partial<T>) {
    this._items.update((current) =>
      current.map((item) => ((item as any).id === id ? { ...item, ...updates } : item)),
    );
  }

  removeItem(id: string) {
    this._items.update((current) => current.filter((item) => (item as any).id !== id));
  }

  setLoading(loading: boolean) {
    this._loading.set(loading);
  }

  setError(error: string | null) {
    this._error.set(error);
  }
}

// Usage:
@Injectable()
export class ProductStore extends BaseStore<Product> {
  // Get CRUD operations for free
}
```

### Reusable Data Service Pattern

```typescript
// base-data.service.ts
export abstract class BaseDataService<T> {
  protected readonly http = inject(HttpClient);
  protected readonly errorHandler = inject(ErrorHandler);

  protected abstract get endpoint(): string;

  getAll(): Observable<T[]> {
    return this.http.get<T[]>(this.endpoint).pipe(catchError(this.errorHandler.handleHttpError));
  }

  getById(id: string): Observable<T> {
    return this.http
      .get<T>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.errorHandler.handleHttpError));
  }

  create(item: Partial<T>): Observable<T> {
    return this.http
      .post<T>(this.endpoint, item)
      .pipe(catchError(this.errorHandler.handleHttpError));
  }

  update(id: string, updates: Partial<T>): Observable<T> {
    return this.http
      .put<T>(`${this.endpoint}/${id}`, updates)
      .pipe(catchError(this.errorHandler.handleHttpError));
  }

  delete(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.errorHandler.handleHttpError));
  }
}

// Usage:
@Injectable()
export class ProductData extends BaseDataService<Product> {
  protected get endpoint() {
    return '/api/products';
  }

  // Add custom methods if needed
  searchByName(name: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.endpoint}/search`, {
      params: { name },
    });
  }
}
```

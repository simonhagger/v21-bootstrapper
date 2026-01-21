# Development Guide

## Daily Workflows

### Starting Development

```bash
# Start fresh
pnpm install
pnpm dev

# Browser opens to http://localhost:4200
```

### Creating a New Feature

```bash
# Generate feature scaffold
pnpm gen:feature UserProfile --route user-profile

# This creates:
# src/app/features/user-profile/
#   ├── user-profile.routes.ts
#   ├── user-profile.page.ts
#   ├── user-profile.data.ts
#   ├── user-profile.state.ts
#   ├── user-profile.models.ts
#   └── README.md
#
# And updates:
# src/app/app.routes.ts (adds route registration)
```

### Feature Development Workflow

1. **Define types** in `<feature>.models.ts`

   ```typescript
   export interface User {
     id: string;
     name: string;
     email: string;
   }
   ```

2. **Add data access** in `<feature>.data.ts`

   ```typescript
   @Injectable()
   export class UserProfileData {
     private readonly http = inject(HttpClient);

     loadUser(id: string): Observable<User> {
       return this.http.get<User>(`/api/users/${id}`);
     }
   }
   ```

3. **Add state** in `<feature>.state.ts`

   ```typescript
   @Injectable()
   export class UserProfileStore {
     private readonly _user = signal<User | null>(null);
     readonly user = this._user.asReadonly();

     setUser(user: User) {
       this._user.set(user);
     }
   }
   ```

4. **Provide in routes** in `<feature>.routes.ts`

   ```typescript
   export const USER_PROFILE_ROUTES: Routes = [
     {
       path: '',
       providers: [UserProfileData, UserProfileStore],
       loadComponent: () => import('./user-profile.page').then((m) => m.UserProfilePage),
     },
   ];
   ```

5. **Build UI** in `<feature>.page.ts`

   ```typescript
   @Component({
     selector: 'app-user-profile',
     standalone: true,
     imports: [CommonModule, MatCardModule],
     template: `
       <div class="mx-auto max-w-4xl p-6">
         <mat-card>
           @if (user(); as user) {
             <mat-card-header>
               <mat-card-title>{{ user.name }}</mat-card-title>
             </mat-card-header>
             <mat-card-content>
               <p>{{ user.email }}</p>
             </mat-card-content>
           }
         </mat-card>
       </div>
     `,
   })
   export class UserProfilePage implements OnInit {
     private readonly data = inject(UserProfileData);
     private readonly store = inject(UserProfileStore);
     private readonly route = inject(ActivatedRoute);

     readonly user = this.store.user;

     ngOnInit() {
       const id = this.route.snapshot.paramMap.get('id') ?? '';
       this.data.loadUser(id).subscribe((user) => this.store.setUser(user));
     }
   }
   ```

**In templates:**

```html
<button (click)="toggleDarkMode()">
  @if (mode() === 'dark') {
  <mat-icon>light_mode</mat-icon>
  } @else {
  <mat-icon>dark_mode</mat-icon>
  }
</button>
```

## Testing

### Running Tests

```bash
# Run once (CI mode)
pnpm test

# Watch mode
pnpm test:watch

# With coverage
pnpm test:coverage
```

### Writing Tests

**Component test:**

```typescript
describe('UserProfilePage', () => {
  let component: UserProfilePage;
  let fixture: ComponentFixture<UserProfilePage>;
  let mockData: jasmine.SpyObj<UserProfileData>;

  beforeEach(async () => {
    mockData = jasmine.createSpyObj('UserProfileData', ['loadUser']);

    await TestBed.configureTestingModule({
      imports: [UserProfilePage],
      providers: [{ provide: UserProfileData, useValue: mockData }, UserProfileStore],
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfilePage);
    component = fixture.componentInstance;
  });

  it('should load user on init', () => {
    const user = { id: '1', name: 'Test', email: 'test@example.com' };
    mockData.loadUser.and.returnValue(of(user));

    component.ngOnInit();

    expect(component.user()).toEqual(user);
  });
});
```

**Service test with HTTP:**

```typescript
describe('UserProfileData', () => {
  let service: UserProfileData;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserProfileData, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(UserProfileData);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch user by id', () => {
    const user = { id: '1', name: 'Test', email: 'test@example.com' };

    service.loadUser('1').subscribe((result) => {
      expect(result).toEqual(user);
    });

    const req = httpMock.expectOne('/api/users/1');
    expect(req.request.method).toBe('GET');
    req.flush(user);
  });
});
```

## Code Quality

### Before Committing

```bash
# Format code
pnpm format

# Fix linting issues
pnpm lint:fix

# Run all verification
pnpm verify
```

### Git Hooks (Automatic)

- **pre-commit**: Formats and lints staged files
- **commit-msg**: Validates commit message format
- **pre-push**: Runs all verifiers and typecheck

### Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting (no code change)
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Build/tooling changes

**Examples:**

```bash
git commit -m "feat(user-profile): add user details page"
git commit -m "fix(theme): correct dark mode surface color"
git commit -m "docs(readme): update quick start guide"
```

## Troubleshooting

### Verifier Failures

**Structure verifier:**

```bash
pnpm verify:structure

# Check that features have all required files
# Fix: Add missing *.data.ts, *.state.ts, etc.
```

**App routes verifier:**

```bash
pnpm verify:app-routes

# Ensures no static page imports
# Fix: Use loadChildren() instead of direct imports
```

**Cross-feature imports:**

```bash
pnpm verify:no-cross-feature-imports

# Fix: Remove imports from other features
# Use core/shared instead
```

### Linting Errors

**Type errors:**

```bash
# Use explicit types
const user: User = { ... };

# Avoid 'any'
const data: unknown = JSON.parse(str);
if (isUser(data)) {
  // Type guard
}
```

**Import errors:**

```bash
# Use type imports when only importing types
import type { User } from './models';

# Regular imports for values
import { UserService } from './service';
```

### Build Errors

**Missing dependencies:**

```bash
pnpm install
```

**Clean build:**

```bash
rm -rf .angular dist
pnpm build
```

## CI/CD

### GitHub Actions Workflow

CI runs on every push and PR:

1. **Install dependencies** (`pnpm install --frozen-lockfile`)
2. **Run all gates** (`pnpm verify`)
3. **Build** (`pnpm build`)

### Semantic Release

On merge to `main`:

- Analyzes commits since last release
- Determines version bump (major/minor/patch)
- Generates CHANGELOG.md
- Creates Git tag
- Publishes GitHub release

## Best Practices

### Component Design

**Prefer small, focused components:**

```typescript
// ✅ Good - Single responsibility
@Component({ selector: 'user-avatar' })
export class UserAvatarComponent {
  @Input() user!: User;
}

// ❌ Too large - Multiple responsibilities
@Component({ selector: 'user-dashboard' })
export class UserDashboardComponent {
  // Handles profile, settings, notifications, etc.
}
```

### State Management

**Use signals for reactive state:**

```typescript
// ✅ Good - Signals
private readonly _items = signal<Item[]>([]);
readonly items = this._items.asReadonly();
readonly count = computed(() => this._items().length);

// ❌ Avoid - BehaviorSubject (unless needed for operators)
private items$ = new BehaviorSubject<Item[]>([]);
```

### Data Access

**Single responsibility for data services:**

```typescript
// ✅ Good - Focused data service
@Injectable()
export class UsersData {
  loadUser(id: string): Observable<User> {}
  updateUser(user: User): Observable<User> {}
}

// ❌ Too broad - Mixed concerns
@Injectable()
export class ApiService {
  getUsers() {}
  getProducts() {}
  getPosts() {}
  // Everything in one service
}
```

### Styling

**Use Material + Tailwind together:**

```html
<!-- ✅ Good - Material behavior + Tailwind layout -->
<div class="flex gap-4 p-6">
  <button mat-raised-button color="primary">Submit</button>
  <button mat-button>Cancel</button>
</div>

<!-- ❌ Avoid - Overriding Material internals with utilities -->
<button mat-raised-button class="bg-blue-500 text-white">
  Don't override Material button styles
</button>
```

**Use design tokens:**

```css
/* ✅ Good - Semantic tokens */
.card {
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  border-radius: var(--md-sys-shape-corner-medium);
}

/* ❌ Avoid - Hardcoded values */
.card {
  background: #ffffff;
  color: #000000;
  border-radius: 12px;
}
```

## Resources

- [Angular Documentation](https://angular.dev)
- [Material Design 3](https://m3.material.io)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Conventional Commits](https://www.conventionalcommits.org)

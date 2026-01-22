import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HomeStore } from './home.state';
import { ThemeService } from '../../shared/services/theme.service';
import { ResponsiveService } from '../../shared/services/responsive.service';

/**
 * Home page component
 * Demonstrates Angular Material components alongside Tailwind utilities
 * with minimal theming (no token pipeline).
 *
 * Also shows the data/state pattern with loading states.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  styles: [
    `
      @import "tailwindcss" reference;

      /* Example: Override Material theme tokens for a specific button */
      #custom-brand-button {
        /* Override Material primary color with a custom Tailwind token */
        --mat-sys-primary: var(--color-accent) !important;
        --mat-sys-on-primary: var(--color-accent-contrast) !important;
      }

      /* Integration callout: Use Material surface with elevated styling */
      .integration-callout {
        background-color: var(--mat-sys-surface-container);
        color: var(--mat-sys-on-surface);
        @apply rounded-lg p-6;
      }

      /* Info boxes: Use Material system variables for automatic dark mode */
      .info-box {
        background-color: var(--mat-sys-surface-dim);
        color: var(--mat-sys-on-surface-variant);
        @apply p-3 rounded text-sm;
      }

      /* Inline code: Use Material system variables instead of hardcoded colors */
      code {
        background-color: var(--mat-sys-surface-container-high);
        color: var(--mat-sys-on-surface);
        @apply px-1 py-0.5 rounded text-sm;
      }

      /* Responsive indicator badge */
      .breakpoint-badge {
        background-color: var(--mat-sys-primary-container);
        color: var(--mat-sys-on-primary-container);
        @apply px-3 py-1 rounded-full text-sm font-semibold inline-block;
      }

      /* Status indicator */
      .status-indicator {
        background-color: var(--mat-sys-surface-container);
        color: var(--mat-sys-on-surface);
        @apply px-2 py-1 rounded text-xs;
      }

      .status-indicator.active {
        background-color: var(--mat-sys-success-container);
        color: var(--mat-sys-on-success-container);
      }

      .status-indicator:not(.active) {
        background-color: var(--mat-sys-surface-dim);
        color: var(--mat-sys-on-surface-variant);
        opacity: 0.5;
        @apply line-through;
      }
    `,
  ],
  template: `
    <div class="home-page max-w-7xl mx-auto">
      <!-- Hero section with Tailwind utilities -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold mb-2">Welcome to Acme Web</h1>
        <p class="text-lg opacity-75">Demonstrating Angular Material + Tailwind CSS v4</p>
        <p class="text-sm opacity-50 mt-4">
          💡 Theme loaded from: <strong>{{ themeSource }}</strong>
        </p>
      </div>

      <!-- Loading state demo -->
      @if (store.loading()) {
        <div class="flex items-center gap-2 mt-4 text-sm">
          <mat-spinner diameter="20"></mat-spinner>
          <span>Loading data...</span>
        </div>
      } @else if (store.summary()) {
        <p class="text-sm opacity-60 mt-2">Last updated: {{ store.summary()?.updatedAt }}</p>
      }

      <!-- Integration example callout -->
      <mat-card class="mb-6 integration-callout">
        <mat-card-header>
          <mat-card-title class="flex items-center gap-2">
            <mat-icon>palette</mat-icon>
            Tailwind + Material Integration
          </mat-card-title>
        </mat-card-header>
        <mat-card-content class="pt-4">
          <p class="text-sm mb-4">
            This demonstrates overriding Material Design tokens using Tailwind design tokens. Both
            buttons below are Material components, but the right one uses custom CSS variable
            overrides.
          </p>
          <div class="flex flex-wrap gap-4 mb-4">
            <div>
              <p class="text-xs font-semibold mb-2 opacity-70">Default Material Theme</p>
              <button mat-raised-button color="primary">
                <mat-icon class="mr-1">check</mat-icon>
                Default Button
              </button>
            </div>
            <div>
              <p class="text-xs font-semibold mb-2 opacity-70">With Token Overrides</p>
              <button mat-raised-button color="primary" id="custom-brand-button">
                <mat-icon class="mr-1">check</mat-icon>
                Custom Brand Button
              </button>
            </div>
          </div>
          <p class="text-xs mt-3 opacity-70">
            💡 The right button overrides Material tokens via CSS variables in
            <code>home.page.ts</code> styles. Define custom
            tokens in <code>src/tailwind.css</code> and use
            <code>mat.theme-overrides()</code> in
            <code>src/styles.scss</code>
          </p>
        </mat-card-content>
      </mat-card>

      <!-- Responsive service demo -->
      @if (responsive.state$ | async; as state) {
        <mat-card class="mb-6">
          <mat-card-header>
            <mat-card-title class="flex items-center gap-2">
              <mat-icon>devices</mat-icon>
              Responsive Service Demo
            </mat-card-title>
          </mat-card-header>
          <mat-card-content class="pt-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <!-- Breakpoint Info -->
              <div>
                <p class="text-xs font-semibold mb-2 opacity-70">Current Breakpoint</p>
                <span class="breakpoint-badge">{{ state.breakpoint }}</span>
                <p class="text-xs mt-2 opacity-60">
                  Resize your window to see breakpoint changes in real-time
                </p>
              </div>

              <!-- Device Type -->
              <div>
                <p class="text-xs font-semibold mb-2 opacity-70">Device Classification</p>
                <div class="flex gap-2">
                  <span class="status-indicator" [class.active]="state.isMobile"
                    >Mobile</span
                  >
                  <span class="status-indicator" [class.active]="state.isTablet"
                    >Tablet</span
                  >
                  <span class="status-indicator" [class.active]="state.isDesktop"
                    >Desktop</span
                  >
                </div>
              </div>

              <!-- Orientation -->
              <div>
                <p class="text-xs font-semibold mb-2 opacity-70">Orientation</p>
                <div class="flex gap-2">
                  <span class="status-indicator" [class.active]="state.isPortrait">
                    <mat-icon class="text-xs mr-1" [style.display]="'inline-block'"
                      >phone_iphone</mat-icon
                    >
                    Portrait
                  </span>
                  <span class="status-indicator" [class.active]="state.isLandscape">
                    <mat-icon class="text-xs mr-1" [style.display]="'inline-block'"
                      >landscape</mat-icon
                    >
                    Landscape
                  </span>
                </div>
              </div>

              <!-- Platform & Browser -->
              <div>
                <p class="text-xs font-semibold mb-2 opacity-70">Platform Detection (CDK)</p>
                <div class="flex flex-col gap-1 text-sm">
                  <span>
                    <strong>Browser:</strong>
                    {{ state.browser }}
                  </span>
                  <span>
                    <strong>OS:</strong>
                    {{ state.os }}
                  </span>
                  <span>
                    <strong>Platform:</strong>
                    {{ state.platform }}
                  </span>
                </div>
                <p class="text-xs mt-2 opacity-60">
                  Detected via Angular CDK Platform service
                </p>
              </div>

              <!-- Touch & Color Scheme -->
              <div>
                <p class="text-xs font-semibold mb-2 opacity-70">Capabilities</p>
                <div class="flex gap-2">
                  <span class="status-indicator" [class.active]="state.isTouchEnabled">
                    <mat-icon class="text-xs mr-1" [style.display]="'inline-block'"
                      >touch_app</mat-icon
                    >
                    Touch
                  </span>
                  <span class="status-indicator" [class.active]="state.prefersDark">
                    <mat-icon class="text-xs mr-1" [style.display]="'inline-block'"
                      >dark_mode</mat-icon
                    >
                    Dark Mode
                  </span>
                </div>
              </div>
            </div>

            <p class="text-xs mt-4 opacity-70 p-3 bg-opacity-10 rounded">
              💡
              <strong>Usage:</strong>
              Inject <code>ResponsiveService</code> to access <code>state$</code> observable for
              component logic, or use CSS class selectors on <code>&lt;html&gt;</code>:
              <code>html.bp-lg .sidebar {{ '{' }} {{ '}' }}</code>,
              <code>html.platform-mobile .desktop-only {{ '{' }} display: none; {{ '}' }}</code>, or
              <code>html.browser-safari</code> for browser-specific styles. Detection uses Angular
              CDK Layout (breakpoints) and Platform service (browser/OS).
            </p>
          </mat-card-content>
        </mat-card>
      }

      <!-- Grid layout using Tailwind -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Card 1: Buttons -->
        <mat-card>
          <mat-card-header>
            <mat-card-title>Material Buttons</mat-card-title>
            <mat-card-subtitle>Button variants with the starter theme</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content class="pt-4">
            <div class="flex flex-col gap-3">
              <button mat-raised-button color="primary" class="w-full">Primary Button</button>
              <button mat-raised-button color="accent" class="w-full">Accent Button</button>
              <button mat-raised-button color="warn" class="w-full">Warn Button</button>
              <button mat-stroked-button class="w-full">Outlined Button</button>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Card 2: Form Inputs -->
        <mat-card>
          <mat-card-header>
            <mat-card-title>Form Fields</mat-card-title>
            <mat-card-subtitle>Material form components</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content class="pt-4">
            <form class="flex flex-col gap-4">
              <mat-form-field class="w-full">
                <mat-label>Email</mat-label>
                <input
                  matInput
                  type="email"
                  placeholder="you@example.com"
                  autocomplete="username"
                />
                <mat-icon matPrefix>email</mat-icon>
              </mat-form-field>

              <mat-form-field class="w-full">
                <mat-label>Password</mat-label>
                <input matInput type="password" autocomplete="current-password" />
                <mat-icon matPrefix>lock</mat-icon>
              </mat-form-field>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Card 3: Technology Stack -->
        <mat-card>
          <mat-card-header>
            <mat-card-title>Tech Stack</mat-card-title>
            <mat-card-subtitle>Technologies used</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content class="pt-4">
            <mat-chip-set>
              <mat-chip>Angular v21</mat-chip>
              <mat-chip>Material Design 3</mat-chip>
              <mat-chip>Tailwind CSS</mat-chip>
              <mat-chip highlighted>Tailwind</mat-chip>
            </mat-chip-set>
          </mat-card-content>
        </mat-card>

        <!-- Card 4: Design System Info -->
        <mat-card>
          <mat-card-header>
            <mat-card-title>Design System</mat-card-title>
            <mat-card-subtitle>Material + Tailwind</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content class="pt-4">
            <p class="mb-4 text-sm">
              This scaffold demonstrates how Angular Material works alongside Tailwind CSS v4.
              Material provides theming via <code>mat.theme()</code>, Tailwind provides utility
              classes and design tokens.
            </p>
            <div class="flex flex-col gap-3">
              <div class="info-box">
                <strong>Material:</strong> Theming configured in <code>src/styles.scss</code>
              </div>
              <div class="info-box">
                <strong>Tailwind:</strong> Design tokens in <code>src/tailwind.css</code>
              </div>
              <div class="info-box">
                <strong>Integration:</strong> Use <code>mat.theme-overrides()</code> to apply
                Tailwind tokens to Material
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Card 5: Features -->
        <mat-card>
          <mat-card-header>
            <mat-card-title>Features</mat-card-title>
            <mat-card-subtitle>Bootstrap includes</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content class="pt-4">
            <ul class="space-y-2 text-sm">
              <li class="flex items-center gap-2">
                <mat-icon class="text-base">check_circle</mat-icon>
                <span>Standalone components</span>
              </li>
              <li class="flex items-center gap-2">
                <mat-icon class="text-base">check_circle</mat-icon>
                <span>Route-first architecture</span>
              </li>
              <li class="flex items-center gap-2">
                <mat-icon class="text-base">check_circle</mat-icon>
                <span>TypeScript strict mode</span>
              </li>
              <li class="flex items-center gap-2">
                <mat-icon class="text-base">check_circle</mat-icon>
                <span>ESLint + Prettier</span>
              </li>
            </ul>
          </mat-card-content>
        </mat-card>

        <!-- Card 6: Quick Links -->
        <mat-card>
          <mat-card-header>
            <mat-card-title>Resources</mat-card-title>
            <mat-card-subtitle>Learn more</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content class="pt-4 flex flex-col gap-2">
            <button mat-stroked-button class="w-full justify-start">
              <mat-icon class="mr-2">description</mat-icon>
              Documentation
            </button>
            <button mat-stroked-button class="w-full justify-start">
              <mat-icon class="mr-2">architecture</mat-icon>
              Architecture Guide
            </button>
            <button mat-stroked-button class="w-full justify-start">
              <mat-icon class="mr-2">palette</mat-icon>
              Design Tokens
            </button>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
})
export class HomePage {
  readonly store = inject(HomeStore);
  readonly theme = inject(ThemeService);
  readonly responsive = inject(ResponsiveService);
  readonly themeSource = this.theme.getThemeSource();

  constructor() {
    void this.store.init();
  }
}

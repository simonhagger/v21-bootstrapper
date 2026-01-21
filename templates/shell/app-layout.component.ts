import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/* eslint-disable no-undef */
declare const window: typeof globalThis & { localStorage: Storage };
/* eslint-enable no-undef */

/**
 * Application shell layout component
 * Provides top navigation bar with theme toggle and content area
 */
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="app-layout">
      <!-- Material toolbar with Tailwind spacing -->
      <mat-toolbar color="primary" class="px-6 shadow-md">
        <span class="text-xl font-semibold">Acme Web</span>

        <!-- Spacer -->
        <span class="flex-1"></span>

        <!-- Navigation links with Tailwind styling -->
        <nav class="flex items-center gap-4">
          <a
            routerLink="/home"
            routerLinkActive="active-link"
            class="px-3 py-2 rounded transition-colors hover:bg-white/10"
          >
            Home
          </a>
        </nav>

        <!-- Theme toggle button -->
        <button
          mat-icon-button
          (click)="toggleTheme()"
          class="ml-4"
          [attr.aria-label]="'Toggle ' + (isDarkMode ? 'light' : 'dark') + ' mode'"
        >
          <mat-icon>{{ isDarkMode ? 'light_mode' : 'dark_mode' }}</mat-icon>
        </button>
      </mat-toolbar>

      <!-- Content area with Tailwind padding -->
      <main class="p-6">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [
    `
      .app-layout {
        display: flex;
        flex-direction: column;
        height: 100vh;
      }

      main {
        flex: 1;
        overflow-y: auto;
      }

      .active-link {
        background-color: rgba(255, 255, 255, 0.15);
        font-weight: 500;
      }
    `,
  ],
})
export class AppLayoutComponent {
  isDarkMode = false;

  constructor() {
    // Initialize theme from localStorage or system preference
    const savedTheme =
      typeof window !== 'undefined' && window.localStorage
        ? window.localStorage.getItem('theme')
        : null;
    if (savedTheme) {
      this.isDarkMode = savedTheme === 'dark';
    } else if (typeof window !== 'undefined') {
      this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    this.applyTheme();
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    }
  }

  private applyTheme(): void {
    const html = document.documentElement;
    if (this.isDarkMode) {
      html.classList.add('dark-theme');
      html.classList.remove('light-theme');
    } else {
      html.classList.add('light-theme');
      html.classList.remove('dark-theme');
    }
  }
}

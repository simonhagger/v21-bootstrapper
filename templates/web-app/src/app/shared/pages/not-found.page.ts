import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

/**
 * Not Found (404) Page
 * Displayed when user navigates to unmapped route
 *
 * Demonstrates:
 * - Standalone component pattern
 * - Using CommonModule for built-in directives
 * - Shared page as part of vertical slice architecture
 */
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="not-found-container">
      <div class="not-found-content">
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <p>
          <a routerLink="/">Return to home</a>
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .not-found-container {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 2rem;
        background: var(--md-sys-color-surface, #fafafa);
      }

      .not-found-content {
        text-align: center;
        max-width: 600px;
      }

      h1 {
        margin: 0 0 1rem 0;
        font-size: 2.5rem;
        color: var(--md-sys-color-on-surface, #1a1a1a);
      }

      p {
        margin: 0.5rem 0;
        color: var(--md-sys-color-on-surface-variant, #49454e);
        font-size: 1.1rem;
      }

      a {
        display: inline-block;
        margin-top: 1.5rem;
        padding: 0.75rem 1.5rem;
        background: var(--md-sys-color-primary, #6750a4);
        color: var(--md-sys-color-on-primary, #ffffff);
        text-decoration: none;
        border-radius: 0.5rem;
        transition: background-color 0.3s ease;
      }

      a:hover {
        background: var(--md-sys-color-primary-hover, #5d4c9f);
      }
    `,
  ],
})
export class NotFoundPage {}

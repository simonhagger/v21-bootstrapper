import { Component } from '@angular/core';
import { AppLayoutComponent } from './shared/layout/app-layout.component';

/**
 * Root application component
 * - Uses shell layout component for application structure
 * - Layout includes toolbar with navigation and router-outlet for content
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AppLayoutComponent],
  template: `<app-layout></app-layout>`,
})
export class App {
  title = 'acme-web';
}

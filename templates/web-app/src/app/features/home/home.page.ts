import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

/**
 * Home page component
 * Demonstrates Angular Material components alongside Tailwind utilities
 * with minimal theming (no token pipeline).
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
  ],
  template: `
    <div class="home-page max-w-7xl mx-auto">
      <!-- Hero section with Tailwind utilities -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold mb-2">Welcome to Acme Web</h1>
        <p class="text-lg opacity-75">Demonstrating Angular Material + Tailwind CSS</p>
      </div>

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
              This scaffold demonstrates how Angular Material works alongside Tailwind CSS
              utilities. Material uses CLI-generated theming, Tailwind provides utility classes.
            </p>
            <div class="flex flex-col gap-3">
              <div class="p-3 rounded text-sm bg-gray-50 dark:bg-gray-900 dark:text-gray-100">
                <strong>Material:</strong> Theme configured via <code>ng add @angular/material</code>
              </div>
              <div class="p-3 rounded text-sm bg-gray-50 dark:bg-gray-900 dark:text-gray-100">
                <strong>Tailwind:</strong> Utilities from <code>ng add tailwindcss</code>
              </div>
              <div class="p-3 rounded text-sm bg-gray-50 dark:bg-gray-900 dark:text-gray-100">
                <strong>Components:</strong> Modern animation patterns, no deprecated APIs
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
export class HomePage {}

import type { MappingGroup } from './types';

/**
 * Material Angular System Token Mapping
 *
 * Maps Material Angular's --mat-sys-* CSS variables to our M3 design tokens.
 * This allows Material components to use our M3 color scheme without Sass compilation.
 *
 * Material Angular v19+ uses system tokens (--mat-sys-*) that we override with our
 * M3 tokens (--md-sys-color-*). This creates a bridge between Material's theming
 * system and our design tokens.
 *
 * Reference: https://github.com/angular/components/blob/main/guides/theming.md
 */
export const material: MappingGroup = {
  type: 'material',
  description:
    'Material Angular system tokens mapped to M3 design tokens from Material Theme Builder',
  map: {
    // Primary color tokens
    'mat-sys-primary': '--md-sys-color-primary',
    'mat-sys-on-primary': '--md-sys-color-on-primary',
    'mat-sys-primary-container': '--md-sys-color-primary-container',
    'mat-sys-on-primary-container': '--md-sys-color-on-primary-container',
    'mat-sys-primary-fixed': '--md-sys-color-primary-fixed',
    'mat-sys-on-primary-fixed': '--md-sys-color-on-primary-fixed',
    'mat-sys-on-primary-fixed-variant': '--md-sys-color-on-primary-fixed-variant',
    'mat-sys-primary-fixed-dim': '--md-sys-color-primary-fixed-dim',
    'mat-sys-inverse-primary': '--md-sys-color-inverse-primary',

    // Secondary color tokens
    'mat-sys-secondary': '--md-sys-color-secondary',
    'mat-sys-on-secondary': '--md-sys-color-on-secondary',
    'mat-sys-secondary-container': '--md-sys-color-secondary-container',
    'mat-sys-on-secondary-container': '--md-sys-color-on-secondary-container',
    'mat-sys-secondary-fixed': '--md-sys-color-secondary-fixed',
    'mat-sys-on-secondary-fixed': '--md-sys-color-on-secondary-fixed',
    'mat-sys-on-secondary-fixed-variant': '--md-sys-color-on-secondary-fixed-variant',
    'mat-sys-secondary-fixed-dim': '--md-sys-color-secondary-fixed-dim',

    // Tertiary color tokens
    'mat-sys-tertiary': '--md-sys-color-tertiary',
    'mat-sys-on-tertiary': '--md-sys-color-on-tertiary',
    'mat-sys-tertiary-container': '--md-sys-color-tertiary-container',
    'mat-sys-on-tertiary-container': '--md-sys-color-on-tertiary-container',
    'mat-sys-tertiary-fixed': '--md-sys-color-tertiary-fixed',
    'mat-sys-on-tertiary-fixed': '--md-sys-color-on-tertiary-fixed',
    'mat-sys-on-tertiary-fixed-variant': '--md-sys-color-on-tertiary-fixed-variant',
    'mat-sys-tertiary-fixed-dim': '--md-sys-color-tertiary-fixed-dim',

    // Error color tokens
    'mat-sys-error': '--md-sys-color-error',
    'mat-sys-on-error': '--md-sys-color-on-error',
    'mat-sys-error-container': '--md-sys-color-error-container',
    'mat-sys-on-error-container': '--md-sys-color-on-error-container',

    // Surface color tokens
    'mat-sys-surface': '--md-sys-color-surface',
    'mat-sys-on-surface': '--md-sys-color-on-surface',
    'mat-sys-surface-tint': '--md-sys-color-surface-tint',
    'mat-sys-surface-variant': '--md-sys-color-surface-variant',
    'mat-sys-on-surface-variant': '--md-sys-color-on-surface-variant',
    'mat-sys-surface-dim': '--md-sys-color-surface-dim',
    'mat-sys-surface-bright': '--md-sys-color-surface-bright',
    'mat-sys-surface-container-lowest': '--md-sys-color-surface-container-lowest',
    'mat-sys-surface-container-low': '--md-sys-color-surface-container-low',
    'mat-sys-surface-container': '--md-sys-color-surface-container',
    'mat-sys-surface-container-high': '--md-sys-color-surface-container-high',
    'mat-sys-surface-container-highest': '--md-sys-color-surface-container-highest',
    'mat-sys-inverse-surface': '--md-sys-color-inverse-surface',
    'mat-sys-inverse-on-surface': '--md-sys-color-inverse-on-surface',

    // Outline tokens
    'mat-sys-outline': '--md-sys-color-outline',
    'mat-sys-outline-variant': '--md-sys-color-outline-variant',

    // Background tokens (legacy M2 tokens still used by some components)
    'mat-sys-background': '--md-sys-color-background',
    'mat-sys-on-background': '--md-sys-color-on-background',

    // Shadow/Scrim tokens
    'mat-sys-shadow': '--md-sys-color-shadow',
    'mat-sys-scrim': '--md-sys-color-scrim',
  },
};

import type { MappingGroup } from "./types";

export const colors: MappingGroup = {
  type: "colors",
  description: "Semantic colors only. Do not map raw tonal palette or component-specific tokens.",
  map: {
    // Primary
    "color-primary": "--md-sys-color-primary",
    "color-on-primary": "--md-sys-color-on-primary",
    "color-primary-container": "--md-sys-color-primary-container",
    "color-on-primary-container": "--md-sys-color-on-primary-container",

    // Secondary
    "color-secondary": "--md-sys-color-secondary",
    "color-on-secondary": "--md-sys-color-on-secondary",
    "color-secondary-container": "--md-sys-color-secondary-container",
    "color-on-secondary-container": "--md-sys-color-on-secondary-container",

    // Surface
    "color-surface": "--md-sys-color-surface",
    "color-on-surface": "--md-sys-color-on-surface",
    "color-surface-variant": "--md-sys-color-surface-variant",
    "color-on-surface-variant": "--md-sys-color-on-surface-variant",

    // Outline + Error
    "color-outline": "--md-sys-color-outline",
    "color-outline-variant": "--md-sys-color-outline-variant",
    "color-error": "--md-sys-color-error",
    "color-on-error": "--md-sys-color-on-error",
    "color-error-container": "--md-sys-color-error-container",
    "color-on-error-container": "--md-sys-color-on-error-container",
  },
};

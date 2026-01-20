import type { MappingGroup } from "./types";

export const radii: MappingGroup = {
  type: "radii",
  description: "Map Tailwind radii to Material shape corner tokens.",
  map: {
    "radius-xs": "--md-sys-shape-corner-extra-small",
    "radius-sm": "--md-sys-shape-corner-small",
    "radius-md": "--md-sys-shape-corner-medium",
    "radius-lg": "--md-sys-shape-corner-large",
    "radius-xl": "--md-sys-shape-corner-extra-large",
  },
};

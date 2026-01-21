export type MappingType = 'colors' | 'radii' | 'typography' | 'elevation' | 'spacing';

export type MappingGroup = {
  type: MappingType;
  /**
   * A short description of intent/constraints for maintainers.
   */
  description?: string;

  /**
   * Tailwind variable name (without leading --) -> M3 CSS variable (with leading --)
   *
   * Example:
   *   "color-primary" -> "--md-sys-color-primary"
   */
  map: Record<string, string>;
};

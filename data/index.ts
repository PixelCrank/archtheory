// Main data index - import all data sources
export { MACRO_MOVEMENTS } from './macro-movements';
export * from './types';

// Helper function for years (label formatting)
export function fmtYear(y: number): string {
  return y < 0 ? `${Math.abs(y)} BCE` : `${y}`;
}

// Quick lookup objects
export function createLookups() {
  // These will be created dynamically when data is imported
  return {
    CHILD_BY_ID: {},
    SUBCHILD_BY_ID: {}
  };
}
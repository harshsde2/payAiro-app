/**
 * Spacing definitions for consistent layout throughout the app
 */

// Base unit for spacing (in pixels)
const baseUnit = 4;

// Spacing scale based on baseUnit
export const spacing = {
  // Named values
  none: 0,
  xxs: baseUnit, // 4
  xs: baseUnit * 2, // 8
  sm: baseUnit * 3, // 12
  md: baseUnit * 4, // 16
  lg: baseUnit * 6, // 24
  xl: baseUnit * 8, // 32
  xxl: baseUnit * 12, // 48
  xxxl: baseUnit * 16, // 64

  // Numeric values for more granular control
  0: 0,
  1: baseUnit, // 4
  2: baseUnit * 2, // 8
  3: baseUnit * 3, // 12
  4: baseUnit * 4, // 16
  5: baseUnit * 5, // 20
  6: baseUnit * 6, // 24
  8: baseUnit * 8, // 32
  10: baseUnit * 10, // 40
  12: baseUnit * 12, // 48
  16: baseUnit * 16, // 64
  20: baseUnit * 20, // 80
  24: baseUnit * 24, // 96
  32: baseUnit * 32, // 128
};

// Common layout patterns
export const layout = {
  screenPadding: spacing.md,
  sectionPadding: spacing.lg,
  cardPadding: spacing.md,
  rowGap: spacing.xs,
  columnGap: spacing.xs,
  buttonPadding: {
    horizontal: spacing.md,
    vertical: spacing.xs,
  },
  inputPadding: {
    horizontal: spacing.md,
    vertical: spacing.xs,
  },
};

export default {
  spacing,
  layout,
  baseUnit,
}; 
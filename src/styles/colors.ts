/**
 * Color palette for the application
 * Based on green palette with additional utility colors
 */

// Green palette
export const greenPalette = {
  green50: "#F3FAF5",
  green100: "#E3F5E8",
  green150: "#E2F1E3",
  green200: "#C8EAD2",
  green300: "#9CD9AE",
  green400: "#69BF82",
  green500: "#45A261",
  green600: "#34854D",
  green700: "#2C6A3F",
  green800: "#275435",
  green900: "#21462E",
  green950: "#0E2515",
  blue500: "#3499E0",
  orange500: "#FF7D20",
  red500: "#FF3A20",
};

// Base colors
export const baseColors = {
  // Core UI colors
  primary: greenPalette.green600,
  secondary: greenPalette.green400,
  accent: "#3498db",

  // Status colors
  success: "#2ecc71",
  warning: "#f39c12",
  error: "#e74c3c",
  info: "#3498db",

  // Neutrals
  white: "#FFFFFF",
  black: "#000000",
  grey50: "#F9FAFB",
  grey100: "#F7F7F7",
  grey150: "#D9D9D912",
  grey200: "#E5E7EB",
  grey250: "#D9D9D912",
  grey300: "#D1D5DB",
  grey400: "#9CA3AF",
  grey500: "#6B7280",
  grey600: "#4B5563",
  grey700: "#374151",
  grey800: "#1F2937",
  grey900: "#111827",
};

// Type definition for colors
export type ColorPalette = typeof greenPalette & typeof baseColors;

// Merged colors object
export const colors = {
  ...greenPalette,
  ...baseColors,
};

export default colors;

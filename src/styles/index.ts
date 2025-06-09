/**
 * Central export file for styling system
 * Import from here to access all styling utilities
 */

// Export all styling modules
export * from "./colors";
export * from "./typography";
export * from "./spacing";
export * from "./theme";
export * from "./ThemeContext";

// Named imports for convenience
import colors from "./colors";
import typography from "./typography";
import spacing from "./spacing";
import themes from "./theme";
import { useTheme, ThemeProvider } from "./ThemeContext";

// Default export for easy destructuring
export default {
  colors,
  typography,
  spacing,
  themes,
  useTheme,
  ThemeProvider,
};

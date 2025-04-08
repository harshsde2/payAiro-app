/**
 * Theme configuration for the application
 * Supports both light and dark themes
 */

import { colors, ColorPalette } from './colors';
import typography from './typography';
import spacing from './spacing';

// Theme type definition
export type ThemeMode = 'light' | 'dark';

// Theme interface
export interface Theme {
  mode: ThemeMode;
  colors: {
    // Semantic colors (mapped differently in light/dark themes)
    background: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      inverse: string;
    };
    border: {
      default: string;
      light: string;
      dark: string;
    };
    shadow: {
      default: string;
      light: string;
    };
    card: {
      background: string;
      border: string;
    };
    button: {
      primary: {
        background: string;
        text: string;
      };
      secondary: {
        background: string;
        text: string;
      };
      ghost: {
        background: string;
        text: string;
      };
    };
    // Raw palette
    palette: ColorPalette;
  };
  typography: typeof typography;
  spacing: typeof spacing;
}

// Light theme
export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    background: {
      primary: colors.green50,
      secondary: colors.grey50,
      tertiary: colors.grey100,
    },
    text: {
      primary: colors.grey900,
      secondary: colors.grey700,
      tertiary: colors.grey500,
      inverse: colors.white,
    },
    border: {
      default: colors.grey300,
      light: colors.grey200,
      dark: colors.grey400,
    },
    shadow: {
      default: 'rgba(0, 0, 0, 0.1)',
      light: 'rgba(0, 0, 0, 0.05)',
    },
    card: {
      background: colors.white,
      border: colors.grey200,
    },
    button: {
      primary: {
        background: colors.primary,
        text: colors.white,
      },
      secondary: {
        background: colors.green100,
        text: colors.green800,
      },
      ghost: {
        background: 'transparent',
        text: colors.primary,
      },
    },
    palette: colors,
  },
  typography,
  spacing,
};

// Dark theme
export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    background: {
      primary: colors.grey900,
      secondary: colors.grey800,
      tertiary: colors.grey700,
    },
    text: {
      primary: colors.white,
      secondary: colors.grey200,
      tertiary: colors.grey400,
      inverse: colors.grey900,
    },
    border: {
      default: colors.grey700,
      light: colors.grey600,
      dark: colors.grey800,
    },
    shadow: {
      default: 'rgba(0, 0, 0, 0.3)',
      light: 'rgba(0, 0, 0, 0.2)',
    },
    card: {
      background: colors.grey800,
      border: colors.grey700,
    },
    button: {
      primary: {
        background: colors.green600,
        text: colors.white,
      },
      secondary: {
        background: colors.green900,
        text: colors.green100,
      },
      ghost: {
        background: 'transparent',
        text: colors.green400,
      },
    },
    palette: colors,
  },
  typography,
  spacing,
};

// Create a theme context and provider to easily switch themes
export const themes = {
  light: lightTheme,
  dark: darkTheme,
};

export default themes; 
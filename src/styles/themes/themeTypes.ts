import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { SPACING } from '../theme/spacing';
import { RADIUS } from '../theme/radius';
import { SHADOWS } from '../theme/shadows';

export interface ITheme {
  colors: {
    primary: string;
    secondary: string;
    tertiary: string;
    greenLight1: string;
    greenLight2: string;
    grey: string;
    white: string;
    black: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
  };
  typography: typeof TYPOGRAPHY;
  spacing: typeof SPACING;
  radius: typeof RADIUS;
  shadows: typeof SHADOWS;
}

export type ThemeMode = 'light' | 'dark';


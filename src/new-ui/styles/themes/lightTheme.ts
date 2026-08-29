import { ITheme } from './themeTypes';
import { TYPOGRAPHY } from '../theme/typography';
import { SPACING } from '../theme/spacing';
import { RADIUS } from '../theme/radius';
import { SHADOWS } from '../theme/shadows';
import { COLORS } from '../theme/colors';

export const lightTheme: ITheme = {
  isDark: false,
  colors: {
    primary: COLORS.primary,
    primaryLight: COLORS.greenLight2,
    secondary: COLORS.secondary,
    tertiary: COLORS.tertiary,
    greenLight1: COLORS.greenLight1,
    greenLight2: COLORS.greenLight2,
    grey: COLORS.grey,
    greyLight: COLORS.greyLight,
    greyDark: COLORS.greyDark,
    greyLight2: COLORS.greyLight2,
    white: COLORS.white,
    black: COLORS.black,
    background: COLORS.white,
    surface: '#F5F5F5',
    surfaceElevated: COLORS.white,
    text: COLORS.black,
    textSecondary: COLORS.grey,
    border: '#E5E5EA',
    error: '#FF3B30',
    success: COLORS.secondary,
    warning: '#FF9500',
    onPrimary: COLORS.white,
    overlay: 'rgba(0, 0, 0, 0.3)',
    errorSurface: '#FFE5E5',
    successSurface: COLORS.greenLight2,
    warningSurface: '#FFF3E0',
    inputBackground: '#F5F5F5',
    glassTint: 'rgba(255, 255, 255, 0.35)',
    glassBorder: 'rgba(255, 255, 255, 0.6)',
  },
  typography: TYPOGRAPHY,
  spacing: SPACING,
  radius: RADIUS,
  shadows: SHADOWS,
};

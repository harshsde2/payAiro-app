import { ITheme } from './themeTypes';
import { TYPOGRAPHY } from '../theme/typography';
import { SPACING } from '../theme/spacing';
import { RADIUS } from '../theme/radius';
import { SHADOWS } from '../theme/shadows';
import { COLORS } from '../theme/colors';

export const darkTheme: ITheme = {
  colors: {
    primary: COLORS.primary,
    primaryLight: '#1A3D2A',
    secondary: COLORS.secondary,
    tertiary: COLORS.tertiary,
    greenLight1: COLORS.greenLight1,
    greenLight2: COLORS.greenLight2,
    grey: COLORS.grey,
    greyLight: '#2C2C2E',
    greyDark: COLORS.greyDark,
    white: COLORS.white,
    black: COLORS.black,
    background: '#000000',
    surface: '#1C1C1E',
    text: COLORS.white,
    textSecondary: '#8E8E93',
    border: '#38383A',
    error: '#FF453A',
    success: COLORS.secondary,
    warning: '#FF9F0A',
  },
  typography: TYPOGRAPHY,
  spacing: SPACING,
  radius: RADIUS,
  shadows: SHADOWS,
};


import { ITheme } from './themeTypes';
import { TYPOGRAPHY } from '../theme/typography';
import { SPACING } from '../theme/spacing';
import { RADIUS } from '../theme/radius';
import { SHADOWS } from '../theme/shadows';
import { COLORS } from '../theme/colors';

export const darkTheme: ITheme = {
  isDark: true,
  colors: {
    // Brand green is lifted slightly so it keeps contrast against near-black surfaces;
    // COLORS.primary (#00793F) is too dark to read as "active" on #000.
    primary: '#0A9E55',
    primaryLight: '#1A3D2A',
    secondary: COLORS.secondary,
    // Doubles as a gradient accent and as the spinner/refresh tint, so it stays a mid
    // green: dark enough not to glare in a gradient, bright enough to read on black.
    tertiary: '#2E9E63',
    // greenLight1/2 are used almost exclusively as background tints and gradient stops.
    // Left at their pastel light values they would paint the Dashboard, Crypto and
    // Onboarding screens near-white in dark mode, so they invert to deep greens.
    greenLight1: '#123322',
    greenLight2: '#0C2416',
    grey: COLORS.grey,
    greyLight: '#2C2C2E',
    greyDark: COLORS.greyDark,
    // Light theme steps greyLight2 darker than greyLight for contrast against white;
    // on dark the equivalent step goes lighter, so it stays visible against #000/#1C1C1E.
    greyLight2: '#48484A',
    white: COLORS.white,
    black: COLORS.black,
    background: '#000000',
    surface: '#1C1C1E',
    surfaceElevated: '#2C2C2E',
    text: COLORS.white,
    textSecondary: '#8E8E93',
    border: '#38383A',
    error: '#FF453A',
    success: COLORS.secondary,
    warning: '#FF9F0A',
    onPrimary: COLORS.white,
    overlay: 'rgba(0, 0, 0, 0.6)',
    errorSurface: 'rgba(255, 69, 58, 0.18)',
    successSurface: 'rgba(47, 188, 57, 0.18)',
    warningSurface: 'rgba(255, 159, 10, 0.18)',
    inputBackground: '#1C1C1E',
    glassTint: 'rgba(30, 30, 30, 0.5)',
    glassBorder: 'rgba(255, 255, 255, 0.15)',
  },
  typography: TYPOGRAPHY,
  spacing: SPACING,
  radius: RADIUS,
  shadows: SHADOWS,
};

import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { SPACING } from '../theme/spacing';
import { RADIUS } from '../theme/radius';
import { SHADOWS } from '../theme/shadows';

export interface ITheme {
  /** True for the dark theme. Lets components pick blur types, image variants, etc. */
  isDark: boolean;
  colors: {
    primary: string;
    primaryLight: string;
    secondary: string;
    tertiary: string;
    greenLight1: string;
    greenLight2: string;
    grey: string;
    greyLight: string;
    greyDark: string;
    greyLight2: string;
    /**
     * Fixed white/black. These do NOT flip between themes — reach for them only when the
     * colour is genuinely fixed (QR codes, fills over brand green). For a surface use
     * `surface`/`surfaceElevated`; for text over a primary fill use `onPrimary`.
     */
    white: string;
    black: string;
    background: string;
    surface: string;
    /** A card/sheet sitting above `surface`. In light mode this is white. */
    surfaceElevated: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    /** Text/icons drawn on top of a `primary`-coloured fill. White in both themes. */
    onPrimary: string;
    /** Scrim behind modals and menus. */
    overlay: string;
    /** Low-opacity status tints, for chips and banners. */
    errorSurface: string;
    successSurface: string;
    warningSurface: string;
    /** Background for text inputs and other form fields. */
    inputBackground: string;
    /** Frosted-glass fill + hairline, used by GlassyWrapper. */
    glassTint: string;
    glassBorder: string;
  };
  typography: typeof TYPOGRAPHY;
  spacing: typeof SPACING;
  radius: typeof RADIUS;
  shadows: typeof SHADOWS;
}

export type ThemeMode = 'light' | 'dark';

/** What the user picked in Settings → Appearance. 'system' follows the OS setting. */
export type ThemePreference = ThemeMode | 'system';

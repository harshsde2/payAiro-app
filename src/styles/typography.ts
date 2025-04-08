/**
 * Typography definitions for the application
 */

export const fontFamily = {
  // Main font families
  nexaHeavy: 'Nexa-Heavy',
  montserrat: 'Montserrat-Regular',
  montserratMedium: 'Montserrat-Medium',
  montserratSemiBold: 'Montserrat-SemiBold',
  montserratBold: 'Montserrat-Bold',
  
  // Semantic naming for usage consistency
  headingFont: 'Nexa-Heavy',
  subheadingFont: 'Montserrat-SemiBold',
  bodyFont: 'Montserrat-Regular',
  
  // Legacy system fonts (keep for backward compatibility)
  regular: 'Montserrat-Regular',
  medium: 'Montserrat-Medium',
  semiBold: 'Montserrat-SemiBold',
  bold: 'Montserrat-Bold',
};

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  md: 18,
  lg: 20,
  xl: 24,
  xxl: 30,
  xxxl: 36,
};

// TypeScript compatible font weights
export const fontWeight = {
  thin: '100' as const,
  extraLight: '200' as const,
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
  black: '900' as const,
};

export const lineHeight = {
  xs: 16,
  sm: 20,
  base: 24,
  md: 28,
  lg: 32,
  xl: 36,
  xxl: 40,
};

// Common text styles that can be reused throughout the app
export const textStyles = {
  h1: {
    fontFamily: fontFamily.headingFont,
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.xxl,
  },
  h2: {
    fontFamily: fontFamily.headingFont,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.xl,
  },
  h3: {
    fontFamily: fontFamily.headingFont,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semiBold,
    lineHeight: lineHeight.lg,
  },
  h4: {
    fontFamily: fontFamily.headingFont,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semiBold,
    lineHeight: lineHeight.md,
  },
  subtitle1: {
    fontFamily: fontFamily.subheadingFont,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.base,
  },
  subtitle2: {
    fontFamily: fontFamily.subheadingFont,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.sm,
  },
  body1: {
    fontFamily: fontFamily.bodyFont,
    fontSize: fontSize.base,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.base,
  },
  body2: {
    fontFamily: fontFamily.bodyFont,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.sm,
  },
  button: {
    fontFamily: fontFamily.subheadingFont,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semiBold,
    lineHeight: lineHeight.base,
  },
  caption: {
    fontFamily: fontFamily.bodyFont,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.xs,
  },
};

export const typography = {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  textStyles,
};

export default typography; 
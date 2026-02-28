import { StyleSheet } from 'react-native';
import { ITheme } from '../themes/themeTypes';

export const headingStyles = (theme: ITheme) =>
  StyleSheet.create({
    h1: {
      fontSize: theme.typography.fontSize['4xl'],
      fontFamily: theme.typography.fontFamily.poppinsBold,
      color: theme.colors.text,
      lineHeight: theme.typography.fontSize['4xl'] * theme.typography.lineHeight.tight,
    },
    h2: {
      fontSize: theme.typography.fontSize['3xl'],
      fontFamily: theme.typography.fontFamily.poppinsBold,
      color: theme.colors.text,
      lineHeight: theme.typography.fontSize['3xl'] * theme.typography.lineHeight.tight,
    },
    h3: {
      fontSize: theme.typography.fontSize['2xl'],
      fontFamily: theme.typography.fontFamily.poppinsSemiBold,
      color: theme.colors.text,
      lineHeight: theme.typography.fontSize['2xl'] * theme.typography.lineHeight.tight,
    },
    h4: {
      fontSize: theme.typography.fontSize.xl,
      fontFamily: theme.typography.fontFamily.poppinsSemiBold,
      color: theme.colors.text,
      lineHeight: theme.typography.fontSize.xl * theme.typography.lineHeight.tight,
    },
    h5: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.poppinsSemiBold,
      color: theme.colors.text,
      lineHeight: theme.typography.fontSize.lg * theme.typography.lineHeight.tight,
    },
    h6: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.poppinsSemiBold,
      color: theme.colors.text,
      lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.tight,
    },
  });


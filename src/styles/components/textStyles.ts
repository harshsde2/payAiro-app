import { StyleSheet } from 'react-native';
import { ITheme } from '../themes/themeTypes';

export const textStyles = (theme: ITheme) =>
  StyleSheet.create({
    body: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.poppinsRegular,
      color: theme.colors.text,
      lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.normal,
    },
    bodySmall: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.poppinsRegular,
      color: theme.colors.text,
      lineHeight: theme.typography.fontSize.sm * theme.typography.lineHeight.normal,
    },
    bodyLarge: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.poppinsRegular,
      color: theme.colors.text,
      lineHeight: theme.typography.fontSize.lg * theme.typography.lineHeight.normal,
    },
    caption: {
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.poppinsRegular,
      color: theme.colors.textSecondary,
      lineHeight: theme.typography.fontSize.xs * theme.typography.lineHeight.normal,
    },
    label: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.poppinsMedium,
      color: theme.colors.text,
      lineHeight: theme.typography.fontSize.sm * theme.typography.lineHeight.normal,
    },
  });


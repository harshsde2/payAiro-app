import { StyleSheet } from 'react-native';
import { ITheme } from '../themes/themeTypes';

export const inputStyles = (theme: ITheme) =>
  StyleSheet.create({
    default: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.base,
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
    },
    focused: {
      borderColor: theme.colors.primary,
      borderWidth: 2,
    },
    error: {
      borderColor: theme.colors.error,
    },
    disabled: {
      backgroundColor: theme.colors.surface,
      opacity: 0.5,
    },
  });


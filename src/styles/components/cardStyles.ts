import { StyleSheet } from 'react-native';
import { ITheme } from '../themes/themeTypes';

export const cardStyles = (theme: ITheme) =>
  StyleSheet.create({
    default: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.base,
      ...theme.shadows.md,
    },
    elevated: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.base,
      ...theme.shadows.lg,
    },
    outlined: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.base,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
  });


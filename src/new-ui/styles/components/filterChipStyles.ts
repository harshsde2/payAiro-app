import { StyleSheet } from 'react-native';
import { ITheme } from '../themes/themeTypes';

export const filterChipStyles = (theme: ITheme) =>
  StyleSheet.create({
    chip: {
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chipSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    chipUnselected: {
      backgroundColor: theme.colors.surfaceElevated,
      borderColor: theme.colors.border,
    },
    labelSelected: {
      fontSize: 14,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.onPrimary,
    },
    labelUnselected: {
      fontSize: 14,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.text,
    },
  });

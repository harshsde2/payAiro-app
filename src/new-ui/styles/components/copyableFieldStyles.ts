import { StyleSheet } from 'react-native';
import { ITheme } from '../themes/themeTypes';

export const copyableFieldStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.md,
    },
    label: {
      fontSize: 14,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.primary,
      marginBottom: theme.spacing.sm,
    },
    fieldRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.full,
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.md,
      backgroundColor: theme.colors.surfaceElevated,
    },
    value: {
      flex: 1,
      fontSize: 15,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.text,
    },
    copyIcon: {
      marginLeft: theme.spacing.sm,
    },
  });

import { StyleSheet } from 'react-native';
import { ITheme } from '@new-ui/styles/themes/themeTypes';

export const accordionItemStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.white,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.lg,
      marginBottom: theme.spacing.sm,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.white,
    },
    title: {
      flex: 1,
    },
    body: {
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.base,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
  });

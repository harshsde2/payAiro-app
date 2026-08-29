import { StyleSheet } from 'react-native';
import { ITheme } from '@new-ui/styles/themes/themeTypes';

export const faqScreenStyles = (theme: ITheme) =>
  StyleSheet.create({
    content: {
      flex: 1,
      minHeight: 0,
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.sm,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.lg,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.surfaceElevated,
      marginBottom: theme.spacing.md,
    },
    searchIcon: {
      marginRight: theme.spacing.sm,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.text,
      padding: 0,
    },
    listContent: {
      paddingBottom: theme.spacing.xl,
    },
    loader: {
      marginTop: theme.spacing['2xl'],
    },
    centerState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing['2xl'],
      gap: theme.spacing.sm,
    },
  });

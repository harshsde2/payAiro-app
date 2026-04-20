import { StyleSheet } from 'react-native';
import { ITheme } from '../../themes/themeTypes';

export const viewStatementScreenStyles = (theme: ITheme) =>
  StyleSheet.create({
    content: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing.base,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.full,
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.white,
      marginBottom: theme.spacing.md,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.text,
      padding: 0,
    },
    searchIcon: {
      marginLeft: theme.spacing.sm,
    },
    listGap: {
      gap: theme.spacing.sm,
    },
    shareRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.md,
    },
    shareText: {
      fontSize: 15,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.text,
    },
    downloadButton: {
      borderRadius: 30,
      height: 54,
    },
  });

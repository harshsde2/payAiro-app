import { StyleSheet } from 'react-native';
import { ITheme } from '../../themes/themeTypes';

export const contactsScreenStyles = (theme: ITheme) =>
  StyleSheet.create({
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
      gap: theme.spacing.sm,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.lg,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.white,
      marginBottom: theme.spacing.xs,
    },
    searchIcon: {
      marginRight: theme.spacing.sm,
      lineHeight: 22,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.text,
      padding: 0,
    },
    recentScrollContent: {
      paddingVertical: theme.spacing.xs,
      gap: theme.spacing.lg,
    },
    allContactsGap: {
      gap: theme.spacing.sm,
    },
  });

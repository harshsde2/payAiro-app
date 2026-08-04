import { StyleSheet } from 'react-native';
import { ITheme } from '../../themes/themeTypes';

export const transactionLimitsStyles = (theme: ITheme) =>
  StyleSheet.create({
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.base,
      paddingTop: theme.spacing.md,
      gap: theme.spacing.lg,
    },
    tabRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    tabChip: {
      flex: 1,
    },
    card: {
      borderWidth: 1,
      borderColor: theme.colors.greyLight,
      borderRadius: theme.radius.lg,
      overflow: 'hidden',
      backgroundColor: theme.colors.white,
    },
    row: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    rowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.greyLight,
    },
    periodBlock: {
      gap: theme.spacing.sm,
    },
    periodHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    centerMessage: {
      paddingVertical: theme.spacing['2xl'],
      paddingHorizontal: theme.spacing.md,
      alignItems: 'center',
    },
    errorText: {
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    retryButton: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.primary,
    },
  });

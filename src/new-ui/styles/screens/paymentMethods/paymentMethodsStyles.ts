import { StyleSheet } from 'react-native';
import { ITheme } from '../../themes/themeTypes';

export const paymentMethodsStyles = (theme: ITheme) =>
  StyleSheet.create({
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.base,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing['2xl'],
    },
    sectionCard: {
      borderWidth: 1,
      borderColor: theme.colors.greyLight,
      borderRadius: theme.radius.lg,
      overflow: 'hidden',
      backgroundColor: theme.colors.white,
    },
    emptyText: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.lg,
      lineHeight: 22,
    },
    rowDivider: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.greyLight,
    },
    cardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.white,
    },
    cardIconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.greenLight2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardTextBlock: {
      flex: 1,
      marginLeft: theme.spacing.md,
      minWidth: 0,
    },
    cardRowDelete: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      marginLeft: theme.spacing.sm,
      justifyContent: 'center',
      alignItems: 'center',
      minWidth: 56,
    },
    cardRowDeleteText: {
      color: theme.colors.error,
    },
    emptyCtaSpacer: {
      marginTop: theme.spacing.lg,
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

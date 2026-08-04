import { StyleSheet } from 'react-native';
import { ITheme } from '../../themes/themeTypes';

/**
 * Shared by the Change PIN / Forgot PIN / Set New PIN screens — they're the same
 * layout (title, hint, field, spacer, button) with different fields, so they read as
 * one flow rather than three screens that drifted apart.
 */
export const pinFlowStyles = (theme: ITheme) =>
  StyleSheet.create({
    content: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing.base,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.base,
    },
    title: {
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      lineHeight: 20,
      marginBottom: theme.spacing.xl,
    },
    fieldGroup: {
      marginBottom: theme.spacing.xl,
    },
    label: {
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
    errorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.md,
    },
    errorText: {
      textAlign: 'center',
    },
    /** Pushes the action button to the bottom without pinning it over the keyboard. */
    spacer: {
      flex: 1,
      minHeight: theme.spacing.xl,
    },
    destinationCard: {
      flexDirection: 'row',
      alignItems: 'center',
      borderColor: theme.colors.greyLight,
      borderWidth: 1,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.xl,
    },
    destinationTextWrapper: {
      marginLeft: theme.spacing.sm,
      flex: 1,
    },
  });

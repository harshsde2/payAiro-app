import { StyleSheet } from 'react-native';
import { ITheme } from '../../themes/themeTypes';

export const appVersionStyles = (theme: ITheme) =>
  StyleSheet.create({
    content: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing.base,
      paddingTop: theme.spacing.xl,
      paddingBottom: theme.spacing.base,
      alignItems: 'center',
    },
    brand: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    versionHeadline: {
      marginTop: theme.spacing.xs,
    },
    card: {
      width: '100%',
      borderColor: theme.colors.greyLight,
      borderWidth: 1,
      borderRadius: theme.radius.lg,
      paddingHorizontal: theme.spacing.md,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.md,
    },
    // Hairline between rows only — the card already draws the outer border.
    rowDivider: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.greyLight,
    },
    rowValue: {
      flexShrink: 1,
      textAlign: 'right',
    },
    spacer: {
      flex: 1,
      minHeight: theme.spacing.xl,
    },
    copyButton: {
      width: '100%',
    },
  });

import { StyleSheet } from 'react-native';
import { ITheme } from '../themes/themeTypes';

export const transactionLimitMeterStyles = (theme: ITheme) =>
  StyleSheet.create({
    // Content only — no border/background and no horizontal padding. Each screen
    // already establishes its own gutters, so the meter inherits them and lines up
    // with whatever sits above and below it.
    container: {
      gap: theme.spacing.sm,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    errorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    errorText: {
      flexShrink: 1,
    },
    useMaxButton: {
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.greenLight2,
    },
  });

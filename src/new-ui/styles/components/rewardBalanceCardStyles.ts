import { StyleSheet } from 'react-native';
import { ITheme } from '../themes/themeTypes';

export const rewardBalanceCardStyles = (theme: ITheme) =>
  StyleSheet.create({
    glassyWrapper: {
      width: '100%',
      minHeight: 120,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.lg,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
    },
    titleText: {
      fontSize: 14,
      color: theme.colors.greyDark,
    },
    balanceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing.xs,
    },
    balanceAmountParts: {
      flexDirection: 'row',
      alignItems: 'baseline',
      maxWidth: '72%',
      flexShrink: 1,
    },
    chevronWrapper: {
      marginLeft: 6,
      alignSelf: 'center',
    },
    subtitleLink: {
      marginTop: theme.spacing.xs,
      alignSelf: 'center',
    },
  });

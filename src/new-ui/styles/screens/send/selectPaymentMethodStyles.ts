import { StyleSheet } from 'react-native';
import { ITheme } from '../../themes/themeTypes';

export const selectPaymentMethodStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    section: {
      marginTop: theme.spacing.lg,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    sectionTitle: {
      fontFamily: theme.typography.fontFamily.interSemiBold,
      fontSize: 18,
      color: theme.colors.text,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: 18,
      backgroundColor: theme.colors.white,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    cardLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    avatarCircle: {
      width: 42,
      height: 42,
      borderRadius: 21,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
      overflow: 'hidden',
    },
    avatarIcon: {
      width: 28,
      height: 28,
      borderRadius: 14,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    nameText: {
      flexShrink: 1,
    },
    subText: {
      marginTop: 2,
    },
    amountText: {
      fontFamily: theme.typography.fontFamily.interSemiBold,
      fontSize: 16,
      color: theme.colors.text,
      marginLeft: theme.spacing.md,
    },
    cryptoIconWrapper: {
      width: 42,
      height: 42,
      borderRadius: 21,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
  });


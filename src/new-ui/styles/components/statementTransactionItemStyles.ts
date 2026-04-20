import { StyleSheet } from 'react-native';
import { ITheme } from '../themes/themeTypes';

export const statementTransactionItemStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.white,
    },
    iconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.greyLight,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    avatarImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    textContainer: {
      flex: 1,
      marginLeft: theme.spacing.md,
    },
    title: {
      fontSize: 15,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.text,
    },
    datetime: {
      fontSize: 12,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textSecondary,
      marginTop: 3,
    },
    amountPositive: {
      fontSize: 15,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.success,
    },
    amountNegative: {
      fontSize: 15,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.error,
    },
    amountCrypto: {
      fontSize: 15,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.success,
    },
  });

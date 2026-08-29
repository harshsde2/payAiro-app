import { StyleSheet } from 'react-native';
import { ITheme } from '../themes/themeTypes';

export const scratchVoucherCardStyles = (theme: ITheme) =>
  StyleSheet.create({
    card: {
      flex: 1,
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.greenLight2,
      padding: theme.spacing.base,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 160,
    },
    giftCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.sm,
    },
    giftEmoji: {
      fontSize: 36,
    },
    unlockText: {
      fontSize: 12,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    pointsText: {
      fontSize: 15,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.primary,
      textAlign: 'center',
      marginTop: 2,
    },
    redeemedBrandIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.black,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.sm,
    },
    discountText: {
      fontSize: 16,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.primary,
    },
    descriptionText: {
      fontSize: 12,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    codeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      backgroundColor: theme.colors.surfaceElevated,
    },
    codeText: {
      fontSize: 12,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.text,
      flex: 1,
    },
  });

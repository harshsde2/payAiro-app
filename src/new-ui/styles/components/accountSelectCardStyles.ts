import { StyleSheet } from 'react-native';
import { ITheme } from '../themes/themeTypes';

export const accountSelectCardStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surfaceElevated,
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.greyLight,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
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
    maskedAccount: {
      fontSize: 12,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    checkIcon: {
      marginLeft: theme.spacing.sm,
    },
  });

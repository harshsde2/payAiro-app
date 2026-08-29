import { StyleSheet } from 'react-native';
import { ITheme } from '../themes/themeTypes';

export const contactActionRowStyles = (theme: ITheme) =>
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
    iconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
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
    subtitle: {
      fontSize: 12,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    chevron: {
      marginLeft: theme.spacing.sm,
    },
  });

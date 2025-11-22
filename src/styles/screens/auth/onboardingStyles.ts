import { StyleSheet } from 'react-native';
import { ITheme } from '../../themes/themeTypes';

export const onboardingStyles = (theme: ITheme) =>
  StyleSheet.create({
    contentContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing['3xl'],
    },
    logoCircle: {
      width: 80,
      height: 80,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    logoText: {
      marginTop: theme.spacing.sm,
    },
    graphicsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      width: '100%',
      marginBottom: theme.spacing['3xl'],
      paddingHorizontal: theme.spacing.xl,
    },
    graphicItem: {
      width: '45%',
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    coin: {
      width: 80,
      height: 80,
      borderRadius: theme.radius.full,
      backgroundColor: '#FFD700',
      justifyContent: 'center',
      alignItems: 'center',
    },
    shape: {
      width: 60,
      height: 60,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radius.md,
      transform: [{ rotate: '45deg' }],
    },
    textContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing['3xl'],
      paddingHorizontal: theme.spacing.base,
    },
    headline: {
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    subtitle: {
      textAlign: 'center',
    },
    buttonContainer: {
      width: '100%',
      paddingHorizontal: theme.spacing.base,
    },
    createAccountButton: {
      backgroundColor: theme.colors.surface,
      paddingVertical: theme.spacing.base,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: theme.radius.lg,
      alignItems: 'center',
      marginBottom: theme.spacing.base,
      ...theme.shadows.sm,
    },
    loginLink: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
    },
  });


import { StyleSheet } from 'react-native';
import { ITheme } from '../themes/themeTypes';

export const dashboardHeaderStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      // paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.sm,
    },
    usernameContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    avatarContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.greenLight2,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.white,
      overflow: 'hidden',
    },
    avatarImage: {
      width: 44,
      height: 44,
      borderRadius: 22,
      resizeMode: 'cover',
    },
    avatarText: {
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.primary,
      fontSize: theme.typography.fontSize.base,
    },
    textContainer: {
      marginLeft: theme.spacing.sm,
      flex: 1,
      gap: theme.spacing.xs,
    },
    welcomeText: {
      color: theme.colors.textSecondary,
      marginBottom: 2,
    },
    nameText: {
      color: theme.colors.text,
      fontFamily: theme.typography.fontFamily.semiBold,
    },
    menuButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    menuButtonGlassy: {
      width: 40,
      height: 40,
    },
  });

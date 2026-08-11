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
    rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
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
    menuIconWrapper: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    menuIconDot: {
      position: 'absolute',
      top: 0,
      right: 4,
      width: 8,
      height: 8,
      borderRadius: 5,
      backgroundColor: theme.colors.error,
    },
    menuBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      paddingHorizontal: theme.spacing.base,
      paddingTop: 120,
      alignItems: 'flex-end',
    },
    menuCardWrapper: {
      width: '70%',
      maxWidth: 260,
      alignItems: 'flex-end',
    },
    menuCard: {
      width: '100%',
      borderRadius: 20,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.base,
      shadowColor: '#000',
      shadowOpacity: 0.18,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 10 },
      elevation: 8,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.sm,
    },
    menuItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    menuItemText: {
      fontFamily: theme.typography.fontFamily.poppinsMedium,
      color: theme.colors.text,
    },
    menuRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    menuBadge: {
      minWidth: 20,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 999,
      backgroundColor: '#FFE5E5',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.xs,
    },
    menuBadgeText: {
      color: theme.colors.error,
    },
    menuDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.xs,
    },
  });

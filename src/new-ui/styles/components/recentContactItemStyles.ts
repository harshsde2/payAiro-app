import { StyleSheet } from 'react-native';
import { ITheme } from '../themes/themeTypes';

export const recentContactItemStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
    },
    avatarCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
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
    initials: {
      fontSize: 18,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.primary,
    },
    name: {
      marginTop: theme.spacing.xs,
      fontSize: 13,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.text,
      textAlign: 'center',
    },
  });

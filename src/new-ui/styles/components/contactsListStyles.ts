import { StyleSheet } from 'react-native';
import { ITheme } from '../themes/themeTypes';

export const contactsListStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    item: {
      alignItems: 'center',
      marginRight: theme.spacing.base,
    },
    addContactContainer: {
      alignItems: 'center',
      marginRight: theme.spacing.base,
    },
    contactCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.greyLight,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    contactImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    initials: {
      color: theme.colors.primary,
      fontSize: 18,
      fontFamily: theme.typography.fontFamily.semiBold,
    },
    name: {
      marginTop: theme.spacing.xs,
      fontSize: 14,
      fontFamily: theme.typography.fontFamily.interSemiBold,
      fontWeight: theme.typography.fontWeight.regular,
      color: theme.colors.text,
      textAlign: 'center',
    },
  });

import { StyleSheet } from 'react-native';
import { ITheme } from '../themes/themeTypes';

export const sendContactsListStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
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
      // shadowColor: 'rgba(15, 23, 42, 0.06)',
      // shadowOpacity: 1,
      // shadowOffset: { width: 0, height: 2 },
      // shadowRadius: 6,
      // elevation: 1,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      marginRight: theme.spacing.md,
      overflow: 'hidden',
      backgroundColor: '#F3F4F6',
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    nameAndTag: {
      flex: 1,
    },
    nameText: {
      marginBottom: 2,
    },
    tagText: {
      opacity: 0.6,
    },
  });


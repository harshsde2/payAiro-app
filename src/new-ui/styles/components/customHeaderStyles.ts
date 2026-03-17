import { StyleSheet } from 'react-native';
import { ITheme } from '../themes/themeTypes';

export const customHeaderStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.xs,
      minHeight: 56,
    },
    contentWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
    },
    leftButton: {
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
      width: 40,
      height: 40,
    },
    rightButton: {
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
      width: 40,
      height: 40,
    },
    titleContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });


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
      position: 'relative',
    },
    contentWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      position: 'relative',
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
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 0,
    },
  });


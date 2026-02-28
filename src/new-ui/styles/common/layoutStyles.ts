import { StyleSheet } from 'react-native';
import { ITheme } from '../themes/themeTypes';

export const layoutStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    wrapper: {
      paddingHorizontal: theme.spacing.base,
    },
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    contentContainer: {
      padding: theme.spacing.base,
    },
  });


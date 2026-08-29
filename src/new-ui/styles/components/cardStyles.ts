import { StyleSheet } from 'react-native';
import { ITheme } from '../themes/themeTypes';

export const cardStyles = (theme: ITheme) => {
  return StyleSheet.create({
    card: {
      width: '100%',
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.md,
    },
  });
};

import { StyleSheet } from 'react-native';
import { ITheme } from '../../themes/themeTypes';
import { cardStyles } from '../../components/cardStyles';

export const dashboardStyles = (theme: ITheme) => {
  const cards = cardStyles(theme);
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    contentContainer: {
      padding: theme.spacing.base,
    },
    header: {
      marginBottom: theme.spacing.xl,
    },
    balanceCard: {
      ...cards.default,
      marginBottom: theme.spacing.xl,
    },
    quickActions: {
      marginTop: theme.spacing.sm,
    },
    actionButton: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.base,
      borderRadius: theme.radius.md,
      marginBottom: theme.spacing.md,
      ...theme.shadows.sm,
    },
    logoutButton: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.base,
      borderRadius: theme.radius.md,
      marginTop: theme.spacing.xl,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.error,
      ...theme.shadows.sm,
    },
  });
};


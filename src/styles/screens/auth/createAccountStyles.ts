import { StyleSheet } from 'react-native';
import { ITheme } from '../../themes/themeTypes';

export const createAccountStyles = (theme: ITheme) => {
  return StyleSheet.create({
    content: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing.base,
      paddingTop: theme.spacing.base,
      paddingBottom: theme.spacing.xl,
    },
    welcomeText: {
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
    instructionText: {
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
    },
    inputContainer: {
      marginBottom: theme.spacing.base,
    },
    checkboxContainer: {
      marginVertical: theme.spacing.xl,
    },
    checkbox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.base,
    },
    checkboxBox: {
      width: 20,
      height: 20,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderRadius: theme.radius.sm,
      marginRight: theme.spacing.sm,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxChecked: {
      backgroundColor: theme.colors.primary,
    },
    checkboxText: {
      flex: 1,
    },
    verifyButton: {
      marginBottom: theme.spacing.base,
    },
    loginLink: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
    },
  });
};


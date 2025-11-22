import { StyleSheet } from 'react-native';
import { ITheme } from '../../themes/themeTypes';

export const createAccountStyles = (theme: ITheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    contentContainer: {
      flexGrow: 1,
      padding: theme.spacing.base,
    },
    backButton: {
      alignSelf: 'flex-start',
      padding: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    header: {
      marginBottom: theme.spacing.xl,
    },
    content: {
      flex: 1,
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


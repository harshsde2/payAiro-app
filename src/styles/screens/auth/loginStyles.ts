import { StyleSheet } from 'react-native';
import { ITheme } from '../../themes/themeTypes';
import { inputStyles } from '../../components/inputStyles';

export const loginStyles = (theme: ITheme) => {
  const inputs = inputStyles(theme);

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
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.sm,
    },
    content: {
      flex: 1,
      marginTop: theme.spacing.sm,
    },
    welcomeText: {
      marginBottom: theme.spacing.sm,
    },
    instructionText: {
      textAlign: 'center',
    },
    inputContainer: {
      marginBottom: theme.spacing.base,
    },
    label: {
      marginBottom: theme.spacing.sm,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      ...inputs.default,
    },
    input: {
      flex: 1,
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.text,
      paddingVertical: 0,
    },
    inputIcon: {
      marginRight: theme.spacing.sm,
    },
    eyeIcon: {
      padding: theme.spacing.xs,
    },
    forgotPasswordLink: {
      alignSelf: 'flex-start',
      marginBottom: theme.spacing.xl,
    },
    proceedButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.base,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      marginBottom: theme.spacing.base,
    },
    createAccountLink: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
    },
  });
};

import { StyleSheet } from 'react-native';
import { ITheme } from '../../themes/themeTypes';
import { inputStyles } from '../../components/inputStyles';

export const otpVerificationStyles = (theme: ITheme) => {
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
      marginBottom: theme.spacing.xl,
    },
    content: {
      flex: 1,
    },
    instructionText: {
      textAlign: 'center',
      // marginBottom: theme.spacing.xl,
    },
    inputContainer: {
      marginBottom: theme.spacing.base,
    },
    label: {
      marginBottom: theme.spacing.sm,
    },
    title: {
      marginBottom: theme.spacing.base,
    },
    titleContainer: { 
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.xs,
    },
    instructionTextContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.xs,
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
    eyeIcon: {
      padding: theme.spacing.xs,
    },
    resendContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    submitButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.base,
      borderRadius: theme.radius.md,
      alignItems: 'center',
    },
  });
};


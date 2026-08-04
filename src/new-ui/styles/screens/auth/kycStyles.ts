import { StyleSheet } from 'react-native';
import { ITheme } from '../../themes/themeTypes';

export const kycStyles = (theme: ITheme) => {
  return StyleSheet.create({
    content: {
      flexGrow: 1,
    },
    titleContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    title: {
      color: theme.colors.text,
    },
    subtitleContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      color: theme.colors.text,
      textAlign: 'center',
    },
    instructionTextContainer: {
      marginBottom: theme.spacing.xl,
    },
    instructionText: {
      lineHeight: 22,
      textAlign: 'center',
    },
    inputContainer: {
      marginBottom: theme.spacing.base,
    },
    countryCodeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    countryFlag: {
      fontSize: 16,
      marginRight: 4,
    },
    countryCodeText: {
      marginRight: 8,
    },
    chevronDown: {
      width: 0,
      height: 0,
      borderLeftWidth: 4,
      borderRightWidth: 4,
      borderTopWidth: 5,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderTopColor: theme.colors.textSecondary,
      marginLeft: 4,
    },
    payAiroSuffix: {
      // paddingRight: 16,
      // paddingLeft: 12,
    },
    skipKYCContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
      alignSelf: 'center',
    },
    skipKYCText: {
      marginRight: theme.spacing.xs,
    },
    buttonContainer: {
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: theme.spacing['3xl'],
    },
    arrowRight: {
      width: 0,
      height: 0,
      borderTopWidth: 4,
      borderBottomWidth: 4,
      borderLeftWidth: 5,
      borderTopColor: 'transparent',
      borderBottomColor: 'transparent',
      borderLeftColor: theme.colors.text,
      marginLeft: 8,
    },
    proceedButton: {
      marginBottom: theme.spacing.base,
    },
    startOverButton: {
      alignSelf: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.base,
    },
    startOverText: {
      textAlign: 'center',
    },
    disclaimerContainer: {
      marginTop: theme.spacing.sm,
    },
    disclaimerText: {
      textAlign: 'center',
      lineHeight: 18,
    },
    checkboxContainer: {
      marginVertical: theme.spacing.xl,
    },
    checkbox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.base,
    },
    checkboxIcon: {
      marginRight: theme.spacing.sm,
      marginTop: 2,
    },
    checkboxText: {
      flex: 1,
      lineHeight: 20,
    },
  });
};


import { StyleSheet } from 'react-native';
import { ITheme } from '../../themes/themeTypes';

export const addContactScreenStyles = (theme: ITheme) =>
  StyleSheet.create({
    content: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing.base,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
    },
    inputContainer: {
      marginBottom: theme.spacing.lg,
    },
    countryCodeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
    },
    countryCodeText: {
      fontSize: 15,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.text,
    },
    payairoTagSuffix: {
      paddingHorizontal: theme.spacing.md,
    },
    buttonContainer: {
      marginTop: 'auto' as any,
      paddingTop: theme.spacing.xl,
    },
    fieldError: {
      marginTop: theme.spacing.xs,
    },
    saveButton: {
      borderRadius: 30,
      height: 54,
    },
  });

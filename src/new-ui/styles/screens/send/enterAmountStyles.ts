import { StyleSheet } from 'react-native';
import { ITheme } from '../../themes/themeTypes';

export const enterAmountStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    headerArea: {
      alignItems: 'center',
      marginTop: theme.spacing['3xl'],
      paddingHorizontal: theme.spacing.base,
    },
    title: {
      marginBottom: theme.spacing.xs,
    },
    identifier: {
      marginBottom: theme.spacing['3xl'],
    },
    amountRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
    },
    amountCurrency: {
      marginRight: 4,
    },
    amountInteger: {
      fontSize: 40,
      fontFamily: theme.typography.fontFamily.semiBold,
    },
    amountFraction: {
      fontSize: 32,
      opacity: 0.5,
      marginLeft: 2,
    },
    inputWrapper: {
      marginTop: theme.spacing['3xl'],
      width: '100%',
    },
    bottomArea: {
      marginTop: theme.spacing['3xl'],
      paddingBottom: theme.spacing['2xl'],
      paddingTop: theme.spacing.lg,
      paddingHorizontal: theme.spacing.base,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: theme.spacing.base,
    },
    requestButton: {
      flex: 1,
      backgroundColor: theme.colors.black,
    },
    payButton: {
      flex: 1,
    },
  });


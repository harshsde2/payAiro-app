import { StyleSheet } from 'react-native';
import { ITheme } from '@new-ui/styles/themes/themeTypes';

export const addBalanceStyles = (theme: ITheme) =>
  StyleSheet.create({
    screenContent: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
    },
    sectionLabel: {
      marginBottom: theme.spacing.sm,
    },
    sectionSpacer: {
      marginTop: theme.spacing['2xl'],
      flex:1
    },
    availableAmount: {
      marginTop: theme.spacing.xs,
    },
    amountFieldRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.lg,
      overflow: 'hidden',
      minHeight: 52,
    },
    amountPrefix: {
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.md,
      backgroundColor: theme.colors.greenLight2,
      justifyContent: 'center',
    },
    amountInput: {
      flex: 1,
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.md,
      fontSize: 16,
      fontFamily: theme.typography.fontFamily.poppinsMedium,
      color: theme.colors.text,
    },
    chipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.md,
    },
    chip: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.base,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      minWidth: 56,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chipSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.greenLight2,
    },
    paymentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      minWidth: 0,
    },
    paymentIconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.greenLight2,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    paymentTextBlock: {
      flex: 1,
      minWidth: 0,
    },
    addNewCard: {
      marginTop: theme.spacing.md,
      alignSelf: 'flex-start',
    },
    proceedSpacer: {
      flexGrow: 1,
      minHeight: theme.spacing.xl,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'flex-end',
      padding: theme.spacing.xl,
    },
    modalCard: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.xl,
      paddingHorizontal: theme.spacing.lg,
      padding: theme.spacing.xl,
      height: 620,
    },
    modalCloseRow: {
      alignItems: 'center',
      marginBottom: theme.spacing.md,

    },
    modalCloseButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    successModalBackdrop: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    successModalCard: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.xl,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xl,
      alignItems: 'center',
      width: '100%',
      maxWidth: 340,
    },
    successLottie: {
      width: 250,
      height: 150,
    },
    successTitle: {
      marginTop: theme.spacing.md,
      textAlign: 'center',
    },
    successMessage: {
      marginTop: theme.spacing.sm,
      textAlign: 'center',
    },
    cardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.white,
    },
    cardRowSelect: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: 0,
    },
    cardRowDelete: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      marginLeft: theme.spacing.sm,
      justifyContent: 'center',
      alignItems: 'center',
      minWidth: 56,
    },
    cardRowDeleteText: {
      color: theme.colors.error,
    },
  });

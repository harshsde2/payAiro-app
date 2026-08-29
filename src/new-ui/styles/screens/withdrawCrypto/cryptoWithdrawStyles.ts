import { StyleSheet } from "react-native";
import { ITheme } from "../../themes/themeTypes";

export const cryptoWithdrawStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    keyboardAvoiding: {
      flex: 1,
    },
    header: {
      width: "100%",
      paddingVertical: 5,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: theme.spacing.base,
    },
    headerTitleContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.base,
      paddingTop: theme.spacing.base,
    },
    selectedCryptoTitle: {
      textAlign: "center",
      marginBottom: theme.spacing.md,
      color: theme.colors.textSecondary,
    },
    walletInputContainer: {
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing["2xl"],
    },
    bottomArea: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: theme.spacing.xl,
      paddingHorizontal: theme.spacing.base,
      paddingBottom: theme.spacing.sm,
    },
    fundingSourceContainer: {
      width: "80%",
    },
    modalBackdrop: {
      flex: 1,
      justifyContent:'flex-end',
      backgroundColor: theme.colors.overlay,
      paddingHorizontal: theme.spacing.base,
      paddingBottom: theme.spacing["2xl"],
    },
    modalCloseRow: {
      alignItems: "center",
      marginBottom: theme.spacing.sm,
    },
    modalCloseButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      // backgroundColor: theme.colors.surfaceElevated,
      alignItems: "center",
      justifyContent: "center",
    },
    modalCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
    },
    modalTitle: {
      marginBottom: theme.spacing.md,
    },
    modalRow: {
      marginTop: theme.spacing.sm,
    },
    modalLabel: {
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    modalAddressText: {
      color: theme.colors.text,
    },
    modalButtonArea: {
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
  });

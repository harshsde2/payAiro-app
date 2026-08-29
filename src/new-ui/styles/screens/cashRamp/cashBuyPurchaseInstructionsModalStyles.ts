import { StyleSheet } from "react-native";
import { ITheme } from "../../themes/themeTypes";

export const cashBuyPurchaseInstructionsModalStyles = (theme: ITheme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: theme.colors.black,
      borderTopLeftRadius: theme.radius.xl,
      borderTopRightRadius: theme.radius.xl,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing["2xl"],
      maxHeight: "92%",
    },
    dragHint: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.greyDark,
      alignSelf: "center",
      marginBottom: theme.spacing.md,
    },
    title: {
      marginBottom: theme.spacing.md,
      textAlign: "center",
    },
    listBox: {
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.35)",
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    bullet: {
      marginBottom: theme.spacing.sm,
    },
    feeBox: {
      backgroundColor: "rgba(255,255,255,0.08)",
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    footer: {
      marginBottom: theme.spacing.lg,
      opacity: 0.85,
    },
    loading: {
      paddingVertical: theme.spacing["3xl"],
      alignItems: "center",
    },
    errorText: {
      marginBottom: theme.spacing.md,
      textAlign: "center",
    },
    actions: {
      gap: theme.spacing.sm,
    },
  });

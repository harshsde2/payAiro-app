import { StyleSheet } from "react-native";
import { ITheme } from "@new-ui/styles/themes/themeTypes";

export const cashBuyBarcodeStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: theme.spacing.xl,
      paddingBottom: theme.spacing.xl,
    },
    retailerLogo: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignSelf: "center",
      marginBottom: theme.spacing.lg,
      // Intentionally fixed, not themed: third-party retailer logos are drawn for a white field.
      backgroundColor: theme.colors.white,
    },
    headline: {
      textAlign: "center",
      marginBottom: theme.spacing.sm,
    },
    address: {
      textAlign: "center",
      marginBottom: theme.spacing.md,
      opacity: 0.9,
    },
    subline: {
      textAlign: "center",
      marginBottom: theme.spacing.md,
    },
    callout: {
      width: "100%",
      marginBottom: theme.spacing.md,
    },
    calloutText: {
      textAlign: "center",
      lineHeight: 22,
    },
    mutedCenter: {
      textAlign: "center",
      marginBottom: theme.spacing.sm,
      opacity: 0.9,
    },
    tapCardWrap: {
      width: "100%",
      marginVertical: theme.spacing.lg,
    },
    tapCard: {
      width: "100%",
    },
    tapCardInner: {
      width: "100%",
      alignItems: "center",
    },
    tapIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      borderWidth: 2,
      borderColor: theme.colors.text,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing.md,
    },
    tapTitle: {
      textAlign: "center",
      marginBottom: theme.spacing.sm,
    },
    tapSub: {
      textAlign: "center",
      opacity: 0.9,
      lineHeight: 20,
    },
    timerRow: {
      alignItems: "center",
      marginBottom: theme.spacing.sm,
    },
    feesSection: {
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    feesLabel: {
      textAlign: "center",
      marginBottom: theme.spacing.sm,
    },
    feesCard: {
      width: "100%",
    },
    feesCardInner: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.sm,
    },
    quoteTimerRow: {
      textAlign: "center",
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
    },
    feesExpanded: {
      marginTop: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
      gap: 4,
    },
    legalBlock: {
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    legalText: {
      textAlign: "center",
      lineHeight: 20,
      opacity: 0.92,
    },
    link: {
      textDecorationLine: "underline",
    },
    cancelBtn: {
      alignSelf: "center",
      paddingVertical: theme.spacing.md,
    },
    loadingCenter: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: theme.spacing.xl,
    },
    barcodeCard: {
      // Intentionally fixed, not themed: barcode must stay on white to remain scannable.
      backgroundColor: theme.colors.white,
      borderRadius: theme.radius.xl,
      padding: theme.spacing.lg,
      alignItems: "center",
      marginVertical: theme.spacing.lg,
    },
    feeNoteBox: {
      backgroundColor: "rgba(255,255,255,0.55)",
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    successIcon: {
      width: 72,
      height: 72,
      borderRadius: 36,
      borderWidth: 2,
      borderColor: theme.colors.text,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      marginBottom: theme.spacing.lg,
      marginTop: theme.spacing["2xl"],
    },
    receiptRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: theme.spacing.md,
      gap: theme.spacing.md,
    },
    receiptDivider: {
      height: 1,
      backgroundColor: theme.colors.overlay,
      marginVertical: theme.spacing.lg,
    },
    footer: {
      marginTop: "auto",
      paddingTop: theme.spacing.xl,
    },
    txnIdRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: theme.spacing.sm,
      flex: 1,
      justifyContent: "flex-end",
    },
  });

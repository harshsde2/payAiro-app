import { StyleSheet } from "react-native";
import { ITheme } from "@new-ui/styles/themes/themeTypes";

export const cashRampBarcodeStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: theme.spacing.xl,
      paddingTop: theme.spacing.xl,
      paddingBottom: theme.spacing.xl,
    },
    title: {
      textAlign: "center",
      marginBottom: theme.spacing.md,
    },
    subtitle: {
      textAlign: "center",
      marginBottom: theme.spacing.xl,
    },
    glassyBarcode: {
      width: "100%",
      minHeight: 154,
    },
    barcodeGlassyInner: {
      width: "100%",
    },
    barcodeRow: {
      height: 110,
      width: "100%",
      flexDirection: "row",
      alignItems: "stretch",
      justifyContent: "space-between",
    },
    barcodeLine: {
      backgroundColor: "#1C1945",
      borderRadius: 1,
    },
    sellCodeCaption: {
      textAlign: "center",
      marginBottom: theme.spacing.sm,
      opacity: 0.85,
    },
    sellCodeText: {
      textAlign: "center",
      fontSize: 13,
      lineHeight: 20,
    },
    qrWrap: {
      alignItems: "center",
      justifyContent: "center",
      minHeight: 180,
      paddingVertical: 8,
    },
    qrInner: {
      backgroundColor: "#FFFFFF",
      padding: 10,
      borderRadius: 12,
    },
    sessionError: {
      textAlign: "center",
      marginBottom: 12,
    },
    metaText: {
      textAlign: "center",
      marginTop: theme.spacing.md,
    },
    disclaimer: {
      textAlign: "center",
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
      opacity: 0.92,
      lineHeight: 22,
    },
    detailBlock: {
      gap: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: theme.spacing.md,
    },
    detailLabel: {
      flex: 1,
    },
    detailValue: {
      textAlign: "right",
    },
    quoteNote: {
      textAlign: "center",
      marginBottom: theme.spacing.md,
      opacity: 0.85,
    },
    footer: {
      marginTop: theme.spacing["2xl"],
    },
  });

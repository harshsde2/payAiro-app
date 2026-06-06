import { StyleSheet } from "react-native";
import type { ITheme } from "../../themes/themeTypes";

export const cashOffRampTransactionDetailsStyles = (theme: ITheme) =>
  StyleSheet.create({
    scroll: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
    },
    badge: {
      alignSelf: "center",
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.full,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    wordmarkRow: {
      alignItems: "center",
      marginBottom: theme.spacing.lg,
    },
    wordmark: {
      color: theme.colors.text,
      letterSpacing: 0.5,
    },
    statusCard: {
      backgroundColor: "rgba(30, 30, 40, 0.88)",
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      alignItems: "center",
    },
    statusCardTitle: {
      color: theme.colors.white,
      marginBottom: theme.spacing.sm,
    },
    statusCardBody: {
      color: theme.colors.white,
      opacity: 0.92,
      lineHeight: 22,
      textAlign: "center",
      width: "100%",
    },
    readyCodeValue: {
      color: theme.colors.white,
      marginVertical: theme.spacing.sm,
      letterSpacing: 2,
      textAlign: "center",
      width: "100%",
    },
    phoneLine: {
      color: theme.colors.white,
      opacity: 0.9,
      marginTop: theme.spacing.xs,
      textAlign: "center",
      width: "100%",
    },
    pickupDisclaimer: {
      color: theme.colors.white,
      opacity: 0.85,
      marginTop: theme.spacing.md,
      textAlign: "center",
    },
    receiptCard: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.radius.lg,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    rowLast: { borderBottomWidth: 0 },
    rowBold: {
      marginTop: theme.spacing.xs,
      paddingTop: theme.spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
    },
    label: { flex: 1, marginRight: theme.spacing.sm },
    valueCol: { flex: 1.2, alignItems: "flex-end" },
    copyRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm },
    link: { textDecorationLine: "underline" },
    fraudLink: {
      textAlign: "center",
      marginBottom: theme.spacing.md,
      textDecorationLine: "underline",
    },
    footer: {
      gap: theme.spacing.md,
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.xl,
    },
    closeTextBtn: {
      alignItems: "center",
      paddingVertical: theme.spacing.md,
    },
    heroTitle: {
      color: theme.colors.white,
      textAlign: "center",
      marginBottom: theme.spacing.sm,
    },
    supportLink: {
      textDecorationLine: "underline",
    },
  });

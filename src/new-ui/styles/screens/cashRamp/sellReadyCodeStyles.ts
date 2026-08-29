import { StyleSheet } from "react-native";
import type { ITheme } from "../../themes/themeTypes";

export const sellReadyCodeStyles = (theme: ITheme) =>
  StyleSheet.create({
    content: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    soldBlock: {
      alignItems: "center",
      marginBottom: theme.spacing.lg,
    },
    soldAmount: {
      marginTop: theme.spacing.sm,
      color: theme.colors.text,
    },
    locationBlock: {
      alignItems: "center",
      marginBottom: theme.spacing.xl,
      paddingHorizontal: theme.spacing.md,
    },
    locationLabel: {
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    locationAddress: {
      textAlign: "center",
      color: theme.colors.text,
    },
    statusCard: {
      backgroundColor: "rgba(30, 30, 40, 0.85)",
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    statusCardTitle: {
      color: theme.colors.onPrimary,
      marginBottom: theme.spacing.sm,
    },
    statusCardBody: {
      color: theme.colors.onPrimary,
      opacity: 0.9,
      lineHeight: 22,
    },
    readyCodeValue: {
      color: theme.colors.onPrimary,
      marginTop: theme.spacing.sm,
      letterSpacing: 1,
    },
    fraudLink: {
      textAlign: "center",
      marginBottom: theme.spacing.lg,
      textDecorationLine: "underline",
    },
    footer: {
      gap: theme.spacing.md,
      marginTop: "auto" as const,
    },
    closeTextBtn: {
      alignItems: "center",
      paddingVertical: theme.spacing.md,
    },
    darkModalOverlay: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: "center",
      paddingHorizontal: theme.spacing.lg,
    },
    darkModalCard: {
      backgroundColor: "rgba(35, 35, 50, 0.98)",
      borderRadius: theme.radius.lg,
      padding: theme.spacing.xl,
      alignItems: "center",
    },
    darkModalTitle: {
      color: theme.colors.onPrimary,
      textAlign: "center",
      marginBottom: theme.spacing.md,
    },
    darkModalBody: {
      color: theme.colors.onPrimary,
      textAlign: "center",
      opacity: 0.92,
      lineHeight: 22,
    },
    darkModalBodyLast: {
      marginBottom: theme.spacing.xl,
    },
    darkModalButton: {
      alignSelf: "stretch",
    },
  });

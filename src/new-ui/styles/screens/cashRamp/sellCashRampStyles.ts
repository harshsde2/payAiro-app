import { StyleSheet } from "react-native";
import type { ITheme } from "../../themes/themeTypes";

export const sellCashRampStyles = (theme: ITheme) =>
  StyleSheet.create({
    screen: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.lg,
    },
    limitScreen: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: theme.spacing.xl,
    },
    limitTitle: {
      textAlign: "center",
      marginBottom: theme.spacing.md,
    },
    limitBody: {
      textAlign: "center",
      marginBottom: theme.spacing.xl,
      color: theme.colors.textSecondary,
    },
    feeCard: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      marginTop: theme.spacing.lg,
    },
    feeRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: theme.spacing.xs,
    },
    checkboxRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginTop: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: theme.colors.border,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 2,
    },
    checkboxChecked: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    footer: {
      paddingVertical: theme.spacing.lg,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: "center",
      paddingHorizontal: theme.spacing.lg,
    },
    modalCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
    },
    modalTitle: {
      marginBottom: theme.spacing.sm,
    },
    modalBody: {
      marginBottom: theme.spacing.lg,
      color: theme.colors.textSecondary,
    },
    headlineCenter: {
      textAlign: "center",
      marginBottom: theme.spacing.xs,
    },
    sublineCenter: {
      textAlign: "center",
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.lg,
    },
  });

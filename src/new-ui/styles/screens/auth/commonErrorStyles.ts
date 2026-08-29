import { StyleSheet } from "react-native";
import { ITheme } from "../../themes/themeTypes";

export const commonErrorStyles = (theme: ITheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surfaceElevated,
      borderTopLeftRadius: theme.radius.lg,
      borderTopRightRadius: theme.radius.lg,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.xl,
      paddingBottom: theme.spacing.xl,
    },
    title: {
      marginBottom: theme.spacing.md,
    },
    description: {
      marginBottom: theme.spacing.xl,
    },
    alternateButton: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: theme.spacing.md,
      marginBottom: theme.spacing.md,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    alternateButtonText: {
      color: theme.colors.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
    },
    primaryButton: {
      marginTop: theme.spacing.sm,
    },
  });

import { StyleSheet } from "react-native";
import { ITheme } from "../../themes/themeTypes";

export const commonErrorStyles = (theme: ITheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.background,
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
  });

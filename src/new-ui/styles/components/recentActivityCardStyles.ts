import { StyleSheet } from "react-native";
import { ITheme } from "../themes/themeTypes";

export const recentActivityCardStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.white,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
      elevation: 2,
    },
    iconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.greyLight,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
    },
    iconCircleInner: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    pendingDot: {
      position: "absolute",
      bottom: 2,
      right: 2,
      width: 10,
      height: 10,
      borderRadius: 5,
      borderWidth: 2,
      borderColor: theme.colors.white,
    },
    textContainer: {
      flex: 1,
      marginLeft: theme.spacing.md,
    },
    title: {
      fontSize: 15,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.text,
    },
    datetime: {
      fontSize: 12,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textSecondary,
      marginTop: 3,
    },
    amountPositive: {
      fontSize: 15,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.success,
    },
    amountNegative: {
      fontSize: 15,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.error,
    },
    initialText: {
      fontSize: 18,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.text,
    },
  });

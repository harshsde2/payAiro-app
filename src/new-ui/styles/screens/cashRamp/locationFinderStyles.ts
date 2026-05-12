import { StyleSheet } from "react-native";
import { ITheme } from "@new-ui/styles/themes/themeTypes";

export const locationFinderStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.black,
    },
    map: {
      ...StyleSheet.absoluteFillObject,
    },
    searchHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: theme.spacing.base,
      paddingTop: theme.spacing["4xl"],
      gap: theme.spacing.sm,
    },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.white,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    searchInputWrap: {
      flex: 1,
      borderRadius: 18,
      backgroundColor: theme.colors.white,
      paddingHorizontal: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      minHeight: 40,
      justifyContent: "center",
    },
    hasearchInput: {
      color: theme.colors.text,
      fontFamily: theme.typography.fontFamily.poppinsRegular,
      fontSize: 14,
      paddingVertical: 0,
    },
    filterButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.white,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    markerWrap: {
      alignItems: "center",
      justifyContent: "center",
    },
    markerDot: {
      minWidth: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 6,
      borderWidth: 2,
      borderColor: theme.colors.white,
    },
    carouselWrap: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: theme.spacing.xl,
    },
    carouselContent: {
      paddingHorizontal: theme.spacing.lg,
      columnGap: theme.spacing.md,
    },
    locationCard: {
      width: 290,
      borderRadius: theme.radius.xl,
      backgroundColor: "rgba(10, 11, 56, 0.95)",
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
      gap: theme.spacing.xs,
    },
    locationCardSelected: {
      borderColor: theme.colors.primary,
    },
    locationCardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    locationAddress: {
      opacity: 0.8,
    },
    locationHours: {
      marginBottom: theme.spacing.md,
    },
    sellCodeBlock: {
      marginTop: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.md,
      backgroundColor: "rgba(255,255,255,0.08)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.12)",
    },
    sellCodeLabel: {
      marginBottom: theme.spacing.xs,
      opacity: 0.85,
    },
    sellCodeValue: {
      fontFamily: theme.typography.fontFamily.poppinsRegular,
    },
    sellMoreDetailsWrap: {
      marginTop: theme.spacing.md,
    },
    stateWrap: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 170,
      alignItems: "center",
      justifyContent: "center",
    },
  });

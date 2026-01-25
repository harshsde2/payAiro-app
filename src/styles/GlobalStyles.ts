import { Platform, StyleSheet, Dimensions } from "react-native";
import { Theme } from "./theme";
import { useTheme } from "./ThemeContext";

export const useGlobalStyles = () => {
  const { theme } = useTheme();
  return globalStyles(theme);
};

export const globalStyles = (theme: Theme) =>
  StyleSheet.create({
    whiteSheetContainer: {
      flex: 1,
      backgroundColor: theme.colors.palette.white,
      borderTopEndRadius: theme.spacing.spacing[8],
      borderTopStartRadius: theme.spacing.spacing[8],
      padding: theme.spacing.spacing[5],
      marginTop: theme.spacing.spacing[5],
    },
    CommonModalContainer: {
      backgroundColor: theme.colors.palette.white,
      borderTopEndRadius: theme.spacing.spacing[8],
      borderTopStartRadius: theme.spacing.spacing[8],
      padding: theme.spacing.spacing[5],
      marginTop: theme.spacing.spacing[5],
      // justifyContent: "flex-end",
    },
    shadowContainer: {
      shadowColor: theme.colors.palette.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 2,
    },
    rowJustifyItems: {
      flexDirection: "row",
      backgroundColor: "red",
      justifyContent: "space-around",
      alignItems: "center",
    },
  });

const { width, height } = Dimensions.get("window");

export const qrScannerStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.palette.black,
    },
    camera: {
      width: width,
      height: Platform.OS === "ios" ? height : height,
      alignSelf: "center",
    },
    topBar: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: theme.spacing.spacing[5],
      paddingVertical: theme.spacing.spacing[5],
    },
    topBarActions: {
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-end",
      flexDirection: "row",
      gap: theme.spacing.spacing[5],
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.palette.black,
    },
    loadingText: {
      marginTop: theme.spacing.spacing[4],
      color: theme.colors.palette.white,
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.regular,
    },
    permissionContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.palette.black,
      paddingHorizontal: theme.spacing.spacing[8],
    },
    permissionTitle: {
      color: theme.colors.palette.white,
      marginTop: theme.spacing.spacing[6],
      marginBottom: theme.spacing.spacing[3],
      textAlign: "center",
    },
    permissionText: {
      color: theme.colors.palette.grey400,
      textAlign: "center",
      fontSize: theme.typography.fontSize.sm,
      lineHeight: theme.typography.lineHeight.sm,
      fontFamily: theme.typography.fontFamily.regular,
    },
    permissionButton: {
      marginTop: theme.spacing.spacing[8],
      backgroundColor: theme.colors.palette.green800,
      paddingVertical: theme.spacing.spacing[4],
      paddingHorizontal: theme.spacing.spacing[8],
      borderRadius: 25,
    },
    permissionButtonText: {
      color: theme.colors.palette.white,
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semiBold,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.palette.black,
      paddingHorizontal: theme.spacing.spacing[8],
    },
    errorTitle: {
      color: theme.colors.palette.white,
      marginTop: theme.spacing.spacing[6],
      marginBottom: theme.spacing.spacing[3],
      textAlign: "center",
    },
    errorText: {
      color: theme.colors.palette.grey400,
      textAlign: "center",
      fontSize: theme.typography.fontSize.sm,
      lineHeight: theme.typography.lineHeight.sm,
      fontFamily: theme.typography.fontFamily.regular,
    },
  });

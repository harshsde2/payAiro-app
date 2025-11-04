import { Platform, StyleSheet } from "react-native";
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
    kycBannerContainer: {
      width: "100%",
      height:40,
      backgroundColor: theme.colors.palette.pendingStatusLight,
      paddingVertical: theme.spacing.spacing[3],
      paddingHorizontal: theme.spacing.spacing[4],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.palette.pendingStatusDark,
      position:'absolute',
      top:Platform.OS == 'ios' ? 45 : 0,
      zIndex:1000
    },
    kycBannerContainerNotStarted: {
      width: "100%",
      height:40,
      backgroundColor: theme.colors.palette.yellow500,
      paddingVertical: theme.spacing.spacing[3],
      paddingHorizontal: theme.spacing.spacing[4],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.palette.yellow400,
      position:'absolute',
      top:Platform.OS == 'ios' ? 45 : 0,
      zIndex:1000
    },
    kycBannerText: {
      color: theme.colors.palette.black,
      fontSize: 10,
      fontWeight: "600",
      textAlign: "center",
    },
    kycBannerTextNotStarted: {
      color: theme.colors.palette.black,
      fontSize: 10,
      fontWeight: "600",
      textAlign: "center",
    },
  });

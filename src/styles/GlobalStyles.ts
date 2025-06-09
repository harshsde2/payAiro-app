import { StyleSheet } from "react-native";
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
  });

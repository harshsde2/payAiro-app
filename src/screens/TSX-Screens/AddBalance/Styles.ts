import { StyleSheet } from "react-native";
import { Theme, useTheme } from "styles";

export const useCommonAddBalanceStyles = () => {
  const { theme } = useTheme();
  return commonAddBalanceStyles(theme);
};

export const commonAddBalanceStyles = (theme: Theme) =>
  StyleSheet.create({
    whiteSheetContainer: {
      backgroundColor: theme.colors.palette.white,
      borderTopEndRadius: theme.spacing.spacing[8],
      borderTopStartRadius: theme.spacing.spacing[8],
      padding: theme.spacing.spacing[5],
      marginTop: theme.spacing.spacing[5],
      width: "100%",
      flex: 1,
    },
  });

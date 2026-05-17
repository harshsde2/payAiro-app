import React from "react";
import { ActivityIndicator, View } from "react-native";
import CustomText from "@new-ui/components/common-components/CustomText";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { cashBuyBarcodeStyles } from "@new-ui/styles/screens/cashRamp/cashBuyBarcodeStyles";
import { CASH_BUY_LOADING_SUB, CASH_BUY_LOADING_TITLE } from "./cashBuyBarcodeInstructionCopy";

const CashBuyBarcodeLoadingView: React.FC = () => {
  const { theme } = useTheme();
  const styles = cashBuyBarcodeStyles(theme);

  return (
    <View style={styles.loadingCenter}>
      <ActivityIndicator size="large" color={theme.colors.text} />
      <CustomText
        variant="h3"
        fontWeight="bold"
        color={theme.colors.text}
        style={{ marginTop: theme.spacing.xl, textAlign: "center" }}
      >
        {CASH_BUY_LOADING_TITLE}
      </CustomText>
      <CustomText
        variant="body"
        color={theme.colors.text}
        style={{ marginTop: theme.spacing.md, textAlign: "center", opacity: 0.9 }}
      >
        {CASH_BUY_LOADING_SUB}
      </CustomText>
    </View>
  );
};

export default CashBuyBarcodeLoadingView;

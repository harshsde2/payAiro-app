import React from "react";
import { View } from "react-native";
import CustomText from "@new-ui/components/common-components/CustomText";
import Button from "@new-ui/components/common-components/layout/Button";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { cashBuyBarcodeStyles } from "@new-ui/styles/screens/cashRamp/cashBuyBarcodeStyles";
import {
  CASH_BUY_FAILED_BODY,
  CASH_BUY_FAILED_BODY2,
  CASH_BUY_FAILED_TITLE,
  CASH_BUY_START_NEW,
} from "./cashBuyBarcodeInstructionCopy";

type Props = {
  onStartNew: () => void;
};

const CashBuyTransactionFailedView: React.FC<Props> = ({ onStartNew }) => {
  const { theme } = useTheme();
  const styles = cashBuyBarcodeStyles(theme);

  return (
    <View style={[styles.container, { justifyContent: "space-between" }]}>
      <View style={{ marginTop: theme.spacing["3xl"] }}>
        <CustomText variant="h2" fontWeight="bold" color={theme.colors.text} style={styles.headline}>
          {CASH_BUY_FAILED_TITLE}
        </CustomText>
        <CustomText variant="body" color={theme.colors.text} style={[styles.subline, { marginTop: theme.spacing.lg }]}>
          {CASH_BUY_FAILED_BODY}
        </CustomText>
        <CustomText variant="body" color={theme.colors.text} style={styles.mutedCenter}>
          {CASH_BUY_FAILED_BODY2}
        </CustomText>
      </View>
      <View style={styles.footer}>
        <Button onPress={onStartNew}>{CASH_BUY_START_NEW}</Button>
      </View>
    </View>
  );
};

export default CashBuyTransactionFailedView;

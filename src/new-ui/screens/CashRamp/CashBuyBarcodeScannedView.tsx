import React from "react";
import { ActivityIndicator, View } from "react-native";
import CustomText from "@new-ui/components/common-components/CustomText";
import Button from "@new-ui/components/common-components/layout/Button";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { cashBuyBarcodeStyles } from "@new-ui/styles/screens/cashRamp/cashBuyBarcodeStyles";
import { CASH_BUY_FINALIZE, CASH_BUY_SCANNED_TITLE } from "./cashBuyBarcodeInstructionCopy";

type Props = {
  finalizing: boolean;
  onFinalize: () => void;
};

const CashBuyBarcodeScannedView: React.FC<Props> = ({ finalizing, onFinalize }) => {
  const { theme } = useTheme();
  const styles = cashBuyBarcodeStyles(theme);

  return (
    <View style={[styles.container, { justifyContent: "space-between" }]}>
      <View>
        <View style={styles.successIcon}>
          <CustomText variant="h2" color={theme.colors.text}>
            ✓
          </CustomText>
        </View>
        <CustomText variant="h2" fontWeight="bold" color={theme.colors.text} style={styles.headline}>
          {CASH_BUY_SCANNED_TITLE}
        </CustomText>
      </View>
      <View style={styles.footer}>
        {finalizing ? (
          <ActivityIndicator color={theme.colors.text} style={{ marginBottom: theme.spacing.md }} />
        ) : null}
        <Button onPress={onFinalize} disabled={finalizing}>
          {CASH_BUY_FINALIZE}
        </Button>
      </View>
    </View>
  );
};

export default CashBuyBarcodeScannedView;

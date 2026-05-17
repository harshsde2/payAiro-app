import React, { useMemo } from "react";
import { useWindowDimensions, View } from "react-native";
import Barcode from "@adrianso/react-native-barcode-builder";
import CustomText from "@new-ui/components/common-components/CustomText";
import Button from "@new-ui/components/common-components/layout/Button";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { cashBuyBarcodeStyles } from "@new-ui/styles/screens/cashRamp/cashBuyBarcodeStyles";
import {
  CASH_BUY_BARCODE_HEADLINE,
  CASH_BUY_CASHIER_CONFIRM_FEE,
  CASH_BUY_CLOSE,
  CASH_BUY_DEFAULT_MAX_RETAIL_FEE,
  cashBuyRetailFeeNote,
} from "./cashBuyBarcodeInstructionCopy";
import CashBuyBarcodeExpiryTimer from "./CashBuyBarcodeExpiryTimer";
import CashBuyBarcodeFeesSection from "./CashBuyBarcodeFeesSection";

const BARCODE_HEIGHT = 120;

export type CashBuyBarcodeDisplayViewProps = {
  fiat: string;
  amount: number;
  barcodeValue: string;
  expiryAt: Date | null;
  maxRetailFee: string;
  quoteRestartKey: number;
  cryptoCode: string;
  unitUsdPrice: number | null;
  feeLines: string[];
  onClose: () => void;
};

const CashBuyBarcodeDisplayView: React.FC<CashBuyBarcodeDisplayViewProps> = ({
  fiat,
  amount,
  barcodeValue,
  expiryAt,
  maxRetailFee,
  quoteRestartKey,
  cryptoCode,
  unitUsdPrice,
  feeLines,
  onClose,
}) => {
  const { theme } = useTheme();
  const styles = cashBuyBarcodeStyles(theme);
  const { width: windowWidth } = useWindowDimensions();
  const feeDisplay = maxRetailFee || CASH_BUY_DEFAULT_MAX_RETAIL_FEE;

  const barcodeWidth = useMemo(
    () => Math.max(200, Math.min(windowWidth - theme.spacing.xl * 2, 360)),
    [theme.spacing.xl, windowWidth]
  );

  return (
    <View style={styles.container}>
      <CustomText variant="h3" fontWeight="bold" color={theme.colors.text} style={styles.headline}>
        {CASH_BUY_BARCODE_HEADLINE}
      </CustomText>
      <CustomText variant="body" color={theme.colors.text} style={styles.subline}>
        Amount to add:{" "}
        <CustomText fontWeight="bold">
          {fiat} {amount.toFixed(2)}
        </CustomText>
      </CustomText>
      <CustomText variant="body" size={13} color={theme.colors.text} style={styles.mutedCenter}>
        {CASH_BUY_CASHIER_CONFIRM_FEE}
      </CustomText>

      <View style={styles.feeNoteBox}>
        <CustomText variant="caption" color={theme.colors.text} style={{ textAlign: "center", lineHeight: 18 }}>
          {cashBuyRetailFeeNote(feeDisplay)}
        </CustomText>
      </View>

      <View style={styles.barcodeCard}>
        <View style={{ width: barcodeWidth, height: BARCODE_HEIGHT }}>
          <Barcode
            value={barcodeValue}
            format="CODE128"
            lineColor="#111111"
            style={{ flex: 1, backgroundColor: "#FFFFFF" }}
          />
        </View>
      </View>

      <CashBuyBarcodeExpiryTimer expiryAt={expiryAt} />

      <CashBuyBarcodeFeesSection
        cryptoCode={cryptoCode}
        unitUsdPrice={unitUsdPrice}
        feeLines={feeLines}
        quoteRestartKey={quoteRestartKey}
      />

      <View style={styles.footer}>
        <Button onPress={onClose}>{CASH_BUY_CLOSE}</Button>
      </View>
    </View>
  );
};

export default CashBuyBarcodeDisplayView;

import React, { useMemo } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import CustomText from "@new-ui/components/common-components/CustomText";
import GlassyWrapper from "@new-ui/components/common-components/GlassyWrapper";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { cashBuyBarcodeStyles } from "@new-ui/styles/screens/cashRamp/cashBuyBarcodeStyles";
import {
  CASH_BUY_CANCEL_TRANSACTION,
  CASH_BUY_CASHIER_SUBLINE,
  CASH_BUY_DEFAULT_MAX_RETAIL_FEE,
  CASH_BUY_SCAN_LOCATION_ONLY,
  CASH_BUY_TAP_CARD_SUB,
  CASH_BUY_TAP_CARD_TITLE,
  CASH_BUY_WALMART_CALLOUT,
  cashBuyHeadline,
  cashBuyRetailFeeLine,
} from "./cashBuyBarcodeInstructionCopy";
import CashBuyBarcodeExpiryTimer from "./CashBuyBarcodeExpiryTimer";
import CashBuyBarcodeFeesSection from "./CashBuyBarcodeFeesSection";
import CashBuyBarcodeLegalText from "./CashBuyBarcodeLegalText";

export type CashBuyBarcodeInstructionViewProps = {
  retailerName: string;
  addressLine: string;
  isWalmart: boolean;
  maxRetailFee: string;
  cryptoCode: string;
  unitUsdPrice: number | null;
  feeLines: string[];
  imageUrl?: string | null;
  quoteRestartKey: number;
  expiryAt: Date;
  onTapReveal: () => void;
  onCancel: () => void;
};

const CashBuyBarcodeInstructionView: React.FC<CashBuyBarcodeInstructionViewProps> = ({
  retailerName,
  addressLine,
  isWalmart,
  maxRetailFee,
  cryptoCode,
  unitUsdPrice,
  feeLines,
  imageUrl,
  quoteRestartKey,
  expiryAt,
  onTapReveal,
  onCancel,
}) => {
  const { theme } = useTheme();
  const styles = cashBuyBarcodeStyles(theme);
  const feeDisplay = maxRetailFee || CASH_BUY_DEFAULT_MAX_RETAIL_FEE;

  const logoSource = useMemo(() => (imageUrl?.trim() ? { uri: imageUrl.trim() } : null), [imageUrl]);

  const showWalmartCallout =
    isWalmart || retailerName.toLowerCase().includes("walmart");

  const glassyCardProps = {
    borderRadius: theme.radius.xl,
    blurAmount: 28,
    blurType: "light" as const,
    overlayOpacity: 0.38,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.85)",
    flowLayout: true,
  };

  return (
    <View style={styles.container}>
      

      <CustomText variant="h3" fontWeight="bold" color={theme.colors.text} style={styles.headline}>
        {cashBuyHeadline(retailerName)}
      </CustomText>
      {addressLine ? (
        <CustomText variant="body" color={theme.colors.text} style={styles.address}>
          {addressLine}
        </CustomText>
      ) : null}
      <CustomText variant="body" color={theme.colors.text} style={styles.subline}>
        {CASH_BUY_CASHIER_SUBLINE}
      </CustomText>

      {showWalmartCallout ? (
        <GlassyWrapper
          style={styles.callout}
          padding={theme.spacing.md}
          {...glassyCardProps}
        >
          <CustomText variant="body" color={theme.colors.text} style={styles.calloutText}>
            {CASH_BUY_WALMART_CALLOUT}
          </CustomText>
        </GlassyWrapper>
      ) : null}

      <CustomText variant="body" size={13} color={theme.colors.text} style={styles.mutedCenter}>
        {CASH_BUY_SCAN_LOCATION_ONLY}
      </CustomText>
      <CustomText variant="body" size={13} color={theme.colors.text} style={styles.mutedCenter}>
        {cashBuyRetailFeeLine(feeDisplay)}
      </CustomText>

      <TouchableOpacity onPress={onTapReveal} activeOpacity={0.9} style={styles.tapCardWrap}>
        <GlassyWrapper
          style={styles.tapCard}
          padding={theme.spacing.xl}
          {...glassyCardProps}
        >
          <View style={styles.tapCardInner}>
            <View style={styles.tapIcon}>
              <CustomText variant="h4" color={theme.colors.text}>
                ⌖
              </CustomText>
            </View>
            <CustomText variant="body" fontWeight="bold" color={theme.colors.text} style={styles.tapTitle}>
              {CASH_BUY_TAP_CARD_TITLE}
            </CustomText>
            <CustomText variant="caption" color={theme.colors.text} style={styles.tapSub}>
              {CASH_BUY_TAP_CARD_SUB}
            </CustomText>
          </View>
        </GlassyWrapper>
      </TouchableOpacity>

      <CashBuyBarcodeExpiryTimer expiryAt={expiryAt} />

      <CashBuyBarcodeFeesSection
        cryptoCode={cryptoCode}
        unitUsdPrice={unitUsdPrice}
        feeLines={feeLines}
        quoteRestartKey={quoteRestartKey}
      />

      <CashBuyBarcodeLegalText />

      <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
        <CustomText variant="body" fontWeight="semiBold" color={theme.colors.text}>
          {CASH_BUY_CANCEL_TRANSACTION}
        </CustomText>
      </TouchableOpacity>
    </View>
  );
};

export default CashBuyBarcodeInstructionView;

import React, { useCallback, useState } from "react";
import { LayoutAnimation, Platform, TouchableOpacity, UIManager, View } from "react-native";
import CustomText from "@new-ui/components/common-components/CustomText";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { cashBuyBarcodeStyles } from "@new-ui/styles/screens/cashRamp/cashBuyBarcodeStyles";
import { AppIcon } from "@new-ui/assets/svgs";
import {
  CASH_BUY_DISPLAY_FEES_LABEL,
  CASH_BUY_QUOTE_REFRESH_SECONDS,
  cashBuyExchangeRateLine,
  cashBuyQuoteUpdatesLabel,
} from "./cashBuyBarcodeInstructionCopy";
import { formatDurationShort, useIntervalCountdown } from "./useCountdownTo";
import GlassyWrapper from "@new-ui/components/common-components/GlassyWrapper";

type Props = {
  cryptoCode: string;
  unitUsdPrice: number | null;
  feeLines?: string[];
  quoteRestartKey?: number;
};

const CashBuyBarcodeFeesSection: React.FC<Props> = ({
  cryptoCode,
  unitUsdPrice,
  feeLines = [],
  quoteRestartKey = 0,
}) => {
  const { theme } = useTheme();
  const styles = cashBuyBarcodeStyles(theme);
  const [expanded, setExpanded] = useState(false);
  const quoteRemaining = useIntervalCountdown(CASH_BUY_QUOTE_REFRESH_SECONDS, quoteRestartKey);

  const rateLabel =
    unitUsdPrice != null
      ? cashBuyExchangeRateLine(cryptoCode, unitUsdPrice.toFixed(2))
      : `1 ${cryptoCode} ≈ —`;

  const toggle = useCallback(() => {
    if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  }, []);

  return (
    <View style={styles.feesSection}>
      <CustomText variant="body" color={theme.colors.text} style={styles.feesLabel}>
        {CASH_BUY_DISPLAY_FEES_LABEL}
      </CustomText>
      <TouchableOpacity onPress={toggle} activeOpacity={0.85}>
        <GlassyWrapper
          style={styles.feesCard}
          padding={theme.spacing.md}
          borderRadius={theme.radius.lg}
          blurAmount={28}
          overlayOpacity={0.38}
          borderWidth={1}
          borderColor="rgba(255, 255, 255, 0.85)"
          flowLayout
        >
          <View style={styles.feesCardInner}>
            <CustomText variant="body" fontWeight="medium" color={theme.colors.text}>
              {rateLabel}
            </CustomText>
            <View style={{ transform: [{ rotate: expanded ? "180deg" : "0deg" }] }}>
              <AppIcon.ChevronDown width={18} height={18} color={theme.colors.text} />
            </View>
          </View>
        </GlassyWrapper>
      </TouchableOpacity>
      <CustomText variant="body" size={13} color={theme.colors.text} style={styles.quoteTimerRow}>
        {cashBuyQuoteUpdatesLabel(formatDurationShort(quoteRemaining))}
      </CustomText>
      {expanded && feeLines.length > 0 ? (
        <View style={styles.feesExpanded}>
          {feeLines.map((line) => (
            <CustomText key={line} variant="caption" color={theme.colors.text} style={{ textAlign: "center" }}>
              {line}
            </CustomText>
          ))}
        </View>
      ) : null}
    </View>
  );
};

export default CashBuyBarcodeFeesSection;

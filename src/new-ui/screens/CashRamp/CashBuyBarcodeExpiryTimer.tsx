import React from "react";
import CustomText from "@new-ui/components/common-components/CustomText";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { cashBuyBarcodeStyles } from "@new-ui/styles/screens/cashRamp/cashBuyBarcodeStyles";
import {
  CASH_BUY_EXPIRY_URGENT_SECONDS,
  cashBuyExpiryLabel,
} from "./cashBuyBarcodeInstructionCopy";
import { formatBarcodeExpiryCountdown, useCountdownTo } from "./useCountdownTo";

type Props = {
  expiryAt: Date | null;
};

const CashBuyBarcodeExpiryTimer: React.FC<Props> = ({ expiryAt }) => {
  const { theme } = useTheme();
  const styles = cashBuyBarcodeStyles(theme);
  const remaining = useCountdownTo(expiryAt);

  if (remaining == null) return null;

  const urgent = remaining <= CASH_BUY_EXPIRY_URGENT_SECONDS;
  const color = urgent ? theme.colors.error ?? "#E53935" : theme.colors.text;

  return (
    <CustomText variant="body" color={color} style={styles.timerRow} fontWeight="semiBold">
      {cashBuyExpiryLabel(formatBarcodeExpiryCountdown(remaining))}
    </CustomText>
  );
};

export default CashBuyBarcodeExpiryTimer;

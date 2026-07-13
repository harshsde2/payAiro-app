import React, { useCallback } from "react";
import { TouchableOpacity, View } from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import CustomText from "@new-ui/components/common-components/CustomText";
import Button from "@new-ui/components/common-components/layout/Button";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { cashBuyBarcodeStyles } from "@new-ui/styles/screens/cashRamp/cashBuyBarcodeStyles";
import {
  CASH_BUY_ALL_DONE,
  CASH_BUY_COPY,
  CASH_BUY_DONE,
  CASH_BUY_SUCCESS_BODY,
  CASH_BUY_SUCCESS_BODY_BOLD,
} from "./cashBuyBarcodeInstructionCopy";
import type { CashRampPurchaseReceipt } from "./useCashRampBarcodeStatus";
import { showError, showSuccess } from "utils/toast";

function truncateId(id: string, head = 10, tail = 5): string {
  const t = id.trim();
  if (t.length <= head + tail + 3) return t;
  return `${t.slice(0, head)}...${t.slice(-tail)}`;
}

type Props = {
  receipt: CashRampPurchaseReceipt;
  onDone: () => void;
};

const CashBuyPurchaseSuccessView: React.FC<Props> = ({ receipt, onDone }) => {
  const { theme } = useTheme();
  const styles = cashBuyBarcodeStyles(theme);

  const onCopy = useCallback(() => {
    const id = receipt.transactionId.trim();
    if (!id) {
      showError("Nothing to copy", "No transaction ID available.");
      return;
    }
    Clipboard.setString(id);
    showSuccess("Copied", "Transaction ID copied to clipboard.");
  }, [receipt.transactionId]);

  const dateLabel = receipt.completedAt.toLocaleString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <View style={[styles.container, { justifyContent: "space-between" }]}>
      <View>
        <View style={styles.successIcon}>
          <CustomText variant="h2" color={theme.colors.text}>
            ✓
          </CustomText>
        </View>
        <CustomText variant="h2" fontWeight="bold" color={theme.colors.text} style={styles.headline}>
          {CASH_BUY_ALL_DONE}
        </CustomText>
        <CustomText variant="body" color={theme.colors.text} style={styles.subline}>
          {CASH_BUY_SUCCESS_BODY}
        </CustomText>
        <CustomText variant="body" fontWeight="bold" color={theme.colors.text} style={styles.mutedCenter}>
          {CASH_BUY_SUCCESS_BODY_BOLD}
        </CustomText>

        <View style={styles.receiptDivider} />

        <View style={styles.receiptRow}>
          <CustomText variant="body" color={theme.colors.text}>
            Date and Time
          </CustomText>
          <CustomText variant="body" color={theme.colors.text} style={{ flex: 1, textAlign: "right" }}>
            {dateLabel}
          </CustomText>
        </View>
        <View style={styles.receiptRow}>
          <CustomText variant="body" color={theme.colors.text}>
            Transaction ID
          </CustomText>
          <View style={styles.txnIdRow}>
            <CustomText variant="body" color={theme.colors.text}>
              {truncateId(receipt.transactionId)}
            </CustomText>
            <TouchableOpacity onPress={onCopy}>
              <CustomText variant="body" color={theme.colors.text} style={styles.link}>
                {CASH_BUY_COPY}
              </CustomText>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.receiptRow}>
          <CustomText variant="body" color={theme.colors.text}>
            Payment Method
          </CustomText>
          <CustomText variant="body" color={theme.colors.text}>
            {receipt.paymentMethod}
          </CustomText>
        </View>
        <View style={styles.receiptRow}>
          <CustomText variant="body" color={theme.colors.text}>
            Total
          </CustomText>
          <CustomText variant="body" fontWeight="bold" color={theme.colors.text}>
            {receipt.totalLabel}
          </CustomText>
        </View>
      </View>

      <View style={styles.footer}>
        <Button onPress={onDone}>{CASH_BUY_DONE}</Button>
      </View>
    </View>
  );
};

export default CashBuyPurchaseSuccessView;

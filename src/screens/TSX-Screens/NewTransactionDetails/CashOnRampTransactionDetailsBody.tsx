import React, { useCallback } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import { formatLongDateTime } from "utils/dateUtils";
import CustomText from "@new-ui/components/common-components/CustomText";
import Button from "@new-ui/components/common-components/layout/Button";
import ScreenWrapper from "@new-ui/components/common-components/ScreenWrapper";
import { useTheme } from "@new-ui/styles/ThemeContext";
import type { ITheme } from "@new-ui/styles/themes/themeTypes";
import type { IUnifiedTransaction } from "../UnifiedTransactions/types";
import { CASH_ONRAMP_PROCESSING_MESSAGE } from "new-ui/components/common-components/RecentActivityCard/cashOnRampActivity";
import { showError, showSuccess } from "utils/toast";

function formatUsd(value: string | null | undefined): string | null {
  if (!value) return null;
  const n = Number.parseFloat(value);
  if (!Number.isFinite(n)) return null;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

type Props = {
  transactionData: IUnifiedTransaction;
  onClose: () => void;
};

const cashOnRampDetailsStyles = (theme: ITheme) =>
  StyleSheet.create({
    scroll: { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.xl },
    badge: {
      alignSelf: "center",
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.full,
      marginTop: theme.spacing.lg,
    },
    headerTitle: {
      textAlign: "center",
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    infoBox: {
      backgroundColor: theme.colors.greyLight,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      marginVertical: theme.spacing.md,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    rowLast: { borderBottomWidth: 0 },
    label: { flex: 1, marginRight: theme.spacing.sm },
    valueCol: { flex: 1.2, alignItems: "flex-end" },
    // flexShrink lets a full-length id/hash wrap inside the value column.
    copyRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm, flexShrink: 1 },
    link: { textDecorationLine: "underline" },
    footer: { marginTop: theme.spacing.lg, marginBottom: theme.spacing.xl },
  });

const CashOnRampTransactionDetailsBody: React.FC<Props> = ({
  transactionData,
  onClose,
}) => {
  const { theme } = useTheme();
  const styles = cashOnRampDetailsStyles(theme);
  const details = transactionData.cash_onramp_details;
  const crypto = transactionData.crypto_details;
  const asset = (crypto?.token ?? crypto?.asset ?? details?.credit_currency_code ?? "Crypto").toUpperCase();

  const isProcessing = transactionData.status === "processing";
  const statusLabel = isProcessing ? "Processing" : "Completed";
  const statusBg = isProcessing ? theme.colors.warning : theme.colors.success;

  const headerLine =
    transactionData.display_party?.identifier ??
    `Cashier – ${details?.retailer_label ?? "Cash purchase"}`;

  const dateLabel = formatLongDateTime(transactionData.created_at);
  const txnId = transactionData.transaction_id;
  const txHash =
    details?.transaction_provider_ref ?? crypto?.tx_hash ?? null;

  const assetPrice = formatUsd(details?.debit_currency_unit_price ?? crypto?.exchange_rate);
  const assetAmount =
    crypto?.amount && asset
      ? `${crypto.amount} ${asset}`
      : details?.credit_currency_amount && asset
        ? `${details.credit_currency_amount} ${asset}`
        : null;

  const totalLabel = formatUsd(transactionData.amount) ?? `$${transactionData.amount}`;

  const onCopy = useCallback((value: string, label: string) => {
    const v = value.trim();
    if (!v) {
      showError("Nothing to copy", `No ${label} available.`);
      return;
    }
    Clipboard.setString(v);
    showSuccess("Copied", `${label} copied to clipboard.`);
  }, []);

  // Identifiers (transaction id / hash) are shown IN FULL and wrap — they are copied and
  // quoted to support, so clipping the tail would hide exactly the distinguishing part.
  const renderCopyValue = (value: string, label: string) => (
    <View style={styles.copyRow}>
      <CustomText
        variant="body"
        color={theme.colors.text}
        style={{ textAlign: "right", flexShrink: 1 }}
      >
        {value}
      </CustomText>
      <TouchableOpacity onPress={() => onCopy(value, label)}>
        <CustomText variant="body" color={theme.colors.text} style={styles.link}>
          Copy
        </CustomText>
      </TouchableOpacity>
    </View>
  );

  const feeRows: { label: string; value: string }[] = [];
  if (details?.processing_fee) {
    feeRows.push({ label: "Processing Fee", value: formatUsd(details.processing_fee) ?? details.processing_fee });
  }
  if (details?.network_fee) {
    feeRows.push({ label: "Network Fee", value: formatUsd(details.network_fee) ?? details.network_fee });
  }
  if (details?.exchange_fee) {
    feeRows.push({ label: "Exchange Fee", value: formatUsd(details.exchange_fee) ?? details.exchange_fee });
  }

  return (
    <ScreenWrapper safeArea safeAreaEdges={["bottom"]} backgroundColor={theme.colors.white}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={[styles.badge, { backgroundColor: statusBg }]}>
          <CustomText variant="body" fontWeight="semiBold" color={theme.colors.white}>
            {statusLabel}
          </CustomText>
        </View>

        <CustomText variant="h2" fontWeight="bold" color={theme.colors.text} style={styles.headerTitle}>
          {headerLine}
        </CustomText>

        {isProcessing ? (
          <View style={styles.infoBox}>
            <CustomText variant="body" color={theme.colors.text}>
              {details?.processing_message ?? CASH_ONRAMP_PROCESSING_MESSAGE}
            </CustomText>
          </View>
        ) : null}

        <View>
          <View style={styles.row}>
            <CustomText variant="body" color={theme.colors.text} style={styles.label}>
              Date and Time
            </CustomText>
            <CustomText variant="body" color={theme.colors.text} style={styles.valueCol}>
              {dateLabel}
            </CustomText>
          </View>

          <View style={styles.row}>
            <CustomText variant="body" color={theme.colors.text} style={styles.label}>
              Transaction ID
            </CustomText>
            <View style={styles.valueCol}>{renderCopyValue(txnId, "Transaction ID")}</View>
          </View>

          <View style={styles.row}>
            <CustomText variant="body" color={theme.colors.text} style={styles.label}>
              Payment Method
            </CustomText>
            <CustomText variant="body" color={theme.colors.text} style={styles.valueCol}>
              {details?.payment_method ?? "Cash"}
            </CustomText>
          </View>

          {txHash ? (
            <View style={styles.row}>
              <CustomText variant="body" color={theme.colors.text} style={styles.label}>
                Transaction Hash
              </CustomText>
              <View style={styles.valueCol}>{renderCopyValue(txHash, "Transaction Hash")}</View>
            </View>
          ) : null}

          {assetPrice ? (
            <View style={styles.row}>
              <CustomText variant="body" color={theme.colors.text} style={styles.label}>
                {asset} Price
              </CustomText>
              <CustomText variant="body" color={theme.colors.text} style={styles.valueCol}>
                {assetPrice}
              </CustomText>
            </View>
          ) : null}

          {assetAmount ? (
            <View style={styles.row}>
              <CustomText variant="body" color={theme.colors.text} style={styles.label}>
                {asset} Amount
              </CustomText>
              <CustomText variant="body" color={theme.colors.text} style={styles.valueCol}>
                {assetAmount}
              </CustomText>
            </View>
          ) : null}

          {feeRows.map((row) => (
            <View key={row.label} style={styles.row}>
              <CustomText variant="body" color={theme.colors.text} style={styles.label}>
                {row.label}
              </CustomText>
              <CustomText variant="body" color={theme.colors.text} style={styles.valueCol}>
                {row.value}
              </CustomText>
            </View>
          ))}

          <View style={[styles.row, styles.rowLast]}>
            <CustomText variant="body" color={theme.colors.text} style={styles.label}>
              Total
            </CustomText>
            <CustomText variant="body" fontWeight="bold" color={theme.colors.text} style={styles.valueCol}>
              {totalLabel}
            </CustomText>
          </View>
        </View>

        <View style={styles.footer}>
          <Button onPress={onClose}>Close</Button>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default CashOnRampTransactionDetailsBody;

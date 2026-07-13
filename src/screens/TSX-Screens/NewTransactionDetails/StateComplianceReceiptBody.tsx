import React, { useCallback, useRef } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View, Alert } from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import { formatServerDate } from "utils/dateUtils";
import ViewShot from "react-native-view-shot";
import Share from "react-native-share";
import CustomText from "@new-ui/components/common-components/CustomText";
import Button from "@new-ui/components/common-components/layout/Button";
import ScreenWrapper from "@new-ui/components/common-components/ScreenWrapper";
import { useTheme } from "@new-ui/styles/ThemeContext";
import type { ITheme } from "@new-ui/styles/themes/themeTypes";
import type { IUnifiedTransaction, RegulatoryReceipt } from "../UnifiedTransactions/types";
import { showSuccess } from "utils/toast";

// Best-effort full asset name for the receipt title; falls back to the symbol.
const ASSET_NAMES: Record<string, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  LTC: "Litecoin",
  USDC: "USD Coin",
  USDT: "Tether",
};

function truncateId(id: string, head = 10, tail = 5): string {
  const t = (id ?? "").trim();
  if (t.length <= head + tail + 3) return t;
  return `${t.slice(0, head)}...${t.slice(-tail)}`;
}

function isEmptyValue(value: string | null | undefined): boolean {
  return value == null || String(value).trim() === "";
}

// Fiat amount fields rendered as 2-decimal USD with a dollar sign.
const FIAT_AMOUNT_KEYS = new Set([
  "purchase_amount",
  "sell_amount",
  "transaction_fees",
  "card_processing_fee",
  "instant_withdrawal_fee",
  "total",
]);

function formatUsd(value: string, fractionDigits = 2): string | null {
  const n = Number.parseFloat(value);
  if (!Number.isFinite(n)) return null;
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}`;
}

type Props = {
  transactionData: IUnifiedTransaction;
  receipt: RegulatoryReceipt;
  onClose: () => void;
};

const StateComplianceReceiptBody: React.FC<Props> = ({ transactionData, receipt }) => {
  const { theme } = useTheme();
  const styles = receiptStyles(theme);
  const screenshotRef = useRef<ViewShot>(null);

  const isBuy = (receipt.transactionType || transactionData.transaction_type)
    .toLowerCase()
    .includes("buy");
  const status = (receipt.transactionStatus ?? "").toLowerCase();
  const isPending = status === "pending" || status === "processing" || status === "storing";
  const isFailed = status === "failed" || status === "cancelled";

  const crypto = transactionData.crypto_details;
  const assetSymbol = (crypto?.token ?? crypto?.asset ?? crypto?.to_currency ?? "Crypto").toUpperCase();
  const assetName = ASSET_NAMES[assetSymbol] ?? assetSymbol;
  const title = isBuy ? `Purchased ${assetName}` : `Sold ${assetName}`;

  let badgeLabel: string;
  let badgeBg: string;
  if (isPending) {
    badgeLabel = "Pending";
    badgeBg = theme.colors.warning;
  } else if (isFailed) {
    badgeLabel = "Failed";
    badgeBg = theme.colors.error;
  } else {
    badgeLabel = isBuy ? "Purchased" : "Sold";
    badgeBg = isBuy ? theme.colors.success : theme.colors.grey;
  }

  const fields = (receipt.receiptFields ?? []).filter((f) => !isEmptyValue(f.value));

  const totalField = fields.find((f) => f.key === "total");
  const bigAmount =
    (totalField ? formatUsd(totalField.value) : null) ??
    formatUsd(String(transactionData.final_amount ?? transactionData.amount ?? "")) ??
    "";

  const formatFieldValue = useCallback((key: string, value: string): string => {
    if (key === "date_and_time") {
      return formatServerDate(value, "MMM D, YYYY [at] h:mm A", value);
    }
    if (FIAT_AMOUNT_KEYS.has(key)) {
      return formatUsd(value) ?? value;
    }
    if (key === "crypto_price") {
      const n = Number.parseFloat(value);
      if (!Number.isFinite(n)) return value;
      return `$${n.toLocaleString("en-US", { maximumFractionDigits: 8 })}`;
    }
    return value;
  }, []);

  const onCopyTxn = useCallback((value: string) => {
    const v = (value ?? "").trim();
    if (!v) return;
    Clipboard.setString(v);
    showSuccess("Copied", "Transaction ID copied to clipboard.");
  }, []);

  const onShare = useCallback(async () => {
    try {
      if (screenshotRef.current?.capture) {
        const uri = await screenshotRef.current.capture();
        await Share.open({
          title: "PayAiro Transaction Receipt",
          message: "PayAiro Transaction Receipt",
          url: uri,
          type: "image/png",
        });
      }
    } catch (e: any) {
      const msg = String(e?.message ?? e ?? "").toLowerCase();
      if (msg.includes("cancel") || msg.includes("user did not share")) return;
      Alert.alert("Error", "Failed to share receipt.");
    }
  }, []);

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={["bottom"]}
      backgroundColor={theme.colors.white}
      padding={0}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <ViewShot
          ref={screenshotRef}
          options={{ format: "png", quality: 0.9, result: "tmpfile" }}
          style={styles.screenshotContainer}
        >
          {/* Header / Summary Block */}
          <View style={styles.headerSection}>
            <View style={styles.visaCircle}>
              <CustomText variant="caption" fontWeight="bold" color={theme.colors.white}>
                VISA
              </CustomText>
            </View>

            <CustomText
              variant="h2"
              fontWeight="semiBold"
              size={20}
              color={theme.colors.text}
              style={styles.title}
            >
              {title}
            </CustomText>
            <CustomText
              variant="body"
              size={14}
              color={theme.colors.textSecondary}
              style={styles.subtitle}
            >
              Visa Debit
            </CustomText>

            {!!bigAmount && (
              <CustomText
                variant="h1"
                fontWeight="extraBold"
                size={40}
                color={theme.colors.text}
                style={styles.amountText}
              >
                {bigAmount}
              </CustomText>
            )}

            <View style={[styles.statusBadge, { backgroundColor: badgeBg }]}>
              <CustomText variant="caption" fontWeight="semiBold" color={theme.colors.white}>
                {badgeLabel}
              </CustomText>
            </View>
          </View>

          {/* Header message (pending / failed) */}
          {!!receipt.headerMessage && (
            <View style={styles.infoBox}>
              <CustomText variant="caption" size={12} color={theme.colors.text} style={styles.infoBoxText}>
                {receipt.headerMessage}
              </CustomText>
            </View>
          )}

          {/* Fields — rendered verbatim from the backend receipt, inside a card */}
          <View style={styles.whiteCard}>
            {fields.map((field, index) => {
              const isLast = index === fields.length - 1;
              const rowStyle = isLast ? [styles.detailRow, styles.detailRowLast] : styles.detailRow;

              if (field.key === "transaction_id") {
                return (
                  <View key={field.key} style={rowStyle}>
                    <CustomText
                      variant="caption"
                      size={11}
                      color={theme.colors.textSecondary}
                      style={styles.label}
                    >
                      {field.label}
                    </CustomText>
                    <TouchableOpacity onPress={() => onCopyTxn(field.value)} style={styles.copyRow}>
                      <CustomText
                        variant="caption"
                        size={11}
                        fontWeight="semiBold"
                        color={theme.colors.text}
                        numberOfLines={1}
                        style={{ maxWidth: 150 }}
                      >
                        {truncateId(field.value)}
                      </CustomText>
                      <CustomText
                        variant="caption"
                        size={11}
                        fontWeight="bold"
                        color={theme.colors.text}
                        style={styles.link}
                      >
                        Copy
                      </CustomText>
                    </TouchableOpacity>
                  </View>
                );
              }

              const isTotal = field.key === "total";
              return (
                <View key={field.key} style={rowStyle}>
                  <CustomText
                    variant="caption"
                    size={11}
                    color={theme.colors.textSecondary}
                    style={styles.label}
                  >
                    {field.label}
                  </CustomText>
                  <CustomText
                    variant="caption"
                    size={11}
                    fontWeight={isTotal ? "bold" : "semiBold"}
                    color={theme.colors.text}
                    style={styles.valueCol}
                  >
                    {formatFieldValue(field.key, field.value)}
                  </CustomText>
                </View>
              );
            })}
          </View>

          {/* Regulatory Footer (state-aware, served by the backend) */}
          {!!receipt.receiptFooter && (
            <CustomText
              variant="caption"
              size={11}
              color={theme.colors.textSecondary}
              style={styles.footerText}
            >
              {receipt.receiptFooter}
            </CustomText>
          )}
        </ViewShot>

        <View style={styles.shareBtn}>
          <Button onPress={onShare}>Share</Button>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const receiptStyles = (theme: ITheme) =>
  StyleSheet.create({
    screenshotContainer: {
      backgroundColor: theme.colors.white,
    },
    headerSection: {
      alignItems: "center",
      paddingVertical: 20,
      backgroundColor: theme.colors.white,
    },
    visaCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: "#1A1F71",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    title: {
      marginBottom: 4,
      textAlign: "center",
    },
    subtitle: {
      marginBottom: 8,
      textAlign: "center",
    },
    amountText: {
      marginBottom: 8,
      marginTop: 4,
      textAlign: "center",
    },
    statusBadge: {
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 20,
      marginTop: 4,
    },
    infoBox: {
      backgroundColor: theme.colors.greyLight,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginHorizontal: 20,
      marginTop: 4,
      marginBottom: 8,
    },
    infoBoxText: {
      lineHeight: 18,
    },
    whiteCard: {
      backgroundColor: theme.colors.white,
      marginHorizontal: 20,
      borderRadius: 8,
      paddingHorizontal: 20,
      paddingVertical: 10,
      marginVertical: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    detailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    detailRowLast: {
      borderBottomWidth: 0,
    },
    label: {
      flex: 1,
      marginRight: 8,
    },
    valueCol: {
      flex: 1.3,
      textAlign: "right",
    },
    copyRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    link: {
      textDecorationLine: "underline",
    },
    footerText: {
      lineHeight: 16,
      paddingHorizontal: 20,
      marginBottom: 16,
    },
    shareBtn: {
      paddingHorizontal: 20,
      marginBottom: 40,
    },
  });

export default StateComplianceReceiptBody;

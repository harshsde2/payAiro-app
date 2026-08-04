import React, { useCallback, useMemo, useRef } from "react";
import { Linking, ScrollView, StyleSheet, TouchableOpacity, View, Alert } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
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

const COINME_WEB_URL = "https://coinme.com";

const CoinmeGlobeIcon: React.FC<{ color: string; size?: number }> = ({
  color,
  size = 14,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.4" />
    <Path d="M12 3v18M3 12h18" stroke={color} strokeWidth="1.4" />
    <Path
      d="M5.5 5.5c3 4.5 3 8.5 0 13M18.5 5.5c-3 4.5-3 8.5 0 13"
      stroke={color}
      strokeWidth="1.2"
    />
  </Svg>
);

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
    badgeBg = theme.colors.success;
  }

  // Card Processing Fee only ever applies to sells (Coinme charges it on the payout
  // rail) — the backend still sends a "0" row for buys, which reads as noise.
  // On sells, the separate "Transaction Fees" row is dropped in favor of a single
  // "Instant Withdrawal Fee" row carrying the true all-in cost (see trueFeeValue).
  const fields = (receipt.receiptFields ?? []).filter(
    (f) =>
      !isEmptyValue(f.value) &&
      !(isBuy && f.key === "card_processing_fee") &&
      !(!isBuy && f.key === "transaction_fees")
  );

  const isSell = !isBuy;

  /**
   * The true USD figure for the header / Sell Amount / Total. The regulatory receipt's
   * `total` ADDS fees on top and its `sell_amount` is the CRYPTO amount, both wrong to
   * show as the USD value.
   *   - Buy:  USD paid   = fee breakdown `youPay`.
   *   - Sell: USD received = fee breakdown `youReceive` (`youPay` there is the tiny
   *           crypto side — e.g. 0.01 ETH — which showed "$0.01" for a $22 sell).
   * Falls back to the transaction's own amount when the quote figure isn't positive.
   */
  const trueTotal = useMemo(() => {
    const fb = transactionData.fee_breakdown;
    if (isSell) {
      const youReceive = Number.parseFloat(
        String(fb?.youReceive ?? "").replace(/[^0-9.-]/g, "")
      );
      if (Number.isFinite(youReceive) && youReceive > 0) return String(youReceive);
    }
    const youPay = Number.parseFloat(
      String(fb?.youPay ?? "").replace(/[^0-9.-]/g, "")
    );
    if (Number.isFinite(youPay) && youPay > 0 && !isSell) return String(youPay);
    const fallback = String(transactionData.amount ?? transactionData.final_amount ?? "");
    return fallback;
  }, [
    isSell,
    transactionData.amount,
    transactionData.fee_breakdown?.youPay,
    transactionData.fee_breakdown?.youReceive,
    transactionData.final_amount,
  ]);

  const bigAmount = formatUsd(trueTotal) ?? "";

  /**
   * The regulatory receipt's raw fee field (buy: `transaction_fees`, sell:
   * `instant_withdrawal_fee`) omits the spread — the fee breakdown's `finalFee`
   * ("Total Cost (Inc. Spread)") is the true all-in cost of the trade. Shown under
   * the receipt's own label for that row so no new row is added to the certified
   * field set; falls back to the receipt's own value when finalFee isn't present.
   */
  const trueFeeValue = transactionData.fee_breakdown?.finalFee;

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

  // The backend's labels carry disclosure markers ("Transaction Fees*",
  // "Amount Exchanged**") tied to receiptFooter text — stripped per design request.
  const cleanLabel = useCallback((label: string): string => label.replace(/\*+\s*$/, ""), []);

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
                      {cleanLabel(field.label)}
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
              const isFeeRow = field.key === "transaction_fees" || field.key === "instant_withdrawal_fee";
              // Sell's `sell_amount` field is the CRYPTO amount (e.g. 0.012 ETH), not the
              // USD sold — show the USD the user sold (`trueTotal` = youReceive) instead.
              const isSellAmount = isSell && field.key === "sell_amount";
              // Show the true "You Pay"/"You Receive" USD for Total & Sell Amount — the
              // backend's value adds fees on top / is the crypto side. Show the true
              // all-in cost (incl. spread) on the fee row — receipt's value omits spread.
              const displayValue =
                isTotal || isSellAmount
                  ? formatUsd(trueTotal) ?? formatFieldValue(field.key, field.value)
                  : isFeeRow
                    ? formatUsd(trueFeeValue ?? "") ?? formatFieldValue(field.key, field.value)
                    : formatFieldValue(field.key, field.value);
              return (
                <View key={field.key} style={rowStyle}>
                  <CustomText
                    variant="caption"
                    size={11}
                    color={theme.colors.textSecondary}
                    style={styles.label}
                  >
                    {cleanLabel(field.label)}
                  </CustomText>
                  <CustomText
                    variant="caption"
                    size={11}
                    fontWeight={isTotal ? "bold" : "semiBold"}
                    color={theme.colors.text}
                    style={styles.valueCol}
                  >
                    {displayValue}
                  </CustomText>
                </View>
              );
            })}
          </View>

          {/* Regulatory Footer (state-aware, served by the backend) — shown above the
              Coinme attribution when present. */}
          {receipt.receiptFooter ? (
            <CustomText
              variant="caption"
              size={11}
              color={theme.colors.textSecondary}
              style={styles.footerText}
            >
              {receipt.receiptFooter}
            </CustomText>
          ) : null}

          {/* Coinme attribution — always shown, for every user/receipt. */}
          <View style={styles.coinmeFooter}>
            <CustomText
              variant="label"
              size={14}
              fontWeight="semiBold"
              color={theme.colors.text}
              style={styles.coinmeFooterTitle}
            >
              Powered by Coinme
            </CustomText>
            <CustomText
              variant="body"
              size={12}
              color={theme.colors.textSecondary}
              style={styles.coinmeFooterAddress}
            >
              255 S. King Street Suite 800 Seattle, WA 98104
            </CustomText>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.coinmeLinkRow}
              onPress={() => Linking.openURL(COINME_WEB_URL)}
            >
              <CoinmeGlobeIcon color={theme.colors.primary} size={14} />
              <CustomText
                variant="body"
                size={12}
                color={theme.colors.primary}
                style={styles.coinmeLinkText}
              >
                coinme.com
              </CustomText>
            </TouchableOpacity>
          </View>
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
      // Was hardcoded Visa navy (#1A1F71), which read as an off-brand purple against
      // the app's green theme. White "VISA" text sits well on the primary green.
      backgroundColor: theme.colors.primary,
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
    coinmeFooter: {
      paddingHorizontal: 20,
      marginBottom: 16,
      alignItems: "center",
    },
    coinmeFooterTitle: {
      textAlign: "center",
      marginBottom: 6,
    },
    coinmeFooterAddress: {
      textAlign: "center",
      marginBottom: 8,
    },
    coinmeLinkRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    coinmeLinkText: {
      marginTop: 1,
    },
    shareBtn: {
      paddingHorizontal: 20,
      marginBottom: 40,
    },
  });

export default StateComplianceReceiptBody;

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import { formatLongDateTime } from "utils/dateUtils";
import { useSelector } from "react-redux";
import CustomText from "@new-ui/components/common-components/CustomText";
import Button from "@new-ui/components/common-components/layout/Button";
import ScreenWrapper from "@new-ui/components/common-components/ScreenWrapper";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { cashOffRampTransactionDetailsStyles } from "@new-ui/styles/screens/cashRamp/cashOffRampTransactionDetailsStyles";
import SellCashPickupInstructionsModal from "@new-ui/screens/CashRamp/Sell/SellCashPickupInstructionsModal";
import { formatReadyCodeDisplay } from "@new-ui/screens/CashRamp/Sell/sellFlow.utils";
import {
  SELL_CASH_PICKUP_INSTRUCTIONS,
  SELL_CLOSE,
  SELL_FRAUD_LEARN_MORE,
} from "@new-ui/screens/CashRamp/Sell/sellFlowCopy";
import {
  CASH_OFFRAMP_BADGE_LABEL,
  CASH_OFFRAMP_ERROR_BODY,
  CASH_OFFRAMP_ERROR_TITLE,
  CASH_OFFRAMP_EXPIRED_BODY,
  CASH_OFFRAMP_EXPIRED_TITLE,
  CASH_OFFRAMP_FAILED_BODY,
  CASH_OFFRAMP_FAILED_TITLE,
  CASH_OFFRAMP_LOCATION_FALLBACK,
  CASH_OFFRAMP_PHONE_HINT_SUFFIX,
  CASH_OFFRAMP_PICKUP_DISCLAIMER,
  CASH_OFFRAMP_PICKUP_DAYS,
  CASH_OFFRAMP_PICKUP_WITHIN,
  CASH_OFFRAMP_READY_CODE_LABEL,
  CASH_OFFRAMP_ROW_ADDRESS,
  CASH_OFFRAMP_ROW_ATM_FEE,
  CASH_OFFRAMP_ROW_DATE,
  CASH_OFFRAMP_ROW_EXCHANGE_FEE,
  CASH_OFFRAMP_ROW_SELL_METHOD,
  CASH_OFFRAMP_ROW_TOTAL_CASH,
  CASH_OFFRAMP_ROW_TOTAL_SALE,
  CASH_OFFRAMP_ROW_TXN_ID,
  CASH_OFFRAMP_SELL_METHOD,
  CASH_OFFRAMP_SUPPORT_URL,
} from "@new-ui/screens/CashRamp/cashOffRampCopy";
import { useCashOfframpPickupCodePoll } from "query/hooks/useCoinmeCashRamp";
import type {
  CashOffRampDisplayKind,
  IUnifiedTransaction,
} from "../UnifiedTransactions/types";
import { showError, showSuccess } from "utils/toast";

const POLL_ERROR_AFTER_MS = 120_000;

function truncateId(id: string, head = 10, tail = 5): string {
  const t = id.trim();
  if (t.length <= head + tail + 3) return t;
  return `${t.slice(0, head)}...${t.slice(-tail)}`;
}

function formatUsd(value: string | null | undefined): string | null {
  if (!value) return null;
  const n = Number.parseFloat(value);
  if (!Number.isFinite(n)) return null;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function maskPhone(value: unknown): string {
  const raw = String(value ?? "").replace(/\D/g, "");
  if (raw.length < 4) return "•••• ••••";
  return `•••• ${raw.slice(-4)}`;
}

type Props = {
  transactionData: IUnifiedTransaction;
  onClose: () => void;
};

const CashOffRampTransactionDetailsBody: React.FC<Props> = ({
  transactionData,
  onClose,
}) => {
  const { theme } = useTheme();
  const styles = cashOffRampTransactionDetailsStyles(theme);
  const details = transactionData.cash_offramp_details;
  const initialKind = details?.display_kind ?? "processing";

  const [displayKind, setDisplayKind] = useState<CashOffRampDisplayKind>(initialKind);
  const [readyCodeFormatted, setReadyCodeFormatted] = useState(
    details?.ready_code_formatted ?? null
  );
  const [pickupInstructionsOpen, setPickupInstructionsOpen] = useState(false);
  const pollStartedAtRef = useRef<number | null>(null);

  const usersMe = useSelector(
    (s: { authenticationSlice?: { usersMe?: Record<string, unknown> | null } }) =>
      s.authenticationSlice?.usersMe ?? null
  );

  const phoneDisplay = useMemo(() => {
    const user = (usersMe as { user?: Record<string, unknown> })?.user;
    const phone =
      user?.phone_national_number ?? user?.phone ?? user?.mobile ?? null;
    return `${maskPhone(phone)} ${CASH_OFFRAMP_PHONE_HINT_SUFFIX}`;
  }, [usersMe]);

  const partnerTransactionId = (
    details?.provider_transaction_id ?? transactionData.transaction_id ?? ""
  ).trim();

  const shouldPoll =
    displayKind === "processing" && partnerTransactionId.length > 0;

  const { data: pickupData, isFetching: isPolling } = useCashOfframpPickupCodePoll(
    partnerTransactionId,
    shouldPoll
  );

  useEffect(() => {
    if (!shouldPoll) return;
    if (pollStartedAtRef.current == null) {
      pollStartedAtRef.current = Date.now();
    }

    const ref =
      pickupData?.data?.providerTransactionRef ??
      details?.provider_transaction_ref ??
      null;

    if (pickupData?.data?.ready === true && ref) {
      setDisplayKind("ready");
      setReadyCodeFormatted(formatReadyCodeDisplay(ref));
      return;
    }

    if (pickupData?.ok === false && pickupData?.message) {
      setDisplayKind("error");
      return;
    }

    const started = pollStartedAtRef.current;
    if (started && Date.now() - started > POLL_ERROR_AFTER_MS) {
      setDisplayKind("error");
    }
  }, [
    details?.provider_transaction_ref,
    pickupData,
    shouldPoll,
  ]);

  const badgeLabel = CASH_OFFRAMP_BADGE_LABEL[displayKind];
  const badgeBg =
    displayKind === "processing"
      ? theme.colors.warning
      : displayKind === "ready" || displayKind === "completed"
        ? theme.colors.success
        : theme.colors.error;

  const asset = (details?.crypto_code ?? transactionData.crypto_details?.token ?? "Crypto").toUpperCase();
  const dateLabel = formatLongDateTime(transactionData.created_at);
  const txnId = transactionData.transaction_id;

  const addressLines = useMemo(() => {
    const parts = [
      details?.location_description,
      details?.location_address,
      details?.location_hours,
    ].filter((p) => Boolean(String(p ?? "").trim()));
    if (parts.length === 0) return CASH_OFFRAMP_LOCATION_FALLBACK;
    return parts.join("\n");
  }, [details]);

  const onCopy = useCallback((value: string, label: string) => {
    const v = value.trim();
    if (!v) {
      showError("Nothing to copy", `No ${label} available.`);
      return;
    }
    Clipboard.setString(v);
    showSuccess("Copied", `${label} copied to clipboard.`);
  }, []);

  const openSupport = useCallback(() => {
    Linking.openURL(CASH_OFFRAMP_SUPPORT_URL).catch(() => {});
  }, []);

  const renderCopyValue = (value: string, label: string) => (
    <View style={styles.copyRow}>
      <CustomText variant="body" color={theme.colors.text} style={{ textAlign: "right" }}>
        {truncateId(value)}
      </CustomText>
      <TouchableOpacity onPress={() => onCopy(value, label)}>
        <CustomText variant="body" color={theme.colors.text} style={styles.link}>
          Copy
        </CustomText>
      </TouchableOpacity>
    </View>
  );

  const renderSupportBody = (title: string, body: string) => (
    <View style={styles.statusCard}>
      <CustomText variant="h4" fontWeight="semiBold" style={styles.heroTitle}>
        {title}
      </CustomText>
      <CustomText variant="body" style={styles.statusCardBody}>
        {body.split("here").map((part, i, arr) => (
          <React.Fragment key={i}>
            {part}
            {i < arr.length - 1 ? (
              <CustomText
                variant="body"
                style={[styles.statusCardBody, styles.supportLink]}
                onPress={openSupport}
              >
                here
              </CustomText>
            ) : null}
          </React.Fragment>
        ))}
      </CustomText>
    </View>
  );

  const renderHero = () => {
    if (displayKind === "processing") {
      return (
        <View style={styles.statusCard}>
          {isPolling ? (
            <ActivityIndicator color={theme.colors.white} style={{ marginBottom: theme.spacing.sm }} />
          ) : null}
          <CustomText variant="body" style={styles.statusCardBody}>
            {details?.processing_message}
          </CustomText>
        </View>
      );
    }

    if (displayKind === "ready") {
      return (
        <View style={styles.statusCard}>
          <CustomText variant="caption" align="center" style={styles.statusCardBody}>
            {CASH_OFFRAMP_READY_CODE_LABEL}
          </CustomText>
          <CustomText
            variant="h1"
            fontWeight="bold"
            align="center"
            style={styles.readyCodeValue}
            selectable
          >
            {readyCodeFormatted ?? "—"}
          </CustomText>
          <CustomText variant="body" align="center" style={styles.phoneLine}>
            {phoneDisplay}
          </CustomText>
          <CustomText variant="caption" style={styles.pickupDisclaimer}>
            {CASH_OFFRAMP_PICKUP_WITHIN}{" "}
            <CustomText variant="caption" fontWeight="bold" color={theme.colors.white}>
              {CASH_OFFRAMP_PICKUP_DAYS}
            </CustomText>
            {"\n"}
            {CASH_OFFRAMP_PICKUP_DISCLAIMER}
          </CustomText>
        </View>
      );
    }

    if (displayKind === "error") {
      return renderSupportBody(CASH_OFFRAMP_ERROR_TITLE, CASH_OFFRAMP_ERROR_BODY);
    }
    if (displayKind === "failed") {
      return renderSupportBody(CASH_OFFRAMP_FAILED_TITLE, CASH_OFFRAMP_FAILED_BODY);
    }
    if (displayKind === "expired") {
      return renderSupportBody(CASH_OFFRAMP_EXPIRED_TITLE, CASH_OFFRAMP_EXPIRED_BODY);
    }

    return null;
  };

  const feeRows: { label: string; value: string }[] = [];
  const exchangeFee = formatUsd(details?.exchange_fee ?? details?.fees_map?.exchangeFee);
  const atmFee = formatUsd(details?.atm_fee ?? details?.fees_map?.atmFee);
  if (exchangeFee) feeRows.push({ label: CASH_OFFRAMP_ROW_EXCHANGE_FEE, value: exchangeFee });
  if (atmFee) feeRows.push({ label: CASH_OFFRAMP_ROW_ATM_FEE, value: atmFee });

  const assetPrice = formatUsd(details?.unit_price_usd ?? transactionData.crypto_details?.exchange_rate);
  const totalSale = formatUsd(details?.total_sale_usd) ?? formatUsd(transactionData.final_amount);
  const totalCash =
    formatUsd(details?.total_cash_pickup_usd) ?? formatUsd(transactionData.amount);

  const showReceipt = displayKind !== "expired";

  const gradientColors = [
    theme.colors.greenLight2,
    theme.colors.white,
    theme.colors.greenLight1,
    theme.colors.greenLight2,
  ] as const;

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={[]}
      scrollable={false}
      // gradient="linear"
      // gradientColors={[...gradientColors]}
      // gradientStart={{ x: 0.5, y: 0 }}
      // gradientEnd={{ x: 0.5, y: 1 }}
      statusBarStyle="dark-content"
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={[styles.badge, { backgroundColor: badgeBg }]}>
          <CustomText variant="body" fontWeight="semiBold" color={theme.colors.white}>
            {badgeLabel}
          </CustomText>
        </View>

        <View style={styles.wordmarkRow}>
          <CustomText variant="h3" fontWeight="bold" style={styles.wordmark}>
            ReadyCode
          </CustomText>
        </View>

        {renderHero()}

        {showReceipt ? (
          <View style={styles.receiptCard}>
            <View style={styles.row}>
              <CustomText variant="body" color={theme.colors.text} style={styles.label}>
                {CASH_OFFRAMP_ROW_DATE}
              </CustomText>
              <CustomText variant="body" color={theme.colors.text} style={styles.valueCol}>
                {dateLabel}
              </CustomText>
            </View>

            <View style={styles.row}>
              <CustomText variant="body" color={theme.colors.text} style={styles.label}>
                {CASH_OFFRAMP_ROW_SELL_METHOD}
              </CustomText>
              <CustomText variant="body" color={theme.colors.text} style={styles.valueCol}>
                {details?.sell_method ?? CASH_OFFRAMP_SELL_METHOD}
              </CustomText>
            </View>

            <View style={styles.row}>
              <CustomText variant="body" color={theme.colors.text} style={styles.label}>
                {CASH_OFFRAMP_ROW_TXN_ID}
              </CustomText>
              <View style={styles.valueCol}>{renderCopyValue(txnId, "Transaction ID")}</View>
            </View>

            <View style={styles.row}>
              <CustomText variant="body" color={theme.colors.text} style={styles.label}>
                {CASH_OFFRAMP_ROW_ADDRESS}
              </CustomText>
              <CustomText variant="body" color={theme.colors.text} style={[styles.valueCol, { textAlign: "right" }]}>
                {addressLines}
              </CustomText>
            </View>

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

            {totalSale ? (
              <View style={styles.row}>
                <CustomText variant="body" color={theme.colors.text} style={styles.label}>
                  {CASH_OFFRAMP_ROW_TOTAL_SALE}
                </CustomText>
                <CustomText variant="body" color={theme.colors.text} style={styles.valueCol}>
                  {totalSale}
                </CustomText>
              </View>
            ) : null}

            {totalCash ? (
              <View style={[styles.row, styles.rowLast, styles.rowBold]}>
                <CustomText variant="body" fontWeight="bold" color={theme.colors.text} style={styles.label}>
                  {CASH_OFFRAMP_ROW_TOTAL_CASH}
                </CustomText>
                <CustomText variant="body" fontWeight="bold" color={theme.colors.text} style={styles.valueCol}>
                  {totalCash}
                </CustomText>
              </View>
            ) : null}
          </View>
        ) : null}

        {displayKind === "ready" ? (
          <Pressable onPress={() => Linking.openURL(CASH_OFFRAMP_SUPPORT_URL).catch(() => {})}>
            <CustomText variant="caption" style={styles.fraudLink} color={theme.colors.text}>
              {SELL_FRAUD_LEARN_MORE}
            </CustomText>
          </Pressable>
        ) : null}

        <View style={styles.footer}>
          {displayKind === "ready" ? (
            <Button onPress={() => setPickupInstructionsOpen(true)}>
              {SELL_CASH_PICKUP_INSTRUCTIONS}
            </Button>
          ) : null}
          <Button onPress={onClose}>{SELL_CLOSE}</Button>
        </View>
      </ScrollView>

      <SellCashPickupInstructionsModal
        visible={pickupInstructionsOpen}
        onClose={() => setPickupInstructionsOpen(false)}
      />
    </ScreenWrapper>
  );
};

export default CashOffRampTransactionDetailsBody;

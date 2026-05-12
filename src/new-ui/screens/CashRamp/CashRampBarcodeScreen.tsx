import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import QRCode from "react-native-qrcode-svg";
import ScreenWrapper from "@new-ui/components/common-components/ScreenWrapper";
import CustomText from "@new-ui/components/common-components/CustomText";
import Button from "@new-ui/components/common-components/layout/Button";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { cashRampBarcodeStyles } from "@new-ui/styles/screens/cashRamp/cashRampBarcodeStyles";
import { useUserCryptoMarketList } from "query/hooks/useCrypto";
import {
  useCoinmeCashOfframpExecuteMutation,
  useCoinmeOrderTemplateMutation,
  type CoinmeCashOfframpExecuteResponse,
  type CoinmeOrderTemplateResponse,
} from "query/hooks/useCoinmeCashRamp";
import GlassyWrapper from "@new-ui/components/common-components/GlassyWrapper";
import { CashRampBarcodeParams } from "./LocationFinder/locationFinder.types";
import { showError } from "utils/toast";

const ILLUSTRATIVE_PROCESSING_FEE_USD = 3.95;
const QR_SIZE = 168;

type SessionStatus = "loading" | "success" | "error";

const CashRampBarcodeScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = cashRampBarcodeStyles(theme);
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<Record<string, CashRampBarcodeParams>, string>>();
  const location = route.params?.location;
  const amount = Number(route.params?.amount ?? 0);
  const fiat = route.params?.fiatCurrencyCode ?? "USD";
  const cryptoCode = (route.params?.cryptoCurrencyCode ?? "SOL").toUpperCase();
  const chainParam = (route.params?.chain ?? "").trim().toUpperCase();
  const sourceWalletAddress = (route.params?.sourceWalletAddress ?? "").trim();
  const cashRampFlow = route.params?.cashRampFlow ?? "buy";
  const isSell = cashRampFlow === "sell";

  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("loading");
  const [buyResponse, setBuyResponse] = useState<CoinmeOrderTemplateResponse | null>(null);
  const [sellResponse, setSellResponse] = useState<CoinmeCashOfframpExecuteResponse | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const { mutateAsync: postOrderTemplate } = useCoinmeOrderTemplateMutation();
  const { mutateAsync: postCashOfframp } = useCoinmeCashOfframpExecuteMutation();

  const { data: marketRows = [] } = useUserCryptoMarketList(fiat);

  const unitUsdPrice = useMemo(() => {
    const row = marketRows.find((r) => (r.asset ?? "").toUpperCase() === cryptoCode);
    const p = row?.usd_price;
    return typeof p === "number" && Number.isFinite(p) && p > 0 ? p : null;
  }, [marketRows, cryptoCode]);

  const estimatedCrypto = useMemo(() => {
    if (unitUsdPrice == null || amount <= 0) return null;
    return amount / unitUsdPrice;
  }, [unitUsdPrice, amount]);

  const marketCryptoAmountLabel = useMemo(() => {
    if (estimatedCrypto == null) return "—";
    const trimmed = estimatedCrypto.toFixed(6).replace(/\.?0+$/, "");
    return `${trimmed} ${cryptoCode}`;
  }, [estimatedCrypto, cryptoCode]);

  const locationRef = (location?.locationReference ?? "").trim();

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setSessionStatus("loading");
      setBuyResponse(null);
      setSellResponse(null);

      if (!locationRef) {
        showError("Missing location reference. Pick a store and try again.");
        if (!cancelled) setSessionStatus("error");
        return;
      }

      try {
        if (isSell) {
          if (!sourceWalletAddress) {
            showError("Missing wallet address for this sell. Go back and try again.");
            if (!cancelled) setSessionStatus("error");
            return;
          }
          if (!chainParam) {
            showError("Missing chain for this sell. Go back and try again.");
            if (!cancelled) setSessionStatus("error");
            return;
          }
          console.log("Payload for sell cash offramp =>", JSON.stringify({
            amountValue: String(amount),
            amountCurrencyCode: fiat.toUpperCase(),
            locationReference: locationRef,
            sourceWalletAddress,
            debitCurrencyCode: cryptoCode,
            chain: chainParam,
          }, null, 2));
          const res = await postCashOfframp({
            amountValue: String(amount),
            amountCurrencyCode: fiat.toUpperCase(),
            locationReference: locationRef,
            sourceWalletAddress,
            debitCurrencyCode: cryptoCode,
            chain: chainParam,
          });
          if (cancelled) return;
          if (res?.ok === false) {
            showError(res?.message || "Cash off-ramp request failed.");
            setSessionStatus("error");
            return;
          }
          setSellResponse(res);
          setSessionStatus("success");
          return;
        }

        const res = await postOrderTemplate({
          debitCurrencyCode: fiat.toUpperCase(),
          creditCurrencyCode: cryptoCode,
          amountValue: String(amount),
          amountCurrencyCode: fiat.toUpperCase(),
          locationReference: locationRef,
        });
        if (cancelled) return;
        if (res?.ok === false) {
          showError(res?.message || "Order template request failed.");
          setSessionStatus("error");
          return;
        }
        setBuyResponse(res);
        setSessionStatus("success");
      } catch (e: unknown) {
        if (cancelled) return;
        const msg =
          typeof e === "object" && e !== null && "message" in e
            ? String((e as { message?: string }).message)
            : "Network error";
        showError(msg);
        setSessionStatus("error");
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [
    retryKey,
    isSell,
    amount,
    fiat,
    cryptoCode,
    locationRef,
    sourceWalletAddress,
    chainParam,
    postCashOfframp,
    postOrderTemplate,
  ]);

  const tpl = buyResponse?.data?.transactionTemplate;
  const buySystemRef = (tpl?.transactionSystemRef ?? "").trim();
  const buyCreditAmt = tpl?.creditCurrencyAmount?.trim();

  const buyFeeFromApi = useMemo(() => {
    const fm = tpl?.feesMap;
    const ex = fm?.exchangeFee;
    if (ex) return `$${ex}`;
    const r = tpl?.providerExclusiveFees?.retailerCustomerFee?.amount;
    if (r) return `$${r}`;
    return null;
  }, [tpl]);

  const sellTxn = sellResponse?.data?.transaction;
  const sellQuote = sellResponse?.data?.quote;
  const partnerTransactionId = (sellTxn?.partnerTransactionId ?? "").trim();

  const primaryAmountLabel = useMemo(() => {
    if (sessionStatus !== "success") return marketCryptoAmountLabel;
    if (isSell) {
      const amt = sellTxn?.debitCurrencyAmount ?? sellQuote?.debitCurrencyAmount;
      const code = sellTxn?.debitCurrencyCode ?? sellQuote?.debitCurrencyCode ?? cryptoCode;
      if (amt) return `${amt} ${code}`;
      return marketCryptoAmountLabel;
    }
    if (buyCreditAmt) return `${buyCreditAmt} ${cryptoCode}`;
    return marketCryptoAmountLabel;
  }, [
    buyCreditAmt,
    cryptoCode,
    isSell,
    marketCryptoAmountLabel,
    sellQuote?.debitCurrencyAmount,
    sellQuote?.debitCurrencyCode,
    sellTxn?.debitCurrencyAmount,
    sellTxn?.debitCurrencyCode,
    sessionStatus,
  ]);

  const feeLabel = useMemo(() => {
    if (sessionStatus !== "success") return "Processing fee (illustrative)";
    return isSell ? "Total fees" : "Processing fee";
  }, [isSell, sessionStatus]);

  const feeValueLabel = useMemo(() => {
    if (sessionStatus !== "success") return `$${ILLUSTRATIVE_PROCESSING_FEE_USD.toFixed(2)}`;
    if (isSell) {
      const tf = sellTxn?.totalFees ?? sellQuote?.totalFees;
      const fc = sellTxn?.feeCurrencyCode ?? sellQuote?.feeCurrency ?? "USD";
      if (tf) return `${tf} ${fc}`;
      return `$${ILLUSTRATIVE_PROCESSING_FEE_USD.toFixed(2)}`;
    }
    if (buyFeeFromApi) return buyFeeFromApi;
    return `$${ILLUSTRATIVE_PROCESSING_FEE_USD.toFixed(2)}`;
  }, [buyFeeFromApi, isSell, sellQuote?.feeCurrency, sellQuote?.totalFees, sellTxn?.feeCurrencyCode, sellTxn?.totalFees, sessionStatus]);

  const quoteNoteText = useMemo(() => {
    if (!isSell && tpl?.expiryTimestamp) {
      try {
        const d = new Date(tpl.expiryTimestamp);
        if (!Number.isNaN(d.getTime())) {
          return `Template expires: ${d.toLocaleString()}`;
        }
      } catch {
        /* ignore */
      }
    }
    if (isSell && sellQuote?.expirationTime) {
      try {
        const d = new Date(sellQuote.expirationTime);
        if (!Number.isNaN(d.getTime())) {
          return `Quote expires: ${d.toLocaleString()}`;
        }
      } catch {
        /* ignore */
      }
    }
    return "Quote is valid for 2 minutes*";
  }, [isSell, sellQuote?.expirationTime, tpl?.expiryTimestamp]);

  const title = isSell ? "ATM cash-out" : "Ask cashier to scan barcode";

  const subtitleText = isSell
    ? `Take approximately ${marketCryptoAmountLabel} to ${location?.description || "the selected ATM"}. Use the partner transaction ID below at the ATM. Amount shown is based on ${fiat} ${amount.toFixed(2)} at current market pricing.`
    : `Please hand the cashier $${amount.toFixed(2)} at ${location?.description || "selected store"} to load ${fiat} into your wallet.`;

  const disclaimerText = isSell
    ? `The following summary is based on selling crypto for approximately ${fiat} ${amount.toFixed(2)} equivalent. Final amounts may vary with market price and provider fees.`
    : `The following summary is based on a cash purchase of ${fiat} ${amount.toFixed(2)}. After your funds are applied, crypto is expected to be acquired at approximately the terms below. Final amounts may vary with market price and provider fees.`;

  const renderGlassContent = () => {
    if (sessionStatus === "loading") {
      return (
        <View style={styles.qrWrap}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }
    if (sessionStatus === "error") {
      return (
        <View style={styles.qrWrap}>
          <CustomText variant="body" color={theme.colors.text} style={styles.sessionError}>
            Unable to load {isSell ? "cash-out" : "order template"}. Check connection and try again.
          </CustomText>
          <Button onPress={() => setRetryKey((k) => k + 1)}>Retry</Button>
        </View>
      );
    }
    if (isSell) {
      return (
        <View style={styles.barcodeGlassyInner}>
          <CustomText variant="caption" color={theme.colors.text} style={styles.sellCodeCaption}>
            Partner transaction ID
          </CustomText>
          <CustomText
            variant="body"
            fontWeight="medium"
            color={theme.colors.text}
            style={styles.sellCodeText}
            selectable
          >
            {partnerTransactionId || "—"}
          </CustomText>
        </View>
      );
    }
    if (!buySystemRef) {
      return (
        <View style={styles.qrWrap}>
          <CustomText variant="body" color={theme.colors.text} style={styles.sessionError}>
            No barcode reference returned.
          </CustomText>
        </View>
      );
    }
    return (
      <View style={styles.qrWrap}>
        <View style={styles.qrInner}>
          <QRCode value={buySystemRef} size={QR_SIZE} color="#111111" backgroundColor="#FFFFFF" />
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={["bottom", "left", "right"]}
      scrollable
      contentStyle={{
        flexGrow: 1,
        paddingTop: headerHeight,
        paddingBottom: theme.spacing["2xl"],
      }}
      gradient="linear"
      gradientColors={[
        theme.colors.greenLight2,
        theme.colors.greenLight2,
        theme.colors.white,
        theme.colors.greenLight2,
        theme.colors.greenLight1,
        theme.colors.tertiary,
        theme.colors.greenLight1,
        theme.colors.greenLight2,
        theme.colors.white,
      ]}
      gradientStart={{ x: 1, y: 1 }}
      gradientEnd={{ x: 0, y: 0 }}
      statusBarStyle="dark-content"
    >
      <View style={styles.container}>
        <CustomText variant="h3" fontWeight="semiBold" color={theme.colors.text} style={styles.title}>
          {title}
        </CustomText>
        <CustomText variant="body" color={theme.colors.text} style={styles.subtitle}>
          {subtitleText}
        </CustomText>

        <GlassyWrapper
          style={[styles.glassyBarcode, isSell && { minHeight: 120 }]}
          borderRadius={theme.radius.xl}
          blurAmount={25}
          blurType="regular"
          overlayOpacity={0.12}
          borderWidth={1}
          borderColor={theme.colors.white}
          padding={theme.spacing.lg}
        >
          {renderGlassContent()}
        </GlassyWrapper>

        <CustomText variant="body" size={10} color={theme.colors.text} style={styles.disclaimer}>
          {disclaimerText}
        </CustomText>

        <View style={styles.detailBlock}>
          <View style={styles.detailRow}>
            <CustomText variant="body" color={theme.colors.text} style={styles.detailLabel}>
              {isSell ? `Est. crypto to sell (${cryptoCode})` : `Est. amount in ${cryptoCode}`}
            </CustomText>
            <CustomText variant="body" fontWeight="semiBold" color={theme.colors.text} style={styles.detailValue}>
              {primaryAmountLabel}
            </CustomText>
          </View>
          <View style={styles.detailRow}>
            <CustomText variant="body" color={theme.colors.text} style={styles.detailLabel}>
              {feeLabel}
            </CustomText>
            <CustomText variant="body" fontWeight="semiBold" color={theme.colors.text} style={styles.detailValue}>
              {feeValueLabel}
            </CustomText>
          </View>
        </View>

        <CustomText variant="body" size={10} color={theme.colors.text} style={styles.quoteNote}>
          {quoteNoteText}
        </CustomText>

        {location?.address ? (
          <CustomText variant="body" color={theme.colors.textSecondary} style={styles.metaText}>
            {location.address}
            {location.city ? `, ${location.city}` : ""}
            {location.state ? `, ${location.state}` : ""}
            {location.zipCode ? ` ${location.zipCode}` : ""}
          </CustomText>
        ) : null}

        <View style={styles.footer}>
          <Button onPress={() => navigation.goBack()}>Close</Button>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default CashRampBarcodeScreen;

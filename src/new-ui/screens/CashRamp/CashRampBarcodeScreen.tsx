import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, AppState, type AppStateStatus, useWindowDimensions, View } from "react-native";
import { RouteProp, useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import ScreenGuard from "react-native-screenguard";
import { useHeaderHeight } from "@react-navigation/elements";
import Barcode from "@adrianso/react-native-barcode-builder";
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
import {
  ATM_REFERENCE_CAPTION,
  cashRampDetailRowLabelBuy,
  cashRampDetailRowLabelSell,
  cashRampDisclaimerBuy,
  cashRampDisclaimerSell,
  cashRampFeeLabel,
  cashRampLoadErrorLine,
  cashRampQuoteNote,
  cashRampSubtitleBuy,
  cashRampSubtitleSell,
  cashRampTitle,
  ERR_CASH_OFF_RAMP,
  ERR_MISSING_CHAIN,
  ERR_MISSING_LOCATION,
  ERR_MISSING_WALLET,
  ERR_ORDER_TEMPLATE,
  FOOTER_DONE,
  NO_CHECKOUT_CODE_MESSAGE,
} from "./cashRampBarcodeCopy";
import { showError } from "utils/toast";

const ILLUSTRATIVE_PROCESSING_FEE_USD = 3.95;
/** CODE128 strip height; width scales with window. */
const BARCODE_HEIGHT = 120;

type SessionStatus = "loading" | "success" | "error";

const CashRampBarcodeScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = cashRampBarcodeStyles(theme);
  const { width: windowWidth } = useWindowDimensions();
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

  const isScreenFocusedRef = useRef(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useFocusEffect(
    useCallback(() => {
      isScreenFocusedRef.current = true;
      let cancelled = false;
      (async () => {
        try {
          await ScreenGuard.initSettings({
            enableCapture: false,
            enableRecord: false,
          });
          if (cancelled) return;
          await ScreenGuard.register({ backgroundColor: theme.colors.white });
        } catch {
          // Native module unavailable or init failed; screen still usable.
        }
      })();
      return () => {
        cancelled = true;
        isScreenFocusedRef.current = false;
        void ScreenGuard.unregister().catch(() => {});
      };
    }, [theme.colors.white])
  );

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next: AppStateStatus) => {
      const prev = appStateRef.current;
      if (
        prev === "active" &&
        next === "background" &&
        isScreenFocusedRef.current &&
        navigation.canGoBack?.()
      ) {
        navigation.goBack();
      }
      appStateRef.current = next;
    });
    return () => sub.remove();
  }, [navigation]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setSessionStatus("loading");
      setBuyResponse(null);
      setSellResponse(null);

      if (!locationRef) {
        showError(ERR_MISSING_LOCATION);
        if (!cancelled) setSessionStatus("error");
        return;
      }

      try {
        if (isSell) {
          if (!sourceWalletAddress) {
            showError(ERR_MISSING_WALLET);
            if (!cancelled) setSessionStatus("error");
            return;
          }
          if (!chainParam) {
            showError(ERR_MISSING_CHAIN);
            if (!cancelled) setSessionStatus("error");
            return;
          }
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
            showError(res?.message || ERR_CASH_OFF_RAMP);
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
          showError(res?.message || ERR_ORDER_TEMPLATE);
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
  const buySystemRef = (tpl?.transactionProviderRef ?? "").trim();
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

  const feeLabel = useMemo(
    () => cashRampFeeLabel(sessionStatus, isSell),
    [isSell, sessionStatus]
  );

  const quoteNoteText = useMemo(() => {
    let expiry: Date | null = null;
    if (!isSell && tpl?.expiryTimestamp) {
      try {
        const d = new Date(tpl.expiryTimestamp);
        if (!Number.isNaN(d.getTime())) expiry = d;
      } catch {
        /* ignore */
      }
    } else if (isSell && sellQuote?.expirationTime) {
      try {
        const d = new Date(sellQuote.expirationTime);
        if (!Number.isNaN(d.getTime())) expiry = d;
      } catch {
        /* ignore */
      }
    }
    return cashRampQuoteNote(isSell, expiry);
  }, [isSell, sellQuote?.expirationTime, tpl?.expiryTimestamp]);

  const locationDescription = (location?.description ?? "").trim();

  const title = useMemo(() => cashRampTitle(isSell), [isSell]);

  const subtitleText = useMemo(
    () =>
      isSell
        ? cashRampSubtitleSell({
            marketCryptoAmountLabel,
            locationDescription,
            fiat,
            amount,
          })
        : cashRampSubtitleBuy({
            amount,
            fiat,
            locationDescription,
          }),
    [amount, fiat, isSell, locationDescription, marketCryptoAmountLabel]
  );

  const disclaimerText = useMemo(
    () =>
      isSell
        ? cashRampDisclaimerSell({ amount, fiat })
        : cashRampDisclaimerBuy({ amount, fiat }),
    [amount, fiat, isSell]
  );

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
            {cashRampLoadErrorLine(isSell)}
          </CustomText>
          <Button style={{width: 200}} onPress={() => setRetryKey((k) => k + 1)}>Retry</Button>
        </View>
      );
    }
    if (isSell) {
      return (
        <View style={styles.barcodeGlassyInner}>
          <CustomText variant="caption" color={theme.colors.text} style={styles.sellCodeCaption}>
            {ATM_REFERENCE_CAPTION}
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
            {NO_CHECKOUT_CODE_MESSAGE}
          </CustomText>
        </View>
      );
    }
    const barcodeWidth = Math.max(
      200,
      Math.min(windowWidth - theme.spacing.xl * 2, 360)
    );
    return (
      <View style={styles.qrWrap}>
        <View style={[styles.qrInner, { width: barcodeWidth, height: BARCODE_HEIGHT }]}>
          <Barcode
            value={buySystemRef}
            format="CODE128"
            lineColor="#111111"
            style={{ flex: 1, backgroundColor: "#FFFFFF" }}
          />
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
              {isSell ? cashRampDetailRowLabelSell(cryptoCode) : cashRampDetailRowLabelBuy(cryptoCode)}
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
          <Button onPress={() => navigation.goBack()}>{FOOTER_DONE}</Button>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default CashRampBarcodeScreen;

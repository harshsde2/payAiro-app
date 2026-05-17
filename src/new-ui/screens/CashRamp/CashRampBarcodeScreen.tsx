import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, AppState, type AppStateStatus } from "react-native";
import { CommonActions, RouteProp, useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import ScreenGuard from "react-native-screenguard";
import { useHeaderHeight } from "@react-navigation/elements";
import ScreenWrapper from "@new-ui/components/common-components/ScreenWrapper";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { useUserCryptoMarketList } from "query/hooks/useCrypto";
import {
  useCoinmeCashOfframpExecuteMutation,
  useCoinmeOrderTemplateMutation,
  useCoinmeOrderTemplateStatusPoll,
  type CoinmeCashOfframpExecuteResponse,
  type CoinmeOrderTemplateResponse,
} from "query/hooks/useCoinmeCashRamp";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { CashRampBarcodeParams } from "./LocationFinder/locationFinder.types";
import {
  ERR_CASH_OFF_RAMP,
  ERR_MISSING_CHAIN,
  ERR_MISSING_LOCATION,
  ERR_MISSING_WALLET,
  ERR_ORDER_TEMPLATE,
  cashRampDisclaimerSell,
  cashRampFeeLabel,
  cashRampQuoteNote,
  cashRampSubtitleSell,
} from "./cashRampBarcodeCopy";
import {
  CASH_BUY_BARCODE_LOAD_SLOW_MS,
  CASH_BUY_DEFAULT_MAX_RETAIL_FEE,
  CASH_BUY_INSTRUCTION_EXPIRY_SECONDS,
  CASH_BUY_LOAD_ERROR_DEFAULT,
  CASH_BUY_LOAD_ERROR_TITLE,
} from "./cashBuyBarcodeInstructionCopy";
import CashBuyBarcodeInstructionView from "./CashBuyBarcodeInstructionView";
import CashBuyBarcodeLoadingView from "./CashBuyBarcodeLoadingView";
import CashBuyBarcodeDisplayView from "./CashBuyBarcodeDisplayView";
import CashBuyBarcodeScannedView from "./CashBuyBarcodeScannedView";
import CashBuyPurchaseSuccessView from "./CashBuyPurchaseSuccessView";
import CashBuyTransactionFailedView from "./CashBuyTransactionFailedView";
import CashRampBarcodeSellView from "./CashRampBarcodeSellView";
import {
  buildReceiptFromTemplate,
  finalizeCashRampTransaction,
  type CashRampPurchaseReceipt,
} from "./useCashRampBarcodeStatus";
import { showError } from "utils/toast";
import { resolveBarcodeExpiryAt } from "./useCountdownTo";

const ILLUSTRATIVE_PROCESSING_FEE_USD = 3.95;

type SellSessionStatus = "loading" | "success" | "error";

type BuyPhase =
  | "instruction"
  | "loadingBarcode"
  | "barcodeVisible"
  | "barcodeScanned"
  | "purchaseSuccess"
  | "transactionFailed";

const CashRampBarcodeScreen: React.FC = () => {
  const { theme } = useTheme();
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
  const resumeFromHistory = route.params?.resumeFromHistory;

  const [buyPhase, setBuyPhase] = useState<BuyPhase>(() => {
    if (isSell || !resumeFromHistory) return "instruction";
    return resumeFromHistory.initialPhase ?? "barcodeVisible";
  });
  const [buyResponse, setBuyResponse] = useState<CoinmeOrderTemplateResponse | null>(
    () => resumeFromHistory?.orderTemplateResponse ?? null
  );
  const [quoteRestartKey, setQuoteRestartKey] = useState(0);
  const [finalizing, setFinalizing] = useState(false);
  const [receipt, setReceipt] = useState<CashRampPurchaseReceipt | null>(null);

  const [sellSessionStatus, setSellSessionStatus] = useState<SellSessionStatus>("loading");
  const [sellResponse, setSellResponse] = useState<CoinmeCashOfframpExecuteResponse | null>(null);
  const [sellRetryKey, setSellRetryKey] = useState(0);

  const { mutateAsync: postOrderTemplate } = useCoinmeOrderTemplateMutation();
  const { mutateAsync: postCashOfframp } = useCoinmeCashOfframpExecuteMutation();
  const { data: marketRows = [] } = useUserCryptoMarketList(fiat);

  const locationRef = (location?.locationReference ?? "").trim();
  const tpl = buyResponse?.data?.transactionTemplate;
  const buySystemRef = (tpl?.transactionProviderRef ?? "").trim();
  const buyTxnRef = (tpl?.transactionSystemRef ?? buySystemRef).trim();

  const [isScreenFocused, setIsScreenFocused] = useState(true);

  const statusPollEnabled =
    !isSell && buyPhase === "barcodeVisible" && buySystemRef.length > 0 && isScreenFocused;

  const { data: templateStatus } = useCoinmeOrderTemplateStatusPoll(
    buySystemRef,
    statusPollEnabled
  );

  const unitUsdPrice = useMemo(() => {
    const row = marketRows.find((r) => (r.asset ?? "").toUpperCase() === cryptoCode);
    const p = row?.usd_price;
    return typeof p === "number" && Number.isFinite(p) && p > 0 ? p : null;
  }, [marketRows, cryptoCode]);

  const retailerName = useMemo(() => {
    const d = (location?.description ?? "").trim();
    if (d) return d;
    const p = (location?.provider ?? "").trim();
    return p || "this store";
  }, [location?.description, location?.provider]);

  const addressLine = useMemo(() => {
    const parts = [
      location?.address,
      location?.city,
      location?.state,
      location?.zipCode,
    ].filter(Boolean);
    return parts.join(", ");
  }, [location?.address, location?.city, location?.state, location?.zipCode]);

  const isWalmart = useMemo(() => {
    const hay = `${location?.provider ?? ""} ${location?.description ?? ""}`.toLowerCase();
    return hay.includes("walmart");
  }, [location?.description, location?.provider]);

  const maxRetailFee = useMemo(() => {
    const r = tpl?.providerExclusiveFees?.retailerCustomerFee?.amount;
    if (r) return `$${r}`;
    return CASH_BUY_DEFAULT_MAX_RETAIL_FEE;
  }, [tpl?.providerExclusiveFees?.retailerCustomerFee?.amount]);

  const feeLines = useMemo(() => {
    const lines: string[] = [];
    const fm = tpl?.feesMap;
    if (fm?.exchangeFee) lines.push(`Exchange fee: $${fm.exchangeFee}`);
    const r = tpl?.providerExclusiveFees?.retailerCustomerFee?.amount;
    if (r) lines.push(`Retail service fee: $${r}`);
    return lines;
  }, [tpl?.feesMap, tpl?.providerExclusiveFees?.retailerCustomerFee?.amount]);

  const sessionExpiryAtRef = useRef(
    new Date(Date.now() + CASH_BUY_INSTRUCTION_EXPIRY_SECONDS * 1000)
  );

  const barcodeExpiryAt = useMemo(
    () => resolveBarcodeExpiryAt(tpl?.expiryTimestamp, sessionExpiryAtRef.current),
    [tpl?.expiryTimestamp]
  );

  const isScreenFocusedRef = useRef(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const loadCancelledRef = useRef(false);

  const screenGuardActive =
    isSell || buyPhase === "barcodeVisible" || buyPhase === "barcodeScanned";

  useFocusEffect(
    useCallback(() => {
      isScreenFocusedRef.current = true;
      setIsScreenFocused(true);
      let cancelled = false;
      if (!screenGuardActive) {
        return () => {
          isScreenFocusedRef.current = false;
          setIsScreenFocused(false);
        };
      }
      (async () => {
        try {
          await ScreenGuard.initSettings({ enableCapture: false, enableRecord: false });
          if (cancelled) return;
          await ScreenGuard.register({ backgroundColor: theme.colors.white });
        } catch {
          /* native module optional */
        }
      })();
      return () => {
        cancelled = true;
        isScreenFocusedRef.current = false;
        setIsScreenFocused(false);
        void ScreenGuard.unregister().catch(() => {});
      };
    }, [screenGuardActive, theme.colors.white])
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
    if (buyPhase !== "barcodeVisible") return;
    if (templateStatus?.kind !== "scanned") return;
    setBuyPhase("barcodeScanned");
  }, [buyPhase, templateStatus?.kind]);

  useEffect(() => {
    if (!isSell) return;
    let cancelled = false;

    const run = async () => {
      setSellSessionStatus("loading");
      setSellResponse(null);

      if (!locationRef) {
        showError(ERR_MISSING_LOCATION);
        if (!cancelled) setSellSessionStatus("error");
        return;
      }
      if (!sourceWalletAddress) {
        showError(ERR_MISSING_WALLET);
        if (!cancelled) setSellSessionStatus("error");
        return;
      }
      if (!chainParam) {
        showError(ERR_MISSING_CHAIN);
        if (!cancelled) setSellSessionStatus("error");
        return;
      }

      try {
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
          setSellSessionStatus("error");
          return;
        }
        setSellResponse(res);
        setSellSessionStatus("success");
      } catch (e: unknown) {
        if (cancelled) return;
        const msg =
          typeof e === "object" && e !== null && "message" in e
            ? String((e as { message?: string }).message)
            : "Network error";
        showError(msg);
        setSellSessionStatus("error");
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [
    sellRetryKey,
    isSell,
    amount,
    fiat,
    cryptoCode,
    locationRef,
    sourceWalletAddress,
    chainParam,
    postCashOfframp,
  ]);

  const navigateLoadError = useCallback(
    (message: string) => {
      navigation.navigate(NAVIGATION_SCREENS.NEW_COMMON_ERROR as never, {
        title: CASH_BUY_LOAD_ERROR_TITLE,
        description: message || CASH_BUY_LOAD_ERROR_DEFAULT,
        primaryButtonLabel: "Close",
        dismissAction: "goBack",
      } as never);
    },
    [navigation]
  );

  const loadBuyBarcode = useCallback(async () => {
    loadCancelledRef.current = false;
    if (!locationRef) {
      navigateLoadError(ERR_MISSING_LOCATION);
      return;
    }

    const slowTimer = setTimeout(() => {
      if (!loadCancelledRef.current) setBuyPhase("loadingBarcode");
    }, CASH_BUY_BARCODE_LOAD_SLOW_MS);

    try {
      const res = await postOrderTemplate({
        debitCurrencyCode: fiat.toUpperCase(),
        creditCurrencyCode: cryptoCode,
        amountValue: String(amount),
        amountCurrencyCode: fiat.toUpperCase(),
        locationReference: locationRef,
      });
      clearTimeout(slowTimer);
      if (loadCancelledRef.current) return;

      if (res?.ok === false) {
        navigateLoadError(res?.message || ERR_ORDER_TEMPLATE);
        setBuyPhase("instruction");
        return;
      }

      const ref = (res?.data?.transactionTemplate?.transactionProviderRef ?? "").trim();
      if (!ref) {
        navigateLoadError("No scannable code came back from the server.");
        setBuyPhase("instruction");
        return;
      }

      setBuyResponse(res);
      setQuoteRestartKey((k) => k + 1);
      setBuyPhase("barcodeVisible");
    } catch (e: unknown) {
      clearTimeout(slowTimer);
      if (loadCancelledRef.current) return;
      const msg =
        typeof e === "object" && e !== null && "message" in e
          ? String((e as { message?: string }).message)
          : "Network error";
      navigateLoadError(msg);
      setBuyPhase("instruction");
    }
  }, [
    amount,
    cryptoCode,
    fiat,
    locationRef,
    navigateLoadError,
    postOrderTemplate,
  ]);

  const onTapReveal = useCallback(() => {
    void loadBuyBarcode();
  }, [loadBuyBarcode]);

  const onCancelTransaction = useCallback(() => {
    Alert.alert("Cancel transaction?", "You'll return to the previous screen.", [
      { text: "Keep going", style: "cancel" },
      {
        text: "Cancel transaction",
        style: "destructive",
        onPress: () => {
          loadCancelledRef.current = true;
          navigation.goBack();
        },
      },
    ]);
  }, [navigation]);

  const onFinalize = useCallback(async () => {
    if (!buyTxnRef) return;
    setFinalizing(true);
    try {
      const result = await finalizeCashRampTransaction({ transactionRef: buyTxnRef });
      if (result === "success") {
        setReceipt(
          buildReceiptFromTemplate({
            fiat,
            amount,
            transactionRef: buyTxnRef,
          })
        );
        setBuyPhase("purchaseSuccess");
      } else {
        setBuyPhase("transactionFailed");
      }
    } finally {
      setFinalizing(false);
    }
  }, [amount, buyTxnRef, fiat]);

  const onStartNewTransaction = useCallback(() => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: NAVIGATION_SCREENS.NEW_CASH_RAMP_LOCATION_FINDER,
            params: {
              amount,
              fiatCurrencyCode: fiat,
              cryptoCurrencyCode: cryptoCode,
              chain: chainParam || "ETH",
              sourceWalletAddress: sourceWalletAddress || undefined,
            },
          },
        ],
      })
    );
  }, [amount, chainParam, cryptoCode, fiat, navigation, sourceWalletAddress]);

  const onBuyDone = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const sellTxn = sellResponse?.data?.transaction;
  const sellQuote = sellResponse?.data?.quote;
  const partnerTransactionId = (sellTxn?.partnerTransactionId ?? "").trim();

  const marketCryptoAmountLabel = useMemo(() => {
    if (unitUsdPrice == null || amount <= 0) return "—";
    const est = amount / unitUsdPrice;
    const trimmed = est.toFixed(6).replace(/\.?0+$/, "");
    return `${trimmed} ${cryptoCode}`;
  }, [unitUsdPrice, amount, cryptoCode]);

  const sellSubtitle = useMemo(
    () =>
      cashRampSubtitleSell({
        marketCryptoAmountLabel,
        locationDescription: (location?.description ?? "").trim(),
        fiat,
        amount,
      }),
    [amount, fiat, location?.description, marketCryptoAmountLabel]
  );

  const sellPrimaryAmount = useMemo(() => {
    if (sellSessionStatus !== "success") return marketCryptoAmountLabel;
    const amt = sellTxn?.debitCurrencyAmount ?? sellQuote?.debitCurrencyAmount;
    const code = sellTxn?.debitCurrencyCode ?? sellQuote?.debitCurrencyCode ?? cryptoCode;
    return amt ? `${amt} ${code}` : marketCryptoAmountLabel;
  }, [
    cryptoCode,
    marketCryptoAmountLabel,
    sellQuote?.debitCurrencyAmount,
    sellQuote?.debitCurrencyCode,
    sellSessionStatus,
    sellTxn?.debitCurrencyAmount,
    sellTxn?.debitCurrencyCode,
  ]);

  const sellFeeValue = useMemo(() => {
    if (sellSessionStatus !== "success") return `$${ILLUSTRATIVE_PROCESSING_FEE_USD.toFixed(2)}`;
    const tf = sellTxn?.totalFees ?? sellQuote?.totalFees;
    const fc = sellTxn?.feeCurrencyCode ?? sellQuote?.feeCurrency ?? "USD";
    if (tf) return `${tf} ${fc}`;
    return `$${ILLUSTRATIVE_PROCESSING_FEE_USD.toFixed(2)}`;
  }, [sellQuote?.feeCurrency, sellQuote?.totalFees, sellSessionStatus, sellTxn?.feeCurrencyCode, sellTxn?.totalFees]);

  const sellQuoteNote = useMemo(() => {
    let expiry: Date | null = null;
    if (sellQuote?.expirationTime) {
      try {
        const d = new Date(sellQuote.expirationTime);
        if (!Number.isNaN(d.getTime())) expiry = d;
      } catch {
        /* ignore */
      }
    }
    return cashRampQuoteNote(true, expiry);
  }, [sellQuote?.expirationTime]);

  const addressMeta = location?.address
    ? `${location.address}${location.city ? `, ${location.city}` : ""}${location.state ? `, ${location.state}` : ""}${location.zipCode ? ` ${location.zipCode}` : ""}`
    : null;

  const buyGradientColors = [
    theme.colors.greenLight2,
    theme.colors.tertiary,
    theme.colors.greenLight1,
    theme.colors.greenLight2,
  ] as const;

  const renderBuyContent = () => {
    switch (buyPhase) {
      case "instruction":
        return (
          <CashBuyBarcodeInstructionView
            retailerName={retailerName}
            addressLine={addressLine}
            isWalmart={isWalmart}
            maxRetailFee={maxRetailFee}
            cryptoCode={cryptoCode}
            unitUsdPrice={unitUsdPrice}
            feeLines={feeLines}
            imageUrl={location?.imageUrl}
            quoteRestartKey={quoteRestartKey}
            expiryAt={barcodeExpiryAt}
            onTapReveal={onTapReveal}
            onCancel={onCancelTransaction}
          />
        );
      case "loadingBarcode":
        return <CashBuyBarcodeLoadingView />;
      case "barcodeVisible":
        return (
          <CashBuyBarcodeDisplayView
            fiat={fiat}
            amount={amount}
            barcodeValue={buySystemRef}
            expiryAt={barcodeExpiryAt}
            maxRetailFee={maxRetailFee}
            quoteRestartKey={quoteRestartKey}
            cryptoCode={cryptoCode}
            unitUsdPrice={unitUsdPrice}
            feeLines={feeLines}
            onClose={() => navigation.goBack()}
          />
        );
      case "barcodeScanned":
        return <CashBuyBarcodeScannedView finalizing={finalizing} onFinalize={() => void onFinalize()} />;
      case "purchaseSuccess":
        return receipt ? (
          <CashBuyPurchaseSuccessView receipt={receipt} onDone={onBuyDone} />
        ) : null;
      case "transactionFailed":
        return <CashBuyTransactionFailedView onStartNew={onStartNewTransaction} />;
      default:
        return null;
    }
  };

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={["bottom", "left", "right"]}
      scrollable={!isSell && buyPhase === "instruction"}
      contentStyle={{
        flexGrow: 1,
        paddingTop: headerHeight,
        paddingBottom: theme.spacing["2xl"],
      }}
      gradient="linear"
      gradientColors={
        isSell
          ? [
              theme.colors.greenLight2,
              theme.colors.greenLight2,
              theme.colors.white,
              theme.colors.greenLight2,
              theme.colors.greenLight1,
              theme.colors.tertiary,
              theme.colors.greenLight1,
              theme.colors.greenLight2,
              theme.colors.white,
            ]
          : [...buyGradientColors]
      }
      gradientStart={{ x: 0.5, y: 0 }}
      gradientEnd={{ x: 0.5, y: 1 }}
      statusBarStyle="dark-content"
    >
      {isSell ? (
        <CashRampBarcodeSellView
          sessionStatus={sellSessionStatus}
          title=""
          subtitleText={sellSubtitle}
          disclaimerText={cashRampDisclaimerSell({ amount, fiat })}
          primaryAmountLabel={sellPrimaryAmount}
          feeLabel={cashRampFeeLabel(sellSessionStatus, true)}
          feeValueLabel={sellFeeValue}
          quoteNoteText={sellQuoteNote}
          partnerTransactionId={partnerTransactionId}
          cryptoCode={cryptoCode}
          addressMeta={addressMeta}
          onRetry={() => setSellRetryKey((k) => k + 1)}
          onDone={() => navigation.goBack()}
        />
      ) : (
        renderBuyContent()
      )}
    </ScreenWrapper>
  );
};

export default CashRampBarcodeScreen;

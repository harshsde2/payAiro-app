import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput as RNTextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useEmailVerificationGuard } from "hooks/useEmailVerificationGuard";
import ScreenWrapper from "@new-ui/components/common-components/ScreenWrapper";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { enterAmountStyles } from "@new-ui/styles/screens/send/enterAmountStyles";
import CustomText from "@new-ui/components/common-components/CustomText";
import { AppIcon } from "@new-ui/assets/svgs";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import useSelectorAction from "hooks/useSelectorAction";
import {
  bankKeys,
  cryptoKeys,
  useCryptoAssetsListData,
  useCryptoMarketForCurrency,
  useUserCryptoBalanceFastApi,
  useCoinmeTradeExecute,
  useCoinmeTradeQuote,
  getExpectedFeeUsd,
  getCoinmeTradeQuoteErrorMessage,
  type CoinmeTradeExecutePayload,
} from "query/hooks";
import { queryClient } from "query/queryClient";
import { useEnterAmountState } from "@new-ui/screens/Send/EnterAmount/useEnterAmountState";
import AmountInput from "@new-ui/screens/Send/EnterAmount/AmountInput";
import PayButton from "@new-ui/screens/Send/EnterAmount/PayButton";
import RecipientHeader from "@new-ui/screens/Send/EnterAmount/RecipientHeader";
import type { FundingSource } from "@new-ui/screens/Send/EnterAmount/enterAmount.types";
import type { CryptoFundingItem } from "@new-ui/screens/Send/EnterAmount/cryptoFundingTypes";
import { showError, getApiErrorMessage } from "utils/toast";
import { useTransactionSubmit } from "hooks/useTransactionSubmit";
import {
  buildIntentSignature,
  isOutcomeUnknown,
  UNKNOWN_OUTCOME_MESSAGE,
} from "services/transactionGuard";
import { confirmDuplicateTransaction } from "utils/confirmDuplicateTransaction";
import { afterModalTransition } from "utils/afterModalTransition";
import { useAppLock } from "hooks/useAppLock";
import { fetchWebSessionId } from "services/coinmeRiskLifecycle";
import { useCoinmeAccountId } from "hooks/useCoinmeAccountId";
import { useStateStablecoin } from "hooks/useStateStablecoin";
import { useTransactionLimit } from "hooks/useTransactionLimit";
import TransactionLimitMeter from "@new-ui/components/common-components/TransactionLimitMeter";
import { coinmeTransactionLimitsKeys } from "query/hooks/useCoinmeTransactionLimits";
import {
  DebitCardPaymentRow,
  PaymentMethodPickerModal,
  AddDebitCardModal,
  useApplyDefaultPaymentMethod,
} from "@new-ui/components/common-components/AddBalance";
import type { AddedCardResult } from "@new-ui/components/common-components/AddBalance/AddDebitCardModal";
import DashboardSection from "tsx-components/DashboardSection";
import {
  usePaymentMethodsList,
  type PaymentMethodItem,
} from "query/hooks/usePaymentMethods";
import WithdrawConfirmationModal from "./WithdrawConfirmationModal";

type WithdrawPaymentMode = "debit" | "cash";

const COINME_DEFAULTS = {
  paymentMethodId: "uhygtfr5e354rtyu76g6b7i8",
  sourceWalletAddress: ",mu9n7777777545e5vr",
};

// Withdraw keeps a 2% buffer of the balance so the fee always fits — the max the user
// may enter is balance × this fraction. Client-side input guard only; real fee = quote.
const SELL_WITHDRAW_MAX_FRACTION = 0.98;

// Name variants a balances row may use for each stablecoin symbol.
const SELL_ASSET_ALIASES: Record<string, string[]> = {
  USDC: ["USDC", "USD COIN", "USDCOIN"],
  DAI: ["DAI", "DAI STABLECOIN"],
};

function isSellAssetRow(item: CryptoFundingItem, symbol: string): boolean {
  const a = String(item?.asset ?? "").toUpperCase();
  const aliases = SELL_ASSET_ALIASES[symbol] ?? [symbol];
  return aliases.includes(a);
}

const CryptoWithdraw: React.FC = () => {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const { theme } = useTheme();
  const { requireEmailVerified } = useEmailVerificationGuard();
  const styles = enterAmountStyles(theme);

  const selectorData = useSelectorAction() as any;
  const { allCryptoBalances } = selectorData;
  const { data: fetchedCryptoBalances = [] } = useCryptoAssetsListData("USD");
  const { requestPaymentVerification } = useAppLock();
  const tradeExecute = useCoinmeTradeExecute();
  // One POST per transaction intent, regardless of taps, retries or re-renders.
  const { submit: submitTransaction, isSubmitting: isSubmittingTransaction } =
    useTransactionSubmit();

  // Registered-state stablecoin (TX → DAI, others → USDC): the asset this screen sells.
  const sellAsset = useStateStablecoin();

  const coinmeAccountId = useCoinmeAccountId();

  const [debitInfoVisible, setDebitInfoVisible] = useState(false);
  const [addCardVisible, setAddCardVisible] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<WithdrawPaymentMode>("debit");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodItem | null>(null);
  const paymentMethodsQuery = usePaymentMethodsList(20);

  // Pre-select the user's default card (frontend-only) once the list loads.
  useApplyDefaultPaymentMethod({
    items: paymentMethodsQuery.data?.data?.items ?? [],
    flow: "sell",
    selected: selectedPaymentMethod,
    onSelect: setSelectedPaymentMethod,
  });

  const paymentSubtitle = useMemo(() => {
    if (!selectedPaymentMethod) return "Select a card";
    const provider = (selectedPaymentMethod.card_provider || "Card").toUpperCase();
    const last4 = selectedPaymentMethod.card_last4 || "••••";
    return `${provider}  •••• ${last4}`;
  }, [selectedPaymentMethod]);

  const handleAddedCard = useCallback(
    async (result: AddedCardResult) => {
      setAddCardVisible(false);

      const res = await paymentMethodsQuery.refetch();
      const items = res.data?.data?.items ?? [];
      const wanted = result.payment_method_id;

      let selected: PaymentMethodItem | null = null;
      if (wanted.startsWith("last4:")) {
        const last4 = wanted.replace("last4:", "");
        selected = items.find((i) => String(i.card_last4 ?? "") === String(last4)) ?? null;
      } else {
        selected = items.find((i) => i.payment_method_id === wanted) ?? null;
      }

      setSelectedPaymentMethod(selected);
      setTimeout(() => setDebitInfoVisible(true), 350);
    },
    [paymentMethodsQuery]
  );

  const mergedCryptoBalances = useMemo<CryptoFundingItem[]>(() => {
    if (Array.isArray(allCryptoBalances) && allCryptoBalances.length > 0) {
      return allCryptoBalances as CryptoFundingItem[];
    }
    if (Array.isArray(fetchedCryptoBalances) && fetchedCryptoBalances.length > 0) {
      return fetchedCryptoBalances as CryptoFundingItem[];
    }
    return [];
  }, [allCryptoBalances, fetchedCryptoBalances]);

  // The general market list is state-filtered per user by the backend and can HIDE
  // the sell asset (USDC/DAI) — fetch it explicitly (`?currencies=` bypasses the
  // filter) and pair it with the balance-API holding as a fallback row.
  const { data: sellMarketRows = [] } = useCryptoMarketForCurrency(sellAsset, "USD");
  const { data: sellBalanceRows = [] } = useUserCryptoBalanceFastApi();

  const solRow = useMemo(() => {
    const fromMerged =
      mergedCryptoBalances.find((item) => isSellAssetRow(item, sellAsset)) ?? null;
    if (fromMerged) return fromMerged;

    const marketRow = sellMarketRows.find(
      (m) => String(m.asset ?? "").toUpperCase() === sellAsset
    );
    if (!marketRow) return null;
    const balRow = sellBalanceRows.find(
      (r) => String(r.currencySymbol ?? "").toUpperCase() === sellAsset
    );
    const qty = Number(balRow?.balance ?? 0);
    const usd = Number(balRow?.estimatedBalanceValue ?? 0);
    return {
      ...marketRow,
      platform_available: Number.isFinite(qty) ? Math.max(0, qty) : 0,
      rounded_balance: Number.isFinite(qty) ? Math.max(0, qty) : 0,
      usd_value_available: Number.isFinite(usd) ? Math.max(0, usd) : 0,
      usd_value_total: Number.isFinite(usd) ? Math.max(0, usd) : 0,
    } as CryptoFundingItem;
  }, [mergedCryptoBalances, sellAsset, sellMarketRows, sellBalanceRows]);

  const coinmeCryptoAsset = useMemo(() => {
    if (!solRow?.asset) return null;
    const rawPrice = Number(solRow.usd_price ?? (solRow as any).price ?? 0);
    const maxAssetBalance = Number(
      solRow.platform_available ?? solRow.platform_total_balance ?? solRow.rounded_balance ?? 0
    );
    const maxUsdBalance = Number(solRow.usd_value_total ?? solRow.usd_value_available ?? 0);
    const derivedPriceFromTotals =
      maxAssetBalance > 0 && maxUsdBalance > 0 ? maxUsdBalance / maxAssetBalance : 0;
    const currentPrice =
      Number.isFinite(rawPrice) && rawPrice > 0
        ? rawPrice
        : Number.isFinite(derivedPriceFromTotals) && derivedPriceFromTotals > 0
          ? derivedPriceFromTotals
          : 0;

    return {
      asset: String(solRow.asset).toUpperCase(),
      chain: String((solRow as any)?.chain ?? sellAsset).toUpperCase(),
      logo: solRow.logo,
      fiatCurrency: "USD" as const,
      currentPrice,
      sourceWalletAddress: (solRow as any)?.sourceWalletAddress,
    };
  }, [solRow, sellAsset]);

  const convertToFundingSource = useCallback((item: CryptoFundingItem): FundingSource | null => {
    const assetSymbol = item?.asset;
    if (!assetSymbol) return null;

    const rawPrice = Number(item.usd_price ?? (item as any).price ?? 0);
    const maxAssetBalance = Number(
      item.platform_available ?? item.platform_total_balance ?? item.rounded_balance ?? 0
    );
    const maxUsdBalance = Number(item.usd_value_total ?? item.usd_value_available ?? 0);
    const derivedPriceFromTotals =
      maxAssetBalance > 0 && maxUsdBalance > 0 ? maxUsdBalance / maxAssetBalance : 0;
    const priceUSD =
      Number.isFinite(rawPrice) && rawPrice > 0
        ? rawPrice
        : Number.isFinite(derivedPriceFromTotals) && derivedPriceFromTotals > 0
          ? derivedPriceFromTotals
          : 0;

    return {
      id: `crypto-${assetSymbol}`,
      name: assetSymbol,
      balance: Number.isFinite(maxAssetBalance) ? maxAssetBalance : 0,
      type: "crypto",
      cryptoMeta: {
        symbol: assetSymbol,
        network: String((item as any)?.chain ?? assetSymbol),
        priceUSD,
        maxAssetBalance: Number.isFinite(maxAssetBalance) ? maxAssetBalance : 0,
        maxUsdBalance: Number.isFinite(maxUsdBalance) ? maxUsdBalance : 0,
        logo: item.logo,
      },
    };
  }, []);

  const solFundingSource = useMemo(() => {
    if (!solRow) return null;
    return convertToFundingSource(solRow);
  }, [convertToFundingSource, solRow]);

  const {
    amount,
    inputValue,
    displayAmount,
    selectedSource,
    inputMode,
    assetAmount,
    maxUsd,
    maxInputLength,
    onChangeAmountText,
    setSelectedSource,
  } = useEnterAmountState({
    initialSelectedSource: solFundingSource,
    transactionFeePercent: 0,
    initialInputMode: "fiat",
    preferFiatCryptoEntry: true,
  });

  useEffect(() => {
    if (!selectedSource && solFundingSource) {
      setSelectedSource(solFundingSource);
    }
  }, [selectedSource, solFundingSource, setSelectedSource]);

  // Sell limits for the selected rail: debit → debit_sell, cash → ncr_sell.
  // `amount` is always USD here regardless of entry mode, so it validates directly.
  const sellLimit = useTransactionLimit("sell", selectedPaymentMode);
  const limitError = sellLimit.validate(amount);

  // Keep a 2% buffer in the wallet so the fee fits — never let the user withdraw more
  // than balance − 2% (else the quote fails on a full-balance withdrawal).
  const maxSpendableUsd = useMemo(
    () => (maxUsd > 0 ? Math.floor(maxUsd * SELL_WITHDRAW_MAX_FRACTION * 100) / 100 : 0),
    [maxUsd]
  );
  const balanceError =
    maxSpendableUsd > 0 && amount > maxSpendableUsd + 0.005
      ? `You can Instant withdraw up to $${maxSpendableUsd.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} after the withdrawal fee is applied.`
      : null;

  const handleUseMaxLimit = useCallback(() => {
    const fillTarget =
      maxSpendableUsd > 0
        ? Math.min(sellLimit.effectiveMaxUsd, maxSpendableUsd)
        : sellLimit.effectiveMaxUsd;
    onChangeAmountText(String(fillTarget));
  }, [maxSpendableUsd, onChangeAmountText, sellLimit.effectiveMaxUsd]);

  const dynamicFontSize = useMemo(() => {
    const totalChars = (displayAmount || "0.00").length + 1;
    const availableWidth = width - 80;
    const charWidthRatio = 0.6;
    const ideal = availableWidth / (totalChars * charWidthRatio);
    const max = 40;
    const min = 24;
    return Math.min(max, Math.max(min, ideal));
  }, [displayAmount, width]);

  // Expected fee shown in the confirmation modal — fetched only while it's open.
  // Declared above handleTradeExecute so the sell execute can net it out.
  const withdrawQuoteEnabled = showConfirmModal && amount > 0 && !!coinmeCryptoAsset;
  const {
    data: withdrawQuoteData,
    isLoading: isWithdrawQuoteLoading,
    isError: isWithdrawQuoteError,
    error: withdrawQuoteError,
  } = useCoinmeTradeQuote(
    {
      tradeType: "sell",
      chain: String(coinmeCryptoAsset?.chain || "ETH").toUpperCase(),
      cryptoCurrencyCode: String(coinmeCryptoAsset?.asset || "").toUpperCase(),
      fiatCurrencyCode: "USD",
      amountValue: String(inputMode === "fiat" ? amount : assetAmount),
      amountCurrencyCode:
        inputMode === "fiat" ? "USD" : String(coinmeCryptoAsset?.asset || "").toUpperCase(),
    },
    withdrawQuoteEnabled
  );
  const withdrawExpectedFee = getExpectedFeeUsd(withdrawQuoteData?.feeBreakdown);

  // Surface the quote's own failure (e.g. insufficient balance) as a toast, deduped
  // by message so it fires once per distinct error rather than on every re-render.
  const lastWithdrawQuoteErrorToast = useRef<string | null>(null);
  useEffect(() => {
    if (!isWithdrawQuoteError || !withdrawQuoteError) {
      lastWithdrawQuoteErrorToast.current = null;
      return;
    }
    const msg = getCoinmeTradeQuoteErrorMessage(withdrawQuoteError);
    if (lastWithdrawQuoteErrorToast.current === msg) return;
    lastWithdrawQuoteErrorToast.current = msg;
    showError("Something went wrong", msg);
  }, [isWithdrawQuoteError, withdrawQuoteError]);

  const inputRef = useRef<RNTextInput | null>(null);
  const handlePressAmountFocus = useCallback(() => inputRef.current?.focus(), []);

  const handleTradeExecute = useCallback(async () => {
    if (!coinmeCryptoAsset) {
      navigation.navigate(NAVIGATION_SCREENS.TRANSACTION_RESULT as never, {
        isLoading: false,
        transactionData: null,
        isSuccess: false,
        isError: true,
        customTitle: "Withdrawal unsuccessful",
        customDescription: "Unable to complete withdrawal. Please try again.",
      } as never);
      showError("Withdrawal failed", "Unable to complete withdrawal. Please try again.");
      return;
    }

    const isFiatEntry = inputMode === "fiat";
    // Send the entered amount as-is. The 2% entry buffer keeps room in the wallet
    // so the backend can auto-deduct the fee on top.
    const payloadAmountValue = String(isFiatEntry ? amount : assetAmount);
    const payloadAmountCurrency = isFiatEntry
      ? coinmeCryptoAsset.fiatCurrency || "USD"
      : coinmeCryptoAsset.asset;
    const paymentMethodId =
      selectedPaymentMethod?.payment_method_id ?? COINME_DEFAULTS.paymentMethodId;

    // NOTE: webSessionId is deliberately NOT part of the signature — it is minted fresh
    // per attempt, so including it would make every retry look like a new intent.
    const signature = buildIntentSignature([
      "trade",
      "sell",
      coinmeCryptoAsset.chain,
      coinmeCryptoAsset.asset,
      payloadAmountValue,
      payloadAmountCurrency,
      paymentMethodId,
    ]);

    await submitTransaction(
      signature,
      async (idempotencyKey) => {
        navigation.navigate(NAVIGATION_SCREENS.TRANSACTION_RESULT as never, {
          isLoading: true,
          transactionData: null,
          isSuccess: false,
          isError: false,
          customTitle: "Processing withdrawal",
          customDescription: "Please wait while we complete your request…",
        } as never);

        try {
          if (!coinmeAccountId) {
            throw new Error(
              "Your Coinme account is not ready yet. Please complete onboarding and try again."
            );
          }

          const webSessionId = await fetchWebSessionId({
            accountId: coinmeAccountId,
            riskFlow: 'cardtransaction',
          });

          const payload: CoinmeTradeExecutePayload = {
            tradeType: "sell",
            chain: coinmeCryptoAsset.chain,
            cryptoCurrencyCode: coinmeCryptoAsset.asset,
            fiatCurrencyCode: coinmeCryptoAsset.fiatCurrency || "USD",
            amountValue: payloadAmountValue,
            amountCurrencyCode: payloadAmountCurrency,
            paymentMethodId,
            sourceWalletAddress:
              coinmeCryptoAsset.sourceWalletAddress || COINME_DEFAULTS.sourceWalletAddress,
            webSessionId,
          };

          const res = await tradeExecute.mutateAsync({ ...payload, idempotencyKey });
          const ok = res?.ok ?? res?.status ?? true;

          queryClient.invalidateQueries({ queryKey: cryptoKeys.allCryptoBalances() });
          queryClient.invalidateQueries({ queryKey: bankKeys.balance() });
          // This sell consumed part of the daily/monthly allowance — refresh the meter.
          queryClient.invalidateQueries({ queryKey: coinmeTransactionLimitsKeys.all });

          // A 2xx body can still carry a rejection (`ok: false`) — its `message` /
          // `error.message` is the reason to show, not a generic line.
          const failureMessage = ok
            ? undefined
            : getApiErrorMessage(res, "Unable to complete withdrawal. Please try again.");

          navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT as never, {
            isLoading: false,
            transactionData: res,
            isSuccess: !!ok,
            isError: !ok,
            customTitle: ok ? "Withdrawal Request Submitted" : "Withdrawal unsuccessful",
            ...(ok
              ? {
                  customDescription:
                    "Your funds will be transferred to your selected debit card in accordance with your bank's processing timeline.",
                }
              : { errorMessage: failureMessage }),
            hideCoinmeCurrencyDetails: true,
          } as never);

          if (!ok) {
            showError("Withdrawal failed", failureMessage!);
          }
        } catch (err: unknown) {
          // No response at all → we do NOT know whether the withdrawal executed. Never
          // offer a plain retry here; send the user to check Activity instead.
          const unknown = isOutcomeUnknown(err);
          // The backend answered (e.g. 503 "This banking rail is currently under
          // maintenance") — show ITS reason. Only a no-response failure gets the
          // generic unknown-outcome copy.
          const description = unknown
            ? UNKNOWN_OUTCOME_MESSAGE
            : getApiErrorMessage(err, "Unable to complete withdrawal. Please try again.");
          navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT as never, {
            isLoading: false,
            transactionData: null,
            isSuccess: false,
            isError: true,
            customTitle: unknown ? "Withdrawal not confirmed" : "Withdrawal unsuccessful",
            errorMessage: description,
            outcomeUnknown: unknown,
          } as never);
          showError(
            unknown ? "Couldn't confirm" : "Withdrawal failed",
            description
          );
          // Rethrow so the guard records the outcome and keeps the intent locked.
          throw err;
        }
      },
      {
        onDuplicate: (retry) => confirmDuplicateTransaction(retry),
        onUnknownOutcome: () => showError("Couldn't confirm", UNKNOWN_OUTCOME_MESSAGE),
      },
    );
  }, [
    amount,
    assetAmount,
    coinmeCryptoAsset,
    coinmeAccountId,
    inputMode,
    navigation,
    selectedPaymentMethod?.payment_method_id,
    submitTransaction,
    tradeExecute,
  ]);

  const handleActionsAfterPinVerified = useCallback(() => {
    handleTradeExecute();
  }, [handleTradeExecute]);

  const proceedWithdraw = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed || trimmed === "." || amount <= 0) {
      showError("Enter an amount", "Please enter an amount to withdraw.");
      return;
    }

    // The meter already shows this inline; the guard stops the flow if the button
    // is reached any other way. No-op when limits are unavailable (validate → null).
    if (limitError) {
      showError("Limit reached", limitError);
      return;
    }
    // Enforce the 2% balance buffer (guards any path to Proceed).
    if (balanceError) {
      showError("Amount too high", balanceError);
      return;
    }

    if (selectedPaymentMode === "cash") {
      if (!coinmeCryptoAsset) {
        showError("Couldn't open locations", "Unable to open cash locations. Please try again.");
        return;
      }
      navigation.navigate(NAVIGATION_SCREENS.NEW_CASH_RAMP_LOCATION_FINDER as never, {
        amount,
        fiatCurrencyCode: coinmeCryptoAsset.fiatCurrency || "USD",
        cryptoCurrencyCode: coinmeCryptoAsset.asset,
        chain: coinmeCryptoAsset.chain,
      } as never);
      return;
    }

    // Debit: a card must be selected before showing the review summary / PIN.
    if (!selectedPaymentMethod) {
      showError("Select a payment method", "Please choose how you want to pay.");
      return;
    }

    // Debit: show the review summary (with expected fee) before PIN.
    setShowConfirmModal(true);
  }, [
    amount,
    balanceError,
    coinmeCryptoAsset,
    inputValue,
    limitError,
    navigation,
    selectedPaymentMethod,
    selectedPaymentMode,
  ]);

  // Gate withdrawal behind email verification; resumes automatically once verified.
  const handlePayPress = useCallback(() => {
    requireEmailVerified(proceedWithdraw);
  }, [requireEmailVerified, proceedWithdraw]);

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={["top", "bottom"]}
      scrollable={false}
      contentStyle={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Scrollable instead of a rigid flex split: iOS's KeyboardAvoidingView "padding"
            behavior isn't reliable enough on its own in nested layouts like this one — when
            its push falls short, a fixed (non-scrolling) layout has no fallback and the
            keyboard just covers the Payment Method / Proceed button. Scrolling guarantees
            everything stays reachable regardless of exact keyboard-height math. The flex
            spacer keeps Payment Method/Proceed visually pinned near the bottom when there's
            slack space (keyboard closed), same as the original layout looked. */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <AppIcon.ArrowLeft width={25} height={25} color={theme.colors.text} onPress={() => navigation.goBack()} />
            <View style={styles.headerTitleContainer}>
              <CustomText variant="h1" fontWeight="bold" size={20}>
                Withdraw
              </CustomText>
            </View>
            <View style={styles.headerRightSpacer} />
          </View>

          <RecipientHeader
            recipient_identifier=""
            mode="trade"
            tradeMode="sell"
            fiatCashout
          />

          <AmountInput
            inputValue={inputValue}
            onChangeAmountText={onChangeAmountText}
            inputRef={inputRef}
            dynamicFontSize={dynamicFontSize}
            onPressFocus={handlePressAmountFocus}
            leftPrefix="$"
            rightSuffix=""
            maxLength={maxInputLength}
          />

          <TransactionLimitMeter
            style={styles.limitMeterSpacer}
            limit={sellLimit}
            amountUsd={amount}
            error={limitError || balanceError}
            // The limit is a USD figure — only offer to fill it while the user
            // is entering USD, otherwise it would land in the input as crypto.
            onUseMax={inputMode === "fiat" ? handleUseMaxLimit : undefined}
          />

          <View style={{ flex: 1 }} />

          <View style={styles.bottomAreaTrade}>
            <DashboardSection
              title="Payment Method"
              titleStyle={{ fontSize: 16 }}
              style={{ marginVertical: 0, width: "100%" }}
              contentContainerStyle={{ width: "100%" }}
            >
              <View style={{ gap: theme.spacing.sm, width: "100%" }}>
                <View style={{ borderRadius: theme.radius.lg, overflow: "hidden" }}>
                  {/* <DebitCardPaymentRow
                    title="Cash"
                    maskedDetail="Pay with cash at nearby stores"
                    onPress={() => setSelectedPaymentMode("cash")}
                  /> */}
                  {selectedPaymentMode === "cash" && (
                    <View
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 999,
                        backgroundColor: theme.colors.primary,
                      }}
                    >
                      <CustomText variant="caption" color={theme.colors.onPrimary}>
                        Selected
                      </CustomText>
                    </View>
                  )}
                </View>

                <View style={{ borderRadius: theme.radius.lg, overflow: "hidden" }}>
                  <DebitCardPaymentRow
                    title="Debit Card"
                    maskedDetail={paymentSubtitle}
                    onPress={() => {
                      Keyboard.dismiss();
                      setSelectedPaymentMode("debit");
                      setDebitInfoVisible(true);
                    }}
                  />
                  {selectedPaymentMode === "debit" && (
                    <View
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 999,
                        backgroundColor: theme.colors.primary,
                      }}
                    >
                      <CustomText variant="caption" color={theme.colors.onPrimary}>
                        Selected
                      </CustomText>
                    </View>
                  )}
                </View>
              </View>
            </DashboardSection>
            <View style={styles.bottomTradePayRow}>
              <PayButton
                disabled={
                  (selectedPaymentMode === "debit" && tradeExecute.isPending) ||
                  isSubmittingTransaction ||
                  !!limitError ||
                  !!balanceError
                }
                onPress={handlePayPress}
                label={selectedPaymentMode === "cash" ? "Find a Location" : "Proceed"}
              />
            </View>
          </View>
        </ScrollView>

        <PaymentMethodPickerModal
          visible={debitInfoVisible}
          onClose={() => setDebitInfoVisible(false)}
          title="Select Payment Method"
          flow="sell"
          selectedPaymentMethodId={selectedPaymentMethod?.payment_method_id ?? null}
          onConfirmSelection={(item) => {
            setSelectedPaymentMethod(item);
          }}
          onRequestAddCard={() => setAddCardVisible(true)}
          onPaymentMethodDeleted={(id) => {
            if (selectedPaymentMethod?.payment_method_id === id) {
              setSelectedPaymentMethod(null);
            }
          }}
        />
 
        <AddDebitCardModal
          visible={addCardVisible}
          onClose={() => setAddCardVisible(false)}
          onAdded={handleAddedCard}
        />

        <WithdrawConfirmationModal
          visible={showConfirmModal}
          usdAmount={amount}
          expectedFee={withdrawExpectedFee}
          expectedFeeLoading={withdrawQuoteEnabled && isWithdrawQuoteLoading}
          feeLabel="Expected Instant Withdrawal Fee"
          totalLabel="Total (Including Withdrawal fee)"
          isSubmitting={tradeExecute.isPending || isSubmittingTransaction}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={() => {
            setShowConfirmModal(false);
            // Wait for this modal's dismissal to finish before presenting the lock
            // screen's modal — dismiss-then-present in one tick leaves a stuck black
            // screen on iOS.
            afterModalTransition(() =>
              requestPaymentVerification(handleActionsAfterPinVerified),
            );
          }}
        />
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default CryptoWithdraw;

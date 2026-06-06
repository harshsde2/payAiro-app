import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TextInput as RNTextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
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
  useCoinmeTradeExecute,
  type CoinmeTradeExecutePayload,
} from "query/hooks";
import { queryClient } from "query/queryClient";
import { useEnterAmountState } from "@new-ui/screens/Send/EnterAmount/useEnterAmountState";
import AmountInput from "@new-ui/screens/Send/EnterAmount/AmountInput";
import PayButton from "@new-ui/screens/Send/EnterAmount/PayButton";
import RecipientHeader from "@new-ui/screens/Send/EnterAmount/RecipientHeader";
import type { FundingSource } from "@new-ui/screens/Send/EnterAmount/enterAmount.types";
import type { CryptoFundingItem } from "@new-ui/screens/Send/EnterAmount/cryptoFundingTypes";
import { showError } from "utils/toast";
import { useAppLock } from "hooks/useAppLock";
import { fetchWebSessionId } from "services/coinmeRiskLifecycle";
import { useCoinmeAccountId } from "hooks/useCoinmeAccountId";
import {
  DebitCardPaymentRow,
  AddNewCardPlaceholderModal,
  AddDebitCardModal,
} from "@new-ui/components/common-components/AddBalance";
import type { AddedCardResult } from "@new-ui/components/common-components/AddBalance/AddDebitCardModal";
import DashboardSection from "tsx-components/DashboardSection";
import {
  usePaymentMethodsList,
  type PaymentMethodItem,
} from "query/hooks/usePaymentMethods";

type WithdrawPaymentMode = "debit" | "cash";

const COINME_DEFAULTS = {
  paymentMethodId: "uhygtfr5e354rtyu76g6b7i8",
  sourceWalletAddress: ",mu9n7777777545e5vr",
};

const DEFAULT_SELL_ASSETS = new Set(["SOL", "SOLANA"]);

function isSolBalanceRow(item: CryptoFundingItem): boolean {
  const a = String(item?.asset ?? "").toUpperCase();
  return DEFAULT_SELL_ASSETS.has(a);
}

const CryptoWithdraw: React.FC = () => {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const { theme } = useTheme();
  const styles = enterAmountStyles(theme);

  const selectorData = useSelectorAction() as any;
  const { allCryptoBalances } = selectorData;
  const { data: fetchedCryptoBalances = [] } = useCryptoAssetsListData("USD");
  const { requestPaymentVerification } = useAppLock();
  const tradeExecute = useCoinmeTradeExecute();

  const coinmeAccountId = useCoinmeAccountId();

  const [debitInfoVisible, setDebitInfoVisible] = useState(false);
  const [addCardVisible, setAddCardVisible] = useState(false);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<WithdrawPaymentMode>("debit");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodItem | null>(null);
  const paymentMethodsQuery = usePaymentMethodsList(20);

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

  const solRow = useMemo(() => {
    return mergedCryptoBalances.find((item) => isSolBalanceRow(item)) ?? null;
  }, [mergedCryptoBalances]);

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
      chain: String((solRow as any)?.chain ?? "SOL").toUpperCase(),
      logo: solRow.logo,
      fiatCurrency: "USD" as const,
      currentPrice,
      sourceWalletAddress: (solRow as any)?.sourceWalletAddress,
    };
  }, [solRow]);

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

  const dynamicFontSize = useMemo(() => {
    const totalChars = (displayAmount || "0.00").length + 1;
    const availableWidth = width - 80;
    const charWidthRatio = 0.6;
    const ideal = availableWidth / (totalChars * charWidthRatio);
    const max = 40;
    const min = 24;
    return Math.min(max, Math.max(min, ideal));
  }, [displayAmount, width]);

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
      showError("Unable to complete withdrawal. Please try again.");
      return;
    }

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

      const isFiatEntry = inputMode === "fiat";
      const payloadAmountValue = isFiatEntry ? amount : assetAmount;
      const payloadAmountCurrency = isFiatEntry
        ? coinmeCryptoAsset.fiatCurrency || "USD"
        : coinmeCryptoAsset.asset;

      const payload: CoinmeTradeExecutePayload = {
        tradeType: "sell",
        chain: coinmeCryptoAsset.chain,
        cryptoCurrencyCode: coinmeCryptoAsset.asset,
        fiatCurrencyCode: coinmeCryptoAsset.fiatCurrency || "USD",
        amountValue: String(payloadAmountValue),
        amountCurrencyCode: payloadAmountCurrency,
        paymentMethodId:
          selectedPaymentMethod?.payment_method_id ?? COINME_DEFAULTS.paymentMethodId,
        sourceWalletAddress:
          coinmeCryptoAsset.sourceWalletAddress || COINME_DEFAULTS.sourceWalletAddress,
        webSessionId,
      };

      const res = await tradeExecute.mutateAsync(payload);
      const ok = res?.ok ?? res?.status ?? true;

      queryClient.invalidateQueries({ queryKey: cryptoKeys.allCryptoBalances() });
      queryClient.invalidateQueries({ queryKey: bankKeys.balance() });

      navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT as never, {
        isLoading: false,
        transactionData: res,
        isSuccess: !!ok,
        isError: !ok,
        customTitle: ok ? "Withdrawal completed" : "Withdrawal unsuccessful",
        customDescription: ok
          ? "Your funds will be sent to your selected debit card according to your bank's timing."
          : "Unable to complete withdrawal. Please try again.",
        hideCoinmeCurrencyDetails: true,
      } as never);

      if (!ok) {
        showError("Unable to complete withdrawal. Please try again.");
      }
    } catch {
      navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT as never, {
        isLoading: false,
        transactionData: null,
        isSuccess: false,
        isError: true,
        customTitle: "Withdrawal unsuccessful",
        customDescription: "Unable to complete withdrawal. Please try again.",
      } as never);
      showError("Unable to complete withdrawal. Please try again.");
    }
  }, [
    amount,
    assetAmount,
    coinmeCryptoAsset,
    coinmeAccountId,
    inputMode,
    navigation,
    selectedPaymentMethod?.payment_method_id,
    tradeExecute,
  ]);

  const handleActionsAfterPinVerified = useCallback(() => {
    handleTradeExecute();
  }, [handleTradeExecute]);

  const handlePayPress = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed || trimmed === "." || amount <= 0) {
      showError("Please enter an amount");
      return;
    }

    if (selectedPaymentMode === "cash") {
      if (!coinmeCryptoAsset) {
        showError("Unable to open cash locations. Please try again.");
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

    requestPaymentVerification(handleActionsAfterPinVerified);
  }, [
    amount,
    coinmeCryptoAsset,
    handleActionsAfterPinVerified,
    inputValue,
    navigation,
    requestPaymentVerification,
    selectedPaymentMode,
  ]);

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
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            <AppIcon.ArrowLeft width={25} height={25} onPress={() => navigation.goBack()} />
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
          />
        </View>

        <View style={styles.bottomAreaTrade}>
          <DashboardSection
            title="Payment Method"
            titleStyle={{ fontSize: 16 }}
            style={{ marginVertical: 0, width: "100%" }}
            contentContainerStyle={{ width: "100%" }}
          >
            <View style={{ gap: theme.spacing.sm, width: "100%" }}>
              <View style={{ borderRadius: theme.radius.lg, overflow: "hidden" }}>
                <DebitCardPaymentRow
                  title="Cash"
                  maskedDetail="Pay with cash at nearby stores"
                  onPress={() => setSelectedPaymentMode("cash")}
                />
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
                    <CustomText variant="caption" color={theme.colors.white}>
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
                    <CustomText variant="caption" color={theme.colors.white}>
                      Selected
                    </CustomText>
                  </View>
                )}
              </View>
            </View>
          </DashboardSection>
          <View style={styles.bottomTradePayRow}>
            <PayButton
              disabled={selectedPaymentMode === "debit" && tradeExecute.isPending}
              onPress={handlePayPress}
              label={selectedPaymentMode === "cash" ? "Find a Location" : "Proceed"}
            />
          </View>
        </View>

        <AddNewCardPlaceholderModal
          visible={debitInfoVisible}
          onClose={() => setDebitInfoVisible(false)}
          title="Select Payment Method"
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
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default CryptoWithdraw;

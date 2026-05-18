import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TextInput as RNTextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import ScreenWrapper from "@new-ui/components/common-components/ScreenWrapper";
import CustomText from "@new-ui/components/common-components/CustomText";
import { DebitCardPaymentRow } from "@new-ui/components/common-components/AddBalance";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { enterAmountStyles } from "@new-ui/styles/screens/send/enterAmountStyles";
import { AppIcon } from "@new-ui/assets/svgs";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { showError } from "utils/toast";
import RecipientHeader from "@new-ui/screens/Send/EnterAmount/RecipientHeader";
import AmountInput from "@new-ui/screens/Send/EnterAmount/AmountInput";
import PayButton from "@new-ui/screens/Send/EnterAmount/PayButton";
import { useEnterAmountState } from "@new-ui/screens/Send/EnterAmount/useEnterAmountState";
import type { FundingSource } from "@new-ui/screens/Send/EnterAmount/enterAmount.types";
import { buildAddressLine } from "../LocationFinder/locationFinder.utils";
import SellTransactionLimitModal from "./SellTransactionLimitModal";
import { SELL_CONTINUE, SELL_METHOD_VALUE } from "./sellFlowCopy";
import { checkDuplicateSellAmount } from "./sellLimitChecks";
import {
  buildSellSession,
  type SellCashRampEntryParams,
  type SellCashRampLocationSnapshot,
} from "./sellFlow.types";
import {
  clampSellAmountUsd,
  computeAvailableBalanceUsd,
  SELL_AMOUNT_STEP_USD,
  SELL_MAX_TRANSACTION_USD,
} from "./sellFlow.utils";

type RouteParams = SellCashRampEntryParams & {
  location: SellCashRampLocationSnapshot;
};

const SellEnterAmountScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = enterAmountStyles(theme);
  const inputRef = useRef<RNTextInput | null>(null);
  const { width } = useWindowDimensions();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();
  const params = route.params as RouteParams | undefined;

  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [checking, setChecking] = useState(false);

  const entry = useMemo<SellCashRampEntryParams | null>(() => {
    if (!params) return null;
    return {
      cryptoCurrencyCode: params.cryptoCurrencyCode,
      chain: params.chain,
      fiatCurrencyCode: params.fiatCurrencyCode,
      sourceWalletAddress: params.sourceWalletAddress,
      platformAvailableCrypto: params.platformAvailableCrypto,
      usdUnitPrice: params.usdUnitPrice,
      cryptoDisplayName: params.cryptoDisplayName,
      logo: params.logo,
    };
  }, [params]);

  const tradeAssetSymbol = String(entry?.cryptoCurrencyCode ?? "").toUpperCase();
  const tradePriceUSD = Number(entry?.usdUnitPrice ?? 0);

  const tradeFundingSource = useMemo<FundingSource | null>(() => {
    if (!entry || !tradeAssetSymbol) return null;
    const sellBalanceRaw = Number(entry.platformAvailableCrypto ?? 0);
    const sellBalance = Number.isFinite(sellBalanceRaw) ? Math.max(0, sellBalanceRaw) : 0;
    const safePrice = Number.isFinite(tradePriceUSD) ? tradePriceUSD : 0;
    return {
      id: `cash-sell-${tradeAssetSymbol}`,
      name: tradeAssetSymbol,
      balance: sellBalance,
      type: "crypto",
      cryptoMeta: {
        symbol: tradeAssetSymbol,
        network: String(entry.chain || "ETH").toUpperCase(),
        priceUSD: safePrice,
        logo: entry.logo ?? undefined,
      },
    };
  }, [entry, tradeAssetSymbol, tradePriceUSD]);

  const {
    amount,
    inputValue,
    displayAmount,
    displayFiatEquivalent,
    displayAssetEquivalent,
    inputMode,
    maxAsset,
    maxUsd,
    feePercent,
    assetAmount,
    fillMax,
    onChangeAmountText,
    toggleInputMode,
  } = useEnterAmountState({
    initialSelectedSource: tradeFundingSource,
    transactionFeePercent: 0,
    initialInputMode: "asset",
  });

  const sellMaxUsd = useMemo(() => {
    if (!entry) return 0;
    return Math.min(computeAvailableBalanceUsd(entry), SELL_MAX_TRANSACTION_USD);
  }, [entry]);

  const dynamicFontSize = useMemo(() => {
    const totalChars = (displayAmount || "0.00").length + 1;
    const availableWidth = width - 80;
    const charWidthRatio = 0.6;
    const ideal = availableWidth / (totalChars * charWidthRatio);
    const max = 40;
    const min = 24;
    return Math.min(max, Math.max(min, ideal));
  }, [displayAmount, width]);

  const assetSymbol = tradeAssetSymbol || "CRYPTO";
  const leftPrefix = inputMode === "asset" ? "" : "$";
  const rightSuffix = inputMode === "asset" ? assetSymbol : "";

  const pricePreviewText = useMemo(() => {
    if (!tradeAssetSymbol) return "";
    if (!Number.isFinite(tradePriceUSD) || tradePriceUSD <= 0) return "";
    return `1 ${tradeAssetSymbol} ≈ $${tradePriceUSD.toFixed(2)}`;
  }, [tradeAssetSymbol, tradePriceUSD]);

  const cashPickupSubtitle = useMemo(() => {
    if (!params?.location) return SELL_METHOD_VALUE;
    const store = String(params.location.description ?? "ATM").trim();
    const address = buildAddressLine({
      address: params.location.address,
      city: params.location.city,
      state: params.location.state,
      zipCode: params.location.zipCode,
    });
    if (!address) return store;
    const short =
      address.length > 48 ? `${address.slice(0, 45)}…` : address;
    return `${store} · ${short}`;
  }, [params?.location]);

  const handlePressAmountFocus = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const onContinue = useCallback(async () => {
    if (!entry || !params?.location) {
      showError("Missing sell details. Go back and try again.");
      return;
    }

    if (inputMode === "fiat" && amount <= 0) {
      showError("Please enter a valid amount");
      return;
    }
    if (inputMode === "asset" && assetAmount <= 0) {
      showError("Please enter a valid amount");
      return;
    }

    const usdAmount = amount;
    if (usdAmount > sellMaxUsd + 0.001) {
      showError(
        sellMaxUsd <= 0
          ? "Insufficient balance to sell"
          : `Maximum available to sell is $${sellMaxUsd.toFixed(2)}`
      );
      return;
    }

    if (usdAmount > SELL_MAX_TRANSACTION_USD + 0.001) {
      showError(`Maximum sale per transaction is $${SELL_MAX_TRANSACTION_USD.toFixed(2)}`);
      return;
    }

    const clamped = clampSellAmountUsd(usdAmount, sellMaxUsd);
    if (Math.abs(usdAmount - clamped) > 0.01) {
      showError(`Select an amount in increments of $${SELL_AMOUNT_STEP_USD}`);
      return;
    }

    setChecking(true);
    try {
      const duplicate = await checkDuplicateSellAmount(clamped);
      if (duplicate) {
        setLimitModalOpen(true);
        return;
      }
      const session = buildSellSession(entry, params.location, clamped);
      navigation.navigate(NAVIGATION_SCREENS.NEW_CASH_SELL_SUMMARY as never, { session } as never);
    } finally {
      setChecking(false);
    }
  }, [
    amount,
    assetAmount,
    entry,
    inputMode,
    navigation,
    params?.location,
    sellMaxUsd,
  ]);

  const canContinue =
    !checking &&
    ((inputMode === "fiat" && amount > 0) || (inputMode === "asset" && assetAmount > 0));

  if (!entry || !params?.location) {
    return (
      <ScreenWrapper safeArea backgroundColor={theme.colors.white} contentStyle={{ flex: 1 }}>
        <View style={[styles.container, { justifyContent: "center", padding: theme.spacing.lg }]}>
          <CustomText variant="body" color={theme.colors.text}>
            Missing sell details. Go back and try again.
          </CustomText>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={["bottom", "top"]}
      scrollable={false}
      contentStyle={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            <AppIcon.ArrowLeft
              width={25}
              height={25}
              onPress={() => navigation.goBack()}
              style={{ marginRight: 45 }}
            />
            <View style={styles.headerTitleContainer}>
              <CustomText variant="h1" fontWeight="bold" size={20}>
                Sell for Cash
              </CustomText>
            </View>
            <TouchableOpacity
              style={styles.cryptoToggleButton}
              activeOpacity={0.85}
              onPress={toggleInputMode}
            >
              <CustomText style={styles.cryptoToggleIcon} fontWeight="semiBold">
                ↻
              </CustomText>
              <CustomText style={styles.cryptoToggleText} fontWeight="semiBold">
                {inputMode === "asset" ? "USD" : assetSymbol}
              </CustomText>
            </TouchableOpacity>
          </View>

          <RecipientHeader
            recipient_identifier=""
            mode="trade"
            tradeMode="sell"
            assetSymbol={tradeAssetSymbol}
            pricePreview={pricePreviewText}
          />

          <AmountInput
            inputValue={inputValue}
            onChangeAmountText={onChangeAmountText}
            inputRef={inputRef}
            dynamicFontSize={dynamicFontSize}
            onPressFocus={handlePressAmountFocus}
            leftPrefix={leftPrefix}
            rightSuffix={rightSuffix}
          />

          <View style={styles.cryptoModeContainer}>
            <CustomText style={styles.cryptoFeeText} variant="caption">
              Fee: {feePercent}%
            </CustomText>
            <TouchableOpacity style={styles.cryptoMaxContainer} activeOpacity={0.9} onPress={fillMax}>
              <CustomText variant="caption" style={styles.cryptoMaxText}>
                Max: {maxAsset.toFixed(maxAsset >= 1 ? 4 : 8)} {assetSymbol} ~$
                {maxUsd.toFixed(2)}
              </CustomText>
            </TouchableOpacity>
            <CustomText variant="caption" style={styles.cryptoEquivalentText}>
              {inputMode === "asset"
                ? `~$${Number(displayFiatEquivalent || 0).toFixed(2)}`
                : `~${Number(displayAssetEquivalent || 0).toFixed(6)} ${assetSymbol}`}
            </CustomText>
          </View>
        </View>

        <View style={[styles.bottomArea, styles.bottomAreaTrade]}>
          <View style={{ width: "100%", gap: theme.spacing.md }}>
            <DebitCardPaymentRow
              title={SELL_METHOD_VALUE}
              maskedDetail={cashPickupSubtitle}
            />
            <PayButton
              disabled={!canContinue}
              onPress={() => {
                Keyboard.dismiss();
                void onContinue();
              }}
              label={checking ? "Please wait…" : SELL_CONTINUE}
            />
          </View>
        </View>
      </KeyboardAvoidingView>

      <SellTransactionLimitModal
        visible={limitModalOpen}
        onDismiss={() => setLimitModalOpen(false)}
      />
    </ScreenWrapper>
  );
};

export default SellEnterAmountScreen;

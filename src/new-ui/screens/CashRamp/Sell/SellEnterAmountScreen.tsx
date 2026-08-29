import React, { useCallback, useMemo, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, View } from "react-native";
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
import PayButton from "@new-ui/screens/Send/EnterAmount/PayButton";
import { buildAddressLine } from "../LocationFinder/locationFinder.utils";
import SellTransactionLimitModal from "./SellTransactionLimitModal";
import { SellAmountSlider } from "./SellAmountRulerDial";
import {
  SELL_AVAILABLE_BALANCE_PREFIX,
  SELL_CONTINUE,
  SELL_METHOD_VALUE,
  SELL_MIN_AMOUNT_ERROR,
} from "./sellFlowCopy";
import { checkDuplicateSellAmount } from "./sellLimitChecks";
import {
  buildSellSession,
  type SellCashRampEntryParams,
  type SellCashRampLocationSnapshot,
} from "./sellFlow.types";
import {
  clampSellAmountUsd,
  computeAvailableBalanceUsd,
  cryptoAmountFromUsd,
  formatUsd,
  SELL_AMOUNT_STEP_USD,
  SELL_MAX_TRANSACTION_USD,
  SELL_MIN_AMOUNT_USD,
} from "./sellFlow.utils";

type RouteParams = SellCashRampEntryParams & {
  location: SellCashRampLocationSnapshot;
};

const SellEnterAmountScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = enterAmountStyles(theme);
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

  const sellMaxUsd = useMemo(() => {
    if (!entry) return 0;
    return Math.min(computeAvailableBalanceUsd(entry), SELL_MAX_TRANSACTION_USD);
  }, [entry]);

  const sliderDisabled = sellMaxUsd < SELL_MIN_AMOUNT_USD;

  const [selectedUsd, setSelectedUsd] = useState(() =>
    sellMaxUsd >= SELL_MIN_AMOUNT_USD ? SELL_MIN_AMOUNT_USD : 0
  );

  React.useEffect(() => {
    if (sellMaxUsd >= SELL_MIN_AMOUNT_USD) {
      setSelectedUsd((prev) => {
        const clamped = clampSellAmountUsd(prev, sellMaxUsd);
        return clamped > 0 ? clamped : SELL_MIN_AMOUNT_USD;
      });
    } else {
      setSelectedUsd(0);
    }
  }, [sellMaxUsd]);

  const pricePreviewText = useMemo(() => {
    if (!tradeAssetSymbol) return "";
    if (!Number.isFinite(tradePriceUSD) || tradePriceUSD <= 0) return "";
    return `1 ${tradeAssetSymbol} ≈ $${tradePriceUSD.toFixed(2)}`;
  }, [tradeAssetSymbol, tradePriceUSD]);

  const cryptoEquivalentText = useMemo(() => {
    if (!tradeAssetSymbol || selectedUsd <= 0) return "";
    const cryptoAmt = cryptoAmountFromUsd(selectedUsd, tradePriceUSD);
    const decimals = cryptoAmt >= 1 ? 4 : 8;
    return `~${cryptoAmt.toFixed(decimals)} ${tradeAssetSymbol}`;
  }, [selectedUsd, tradeAssetSymbol, tradePriceUSD]);

  const cashPickupSubtitle = useMemo(() => {
    if (!params?.location) return SELL_METHOD_VALUE;
    const store = String(params.location.description ?? "ATM").trim();
    const address = buildAddressLine({
      address: String(params.location.address ?? ""),
      city: String(params.location.city ?? ""),
      state: String(params.location.state ?? ""),
      zipCode: String(params.location.zipCode ?? ""),
    });
    if (!address) return store;
    const short =
      address.length > 48 ? `${address.slice(0, 45)}…` : address;
    return `${store} · ${short}`;
  }, [params?.location]);

  const onContinue = useCallback(async () => {
    if (!entry || !params?.location) {
      showError("Missing details", "Sell details are missing. Go back and try again.");
      return;
    }

    if (sellMaxUsd < SELL_MIN_AMOUNT_USD) {
      showError("Insufficient balance", "You don't have enough balance to sell.");
      return;
    }

    if (selectedUsd < SELL_MIN_AMOUNT_USD) {
      showError("Amount too low", SELL_MIN_AMOUNT_ERROR);
      return;
    }

    if (selectedUsd > sellMaxUsd + 0.001) {
      showError(
        "Amount too high",
        `Maximum available to sell is $${sellMaxUsd.toFixed(2)}.`
      );
      return;
    }

    if (selectedUsd > SELL_MAX_TRANSACTION_USD + 0.001) {
      showError("Amount too high", `Maximum sale per transaction is $${SELL_MAX_TRANSACTION_USD.toFixed(2)}.`);
      return;
    }

    const clamped = clampSellAmountUsd(selectedUsd, sellMaxUsd);
    if (clamped < SELL_MIN_AMOUNT_USD) {
      showError("Amount too low", SELL_MIN_AMOUNT_ERROR);
      return;
    }

    if (Math.abs(selectedUsd - clamped) > 0.01) {
      showError("Invalid amount", `Select an amount in increments of $${SELL_AMOUNT_STEP_USD}.`);
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
  }, [entry, navigation, params?.location, selectedUsd, sellMaxUsd]);

  const canContinue =
    !checking &&
    !sliderDisabled &&
    selectedUsd >= SELL_MIN_AMOUNT_USD &&
    selectedUsd <= sellMaxUsd + 0.001;

  if (!entry || !params?.location) {
    return (
      <ScreenWrapper safeArea backgroundColor={theme.colors.background} contentStyle={{ flex: 1 }}>
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
            color={theme.colors.text}
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
            <View style={{ width: 72 }} />
          </View>

          <RecipientHeader
            recipient_identifier=""
            mode="trade"
            tradeMode="sell"
            assetSymbol={tradeAssetSymbol}
            pricePreview={pricePreviewText}
          />

          <CustomText variant="body" style={{ textAlign: "center", marginTop: theme.spacing.md }}>
            {SELL_AVAILABLE_BALANCE_PREFIX}{" "}
            <CustomText variant="body" fontWeight="semiBold">
              {formatUsd(sellMaxUsd)}
            </CustomText>
          </CustomText>

          <SellAmountSlider
            maxUsd={sellMaxUsd}
            valueUsd={selectedUsd}
            onChange={setSelectedUsd}
            disabled={sliderDisabled}
          />

          {cryptoEquivalentText ? (
            <CustomText
              variant="caption"
              style={[styles.cryptoEquivalentText, { textAlign: "center" }]}
            >
              {cryptoEquivalentText}
            </CustomText>
          ) : null}

          {sliderDisabled ? (
            <CustomText
              variant="caption"
              color={theme.colors.error}
              style={{ textAlign: "center", marginTop: theme.spacing.sm }}
            >
              {SELL_MIN_AMOUNT_ERROR}
            </CustomText>
          ) : null}
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

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import ScreenWrapper from "@new-ui/components/common-components/ScreenWrapper";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { cryptoWithdrawStyles } from "@new-ui/styles/screens/withdrawCrypto/cryptoWithdrawStyles";
import { enterAmountStyles } from "@new-ui/styles/screens/send/enterAmountStyles";
import CustomText from "@new-ui/components/common-components/CustomText";
import TextInput from "@new-ui/components/common-components/layout/TextInput";
import { AppIcon } from "@new-ui/assets/svgs";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import useSelectorAction from "hooks/useSelectorAction";
import { useCryptoAssetsListData } from "query/hooks/useCrypto";
import { bankKeys } from "query/hooks/useBank";
import { queryClient } from "query/queryClient";
import { useEnterAmountState } from "@new-ui/screens/Send/EnterAmount/useEnterAmountState";
import AmountInput from "@new-ui/screens/Send/EnterAmount/AmountInput";
import FundingSourceCard from "@new-ui/screens/Send/EnterAmount/FundingSourceCard";
import PayButton from "@new-ui/screens/Send/EnterAmount/PayButton";
import FundingSourceSelectorModal from "@new-ui/screens/Send/EnterAmount/FundingSourceSelectorModal";
import type { FundingSource } from "@new-ui/screens/Send/EnterAmount/enterAmount.types";
import type { CryptoFundingItem } from "@new-ui/screens/Send/EnterAmount/cryptoFundingTypes";
import { cryptoKeys, usePaymentTransactionSend } from "query/hooks";
import { showError } from "utils/toast";
import WithdrawConfirmationModal from "./WithdrawConfirmationModal";

type WithdrawDraft = {
  type: "external";
  amount: string;
  currency: string;
  chain: string;
  destinationWalletAddress: string;
};

const CryptoWithdraw: React.FC = () => {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const { theme } = useTheme();
  const styles = cryptoWithdrawStyles(theme);
  const amountStyles = enterAmountStyles(theme);

  const selectorData = useSelectorAction() as any;
  const { allCryptoBalances, walletData } = selectorData;
  const { data: fetchedCryptoBalances = [] } = useCryptoAssetsListData("USD");
  const { mutate: sendPaymentTransaction } = usePaymentTransactionSend();

  const [walletAddress, setWalletAddress] = useState("");
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const withdrawDraftRef = useRef<WithdrawDraft | null>(null);
  useEffect(
    () => () => {
      withdrawDraftRef.current = null;
    },
    []
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

  const cryptoSources = useMemo<CryptoFundingItem[]>(() => {
    return mergedCryptoBalances.filter(
      (item: CryptoFundingItem) => item?.asset && item?.asset !== "Bank Balance"
    );
  }, [mergedCryptoBalances]);

  const convertToFundingSource = useCallback((item: CryptoFundingItem): FundingSource | null => {
    const assetSymbol = item?.asset;
    if (!assetSymbol) return null;

    const rawPrice = Number(
      item.usd_price ??
        (item as any).price ??
        0
    );
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
        network: assetSymbol,
        priceUSD,
        maxAssetBalance: Number.isFinite(maxAssetBalance) ? maxAssetBalance : 0,
        maxUsdBalance: Number.isFinite(maxUsdBalance) ? maxUsdBalance : 0,
        logo: item.logo,
      },
    };
  }, []);

  const defaultSelectedSource = useMemo<FundingSource | null>(() => {
    if (!cryptoSources.length) return null;
    for (const source of cryptoSources) {
      const converted = convertToFundingSource(source);
      if (converted) return converted;
    }
    return null;
  }, [convertToFundingSource, cryptoSources]);

  const transactionFeePercent = useMemo(() => {
    const raw = walletData?.TransactionFees_persentage;
    const n = typeof raw === "string" ? parseFloat(raw) : Number(raw);
    return Number.isFinite(n) ? n : 0;
  }, [walletData?.TransactionFees_persentage]);

  const {
    amount,
    inputValue,
    displayAmount,
    displayFiatEquivalent,
    displayAssetEquivalent,
    selectedSource,
    inputMode,
    maxAsset,
    maxUsd,
    feePercent,
    fillMax,
    assetAmount,
    validateCrypto,
    onChangeAmountText,
    setSelectedSource,
    toggleInputMode,
  } = useEnterAmountState({
    initialSelectedSource: defaultSelectedSource,
    transactionFeePercent,
  });

  useEffect(() => {
    if (!selectedSource && defaultSelectedSource) {
      setSelectedSource(defaultSelectedSource);
    }
  }, [defaultSelectedSource, selectedSource, setSelectedSource]);

  const dynamicFontSize = useMemo(() => {
    const totalChars = (displayAmount || "0.00").length + 1;
    const availableWidth = width - 80;
    const charWidthRatio = 0.6;
    const ideal = availableWidth / (totalChars * charWidthRatio);
    const max = 40;
    const min = 24;
    return Math.min(max, Math.max(min, ideal));
  }, [displayAmount, width]);

  const assetSymbol = useMemo(
    () => selectedSource?.cryptoMeta?.symbol || selectedSource?.name || "CRYPTO",
    [selectedSource?.cryptoMeta?.symbol, selectedSource?.name]
  );

  const leftPrefix = inputMode === "asset" ? "" : "$";
  const rightSuffix = inputMode === "asset" ? assetSymbol : "";

  const inputRef = useRef<any>(null);
  const handlePressAmountFocus = useCallback(() => inputRef.current?.focus(), []);

  const handlePressFundingSource = useCallback(() => {
    Keyboard.dismiss();
    setIsSelectorOpen(true);
  }, []);

  const handleWithdrawPayment = useCallback(() => {
    const draft = withdrawDraftRef.current;
    if (!draft) {
      showError("Session expired. Please try again.");
      return;
    }

    setIsPaying(true);
    setIsConfirmModalVisible(false);
    navigation.navigate(NAVIGATION_SCREENS.TRANSACTION_RESULT as never, {
      isLoading: true,
      transactionData: null,
      isSuccess: false,
      isError: false,
    } as never);

    sendPaymentTransaction(draft, {
      onSuccess: (data: any) => {
        const isSuccess = !data?.errorResponse && !!data?.data?.paymentTransaction;

        queryClient.invalidateQueries({ queryKey: cryptoKeys.allCryptoBalances() });
        queryClient.invalidateQueries({ queryKey: bankKeys.balance() });

        navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT as never, {
          isLoading: false,
          transactionData: {
            status: isSuccess,
            message: data?.message,
            data: data?.data?.paymentTransaction ?? data?.data ?? null,
          },
          isSuccess,
          isError: !isSuccess,
        } as never);

        if (!isSuccess) {
          const errorMessage =
            data?.errorResponse?.message ||
            data?.message ||
            "Unable to process withdraw request.";
          showError(errorMessage);
        }
        withdrawDraftRef.current = null;
      },
      onError: (error: any) => {
        navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT as never, {
          isLoading: false,
          transactionData: null,
          isSuccess: false,
          isError: true,
        } as never);
        const message =
          error?.response?.data?.errorResponse?.message ||
          error?.response?.data?.message ||
          "Something went wrong while withdrawing crypto";
        showError(message);
        withdrawDraftRef.current = null;
      },
      onSettled: () => {
        setIsPaying(false);
      },
    });
  }, [bankKeys, cryptoKeys, navigation, sendPaymentTransaction]);

  const handleProceed = useCallback(() => {
    if (isPaying) return;
    const trimmedAddress = walletAddress.trim();
    if (!trimmedAddress) {
      showError("Wallet address is required");
      return;
    }

    const errors = validateCrypto();
    if (errors.length > 0) {
      showError(errors[0]);
      return;
    }

    if (!selectedSource?.cryptoMeta) {
      showError("Please select a crypto asset");
      return;
    }

    if (amount <= 0 || assetAmount <= 0) {
      showError("Please enter a valid amount");
      return;
    }

    const symbol = selectedSource.cryptoMeta.symbol || selectedSource.name || "CRYPTO";
    withdrawDraftRef.current = {
      type: "external",
      amount: String(assetAmount),
      currency: symbol,
      chain: symbol,
      destinationWalletAddress: trimmedAddress,
    };

    setIsConfirmModalVisible(true);
  }, [
    amount,
    assetAmount,
    isPaying,
    selectedSource,
    validateCrypto,
    walletAddress,
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
        <View style={styles.header}>
          <AppIcon.ArrowLeft width={25} height={25} onPress={() => navigation.goBack()} />
          <View style={styles.headerTitleContainer}>
            <CustomText variant="h1" fontWeight="bold" size={20}>
              Withdraw
            </CustomText>
          </View>
          <TouchableOpacity
            style={amountStyles.cryptoToggleButton}
            activeOpacity={0.85}
            onPress={toggleInputMode}
          >
            <CustomText style={amountStyles.cryptoToggleIcon} fontWeight="semiBold">
              ↻
            </CustomText>
            <CustomText style={amountStyles.cryptoToggleText} fontWeight="semiBold">
              {inputMode === "asset" ? "USD" : assetSymbol}
            </CustomText>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <CustomText variant="caption" style={styles.selectedCryptoTitle}>
            Selected Crypto: {assetSymbol}
          </CustomText>

          <AmountInput
            inputValue={inputValue}
            onChangeAmountText={onChangeAmountText}
            inputRef={inputRef}
            dynamicFontSize={dynamicFontSize}
            onPressFocus={handlePressAmountFocus}
            leftPrefix={leftPrefix}
            rightSuffix={rightSuffix}
          />

          <View style={amountStyles.cryptoModeContainer}>
            <CustomText style={amountStyles.cryptoFeeText} variant="caption">
              Fee: {feePercent}%
            </CustomText>

            <TouchableOpacity style={amountStyles.cryptoMaxContainer} activeOpacity={0.9} onPress={fillMax}>
              <CustomText variant="caption" style={amountStyles.cryptoMaxText}>
                Max: {maxAsset.toFixed(maxAsset >= 1 ? 4 : 8)} {assetSymbol} ~$
                {maxUsd.toFixed(2)}
              </CustomText>
            </TouchableOpacity>

            <CustomText variant="caption" style={amountStyles.cryptoEquivalentText}>
              {inputMode === "asset"
                ? `~$${Number(displayFiatEquivalent || 0).toFixed(2)}`
                : `~${Number(displayAssetEquivalent || 0).toFixed(6)} ${assetSymbol}`}
            </CustomText>
          </View>

          <View style={styles.walletInputContainer}>
            <TextInput
              label="Wallet Address"
              placeholder="Enter wallet address"
              value={walletAddress}
              onChangeText={setWalletAddress}
              autoCapitalize="none"
              autoCorrect={false}
              borderColor={theme.colors.border}
              rightIcon={<AppIcon.QrCode width={20} height={20} color={theme.colors.primary} />}
              showRightSeparator={false}
            />
          </View>
        </View>

        <View style={styles.bottomArea}>
          <View style={styles.fundingSourceContainer}>
            <FundingSourceCard source={selectedSource} onPress={handlePressFundingSource} />
          </View>
          <PayButton disabled={isPaying} onPress={handleProceed} />
        </View>

        {isSelectorOpen ? (
          <FundingSourceSelectorModal
            sources={[]}
            cryptoSources={cryptoSources}
            selectedSource={selectedSource}
            onSelect={(source) => setSelectedSource(source)}
            onClose={() => setIsSelectorOpen(false)}
          />
        ) : null}

        <WithdrawConfirmationModal
          visible={isConfirmModalVisible}
          assetSymbol={assetSymbol}
          assetAmount={assetAmount}
          usdAmount={amount}
          walletAddress={walletAddress.trim()}
          isSubmitting={isPaying}
          onClose={() => setIsConfirmModalVisible(false)}
          onConfirm={handleWithdrawPayment}
        />
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default CryptoWithdraw;

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useEmailVerificationGuard } from 'hooks/useEmailVerificationGuard';
import ScreenWrapper from '@new-ui/components/common-components/ScreenWrapper';
import Button from '@new-ui/components/common-components/layout/Button';
import {
  AvailableBalanceBlock,
  AddBalanceAmountField,
  AmountQuickSelectChips,
  DebitCardPaymentRow,
  PaymentMethodPickerModal,
  AddDebitCardModal,
  getCardEligibility,
  useApplyDefaultPaymentMethod,
} from '@new-ui/components/common-components/AddBalance';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { addBalanceStyles } from '@new-ui/styles/screens/addBalance/addBalanceStyles';
import {
  sanitizeMoneyInput,
  parseMoneyAmount,
  selectedChipIndexForAmount,
} from './moneyInput';
import DashboardSection from 'tsx-components/DashboardSection';
import type { AddedCardResult } from '@new-ui/components/common-components/AddBalance/AddDebitCardModal';
import { usePaymentMethodsList, type PaymentMethodItem } from 'query/hooks/usePaymentMethods';
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants';
import { useAppLock } from 'hooks/useAppLock';
import {
  useCoinmeTradeExecute,
  type CoinmeTradeExecutePayload,
  useCryptoMarketForCurrency,
  useUserCryptoBalanceFastApi,
  useWalletAddresses,
  useCoinmeTradeQuote,
  getExpectedFeeUsd,
  getCoinmeTradeQuoteErrorMessage,
} from 'query/hooks/useCrypto';
import { fetchWebSessionId } from 'services/coinmeRiskLifecycle';
import { useCoinmeAccountId } from 'hooks/useCoinmeAccountId';
import { showError, showInfo } from 'utils/toast';
import { formatSpendableBalance } from 'utils/formatMoney';
import CryptoReceiptModal from '@new-ui/screens/Send/EnterAmount/CryptoReceiptModal';
import CustomText from '@new-ui/components/common-components/CustomText';
import TransactionLimitMeter from '@new-ui/components/common-components/TransactionLimitMeter';
import { useStateStablecoin } from 'hooks/useStateStablecoin';
import { useTransactionLimit } from 'hooks/useTransactionLimit';
import { coinmeTransactionLimitsKeys } from 'query/hooks/useCoinmeTransactionLimits';
import { queryClient } from 'query/queryClient';

const QUICK_AMOUNTS = [20, 50, 100, 200, 500];

const COINME_DEFAULTS = {
  paymentMethodId: 'uhygtfr5e354rtyu76g6b7i8',
  sourceWalletAddress: ',mu9n7777777545e5vr',
};

type HiddenTradeCryptoAsset = {
  asset: string;
  chain: string;
  logo?: string;
  fiatCurrency: string;
  currentPrice: number;
  sourceWalletAddress?: string;
};

type AddBalancePaymentMode = 'debit' | 'cash';

const NewAddBalanceScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = addBalanceStyles(theme);
  const navigation = useNavigation<any>();
  const { requestPaymentVerification } = useAppLock();
  const { requireEmailVerified } = useEmailVerificationGuard();
  const tradeExecute = useCoinmeTradeExecute();

  const coinmeAccountId = useCoinmeAccountId();

  // Registered-state stablecoin (TX → DAI, others → USDC). Backend derives the chain
  // from this asset symbol and ignores whatever chain we send.
  const stateStablecoin = useStateStablecoin();

  // The general market list is state-filtered per user by the backend and can HIDE
  // the state stablecoin (that's what disabled Proceed for real users) — fetch the
  // coin explicitly via `?currencies=`, which bypasses the filter.
  const { data: stablecoinMarketRows = [], isPending: isMarketPending } =
    useCryptoMarketForCurrency(stateStablecoin, 'USD');
  // Balance straight from the balance API — the merged market+balance list is keyed
  // off the filtered market list, which showed $0.00 when the coin was hidden.
  const { data: balanceRows = [] } = useUserCryptoBalanceFastApi();
  const { data: walletResponse, isPending: isWalletPending } = useWalletAddresses();
  const walletRows = walletResponse?.walletAddresses ?? [];

  const cryptoAsset = useMemo((): HiddenTradeCryptoAsset | null => {
    const sym = stateStablecoin;
    const marketItem = stablecoinMarketRows.find(
      (i) => String(i.asset ?? '').toUpperCase() === sym
    );
    if (!marketItem) return null;
    const price = Number(marketItem.usd_price ?? 0);
    const solRow = walletRows.find(
      (r) =>
        String(r.currencySymbol ?? '').toUpperCase() === sym ||
        String(r.assetId ?? '').toUpperCase() === sym
    );
    const chain = String(solRow?.chain ?? sym).toUpperCase();
    return {
      asset: sym,
      chain,
      logo: typeof marketItem.logo === 'string' ? marketItem.logo : undefined,
      fiatCurrency: 'USD',
      currentPrice: Number.isFinite(price) ? price : 0,
      sourceWalletAddress: solRow?.walletAddress,
    };
  }, [stablecoinMarketRows, walletRows, stateStablecoin]);

  const tradePriceUSD = cryptoAsset?.currentPrice ?? 0;

  // console.log("row ->",balanceRows)

  const stablecoinBalance = useMemo(() => {
    const row = balanceRows.find(
      (b) => String(b.currencySymbol ?? '').toUpperCase() === stateStablecoin
    );
    const usd = Number(row?.estimatedBalanceValue ?? 0);
    return Number.isFinite(usd) ? usd : 0;
  }, [balanceRows, stateStablecoin]);

  const formattedAvailable = useMemo(
    () => `$${formatSpendableBalance(stablecoinBalance)}`,
    [stablecoinBalance]
  );

  const [amountText, setAmountText] = useState('');
  const [selectedChipIndex, setSelectedChipIndex] = useState<number | null>(null);
  const [debitInfoVisible, setDebitInfoVisible] = useState(false);
  const [addCardVisible, setAddCardVisible] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodItem | null>(
    null
  );
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<AddBalancePaymentMode>('debit');

  const paymentMethodsQuery = usePaymentMethodsList(20);

  // Pre-select the user's default card (frontend-only) once the list loads.
  useApplyDefaultPaymentMethod({
    items: paymentMethodsQuery.data?.data?.items ?? [],
    flow: 'buy',
    selected: selectedPaymentMethod,
    onSelect: setSelectedPaymentMethod,
  });

  const handleAmountChange = useCallback((text: string) => {
    const next = sanitizeMoneyInput(text);
    setAmountText(next);
    setSelectedChipIndex(selectedChipIndexForAmount(next, QUICK_AMOUNTS));
  }, []);

  const handleChipSelect = useCallback((value: number, index: number) => {
    setAmountText(String(value));
    setSelectedChipIndex(index);
  }, []);

  const parsedAmount = parseMoneyAmount(amountText);

  // Limits follow the rail the user is actually paying with: debit → debit_buy,
  // cash → green_dot_buy (whose caps are far lower, $500/txn vs $20,000).
  const buyLimit = useTransactionLimit('buy', selectedPaymentMode);
  const limitError = buyLimit.validate(parsedAmount);
  const handleUseMaxLimit = useCallback(() => {
    setAmountText(String(buyLimit.effectiveMaxUsd));
    setSelectedChipIndex(null);
  }, [buyLimit.effectiveMaxUsd]);

  const isTradeContextLoading = isMarketPending || isWalletPending;
  // The market list has no row for the user's state stablecoin, or no usable price
  // (e.g. DAI absent from the production market response for a TX-registered user).
  // Surfaced as an inline message — otherwise the user just stares at a Proceed
  // button that can never enable.
  const topUpUnavailable =
    !isTradeContextLoading && (cryptoAsset === null || tradePriceUSD <= 0);
  const canProceedDebit =
    amountText.length > 0 &&
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0 &&
    selectedPaymentMethod !== null &&
    tradePriceUSD > 0 &&
    cryptoAsset !== null &&
    !isTradeContextLoading;

  const canProceedCash =
    amountText.length > 0 &&
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0 &&
    !isTradeContextLoading;
  const canProceed =
    (selectedPaymentMode === 'debit' ? canProceedDebit : canProceedCash) &&
    !limitError &&
    // Cash also needs the stablecoin market row (proceedAddBalance builds the
    // location-finder params from it) — keep both rails disabled when unavailable.
    !topUpUnavailable;

  const handleTradeExecute = useCallback(async () => {
    if (!cryptoAsset) return;

    navigation.navigate(NAVIGATION_SCREENS.TRANSACTION_RESULT as never, {
      isLoading: true,
      transactionData: null,
      isSuccess: false,
      isError: false,
      customTitle: 'Processing',
      customDescription: 'Submitting your payment…',
    } as never);

    try {
      if (!coinmeAccountId) {
        throw new Error(
          'Your Coinme account is not ready yet. Please complete onboarding and try again.'
        );
      }

      const webSessionId = await fetchWebSessionId({
        accountId: coinmeAccountId,
        riskFlow: 'cardtransaction',
      });

      const payload: CoinmeTradeExecutePayload = {
        tradeType: 'buy',
        chain: cryptoAsset.chain,
        cryptoCurrencyCode: cryptoAsset.asset,
        fiatCurrencyCode: cryptoAsset.fiatCurrency || 'USD',
        amountValue: String(parsedAmount),
        amountCurrencyCode: cryptoAsset.fiatCurrency || 'USD',
        paymentMethodId:
          selectedPaymentMethod?.payment_method_id ?? COINME_DEFAULTS.paymentMethodId,
        sourceWalletAddress:
          cryptoAsset.sourceWalletAddress || COINME_DEFAULTS.sourceWalletAddress,
        webSessionId,
      };

      const res = await tradeExecute.mutateAsync(payload);
      const ok = res?.ok ?? res?.status ?? true;

      // This buy consumed part of the daily/monthly allowance — without this the
      // meter would keep showing the pre-purchase "remaining" for up to staleTime.
      queryClient.invalidateQueries({ queryKey: coinmeTransactionLimitsKeys.all });

      navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT as never, {
        isLoading: false,
        transactionData: res,
        isSuccess: !!ok,
        isError: !ok,
        customTitle: 'Payment submitted',
      } as never);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      console.log('coinme trade error =>', e?.message || err);
      const errorMessage =
        e?.response?.data?.message ||
        e?.message ||
        'Something went wrong while executing the trade';
      navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT as never, {
        isLoading: false,
        transactionData: null,
        isSuccess: false,
        isError: true,
        errorMessage,
      } as never);
      showError('Purchase failed', errorMessage);
    }
  }, [
    cryptoAsset,
    coinmeAccountId,
    navigation,
    parsedAmount,
    selectedPaymentMethod?.payment_method_id,
    tradeExecute,
  ]);

  const handleAfterPinVerified = useCallback(() => {
    handleTradeExecute();
  }, [handleTradeExecute]);

  const proceedAddBalance = useCallback(() => {
    if (selectedPaymentMode === 'cash') {
      if (!(amountText.length > 0 && Number.isFinite(parsedAmount) && parsedAmount > 0)) {
        return;
      }
      if (!cryptoAsset) {
        showError('Missing details', 'Crypto details are missing. Please try again.');
        return;
      }
      navigation.navigate(NAVIGATION_SCREENS.NEW_CASH_RAMP_LOCATION_FINDER as never, {
        amount: parsedAmount,
        fiatCurrencyCode: cryptoAsset.fiatCurrency || 'USD',
        cryptoCurrencyCode: cryptoAsset.asset,
        chain: cryptoAsset.chain,
      } as never);
      return;
    }

    if (!selectedPaymentMethod) {
      showError('Select a payment method', 'Please choose how you want to pay.');
      return;
    }
    if (!cryptoAsset || tradePriceUSD <= 0) {
      showError('Price unavailable', 'Please try again in a moment.');
      return;
    }
    if (!(amountText.length > 0 && Number.isFinite(parsedAmount) && parsedAmount > 0)) {
      return;
    }
    setShowReceiptModal(true);
  }, [
    amountText.length,
    cryptoAsset,
    navigation,
    parsedAmount,
    selectedPaymentMethod,
    selectedPaymentMode,
    tradePriceUSD,
  ]);

  // Gate buy (debit + cash) behind email verification; resumes automatically once verified.
  const handleProceed = useCallback(() => {
    requireEmailVerified(proceedAddBalance);
  }, [requireEmailVerified, proceedAddBalance]);

  // Expected fee shown in the summary modal — fetched only while it's open (debit buy).
  const quoteEnabled =
    showReceiptModal && selectedPaymentMode === 'debit' && parsedAmount > 0 && !!cryptoAsset;
  const {
    data: quoteData,
    isLoading: isQuoteLoading,
    isError: isQuoteError,
    error: quoteError,
  } = useCoinmeTradeQuote(
    {
      tradeType: 'buy',
      chain: cryptoAsset?.chain ?? '',
      cryptoCurrencyCode: cryptoAsset?.asset ?? '',
      fiatCurrencyCode: 'USD',
      amountValue: String(parsedAmount),
      amountCurrencyCode: 'USD',
    },
    quoteEnabled
  );
  const expectedFee = getExpectedFeeUsd(quoteData?.feeBreakdown);

  // Surface the quote's own failure (e.g. insufficient balance) instead of a silent
  // no-op. Deduped by message so it toasts once per distinct error.
  const lastQuoteErrorToast = useRef<string | null>(null);
  useEffect(() => {
    if (!isQuoteError || !quoteError) {
      lastQuoteErrorToast.current = null;
      return;
    }
    const msg = getCoinmeTradeQuoteErrorMessage(quoteError);
    if (lastQuoteErrorToast.current === msg) return;
    lastQuoteErrorToast.current = msg;
    showError('Something went wrong', msg);
  }, [isQuoteError, quoteError]);

  const paymentSubtitle = useMemo(() => {
    if (!selectedPaymentMethod) return 'Select a card';
    const provider = (selectedPaymentMethod.card_provider || 'Card').toUpperCase();
    const last4 = selectedPaymentMethod.card_last4 || '••••';
    return `${provider}  •••• ${last4}`;
  }, [selectedPaymentMethod]);

  const handleAddedCard = useCallback(
    async (result: AddedCardResult) => {
      setAddCardVisible(false);

      const wanted = result.payment_method_id;
      const findCard = (items: PaymentMethodItem[]): PaymentMethodItem | null => {
        if (!wanted) return null;
        if (wanted.startsWith('last4:')) {
          const last4 = wanted.replace('last4:', '');
          return items.find((i) => String(i.card_last4 ?? '') === String(last4)) ?? null;
        }
        return items.find((i) => i.payment_method_id === wanted) ?? null;
      };

      // Always fetch the latest data before trusting the card. A freshly added card is often
      // still being verified by the issuer, so poll a few times to give a quick verification a
      // chance to land before deciding whether to auto-select it.
      let found: PaymentMethodItem | null = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        const res = await paymentMethodsQuery.refetch();
        found = findCard(res.data?.data?.items ?? []);
        if (found && getCardEligibility(found, 'buy').ok) break;
        if (attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 1200));
        }
      }

      if (found && getCardEligibility(found, 'buy').ok) {
        // Verified and usable — select it so the user can pay right away.
        setSelectedPaymentMethod(found);
      } else {
        // Card was added but isn't verified yet: never present it as a ready-to-use selection.
        // Leaving it unselected also keeps the Proceed button disabled until it's approved.
        setSelectedPaymentMethod(null);
        showInfo(
          'Card added — verifying',
          "We're verifying your card with the issuer. This usually takes a moment — you'll be able to select it once it's approved."
        );
      }

      setTimeout(() => setDebitInfoVisible(true), 350);
    },
    [paymentMethodsQuery]
  );

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={['bottom', 'left', 'right']}
      scrollable
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View style={styles.screenContent}>
        <AvailableBalanceBlock label="Available Balance" formattedAmount={formattedAvailable} />

        <View style={styles.sectionSpacer}>
          <AddBalanceAmountField label="Amount" value={amountText} onChangeText={handleAmountChange} />
          <AmountQuickSelectChips
            values={QUICK_AMOUNTS}
            selectedIndex={selectedChipIndex}
            onSelect={handleChipSelect}
          />
          <TransactionLimitMeter
            style={styles.limitMeterSpacer}
            limit={buyLimit}
            amountUsd={parsedAmount}
            error={limitError}
            onUseMax={handleUseMaxLimit}
          />
        </View>

        <DashboardSection title="Payment Method" titleStyle={{ fontSize: 16 }}>
          <View style={{ gap: theme.spacing.sm }}>
            <View style={{ borderRadius: theme.radius.lg, overflow: 'hidden' }}>
              {/* <DebitCardPaymentRow
                title="Cash"
                maskedDetail="Pay with cash at nearby stores"
                onPress={() => setSelectedPaymentMode('cash')}
              /> */}
              {selectedPaymentMode === 'cash' && (
                <View
                  style={{
                    position: 'absolute',
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

            <View style={{ borderRadius: theme.radius.lg, overflow: 'hidden' }}>
              <DebitCardPaymentRow
                title="Debit Card"
                maskedDetail={paymentSubtitle}
                onPress={() => {
                  setSelectedPaymentMode('debit');
                  setDebitInfoVisible(true);
                }}
              />
              {selectedPaymentMode === 'debit' && (
                <View
                  style={{
                    position: 'absolute',
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

        <View style={styles.proceedSpacer} />

        {topUpUnavailable ? (
          <CustomText
            variant="caption"
            color={theme.colors.error}
            style={{ textAlign: 'center', marginBottom: theme.spacing.sm }}
          >
            Adding balance is temporarily unavailable. Please check your connection
            and try again in a moment.
          </CustomText>
        ) : null}

        <Button disabled={!canProceed} onPress={handleProceed}>
          {selectedPaymentMode === 'cash' ? 'Find a Location' : 'Proceed'}
        </Button>
      </View>

      <CryptoReceiptModal
        visible={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        onPayNow={() => {
          setShowReceiptModal(false);
          requestPaymentVerification(handleAfterPinVerified);
        }}
        variant="fiatOnly"
        usdAmount={parsedAmount}
        expectedFee={expectedFee}
        expectedFeeLoading={quoteEnabled && isQuoteLoading}
        totalLabel="Amount to Be Added"
      />

      <PaymentMethodPickerModal
        visible={debitInfoVisible}
        onClose={() => setDebitInfoVisible(false)}
        title="Select Payment Method"
        flow="buy"
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
    </ScreenWrapper>
  );
};

export default NewAddBalanceScreen;

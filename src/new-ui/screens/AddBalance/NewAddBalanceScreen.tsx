import React, { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import ScreenWrapper from '@new-ui/components/common-components/ScreenWrapper';
import Button from '@new-ui/components/common-components/layout/Button';
import {
  AvailableBalanceBlock,
  AddBalanceAmountField,
  AmountQuickSelectChips,
  DebitCardPaymentRow,
  AddNewCardPlaceholderModal,
  AddDebitCardModal,
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
  useUserCryptoMarketList,
  useWalletAddresses,
} from 'query/hooks/useCrypto';
import { fetchWebSessionId } from 'services/coinmeRiskLifecycle';
import { useCoinmeAccountId } from 'hooks/useCoinmeAccountId';
import { showError } from 'utils/toast';
import CryptoReceiptModal from '@new-ui/screens/Send/EnterAmount/CryptoReceiptModal';

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000];

const DEFAULT_TRADE_ASSET = 'SOL';

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

const NewAddBalanceScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = addBalanceStyles(theme);
  const navigation = useNavigation<any>();
  const { requestPaymentVerification } = useAppLock();
  const tradeExecute = useCoinmeTradeExecute();

  const bankBalance = useSelector((state: { authenticationSlice?: { bankBalance?: Record<string, unknown> } }) => {
    return state.authenticationSlice?.bankBalance;
  });

  const coinmeAccountId = useCoinmeAccountId();

  const { data: marketRows = [], isPending: isMarketPending } = useUserCryptoMarketList('USD');
  const { data: walletResponse, isPending: isWalletPending } = useWalletAddresses();
  const walletRows = walletResponse?.walletAddresses ?? [];

  const cryptoAsset = useMemo((): HiddenTradeCryptoAsset | null => {
    const sym = DEFAULT_TRADE_ASSET;
    const marketItem = marketRows.find((i) => String(i.asset ?? '').toUpperCase() === sym);
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
  }, [marketRows, walletRows]);

  const tradePriceUSD = cryptoAsset?.currentPrice ?? 0;

  const formattedAvailable = useMemo(() => {
    const bb = bankBalance as
      | {
          platform_available?: number;
          platform_balance?: number;
          bank_account?: { usd?: number };
        }
      | null
      | undefined;
    if (!bb || typeof bb !== 'object') {
      return '$0.00';
    }
    const n = Number(
      bb.platform_available ?? bb.platform_balance ?? bb.bank_account?.usd ?? 0
    );
    const safe = Number.isFinite(n) ? n : 0;
    return `$${safe.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }, [bankBalance]);

  const [amountText, setAmountText] = useState('');
  const [selectedChipIndex, setSelectedChipIndex] = useState<number | null>(null);
  const [debitInfoVisible, setDebitInfoVisible] = useState(false);
  const [addCardVisible, setAddCardVisible] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodItem | null>(
    null
  );

  const paymentMethodsQuery = usePaymentMethodsList(20);

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
  const isTradeContextLoading = isMarketPending || isWalletPending;
  const canProceed =
    amountText.length > 0 &&
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0 &&
    selectedPaymentMethod !== null &&
    tradePriceUSD > 0 &&
    cryptoAsset !== null &&
    !isTradeContextLoading;

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
      showError(errorMessage);
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

  const handleProceed = useCallback(() => {
    if (!selectedPaymentMethod) {
      showError('Please select a payment method');
      return;
    }
    if (!cryptoAsset || tradePriceUSD <= 0) {
      showError('Missing current price; please try again.');
      return;
    }
    if (!(amountText.length > 0 && Number.isFinite(parsedAmount) && parsedAmount > 0)) {
      return;
    }
    setShowReceiptModal(true);
  }, [amountText.length, cryptoAsset, parsedAmount, selectedPaymentMethod, tradePriceUSD]);

  const paymentSubtitle = useMemo(() => {
    if (!selectedPaymentMethod) return 'Select a card';
    const provider = (selectedPaymentMethod.card_provider || 'Card').toUpperCase();
    const last4 = selectedPaymentMethod.card_last4 || '••••';
    return `${provider}  •••• ${last4}`;
  }, [selectedPaymentMethod]);

  const handleAddedCard = useCallback(
    async (result: AddedCardResult) => {
      setAddCardVisible(false);

      const res = await paymentMethodsQuery.refetch();
      const items = res.data?.data?.items ?? [];
      const wanted = result.payment_method_id;

      let selected: PaymentMethodItem | null = null;
      if (wanted.startsWith('last4:')) {
        const last4 = wanted.replace('last4:', '');
        selected =
          items.find((i) => String(i.card_last4 ?? '') === String(last4)) ?? null;
      } else {
        selected = items.find((i) => i.payment_method_id === wanted) ?? null;
      }

      setSelectedPaymentMethod(selected);
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
        </View>

        <DashboardSection title="Payment Method" titleStyle={{ fontSize: 16 }}>
          <DebitCardPaymentRow
            title="Debit Card"
            maskedDetail={paymentSubtitle}
            onPress={() => setDebitInfoVisible(true)}
          />
        </DashboardSection>

        <View style={styles.proceedSpacer} />

        <Button disabled={!canProceed} onPress={handleProceed}>
          Proceed
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
        feePercent={0}
      />

      <AddNewCardPlaceholderModal
        visible={debitInfoVisible}
        onClose={() => setDebitInfoVisible(false)}
        title="Select Payment Method"
        selectedPaymentMethodId={selectedPaymentMethod?.payment_method_id ?? null}
        onConfirmSelection={(item) => {
          setSelectedPaymentMethod(item);
        }}
        onRequestAddCard={() => setAddCardVisible(true)}
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

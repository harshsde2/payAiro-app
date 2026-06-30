import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  TextInput as RNTextInput,
  useWindowDimensions,
  Keyboard,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  InteractionManager,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import ScreenWrapper from '@new-ui/components/common-components/ScreenWrapper';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { enterAmountStyles } from '@new-ui/styles/screens/send/enterAmountStyles';
import { IEnterAmountProps } from '../Send/types';
import { useAppLock } from 'hooks/useAppLock';
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants';
import {
  cryptoKeys,
  type CoinmeTradeExecutePayload,
  useAllBankAccounts,
  useCreatePaymentRequest,
  useCoinmeTradeExecute,
  useCryptoAssetsListData,
  useCryptoTransfer,
  usePaymentTransactionSend,
  usePayPaymentRequest,
  useUserToUserTransfer,
} from 'query/hooks';
import { bankKeys } from 'query/hooks/useBank';
import { queryClient } from 'query/queryClient';
import { showError } from 'utils/toast';
import type { FundingSource } from './enterAmount.types';
import { useEnterAmountState } from './useEnterAmountState';
import RecipientHeader from './RecipientHeader';
import AmountInput from './AmountInput';
import FundingSourceCard from './FundingSourceCard';
import PayButton from './PayButton';
import FundingSourceSelectorModal from './FundingSourceSelectorModal';
import type { CryptoFundingItem } from './cryptoFundingTypes';
import { AppIcon } from 'new-ui/assets/svgs';
import CustomText from 'new-ui/components/common-components/CustomText';
import CryptoReceiptModal from './CryptoReceiptModal';
import type { CryptoReceiptDraft } from './cryptoReceiptTypes';
import { fetchWebSessionId } from 'services/coinmeRiskLifecycle';
import { useCoinmeAccountId } from 'hooks/useCoinmeAccountId';
import { useComplianceStatus } from 'query/hooks/useComplianceDisclosure';
import { useEmailVerificationGuard } from 'hooks/useEmailVerificationGuard';
import type { StateCode } from '@new-ui/constants/compliance';
import {
  registerPreTxPinContinuation,
  consumePreTxDisclosureAccepted,
} from '@new-ui/screens/Compliance/preTxDisclosureFlow';

// Dev-test switch: set to 'CT' to force the pre-transaction disclosure for any user on
// every debit buy/sell confirm. MUST stay `null` in committed/shipped code.
const TEST_FORCE_PRE_TX_STATE: StateCode | null = null;
import {
  DebitCardPaymentRow,
  PaymentMethodPickerModal,
  AddDebitCardModal,
  RETAIL_CASH_PAYMENT_METHOD_ID,
} from '@new-ui/components/common-components/AddBalance';
import Button from '@new-ui/components/common-components/layout/Button';
import type { AddedCardResult } from '@new-ui/components/common-components/AddBalance/AddDebitCardModal';
import { usePaymentMethodsList, type PaymentMethodItem } from 'query/hooks/usePaymentMethods';
import CashBuyWalletAndSummary from './CashBuyWalletAndSummary';

const COINME_DEFAULTS = {
  paymentMethodId: 'uhygtfr5e354rtyu76g6b7i8',
  sourceWalletAddress: ',mu9n7777777545e5vr',
};

const EnterAmount: React.FC<IEnterAmountProps> = ({ route }) => {
  const { theme } = useTheme();
  const styles = enterAmountStyles(theme);
  const inputRef = useRef<RNTextInput | null>(null);
  /** Captured when user taps Pay so PIN/OTP callback uses current amount/recipient (avoids stale closure). */
  const pendingPaymentRef = useRef<{ amount: number; recipient_identifier: string } | null>(null);
  useEffect(() => () => { pendingPaymentRef.current = null; }, []);
  const { width } = useWindowDimensions();
  const navigation = useNavigation<any>();

  const PAYMENT_PROCEED_METHOD_TYPE = {
    send: ()=>{
      handleSendPayment();
    },
    request: ()=>{
      handleRequestPayment();
    },
    requested: ()=>{
      handleRequestedPayment();
    },
  }

  const {
    recipient_identifier,
    type,
    selectedContact,
    request_data,
    tradeMode,
    cryptoAsset,
    recipientUserId,
  } =
    route.params || ({} as any);
  console.log("route.params on enter amount =>", JSON.stringify(route.params, null, 2));

  const isRequestedFlow = type === 'requested';
  const requestDetails = (request_data as any)?.request_details;
  const requesterDetails = (request_data as any)?.requester_details;

  const requestId: string | undefined = requestDetails?.request_id;
  const requestAmount: number | undefined = requestDetails?.amount;
  const requesterName: string | undefined = requesterDetails?.name;
  const requesterUsername: string | undefined = requesterDetails?.username;

  const requestedRecipientIdentifier =
    requesterUsername || requesterDetails?.email || recipient_identifier || '';

  const requestedSelectedContact = isRequestedFlow
    ? {
        uuid: String(
          requestId ??
            requesterDetails?.wallet_address ??
            requesterDetails?.email ??
            'requested'
        ),
        nickname: String(requesterName ?? requesterUsername ?? ''),
        username: String(requesterUsername ?? ''),
        email: String(requesterDetails?.email ?? ''),
        profile_photo: requesterDetails?.profile_photo ?? null,
      }
    : undefined;

  const requestedInitialInputValue = isRequestedFlow
    ? String(requestAmount ?? '')
    : undefined;

  const walletData = useSelector(
    (state: { authenticationSlice?: { walletData?: Record<string, unknown> } }) =>
      state.authenticationSlice?.walletData ?? null
  );
  const bankListsFromRedux = useSelector(
    (state: { authenticationSlice?: { bankLists?: unknown[] } }) =>
      state.authenticationSlice?.bankLists
  );
  const allCryptoFromRedux = useSelector(
    (state: { authenticationSlice?: { allCryptoBalances?: unknown[] } }) =>
      state.authenticationSlice?.allCryptoBalances
  );

  const { data: apiBankAccounts = [] } = useAllBankAccounts();
  const { data: cryptoAssetsList = [] } = useCryptoAssetsListData('USD');

  const bankLists = useMemo(() => {
    if (Array.isArray(bankListsFromRedux) && bankListsFromRedux.length > 0) {
      return bankListsFromRedux;
    }
    return apiBankAccounts;
  }, [apiBankAccounts, bankListsFromRedux]);

  const allCryptoBalances = useMemo(() => {
    if (Array.isArray(allCryptoFromRedux) && allCryptoFromRedux.length > 0) {
      return allCryptoFromRedux;
    }
    return cryptoAssetsList;
  }, [allCryptoFromRedux, cryptoAssetsList]);

  const { requestPaymentVerification } = useAppLock();
  const coinmeAccountId = useCoinmeAccountId();
  // Backend-driven (GET state-compliance/status/): which state the user is in and
  // whether a pre-transaction disclosure is required (e.g. CT debit buy/sell).
  const { data: complianceStatus } = useComplianceStatus();
  const { requireEmailVerified } = useEmailVerificationGuard();
  const { mutate: handleUserToUserTransfer } = useUserToUserTransfer() as any;
  const { mutate: handleCryptoTransfer } = useCryptoTransfer() as any;
  const { mutate: createPaymentRequest } = useCreatePaymentRequest();
  const { mutate: payPaymentRequest } = usePayPaymentRequest();
  const tradeExecute = useCoinmeTradeExecute();
  const { mutate: sendPaymentTransaction, isPending: isSendingPaymentTx } = usePaymentTransactionSend();
  const isTradeMode =
    (tradeMode === 'buy' || tradeMode === 'sell') &&
    !!cryptoAsset &&
    typeof cryptoAsset === 'object';
  const isCryptoSendMode = type === 'send' && !tradeMode;
  const tradeAssetSymbol = String(cryptoAsset?.asset || '').toUpperCase();
  const tradePriceUSD = Number(cryptoAsset?.currentPrice ?? 0);

  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [showCryptoReceiptModal, setShowCryptoReceiptModal] = useState(false);
  const cryptoPaymentRef = useRef<CryptoReceiptDraft | null>(null);
  const [debitInfoVisible, setDebitInfoVisible] = useState(false);
  const [addCardVisible, setAddCardVisible] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodItem | null>(
    null
  );
  const [tradePaymentRail, setTradePaymentRail] = useState<'debit' | 'retail_cash'>('debit');
  const paymentMethodsQuery = usePaymentMethodsList(20);

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  useEffect(() => {
    if (!isTradeMode) {
      setTradePaymentRail('debit');
    }
  }, [isTradeMode]);

  const convertToFundingSource = useCallback((bankLike: any): FundingSource | null => {
    if (!bankLike || typeof bankLike !== 'object') return null;

    const idRaw =
      bankLike.id ??
      bankLike.account_id ??
      bankLike.guid ??
      bankLike.account_guid ??
      bankLike.account_number ??
      bankLike.accountId ??
      '';
    const id = String(idRaw ?? '').trim();
    if (!id) return null;

    const isMain = String(bankLike.account_type ?? '').toLowerCase() === 'main';
    const rawName =
      bankLike.name ??
      bankLike.bank_name ??
      bankLike.bankName ??
      bankLike.account_holder ??
      'Bank';
    const bankNameLower = String(bankLike.bank_name ?? '').toLowerCase();
    const isLikelyPayairo =
      isMain || bankNameLower.includes('payairo') || bankNameLower.includes('pay airo');
    const name = isLikelyPayairo ? 'PayAiro Account' : String(rawName);

    const balanceRaw =
      bankLike.balances?.available ??
      bankLike.balances?.available_usd ??
      bankLike.balance ??
      0;
    const balance = typeof balanceRaw === 'number' ? balanceRaw : Number(balanceRaw ?? 0);
    const safeBalance = Number.isFinite(balance) ? balance : 0;

    const acctNum = String(
      bankLike.account_number ?? bankLike.masked_account_number ?? ''
    ).trim();
    const digits = acctNum.replace(/\D/g, '');
    let accountMaskHint =
      digits.length >= 4
        ? digits.slice(-4)
        : acctNum.length >= 4
          ? acctNum.replace(/\D/g, '').slice(-4) || acctNum.slice(-4)
          : '';
    if (!accountMaskHint) {
      const idDigits = String(id).replace(/\D/g, '');
      if (idDigits.length >= 4) accountMaskHint = idDigits.slice(-4);
    }

    return {
      id,
      name,
      balance: safeBalance,
      type: 'bank',
      accountMaskHint: accountMaskHint || undefined,
      isPayairoFunding: isLikelyPayairo,
    };
  }, []);




  const handlePressAmountFocus = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const handlePressFundingSource = useCallback(() => {
    // Ensure native keyboard is dismissed so the backdrop covers the full RN screen.
    Keyboard.dismiss();
    setIsSelectorOpen(true);
  }, []);


  // Only consider Payairo \"main\" bank accounts as funding sources.
  const mainBanks = useMemo(() => {
    if (!Array.isArray(bankLists)) return [];
    const mains = bankLists.filter(
      (bank: any) => String(bank?.account_type ?? '').toLowerCase() === 'main'
    );
    if (mains.length > 0) return mains;
    return bankLists.length > 0 ? [bankLists[0]] : [];
  }, [bankLists]);

  const sources = useMemo(() => {
    return mainBanks
      .map((b: any) => convertToFundingSource(b))
      .filter(Boolean) as FundingSource[];
  }, [convertToFundingSource, mainBanks]);

  const cryptoSources = useMemo<CryptoFundingItem[]>(() => {
    if (!Array.isArray(allCryptoBalances)) return [];
    const list = allCryptoBalances as CryptoFundingItem[];
    return list.filter((item) => item?.asset !== 'Bank Balance');
  }, [allCryptoBalances]);

  // For request/requested flows, show only fiat/bank funding sources in the selector.
  const cryptoSourcesForModal = useMemo<CryptoFundingItem[]>(() => {
    const shouldHideCrypto = type === 'request' || type === 'requested';
    return shouldHideCrypto ? [] : cryptoSources;
  }, [cryptoSources, type]);

  const transactionFeePercent = useMemo(() => {
    if (isTradeMode) return 0;
    const raw = walletData?.TransactionFees_persentage;
    const n = typeof raw === 'string' ? parseFloat(raw) : Number(raw);
    return Number.isFinite(n) ? n : 0;
  }, [isTradeMode, walletData?.TransactionFees_persentage]);

  const tradeFundingSource = useMemo<FundingSource | null>(() => {
    if (!isTradeMode || !tradeAssetSymbol) return null;
    const safePrice = Number.isFinite(tradePriceUSD) ? tradePriceUSD : 0;
    const sellBalanceRaw = Number(cryptoAsset?.platformAvailable ?? 0);
    const sellBalance = Number.isFinite(sellBalanceRaw) ? Math.max(0, sellBalanceRaw) : 0;
    return {
      id: `trade-${tradeMode}-${tradeAssetSymbol}`,
      name: tradeAssetSymbol,
      balance: tradeMode === 'sell' ? sellBalance : 0,
      type: 'crypto',
      cryptoMeta: {
        symbol: tradeAssetSymbol,
        network: String(cryptoAsset?.chain || 'ETH').toUpperCase(),
        priceUSD: safePrice,
        logo: cryptoAsset?.logo,
      },
    };
  }, [cryptoAsset, isTradeMode, tradeAssetSymbol, tradeMode, tradePriceUSD]);

  const cryptoSendInitialSource = useMemo<FundingSource | null>(() => {
    if (!isCryptoSendMode) return null;
    if (!Array.isArray(cryptoSources) || cryptoSources.length === 0) return null;

    const btc = cryptoSources.find((c) => String(c.asset ?? '').toUpperCase() === 'BTC');
    const item = btc ?? cryptoSources[0];
    if (!item) return null;

    const symbol = String(item.asset || 'CRYPTO').toUpperCase();
    const maxAssetBalance = Number(item.platform_available ?? item.rounded_balance ?? 0);
    const maxUsdBalance = Number(item.usd_value_available ?? item.usd_value_total ?? 0);
    const rawPrice = Number(item.usd_price ?? 0);
    const derivedPrice = maxAssetBalance > 0 && maxUsdBalance > 0 ? maxUsdBalance / maxAssetBalance : 0;
    const priceUSD = rawPrice > 0 ? rawPrice : derivedPrice;

    return {
      id: `crypto-${symbol}`,
      name: symbol,
      balance: maxAssetBalance,
      type: 'crypto',
      cryptoMeta: {
        symbol,
        network: symbol,
        priceUSD,
        maxAssetBalance,
        logo: item.logo,
      },
    };
  }, [cryptoSources, isCryptoSendMode]);

  const initialSelectedSource = useMemo(() => {
    if (tradeFundingSource) return tradeFundingSource;
    if (cryptoSendInitialSource) return cryptoSendInitialSource;
    // For now we always default to the first main Payairo bank, if available.
    if (mainBanks.length > 0) {
      return convertToFundingSource(mainBanks[0]);
    }
    return null;
  }, [convertToFundingSource, cryptoSendInitialSource, mainBanks, tradeFundingSource]);

  const {
    amount,
    inputValue,
    displayAmount,
    displayFiatEquivalent,
    displayAssetEquivalent,
    selectedSource,
    viewMode,
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
    initialSelectedSource,
    transactionFeePercent,
    initialInputValue: requestedInitialInputValue,
    initialInputMode: isTradeMode
      ? 'fiat'
      : isCryptoSendMode
        ? 'asset'
        : 'fiat',
    preferFiatCryptoEntry: isTradeMode && tradeMode === 'buy',
    defaultFiatOnCryptoSource: isTradeMode && tradeMode === 'sell',
  });

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [viewMode]);

  const dynamicFontSize = useMemo(() => {
    const totalChars = (displayAmount || '0.00').length + 1; // + $ prefix
    const availableWidth = width - 80;
    const charWidthRatio = 0.6;
    const ideal = availableWidth / (totalChars * charWidthRatio);
    const max = 40;
    const min = 24;
    return Math.min(max, Math.max(min, ideal));
  }, [displayAmount, width]);

  const assetSymbol = useMemo(
    () => selectedSource?.cryptoMeta?.symbol || selectedSource?.name || 'CRYPTO',
    [selectedSource?.cryptoMeta?.symbol, selectedSource?.name]
  );

  const isCryptoMode = viewMode === 'crypto';
  const cashBuyWalletAddress = useMemo(
    () => String(cryptoAsset?.sourceWalletAddress ?? '').trim(),
    [cryptoAsset?.sourceWalletAddress]
  );
  const showCashBuyExtras =
    isTradeMode &&
    tradeMode === 'buy' &&
    tradePaymentRail === 'retail_cash' &&
    isCryptoMode;
  const leftPrefix = isCryptoMode && inputMode === 'asset' ? '' : '$';
  const rightSuffix = isCryptoMode && inputMode === 'asset' ? assetSymbol : '';
  const pricePreviewText = useMemo(() => {
    if (!isTradeMode || !tradeAssetSymbol) return '';
    if (!Number.isFinite(tradePriceUSD) || tradePriceUSD <= 0) return '';
    return `1 ${tradeAssetSymbol} ≈ $${tradePriceUSD.toFixed(2)}`;
  }, [isTradeMode, tradeAssetSymbol, tradePriceUSD]);

  const paymentSubtitle = useMemo(() => {
    if (isTradeMode && tradePaymentRail === 'retail_cash') {
      return 'Pay with cash at a retail location';
    }
    if (!selectedPaymentMethod) return 'Select a card';
    const provider = (selectedPaymentMethod.card_provider || 'Card').toUpperCase();
    const last4 = selectedPaymentMethod.card_last4 || '••••';
    return `${provider}  •••• ${last4}`;
  }, [isTradeMode, tradePaymentRail, selectedPaymentMethod]);

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
      if (isTradeMode) {
        setTradePaymentRail('debit');
      }
      setTimeout(() => setDebitInfoVisible(true), 350);
    },
    [isTradeMode, paymentMethodsQuery]
  );

  const handleFindCashLocation = useCallback(() => {
    if (!cryptoAsset) {
      showError('Missing crypto details; please try again.');
      return;
    }
    const wallet = String(cryptoAsset?.sourceWalletAddress ?? '').trim();
    if (!wallet) {
      showError('Wallet address is required. Go back to the asset screen and try again.');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      showError('Please enter a valid amount');
      return;
    }
    const finderParams = {
      amount,
      fiatCurrencyCode: String(cryptoAsset.fiatCurrency || 'USD').toUpperCase(),
      cryptoCurrencyCode: String(cryptoAsset.asset || '').toUpperCase(),
      chain: String(cryptoAsset.chain || 'ETH').toUpperCase(),
      sourceWalletAddress: String(cryptoAsset?.sourceWalletAddress ?? '').trim(),
    };
    if (tradeMode === 'sell') {
      navigation.navigate(NAVIGATION_SCREENS.NEW_CASH_RAMP_SELL_LOCATION_FINDER as never, finderParams as never);
    } else {
      navigation.navigate(NAVIGATION_SCREENS.NEW_CASH_RAMP_LOCATION_FINDER as never, finderParams as never);
    }
  }, [amount, cryptoAsset, navigation, tradeMode]);

  const openDebitPaymentPicker = useCallback(() => {
    Keyboard.dismiss();
    setDebitInfoVisible(true);
  }, []);

  const handleSendPayment = useCallback(() => {
    const pending = pendingPaymentRef.current;
    if (!pending) {
      showError('Session expired. Please try again.');
      return;
    }
    const { amount: sendAmount, recipient_identifier: sendRecipient } = pending;
    const numericAmount = Number(sendAmount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      showError('Please enter a valid amount');
      return;
    }

    const formData = new FormData();
    formData.append('amount', String(numericAmount));
    formData.append('recipient_identifier', sendRecipient);

    navigation.navigate(NAVIGATION_SCREENS.TRANSACTION_RESULT as never, {
      isLoading: true,
      transactionData: null,
      isSuccess: false,
      isError: false,
    } as never);

    handleUserToUserTransfer(formData, {
      onSuccess: (data: any) => {
        if (data?.data && data?.status) {
          queryClient.invalidateQueries({ queryKey: bankKeys.balance() });

          navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT as never, {
            isLoading: false,
            transactionData: data,
            isSuccess: true,
            isError: false,
          } as never);
        } else {
          navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT as never, {
            isLoading: false,
            transactionData: data,
            isSuccess: false,
            isError: true,
          } as never);
          showError(
            data?.data?.data?.error ||
              'Operation is forbidden. Custodial account is suspended or Level 2 KYC Pending'
          );
        }
      },
      onError: (error: unknown) => {
        console.log('error =>', JSON.stringify(error, null, 2));
        navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT as never, {
          isLoading: false,
          transactionData: null,
          isSuccess: false,
          isError: true,
        } as never);
      },
      onSettled: () => {},
    });
  }, [navigation, showError, handleUserToUserTransfer, queryClient, bankKeys]);

  const handleRequestPayment = useCallback(() => {
    const pending = pendingPaymentRef.current;

    const rawAmount = pending?.amount ?? amount;
    const transactionAmount = Number(rawAmount) || 0;

    if (transactionAmount <= 0) {
      showError('Please enter a valid amount');
      return;
    }

    if (transactionAmount > 100000) {
      showError('Amount cannot exceed ₹1,00,000');
      return;
    }

    const recipient_email_or_wallet_public_key =
      pending?.recipient_identifier ?? recipient_identifier ?? '';

    const payload = {
      amount: String(pending?.amount ?? amount),
      recipient_email_or_wallet_public_key,
    };

    navigation.navigate(NAVIGATION_SCREENS.TRANSACTION_RESULT as never, {
      isLoading: true,
      transactionData: null,
      isSuccess: false,
      isError: false,
      customTitle: 'Sending Payment Request',
      customDescription: 'Please wait while we send your payment request...',
    } as never);

    createPaymentRequest(payload, {
      onSuccess: (data: any) => {
        if (data?.status) {
          navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT as never, {
            isLoading: false,
            transactionData: null,
            isSuccess: true,
            isError: false,
            customTitle: 'Payment Request Sent Successfully',
            customDescription:
              'Your payment request has been sent successfully!',
          } as never);
        } else {
          navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT as never, {
            isLoading: false,
            transactionData: data,
            isSuccess: false,
            isError: true,
          } as never);

          showError(
            data?.message || 'Already have pending request with this account'
          );
        }
      },
      onError: (error: unknown) => {
        console.log('Payment request error:', error);
        navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT as never, {
          isLoading: false,
          transactionData: null,
          isSuccess: false,
          isError: true,
        } as never);
        showError('Already have pending request with this account');
      },
    });
  }, [
    amount,
    createPaymentRequest,
    navigation,
    recipient_identifier,
    showError,
  ]);

  const handleRequestedPayment = useCallback(() => {
    if (!requestId) {
      showError('Session expired. Please try again.');
      return;
    }

    const requestAmountForUi = requestAmount ?? 0;
    const requesterNameOrUsername = requesterName || requesterUsername;

    // Navigate to transaction result screen with loading state
    navigation.navigate(NAVIGATION_SCREENS.TRANSACTION_RESULT as never, {
      isLoading: true,
      transactionData: null,
      isSuccess: false,
      isError: false,
      customTitle: 'Processing Payment',
      customDescription: 'Please wait while we process your payment...',
    } as never);

    payPaymentRequest(requestId, {
      onSuccess: (data: any) => {
        if (data?.status) {
          queryClient.invalidateQueries({ queryKey: bankKeys.balance() });

          navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT as never, {
            isLoading: false,
            transactionData: data,
            isSuccess: true,
            isError: false,
            customTitle: 'Payment Initiated',
            customDescription: `Your payment of $${requestAmountForUi} to ${requesterNameOrUsername} has been sent for processing.`,
          } as never);
        } else {
          navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT as never, {
            isLoading: false,
            transactionData: data,
            isSuccess: false,
            isError: true,
          } as never);
          showError(data?.message || 'Did not have enough balance or some error occurred');
        }
      },
      onError: (error: unknown) => {
        console.log('Pay request error:', JSON.stringify(error, null, 2));
        navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT as never, {
          isLoading: false,
          transactionData: null,
          isSuccess: false,
          isError: true,
        } as never);
        showError('Did not have enough balance or some error occurred');
      },
    });
  }, [
    bankKeys,
    navigation,
    payPaymentRequest,
    queryClient,
    requestAmount,
    requestId,
    requesterName,
    requesterUsername,
    showError,
  ]);

  const handleCryptoSendPayment = useCallback(() => {
    const draft = cryptoPaymentRef.current;
    if (!draft) {
      showError('Session expired. Please try again.');
      return;
    }

    setIsPaying(true);

    navigation.navigate(NAVIGATION_SCREENS.TRANSACTION_RESULT as never, {
      isLoading: true,
      transactionData: null,
      isSuccess: false,
      isError: false,
    } as never);

    const chainName = draft.symbol.slice(0, 3);

    handleCryptoTransfer(
      {
        account_type: '',
        amount: draft.assetAmount.toString(),
        asset: chainName,
        network: draft.network || '',
        receiver: draft.receiver,
        usd_amount: Number(draft.usdAmount.toFixed(2)),
      } as any,
      {
        onSuccess: (data: any) => {
          const ok = data?.status ?? data?.data?.status ?? false;

          // Invalidate both crypto + fiat (crypto transfers may affect fiat cards)
          queryClient.invalidateQueries({ queryKey: cryptoKeys.allCryptoBalances() });
          queryClient.invalidateQueries({ queryKey: bankKeys.balance() });

          navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT as never, {
            isLoading: false,
            transactionData: data,
            isSuccess: !!ok,
            isError: !ok,
          } as never);

          // Clear draft after success/failure (avoid reusing stale payloads)
          cryptoPaymentRef.current = null;
        },
        onError: (error: unknown) => {
          console.log('crypto send error =>', JSON.stringify(error, null, 2));
          navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT as never, {
            isLoading: false,
            transactionData: null,
            isSuccess: false,
            isError: true,
          } as never);
          cryptoPaymentRef.current = null;
          showError('Something went wrong while sending crypto');
        },
        onSettled: () => {
          setIsPaying(false);
        },
      }
    );
  }, [handleCryptoTransfer, navigation, queryClient, showError]);

  const handleCryptoSendViaPaymentTransaction = useCallback(() => {
    if (!selectedSource?.cryptoMeta) {
      showError('Please select a crypto asset');
      return;
    }

    const symbol = selectedSource.cryptoMeta.symbol;
    const chain = selectedSource.cryptoMeta.network || symbol;
    const amountStr = String(assetAmount.toFixed(8)).replace(/\.?0+$/, '') || '0';

    const payload = recipientUserId
      ? ({ type: 'internal', amount: amountStr, currency: symbol, chain, recipientUserId } as const)
      : ({ type: 'external', amount: amountStr, currency: symbol, chain, destinationWalletAddress: recipient_identifier || '' } as const);

    navigation.navigate(NAVIGATION_SCREENS.TRANSACTION_RESULT as never, {
      isLoading: true, transactionData: null, isSuccess: false, isError: false,
    } as never);

    sendPaymentTransaction(payload, {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: cryptoKeys.allCryptoBalances() });
        const ok = data?.ok ?? data?.status ?? true;
        navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT as never, {
          isLoading: false, transactionData: data, isSuccess: !!ok, isError: !ok,
        } as never);
        if (!ok) showError((data as any)?.message || 'Transaction failed. Please try again.');
      },
      onError: (error: unknown) => {
        const e = error as { response?: { data?: { message?: string } }; message?: string };
        const msg = e?.response?.data?.message || e?.message || 'Something went wrong. Please try again.';
        navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT as never, {
          isLoading: false, transactionData: null, isSuccess: false, isError: true,
        } as never);
        showError(msg);
      },
    });
  }, [
    assetAmount,
    navigation,
    queryClient,
    recipient_identifier,
    recipientUserId,
    selectedSource,
    sendPaymentTransaction,
    showError,
  ]);

  const handleTradeExecute = useCallback(async () => {
    if (!isTradeMode || !cryptoAsset) return;
    if (!coinmeAccountId) {
      showError(
        'Your Coinme account is not ready yet. Please complete onboarding and try again.'
      );
      return;
    }

    navigation.navigate(NAVIGATION_SCREENS.TRANSACTION_RESULT as never, {
      isLoading: true,
      transactionData: null,
      isSuccess: false,
      isError: false,
      customTitle: 'Processing',
      customDescription: 'Submitting your trade...',
    } as never);

    try {
      console.log('step one =>');
      const webSessionId = await fetchWebSessionId({
        accountId: coinmeAccountId,
        riskFlow: 'cardtransaction',
      });



      console.log('step two =>', webSessionId);

      const isFiatEntry = inputMode === 'fiat';
      const payload: CoinmeTradeExecutePayload = {
        tradeType: tradeMode,
        chain: String(cryptoAsset.chain || 'ETH').toUpperCase(),
        cryptoCurrencyCode: String(cryptoAsset.asset || '').toUpperCase(),
        fiatCurrencyCode: String(cryptoAsset.fiatCurrency || 'USD').toUpperCase(),
        amountValue: String(isFiatEntry ? amount : assetAmount),
        amountCurrencyCode: isFiatEntry
          ? String(cryptoAsset.fiatCurrency || 'USD').toUpperCase()
          : String(cryptoAsset.asset || '').toUpperCase(),
        paymentMethodId:
          selectedPaymentMethod?.payment_method_id ?? COINME_DEFAULTS.paymentMethodId,
        sourceWalletAddress:
          cryptoAsset.sourceWalletAddress || COINME_DEFAULTS.sourceWalletAddress,
        webSessionId,
      };

      console.log('step three =>');
      const res = await tradeExecute.mutateAsync(payload);
      const ok = res?.ok ?? res?.status ?? true;

      queryClient.invalidateQueries({ queryKey: cryptoKeys.allCryptoBalances() });
      queryClient.invalidateQueries({ queryKey: bankKeys.balance() });

      console.log('step four =>');

      navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT as never, {
        isLoading: false,
        transactionData: res,
        isSuccess: !!ok,
        isError: !ok,
        customTitle: tradeMode === 'buy' ? 'Buy submitted' : 'Sell submitted',
      } as never);
    } catch (err: unknown) {

      console.log('step five =>', JSON.stringify(err, null, 2));
      const e = err as { response?: { data?: { message?: string } }; message?: string };
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
    amount,
    assetAmount,
    coinmeAccountId,
    cryptoAsset,
    inputMode,
    isTradeMode,
    navigation,
    queryClient,
    showError,
    tradeExecute,
    tradeMode,
    selectedPaymentMethod?.payment_method_id,
  ]);

  const handleActionsAfterOTPVerified = useCallback(() => {
    if (!isCryptoMode) {
      // if (type === 'send') {
      //   handleSendPayment();
      // }
      PAYMENT_PROCEED_METHOD_TYPE[type as keyof typeof PAYMENT_PROCEED_METHOD_TYPE]?.();
      return;
    }
    handleCryptoSendPayment();
  }, [
    handleCryptoSendPayment,
    handleRequestedPayment,
    handleRequestPayment,
    handleSendPayment,
    isCryptoMode,
    type,
  ]);

  const handleActionsAfterPinVerified = useCallback(() => {
    if (isTradeMode) {
      handleTradeExecute();
      return;
    }
    if (isCryptoSendMode) {
      handleCryptoSendViaPaymentTransaction();
      return;
    }
    navigation.navigate(NAVIGATION_SCREENS.OTP_SCREEN, {
      onOTPVerified: handleActionsAfterOTPVerified,
      transactionType: isCryptoMode ? 'crypto_send' : type,
    });
  }, [
    handleActionsAfterOTPVerified,
    handleCryptoSendViaPaymentTransaction,
    handleTradeExecute,
    isCryptoMode,
    isCryptoSendMode,
    isTradeMode,
    navigation,
    type,
  ]);

  // Pre-transaction disclosure dismisses via goBack; the bridge signals acceptance
  // so we continue to PIN once EnterAmount regains focus.
  useFocusEffect(
    useCallback(() => {
      const continueToPin = consumePreTxDisclosureAccepted();
      if (!continueToPin) return;
      const task = InteractionManager.runAfterInteractions(continueToPin);
      return () => task.cancel();
    }, [handleActionsAfterPinVerified, requestPaymentVerification]),
  );

  const proceedPay = useCallback(() => {
    if (!isCryptoMode) {
      if (type === 'requested') {
        if (!requestId) {
          showError('Session expired. Please try again.');
          return;
        }
        requestPaymentVerification(handleActionsAfterPinVerified);
        return;
      }

      if (!selectedPaymentMethod) {
        showError('Please select a payment method');
        return;
      }
      if (!recipient_identifier) {
        showError('Recipient is missing');
        return;
      }
      if (amount <= 0) {
        showError('Please enter a valid amount');
        return;
      }

      pendingPaymentRef.current = {
        amount,
        recipient_identifier: recipient_identifier || '',
      };
      requestPaymentVerification(handleActionsAfterPinVerified);
      return;
    }

    if (isTradeMode) {
      if (inputMode === 'fiat' && amount <= 0) {
        showError('Please enter a valid amount');
        return;
      }
      if (inputMode === 'asset' && assetAmount <= 0) {
        showError('Please enter a valid amount');
        return;
      }
      if (tradePaymentRail === 'retail_cash') {
        return;
      }
      if (!selectedPaymentMethod) {
        showError('Please select a payment method');
        return;
      }
      // State compliance (e.g. CT): show pre-transaction disclosure before PIN.
      // Required EVERY transaction — disclosure GET runs on that screen; PIN follows
      // via goBack + bridge when the user finalizes.
      const complianceStateCode =
        TEST_FORCE_PRE_TX_STATE ?? (complianceStatus?.stateCode as StateCode | undefined);
      const requiresPreTxDisclosure =
        !!TEST_FORCE_PRE_TX_STATE || complianceStatus?.requiresPreTransactionDisclosure;
      if (requiresPreTxDisclosure && complianceStateCode) {
        const isFiatEntry = inputMode === 'fiat';
        registerPreTxPinContinuation(() =>
          requestPaymentVerification(handleActionsAfterPinVerified),
        );
        navigation.navigate(NAVIGATION_SCREENS.STATE_COMPLIANCE_PRE_TRANSACTION, {
          stateCode: complianceStateCode,
          tradeType: tradeMode as 'buy' | 'sell',
          usdAmount: amount,
          chain: String(cryptoAsset?.chain || 'ETH').toUpperCase(),
          cryptoCurrencyCode: String(cryptoAsset?.asset || '').toUpperCase(),
          fiatCurrencyCode: String(cryptoAsset?.fiatCurrency || 'USD').toUpperCase(),
          amountValue: String(isFiatEntry ? amount : assetAmount),
          amountCurrencyCode: isFiatEntry
            ? String(cryptoAsset?.fiatCurrency || 'USD').toUpperCase()
            : String(cryptoAsset?.asset || '').toUpperCase(),
        });
        return;
      }
    } else {
      const errors = validateCrypto();
      if (errors.length > 0) {
        showError(errors[0]);
        return;
      }
    }

    if (!selectedSource?.cryptoMeta) {
      showError('Please select a crypto asset');
      return;
    }

    const symbol = selectedSource.cryptoMeta.symbol;
    const network = selectedSource.cryptoMeta.network || '';

    cryptoPaymentRef.current = {
      receiver: recipient_identifier || '',
      symbol,
      network,
      assetAmount,
      usdAmount: amount,
    };

    setShowCryptoReceiptModal(true);
  }, [
    amount,
    assetAmount,
    isCryptoMode,
    isTradeMode,
    inputMode,
    requestId,
    type,
    selectedSource,
    recipient_identifier,
    requestPaymentVerification,
    selectedSource?.cryptoMeta,
    selectedPaymentMethod,
    showError,
    tradeMode,
    tradePaymentRail,
    validateCrypto,
    handleActionsAfterPinVerified,
    navigation,
    complianceStatus,
  ]);

  // Gate every money movement behind email verification; resumes the trade/send
  // automatically once the email is verified.
  const handlePayPress = useCallback(() => {
    requireEmailVerified(proceedPay);
  }, [requireEmailVerified, proceedPay]);

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={['bottom','top']}
      scrollable={false}
      contentStyle={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={{ flex: 1 }}>
         <View style={styles.header}>
          <AppIcon.ArrowLeft
            width={25}
            height={25}
            onPress={() => navigation.goBack()}
            style={{ marginRight:isCryptoMode ? 45 : 0}}
          />

          <View style={styles.headerTitleContainer}>
            <CustomText variant='h1' fontWeight='bold' size={20}>Enter Amount</CustomText>
          </View>

          {isCryptoMode ? (
            <TouchableOpacity
              style={styles.cryptoToggleButton}
              activeOpacity={0.85}
              onPress={toggleInputMode}
            >
              <CustomText style={styles.cryptoToggleIcon} fontWeight="semiBold">
                ↻
              </CustomText>
              <CustomText style={styles.cryptoToggleText} fontWeight="semiBold">
                {inputMode === 'asset' ? 'USD' : assetSymbol}
              </CustomText>
            </TouchableOpacity>
          ) : (
            <View style={styles.headerRightSpacer} />
          )}
        </View>

          <RecipientHeader
            recipient_identifier={
              isRequestedFlow ? requestedRecipientIdentifier : recipient_identifier || ''
            }
            type={isRequestedFlow ? ('send' as any) : type}
            selectedContact={isRequestedFlow ? requestedSelectedContact : selectedContact}
            mode={isTradeMode ? 'trade' : 'send'}
            tradeMode={isTradeMode ? tradeMode : undefined}
            assetSymbol={isTradeMode ? tradeAssetSymbol : undefined}
            pricePreview={isTradeMode ? pricePreviewText : undefined}
          />

          <AmountInput
            inputValue={inputValue}
            onChangeAmountText={onChangeAmountText}
            inputRef={inputRef}
            dynamicFontSize={dynamicFontSize}
            onPressFocus={handlePressAmountFocus}
            editable={!isRequestedFlow}
            leftPrefix={leftPrefix}
            rightSuffix={rightSuffix}
          />

          {isCryptoMode ? (
            <View style={styles.cryptoModeContainer}>
              <CustomText style={styles.cryptoFeeText} variant="caption">
                Fee: {feePercent}%
              </CustomText>

              {!isTradeMode ? (
                <TouchableOpacity style={styles.cryptoMaxContainer} activeOpacity={0.9} onPress={fillMax}>
                  <CustomText variant="caption" style={styles.cryptoMaxText}>
                    Max: {maxAsset.toFixed(maxAsset >= 1 ? 4 : 8)} {assetSymbol} ~$
                    {maxUsd.toFixed(2)}
                  </CustomText>
                </TouchableOpacity>
              ) : null}

              <CustomText variant="caption" style={styles.cryptoEquivalentText}>
                {inputMode === 'asset'
                  ? `~$${Number(displayFiatEquivalent || 0).toFixed(2)}`
                  : `~${Number(displayAssetEquivalent || 0).toFixed(6)} ${assetSymbol}`}
              </CustomText>
            </View>
          ) : null}

          {showCashBuyExtras ? (
            <CashBuyWalletAndSummary
              walletAddress={cashBuyWalletAddress}
              assetSymbol={assetSymbol}
              fiatCode="USD"
              fiatAmount={amount}
              estimatedCryptoAmount={assetAmount}
              oneLineRateLabel={pricePreviewText}
              feePercent={feePercent}
            />
          ) : null}

        </View>

        <View
          style={
            isCryptoMode && isTradeMode
              ? [styles.bottomArea, styles.bottomAreaTrade]
              : styles.bottomArea
          }
        >
          <View style={{ width: '100%', gap: theme.spacing.md }}>
            {isCryptoMode && isTradeMode ? (
              <DebitCardPaymentRow
                title={tradePaymentRail === 'retail_cash' ? 'Cash' : 'Debit Card'}
                maskedDetail={paymentSubtitle}
                onPress={openDebitPaymentPicker}
              />
            ) : isCryptoMode && !isTradeMode ? (
              <FundingSourceCard
                source={selectedSource}
                onPress={handlePressFundingSource}
              />
            ) : (
              <DebitCardPaymentRow
                title="Debit Card"
                maskedDetail={paymentSubtitle}
                onPress={openDebitPaymentPicker}
              />
            )}
            {!isTradeMode || tradePaymentRail === 'debit' ? (
              <PayButton disabled={isPaying || isSendingPaymentTx} onPress={handlePayPress} />
            ) : null}
            {isTradeMode && tradePaymentRail === 'retail_cash' ? (
              <Button
                onPress={handleFindCashLocation}
                style={styles.payButton}
                disabled={!cashBuyWalletAddress || !Number.isFinite(amount) || amount <= 0}
              >
                Find a Location
              </Button>
            ) : null}
          </View>
        </View>

        {isSelectorOpen && isCryptoMode && !isTradeMode ? (
          <FundingSourceSelectorModal
            sources={isCryptoSendMode ? [] : sources}
            cryptoSources={cryptoSourcesForModal}
            selectedSource={selectedSource}
            onSelect={(source) => setSelectedSource(source)}
            onClose={() => setIsSelectorOpen(false)}
          />
        ) : null}

        <PaymentMethodPickerModal
          visible={debitInfoVisible}
          onClose={() => setDebitInfoVisible(false)}
          title="Select Payment Method"
          flow={tradeMode === 'sell' ? 'sell' : 'buy'}
          includeRetailCashOption={isTradeMode}
          selectedPaymentMethodId={
            isTradeMode && tradePaymentRail === 'retail_cash'
              ? RETAIL_CASH_PAYMENT_METHOD_ID
              : selectedPaymentMethod?.payment_method_id ?? null
          }
          onConfirmSelection={(item, ctx) => {
            if (ctx?.retailCash) {
              setTradePaymentRail('retail_cash');
              setSelectedPaymentMethod(null);
              return;
            }
            setSelectedPaymentMethod(item);
            if (isTradeMode) {
              setTradePaymentRail('debit');
            }
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

        <CryptoReceiptModal
          visible={showCryptoReceiptModal}
          onClose={() => setShowCryptoReceiptModal(false)}
          onPayNow={() => {
            setShowCryptoReceiptModal(false);
            requestPaymentVerification(handleActionsAfterPinVerified);
          }}
          tokenSymbol={assetSymbol}
          tokenAmount={assetAmount}
          priceUSD={selectedSource?.cryptoMeta?.priceUSD ?? tradePriceUSD ?? 0}
          usdAmount={amount}
          feePercent={feePercent}
        />
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default EnterAmount;


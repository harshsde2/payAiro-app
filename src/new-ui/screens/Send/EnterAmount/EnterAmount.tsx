import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
  useCoinmeTradeQuote,
  getExpectedFeeUsd,
  getCoinmeTradeQuoteErrorMessage,
  useCryptoAssetsListData,
  useCryptoMarketForCurrency,
  useUserCryptoBalanceFastApi,
  useCryptoTransfer,
  usePaymentTransactionSend,
  usePayPaymentRequest,
  useUserToUserTransfer,
} from 'query/hooks';
import { bankKeys } from 'query/hooks/useBank';
import { queryClient } from 'query/queryClient';
import { useStateStablecoin } from 'hooks/useStateStablecoin';
import { useTransactionLimit } from 'hooks/useTransactionLimit';
import TransactionLimitMeter from '@new-ui/components/common-components/TransactionLimitMeter';
import { coinmeTransactionLimitsKeys } from 'query/hooks/useCoinmeTransactionLimits';
import { showError, getApiErrorMessage } from 'utils/toast';
import type { FundingSource } from './enterAmount.types';
import { useEnterAmountState } from './useEnterAmountState';
import RecipientHeader from './RecipientHeader';
import AmountInput from './AmountInput';
import SendingAssetRow from './SendingAssetRow';
import PayButton from './PayButton';
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
  useApplyDefaultPaymentMethod,
} from '@new-ui/components/common-components/AddBalance';
import Button from '@new-ui/components/common-components/layout/Button';
import type { AddedCardResult } from '@new-ui/components/common-components/AddBalance/AddDebitCardModal';
import { usePaymentMethodsList, type PaymentMethodItem } from 'query/hooks/usePaymentMethods';
import CashBuyWalletAndSummary from './CashBuyWalletAndSummary';
import RequestDetailsSheet from './RequestDetailsSheet';
import { useCreateCryptoRequest } from 'query/hooks/useCryptoRequest';
import { getCryptoRequestError } from 'query/hooks/cryptoRequest.types';
import { showSuccess } from 'utils/toast';

const COINME_DEFAULTS = {
  paymentMethodId: 'uhygtfr5e354rtyu76g6b7i8',
  sourceWalletAddress: ',mu9n7777777545e5vr',
};

// Sell keeps a 2% buffer of the balance so the fee always fits — the max the user may
// enter is balance × this fraction. Client-side input guard only; real fee = quote.
const SELL_WITHDRAW_MAX_FRACTION = 0.98;

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
    preselectedAsset,
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
  const { mutate: createCryptoRequest, isPending: isCreatingRequest } = useCreateCryptoRequest();
  const isTradeMode =
    (tradeMode === 'buy' || tradeMode === 'sell') &&
    !!cryptoAsset &&
    typeof cryptoAsset === 'object';
  const isCryptoSendMode = type === 'send' && !tradeMode;
  // Dashboard "plain send" (no coin preselected): present it as a normal USD send —
  // hide the asset chip, the USD⇄crypto swap, and Max, and show a USD-only receipt.
  // A send opened from a coin's details page (preselectedAsset set) keeps every
  // crypto affordance. UI-only: the payload/amount math are unchanged.
  const isFiatStyleSend = isCryptoSendMode && !preselectedAsset;
  // Registered-state stablecoin (TX → DAI, others → USDC): the default crypto-send source.
  const stateStablecoin = useStateStablecoin();
  const tradeAssetSymbol = String(cryptoAsset?.asset || '').toUpperCase();
  const tradePriceUSD = Number(cryptoAsset?.currentPrice ?? 0);

  const [isPaying, setIsPaying] = useState(false);
  const [showCryptoReceiptModal, setShowCryptoReceiptModal] = useState(false);
  const [requestSheetVisible, setRequestSheetVisible] = useState(false);
  const cryptoPaymentRef = useRef<CryptoReceiptDraft | null>(null);
  const [debitInfoVisible, setDebitInfoVisible] = useState(false);
  const [addCardVisible, setAddCardVisible] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodItem | null>(
    null
  );
  const [tradePaymentRail, setTradePaymentRail] = useState<'debit' | 'retail_cash'>('debit');
  const paymentMethodsQuery = usePaymentMethodsList(20);

  // Pre-select the user's default card (frontend-only) for trade (buy/sell) — plain P2P
  // send has no card, so it's disabled there.
  useApplyDefaultPaymentMethod({
    items: paymentMethodsQuery.data?.data?.items ?? [],
    flow: tradeMode === 'sell' ? 'sell' : 'buy',
    selected: selectedPaymentMethod,
    onSelect: setSelectedPaymentMethod,
    enabled: isTradeMode,
  });

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

  // Only consider Payairo \"main\" bank accounts as funding sources.
  const mainBanks = useMemo(() => {
    if (!Array.isArray(bankLists)) return [];
    const mains = bankLists.filter(
      (bank: any) => String(bank?.account_type ?? '').toLowerCase() === 'main'
    );
    if (mains.length > 0) return mains;
    return bankLists.length > 0 ? [bankLists[0]] : [];
  }, [bankLists]);

  const cryptoSources = useMemo<CryptoFundingItem[]>(() => {
    if (!Array.isArray(allCryptoBalances)) return [];
    const list = allCryptoBalances as CryptoFundingItem[];
    return list.filter((item) => item?.asset !== 'Bank Balance');
  }, [allCryptoBalances]);


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

  // The coin this send transacts in — chosen by how the user got here, never by them.
  const sendIntendedSymbol = isCryptoSendMode
    ? String(preselectedAsset?.asset ?? '').toUpperCase() || stateStablecoin
    : '';
  // The general market list is state-filtered per user by the backend and can HIDE
  // USDC/DAI — fetch the intended coin explicitly (`?currencies=`), which bypasses
  // the filter, and take held balances straight from the balance API.
  const { data: sendMarketRows = [] } = useCryptoMarketForCurrency(
    sendIntendedSymbol || null,
    'USD'
  );
  const { data: sendBalanceRows = [] } = useUserCryptoBalanceFastApi();

  const cryptoSendInitialSource = useMemo<FundingSource | null>(() => {
    if (!isCryptoSendMode) return null;

    // The asset is decided by how the user got here and is NOT theirs to change:
    // the coin they opened Send from (e.g. tapped ETH → Send on its details page),
    // otherwise the registered-state stablecoin (TX → DAI, others → USDC).
    const preselectedSymbol = String(preselectedAsset?.asset ?? '').toUpperCase();
    const intendedSymbol = preselectedSymbol || stateStablecoin;
    if (!intendedSymbol) return null;

    const item = Array.isArray(cryptoSources)
      ? cryptoSources.find(
          (c) => String(c.asset ?? '').toUpperCase() === intendedSymbol
        )
      : undefined;

    if (!item) {
      // Not in the general list (state filter hides the coin): price it via the
      // explicit `?currencies=` row and pair it with the balance-API holding.
      const marketRow = sendMarketRows.find(
        (m) => String(m.asset ?? '').toUpperCase() === intendedSymbol
      );
      const directPrice = Number(marketRow?.usd_price ?? 0);
      if (marketRow && directPrice > 0) {
        const balRow = sendBalanceRows.find(
          (r) => String(r.currencySymbol ?? '').toUpperCase() === intendedSymbol
        );
        const qty = Number(balRow?.balance ?? 0);
        const safeQty = Number.isFinite(qty) ? Math.max(0, qty) : 0;
        // Price this holding the SAME way its balance was valued for display, rather than at
        // market spot. The balance API returns both the token quantity and its USD value, and
        // those must agree with what validation enforces — otherwise the user is shown a
        // dollar balance that spot pricing then says they cannot afford to send.
        const balUsd = Number(balRow?.estimatedBalanceValue ?? 0);
        const balDerivedPrice = safeQty > 0 && balUsd > 0 ? balUsd / safeQty : 0;
        return {
          id: `crypto-${intendedSymbol}`,
          name: intendedSymbol,
          balance: safeQty,
          type: 'crypto',
          cryptoMeta: {
            symbol: intendedSymbol,
            network: String(preselectedAsset?.chain ?? intendedSymbol).toUpperCase(),
            priceUSD: balDerivedPrice > 0 ? balDerivedPrice : directPrice,
            maxAssetBalance: safeQty,
            logo: marketRow.logo ?? preselectedAsset?.logo,
          },
        };
      }

      // Never substitute a different coin. With no selector on this screen the user
      // couldn't correct it, and they'd send the wrong asset. If the details screen
      // handed us the asset we can still show it (balance 0 → validateCrypto blocks
      // with "Insufficient balance"); otherwise render nothing rather than guess.
      const fallbackPrice = Number(preselectedAsset?.currentPrice ?? 0);
      if (!preselectedSymbol || !(fallbackPrice > 0)) return null;
      const fallbackBalance = Number(preselectedAsset?.platformAvailable ?? 0);
      const safeBalance = Number.isFinite(fallbackBalance) ? Math.max(0, fallbackBalance) : 0;
      return {
        id: `crypto-${preselectedSymbol}`,
        name: preselectedSymbol,
        balance: safeBalance,
        type: 'crypto',
        cryptoMeta: {
          symbol: preselectedSymbol,
          network: String(preselectedAsset?.chain ?? preselectedSymbol).toUpperCase(),
          priceUSD: fallbackPrice,
          maxAssetBalance: safeBalance,
          logo: preselectedAsset?.logo,
        },
      };
    }

    const symbol = String(item.asset || 'CRYPTO').toUpperCase();
    const maxAssetBalance = Number(item.platform_available ?? item.rounded_balance ?? 0);
    const maxUsdBalance = Number(item.usd_value_available ?? item.usd_value_total ?? 0);
    const rawPrice = Number(item.usd_price ?? 0);
    const derivedPrice = maxAssetBalance > 0 && maxUsdBalance > 0 ? maxUsdBalance / maxAssetBalance : 0;
    // Prefer the price implied by this holding's own USD valuation over market spot. Spot is a
    // second, slightly different price for the same coin, and mixing the two means the balance
    // shown to the user converts back to MORE tokens than they hold — so entering the balance
    // they were just shown fails as "insufficient". One price, used for both, keeps them equal.
    const priceUSD = derivedPrice > 0 ? derivedPrice : rawPrice;

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
  }, [
    cryptoSources,
    isCryptoSendMode,
    stateStablecoin,
    preselectedAsset,
    sendMarketRows,
    sendBalanceRows,
  ]);

  const initialSelectedSource = useMemo(() => {
    if (tradeFundingSource) return tradeFundingSource;
    if (cryptoSendInitialSource) return cryptoSendInitialSource;
    // A crypto send must NEVER fall back to a bank source. On a cold start the
    // market/balances queries may not have resolved yet; seeding a bank here won the
    // race and permanently locked the screen into the legacy fiat branch (the
    // "Select Payment Method" UI users saw on fresh installs). Stay null — the
    // useEnterAmountState effect fills the source in once the crypto list arrives.
    if (isCryptoSendMode) return null;
    // Request/requested (fiat) flows still default to the first main Payairo bank.
    if (mainBanks.length > 0) {
      return convertToFundingSource(mainBanks[0]);
    }
    return null;
  }, [convertToFundingSource, cryptoSendInitialSource, isCryptoSendMode, mainBanks, tradeFundingSource]);

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
    maxInputLength,
    feePercent,
    fillMax,
    assetAmount,
    validateCrypto,
    onChangeAmountText,
    toggleInputMode,
  } = useEnterAmountState({
    initialSelectedSource,
    initialInputValue: requestedInitialInputValue,
    // Always start in USD entry — including crypto-send, which used to default
    // to asset (crypto) amount entry. Users can still toggle to crypto via the
    // header's ↻ button or by picking a different funding source.
    initialInputMode: 'fiat',
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

  // Coinme buy/sell limits apply to trade mode only — a P2P crypto send has none.
  // The hook must run unconditionally, so it's fed a safe default outside trade mode
  // and its result is gated by `isTradeMode` below.
  const tradeLimit = useTransactionLimit(
    tradeMode === 'sell' ? 'sell' : 'buy',
    tradePaymentRail === 'retail_cash' ? 'cash' : 'debit'
  );
  const limitError = isTradeMode ? tradeLimit.validate(amount) : null;

  // SELL only: keep a 2% buffer in the wallet so the fee fits — never let the user
  // enter more than balance − 2% (else the quote fails on a full-balance sell).
  const isSell = isTradeMode && tradeMode === 'sell';
  const maxSpendableUsd = useMemo(
    () => (maxUsd > 0 ? Math.floor(maxUsd * SELL_WITHDRAW_MAX_FRACTION * 100) / 100 : 0),
    [maxUsd]
  );
  const sellBalanceError =
    isSell && maxSpendableUsd > 0 && amount > maxSpendableUsd + 0.005
      ? `You can Instant withdraw up to $${maxSpendableUsd.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} after the withdrawal fee is applied.`
      : null;

  const handleUseMaxLimit = useCallback(() => {
    const fillTarget =
      isSell && maxSpendableUsd > 0
        ? Math.min(tradeLimit.effectiveMaxUsd, maxSpendableUsd)
        : tradeLimit.effectiveMaxUsd;
    onChangeAmountText(String(fillTarget));
  }, [isSell, maxSpendableUsd, onChangeAmountText, tradeLimit.effectiveMaxUsd]);

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

  // Expected fee shown in the summary modal — trade (buy/sell) only, fetched while the
  // receipt modal is open. Plain P2P crypto send has no quote, so no fee row there.
  // Declared here (above handleTradeExecute) so the sell execute can net it out.
  const tradeQuoteEnabled = showCryptoReceiptModal && isTradeMode && amount > 0;
  const {
    data: tradeQuoteData,
    isLoading: isTradeQuoteLoading,
    isError: isTradeQuoteError,
    error: tradeQuoteError,
  } = useCoinmeTradeQuote(
    {
      tradeType: tradeMode === 'sell' ? 'sell' : 'buy',
      chain: String(cryptoAsset?.chain || 'ETH').toUpperCase(),
      cryptoCurrencyCode: String(cryptoAsset?.asset || '').toUpperCase(),
      fiatCurrencyCode: String(cryptoAsset?.fiatCurrency || 'USD').toUpperCase(),
      amountValue: String(inputMode === 'fiat' ? amount : assetAmount),
      amountCurrencyCode:
        inputMode === 'fiat'
          ? String(cryptoAsset?.fiatCurrency || 'USD').toUpperCase()
          : String(cryptoAsset?.asset || '').toUpperCase(),
    },
    tradeQuoteEnabled
  );
  const tradeExpectedFee = isTradeMode ? getExpectedFeeUsd(tradeQuoteData?.feeBreakdown) : null;

  // Surface the quote's own failure (e.g. insufficient balance) as a toast, deduped
  // by message so it fires once per distinct error rather than on every re-render.
  const lastTradeQuoteErrorToast = useRef<string | null>(null);
  useEffect(() => {
    if (!isTradeQuoteError || !tradeQuoteError) {
      lastTradeQuoteErrorToast.current = null;
      return;
    }
    const msg = getCoinmeTradeQuoteErrorMessage(tradeQuoteError);
    if (lastTradeQuoteErrorToast.current === msg) return;
    lastTradeQuoteErrorToast.current = msg;
    showError('Something went wrong', msg);
  }, [isTradeQuoteError, tradeQuoteError]);
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
      showError('Missing details', 'Crypto details are missing. Please try again.');
      return;
    }
    const wallet = String(cryptoAsset?.sourceWalletAddress ?? '').trim();
    if (!wallet) {
      showError('Wallet address required', 'Go back to the asset screen and try again.');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      showError('Invalid amount', 'Please enter a valid amount.');
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
      showError('Session expired', 'Please try again.');
      return;
    }
    const { amount: sendAmount, recipient_identifier: sendRecipient } = pending;
    const numericAmount = Number(sendAmount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      showError('Invalid amount', 'Please enter a valid amount.');
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
          const failMsg =
            data?.data?.data?.error ||
            'Custodial account is suspended or Level 2 KYC is pending.';
          navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT as never, {
            isLoading: false,
            transactionData: data,
            isSuccess: false,
            isError: true,
            errorMessage: failMsg,
          } as never);
          showError('Payment blocked', failMsg);
        }
      },
      onError: (error: unknown) => {
        console.log('error =>', JSON.stringify(error, null, 2));
        const failMsg = getApiErrorMessage(error, 'Something went wrong. Please try again.');
        navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT as never, {
          isLoading: false,
          transactionData: null,
          isSuccess: false,
          isError: true,
          errorMessage: failMsg,
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
      showError('Invalid amount', 'Please enter a valid amount.');
      return;
    }

    if (transactionAmount > 100000) {
      showError('Amount too high', 'Amount cannot exceed ₹1,00,000.');
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
          const failMsg = data?.message || 'Already have pending request with this account';
          navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT as never, {
            isLoading: false,
            transactionData: data,
            isSuccess: false,
            isError: true,
            errorMessage: failMsg,
          } as never);

          showError(failMsg);
        }
      },
      onError: (error: unknown) => {
        console.log('Payment request error:', error);
        const failMsg = 'You already have a pending request with this account.';
        navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT as never, {
          isLoading: false,
          transactionData: null,
          isSuccess: false,
          isError: true,
          errorMessage: failMsg,
        } as never);
        showError("Couldn't send request", failMsg);
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
      showError('Session expired', 'Please try again.');
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
          const failMsg = data?.message || 'Insufficient balance or something went wrong.';
          navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT as never, {
            isLoading: false,
            transactionData: data,
            isSuccess: false,
            isError: true,
            errorMessage: failMsg,
          } as never);
          showError('Payment failed', failMsg);
        }
      },
      onError: (error: unknown) => {
        console.log('Pay request error:', JSON.stringify(error, null, 2));
        const failMsg = getApiErrorMessage(error, 'Insufficient balance or something went wrong.');
        navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT as never, {
          isLoading: false,
          transactionData: null,
          isSuccess: false,
          isError: true,
          errorMessage: failMsg,
        } as never);
        showError('Payment failed', failMsg);
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
      showError('Session expired', 'Please try again.');
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
          const failMsg = getApiErrorMessage(error, 'Something went wrong while sending crypto.');
          navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT as never, {
            isLoading: false,
            transactionData: null,
            isSuccess: false,
            isError: true,
            errorMessage: failMsg,
          } as never);
          cryptoPaymentRef.current = null;
          showError('Transfer failed', failMsg);
        },
        onSettled: () => {
          setIsPaying(false);
        },
      }
    );
  }, [handleCryptoTransfer, navigation, queryClient, showError]);

  const handleCryptoSendViaPaymentTransaction = useCallback(() => {
    if (!selectedSource?.cryptoMeta) {
      showError('Select an asset', 'Please choose a crypto asset to continue.');
      return;
    }

    const symbol = selectedSource.cryptoMeta.symbol;
    const chain = selectedSource.cryptoMeta.network || symbol;
    // Never send more than the real balance: a Max amount round-tripped through USD can
    // land a hair above the balance from display rounding — clamp it to the actual max.
    const sendAsset = maxAsset > 0 ? Math.min(assetAmount, maxAsset) : assetAmount;
    const amountStr = String(sendAsset.toFixed(8)).replace(/\.?0+$/, '') || '0';

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
        const failMsg = (data as any)?.message || 'Please try again.';
        navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT as never, {
          isLoading: false, transactionData: data, isSuccess: !!ok, isError: !ok,
          ...(ok ? {} : { errorMessage: failMsg }),
        } as never);
        if (!ok) showError('Transaction failed', failMsg);
      },
      onError: (error: unknown) => {
        const failMsg = getApiErrorMessage(error, 'Please try again.');
        navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT as never, {
          isLoading: false, transactionData: null, isSuccess: false, isError: true,
          errorMessage: failMsg,
        } as never);
        showError('Transaction failed', failMsg);
      },
    });
  }, [
    assetAmount,
    maxAsset,
    navigation,
    queryClient,
    recipient_identifier,
    recipientUserId,
    selectedSource,
    sendPaymentTransaction,
    showError,
  ]);

  // --- Crypto Request (P2P) ----------------------------------------------
  // A request can only target a verified Payairo user (not a raw wallet
  // address), and only makes sense for a crypto asset source.
  const canRequest =
    isCryptoSendMode && isCryptoMode && !!recipientUserId && !!selectedSource?.cryptoMeta;

  const handleRequestPress = useCallback(() => {
    requireEmailVerified(() => {
      if (!selectedSource?.cryptoMeta) {
        showError('Select an asset', 'Please choose a crypto asset to continue.');
        return;
      }
      if (!(assetAmount > 0)) {
        showError('Enter an amount', 'Please enter an amount to request.');
        return;
      }
      setRequestSheetVisible(true);
    });
  }, [assetAmount, requireEmailVerified, selectedSource, showError]);

  const handleCreateRequest = useCallback(
    (values: { note?: string; expiresAt?: string }) => {
      if (!selectedSource?.cryptoMeta) {
        showError('Select an asset', 'Please choose a crypto asset to continue.');
        return;
      }
      const symbol = selectedSource.cryptoMeta.symbol;
      const chain = selectedSource.cryptoMeta.network || symbol;
      const amountStr = String(assetAmount.toFixed(8)).replace(/\.?0+$/, '') || '0';

      createCryptoRequest(
        {
          recipient: recipient_identifier || recipientUserId || '',
          amount: amountStr,
          currency: symbol,
          chain,
          note: values.note,
          expiresAt: values.expiresAt,
        },
        {
          onSuccess: (data) => {
            setRequestSheetVisible(false);
            const request = data?.data?.request;
            const targetName =
              request?.requestedFrom?.firstName ||
              selectedContact?.nickname ||
              recipient_identifier ||
              'them';
            showSuccess('Request sent', `Your request was sent to ${targetName}.`);
            navigation.navigate(
              NAVIGATION_SCREENS.NEW_CRYPTO_REQUEST_DETAIL as never,
              { id: request?.id ?? 0, request } as never
            );
          },
          onError: (error: unknown) => {
            const { message } = getCryptoRequestError(error);
            showError("Couldn't send request", message);
          },
        }
      );
    },
    [
      assetAmount,
      createCryptoRequest,
      navigation,
      recipient_identifier,
      recipientUserId,
      selectedContact,
      selectedSource,
      showError,
    ]
  );

  const handleTradeExecute = useCallback(async () => {
    if (!isTradeMode || !cryptoAsset) return;
    if (!coinmeAccountId) {
      showError(
        'Account not ready',
        'Please complete onboarding and try again.'
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
      // Send the entered amount as-is (both buy and sell). The wallet keeps a 2%
      // buffer at entry time so the backend can auto-deduct the fee on top.
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
      // This trade consumed part of the daily/monthly allowance — refresh the meter.
      queryClient.invalidateQueries({ queryKey: coinmeTransactionLimitsKeys.all });

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
      showError('Transaction failed', errorMessage);
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
    // Crypto send with no source yet (balances still loading, or the stablecoin is
    // missing from the market list): without this guard a null source reads as
    // viewMode 'fiat' and drops into the legacy path that demands a payment method.
    if (isCryptoSendMode && !selectedSource) {
      showError('Still loading', 'Fetching your balance — please try again in a moment.');
      return;
    }
    if (!isCryptoMode) {
      if (type === 'requested') {
        if (!requestId) {
          showError('Session expired', 'Please try again.');
          return;
        }
        requestPaymentVerification(handleActionsAfterPinVerified);
        return;
      }

      if (!selectedPaymentMethod) {
        showError('Select a payment method', 'Please choose how you want to pay.');
        return;
      }
      if (!recipient_identifier) {
        showError('Recipient missing', 'Please choose who to pay.');
        return;
      }
      if (amount <= 0) {
        showError('Invalid amount', 'Please enter a valid amount.');
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
        showError('Invalid amount', 'Please enter a valid amount.');
        return;
      }
      if (inputMode === 'asset' && assetAmount <= 0) {
        showError('Invalid amount', 'Please enter a valid amount.');
        return;
      }
      // Shown inline by the meter; this guard covers any other path to Pay.
      // No-op when limits are unavailable (validate → null).
      if (limitError) {
        showError('Limit reached', limitError);
        return;
      }
      // Sell: enforce the 2% balance buffer (guards any path to Pay).
      if (sellBalanceError) {
        showError('Amount too high', sellBalanceError);
        return;
      }
      if (tradePaymentRail === 'retail_cash') {
        return;
      }
      if (!selectedPaymentMethod) {
        showError('Select a payment method', 'Please choose how you want to pay.');
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
        console.log('errors =>', errors);
        showError('Please check the form', errors[0]);
        return;
      }
    }

    if (!selectedSource?.cryptoMeta) {
      showError('Select an asset', 'Please choose a crypto asset to continue.');
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
    isCryptoSendMode,
    isTradeMode,
    inputMode,
    limitError,
    sellBalanceError,
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
        {/* Scrollable instead of a rigid flex split: iOS's KeyboardAvoidingView "padding"
            behavior isn't reliable enough on its own in nested layouts like this one — when
            its push falls short, a fixed (non-scrolling) layout has no fallback, so content
            overflows (the funding row painting over the "Max:" pill) and the Request button
            ends up under the keyboard. AmountInput autoFocuses, so the keyboard is up from
            mount and this is the default state, not an edge case. The flex spacer below keeps
            the bottom block pinned low when there's slack (keyboard closed). */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
         <View style={styles.header}>
          <AppIcon.ArrowLeft
            width={25}
            height={25}
            onPress={() => navigation.goBack()}
            style={{ marginRight:isCryptoMode && !isFiatStyleSend ? 45 : 0}}
          />

          <View style={styles.headerTitleContainer}>
            <CustomText variant='h1' fontWeight='bold' size={20}>Enter Amount</CustomText>
          </View>

          {isCryptoMode && !isFiatStyleSend ? (
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
            maxLength={maxInputLength}
          />

          {isCryptoMode && !isFiatStyleSend ? (
            <View style={styles.cryptoModeContainer}>
              {!isTradeMode ? (
                <TouchableOpacity style={styles.cryptoMaxContainer} activeOpacity={0.9} onPress={fillMax}>
                  <CustomText variant="caption" style={styles.cryptoMaxText}>
                    Available balance:{' '}
                    {inputMode === 'asset'
                      ? `${maxAsset.toFixed(8).replace(/\.?0+$/, '') || '0'} ${assetSymbol}`
                      : `$${maxUsd.toFixed(2)}`}
                  </CustomText>
                </TouchableOpacity>
              ) : (
                <TransactionLimitMeter
                  style={styles.limitMeterSpacer}
                  limit={tradeLimit}
                  amountUsd={amount}
                  error={limitError || sellBalanceError}
                  // The limit is a USD figure — only offer to fill it during USD
                  // entry, else it would land in the input as a crypto amount.
                  onUseMax={inputMode === 'fiat' ? handleUseMaxLimit : undefined}
                />
              )}

              {/* <CustomText variant="caption" style={styles.cryptoEquivalentText}>
                {inputMode === 'asset'
                  ? `~$${Number(displayFiatEquivalent || 0).toFixed(2)}`
                  : `~${Number(displayAssetEquivalent || 0).toFixed(6)} ${assetSymbol}`}
              </CustomText> */}
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

        <View style={{ flex: 1 }} />

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
                title={tradePaymentRail === 'retail_cash' ? 'Cash' : 'Select Payment Method'}
                maskedDetail={paymentSubtitle}
                onPress={openDebitPaymentPicker}
              />
            ) 
            : isCryptoSendMode ? (
              // Keyed off the FLOW (not viewMode): while the crypto source is still
              // loading, viewMode reads 'fiat' and the old condition dropped a send
              // into the legacy debit-card row below. A send shows its asset chip
              // (crypto-details flow) or nothing (plain USD send / still loading).
              isFiatStyleSend || !selectedSource ? null : (
                <SendingAssetRow
                  symbol={assetSymbol}
                  logo={selectedSource?.cryptoMeta?.logo}
                />
              )
            )
            : (
              <DebitCardPaymentRow
                title="Select Payment Method"
                maskedDetail={paymentSubtitle}
                onPress={openDebitPaymentPicker}
              />
            )}
            {!isTradeMode || tradePaymentRail === 'debit' ? (
              <PayButton
                disabled={
                  isPaying ||
                  isSendingPaymentTx ||
                  !!limitError ||
                  !!sellBalanceError ||
                  // Crypto send: disabled until the funding source resolves.
                  (isCryptoSendMode && !selectedSource)
                }
                onPress={handlePayPress}
              />
            ) : null}
            {canRequest ? (
              <Button
                color={theme.colors.white}
                style={[styles.payButton, styles.requestButton]}
                textStyle={{ color: theme.colors.primary }}
                onPress={handleRequestPress}
                disabled={isCreatingRequest}
              >
                Request
              </Button>
            ) : null}
            {isTradeMode && tradePaymentRail === 'retail_cash' ? (
              <Button
                onPress={handleFindCashLocation}
                style={styles.payButton}
                disabled={
                  !cashBuyWalletAddress ||
                  !Number.isFinite(amount) ||
                  amount <= 0 ||
                  !!limitError ||
                  !!sellBalanceError
                }
              >
                Find a Location
              </Button>
            ) : null}
          </View>
        </View>
        </ScrollView>

        {/* Modals stay outside the ScrollView — they overlay the whole screen. */}
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
          variant={isFiatStyleSend ? 'fiatOnly' : 'full'}
          tokenSymbol={assetSymbol}
          tokenAmount={assetAmount}
          priceUSD={selectedSource?.cryptoMeta?.priceUSD ?? tradePriceUSD ?? 0}
          usdAmount={amount}
          expectedFee={tradeExpectedFee}
          expectedFeeLoading={tradeQuoteEnabled && isTradeQuoteLoading}
          feeLabel={isTradeMode && tradeMode === 'sell' ? 'Expected Instant Withdrawal Fee' : 'Expected Fee'}
          totalLabel={
            isTradeMode
              ? tradeMode === 'sell'
                ? 'Total'
                : 'Expected Tokens Received'
              : 'Total'
          }
          addFeeToTotal={isTradeMode && tradeMode === 'sell'}
        />

        <RequestDetailsSheet
          visible={requestSheetVisible}
          loading={isCreatingRequest}
          summary={
            selectedSource?.cryptoMeta
              ? `Request ${String(assetAmount.toFixed(8)).replace(/\.?0+$/, '') || '0'} ${selectedSource.cryptoMeta.symbol} from ${
                  selectedContact?.nickname || recipient_identifier || 'them'
                }`
              : undefined
          }
          onClose={() => setRequestSheetVisible(false)}
          onConfirm={handleCreateRequest}
        />
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default EnterAmount;


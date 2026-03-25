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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '@new-ui/components/common-components/ScreenWrapper';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { enterAmountStyles } from '@new-ui/styles/screens/send/enterAmountStyles';
import { IEnterAmountProps } from '../Send/types';
import useSelectorAction from 'hooks/useSelectorAction';
import { useAppLock } from 'hooks/useAppLock';
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants';
import {
  cryptoKeys,
  useCreatePaymentRequest,
  useCryptoTransfer,
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

  const { recipient_identifier, type, selectedContact, request_data } =
    route.params || ({} as any);
  console.log("route.params =>", JSON.stringify(route.params, null, 2));

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

  const selectorData = useSelectorAction() as any;
  const { bankLists, walletData, allCryptoBalances } = selectorData;
  // console.log("walletData =>", JSON.stringify(walletData, null, 2));
  // console.log("bankLists =>", JSON.stringify(bankLists, null, 2));

  const { requestPaymentVerification } = useAppLock();
  const { mutate: handleUserToUserTransfer } = useUserToUserTransfer() as any;
  const { mutate: handleCryptoTransfer } = useCryptoTransfer() as any;
  const { mutate: createPaymentRequest } = useCreatePaymentRequest();
  const { mutate: payPaymentRequest } = usePayPaymentRequest();

  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [showCryptoReceiptModal, setShowCryptoReceiptModal] = useState(false);
  const cryptoPaymentRef = useRef<CryptoReceiptDraft | null>(null);

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const convertToFundingSource = useCallback((bankLike: any): FundingSource | null => {
    if (!bankLike || typeof bankLike !== 'object') return null;

    const idRaw =
      bankLike.id ??
      bankLike.guid ??
      bankLike.account_guid ??
      bankLike.account_number ??
      bankLike.accountId ??
      '';
    const id = String(idRaw ?? '').trim();
    if (!id) return null;

    const name =
      bankLike.name ??
      bankLike.bank_name ??
      bankLike.bankName ??
      bankLike.account_holder ??
      'Bank';

    const balanceRaw =
      bankLike.balances?.available ??
      bankLike.balances?.available_usd ??
      bankLike.balance ??
      0;
    const balance = typeof balanceRaw === 'number' ? balanceRaw : Number(balanceRaw ?? 0);
    const safeBalance = Number.isFinite(balance) ? balance : 0;

    const accountNumber = bankLike.account_number ?? bankLike.accountId ?? id;
    return {
      id,
      name: String(name),
      balance: safeBalance,
      type: 'bank',
      // bank_type: bankLike.bank_type,
      // account_type: bankLike.account_type,
      // account_number: String(accountNumber ?? id),
      // raw: bankLike,
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
  const mainBanks = useMemo(
    () =>
      Array.isArray(bankLists)
        ? bankLists.filter((bank: any) => bank?.account_type === 'main')
        : [],
    [bankLists]
  );

  const sources = useMemo(() => {
    return mainBanks
      .map((b: any) => convertToFundingSource(b))
      .filter(Boolean) as FundingSource[];
  }, [convertToFundingSource, mainBanks]);

  const cryptoSources = useMemo<CryptoFundingItem[]>(() => {
    if (!Array.isArray(allCryptoBalances)) return [];
    // allCryptoBalances also contains a synthetic "Bank Balance" row; crypto selection should only show real assets.
    return allCryptoBalances.filter((item: CryptoFundingItem) => item?.asset !== 'Bank Balance');
  }, [allCryptoBalances]);

  // For request/requested flows, show only fiat/bank funding sources in the selector.
  const cryptoSourcesForModal = useMemo<CryptoFundingItem[]>(() => {
    const shouldHideCrypto = type === 'request' || type === 'requested';
    return shouldHideCrypto ? [] : cryptoSources;
  }, [cryptoSources, type]);

  const transactionFeePercent = useMemo(() => {
    const raw = walletData?.TransactionFees_persentage;
    const n = typeof raw === 'string' ? parseFloat(raw) : Number(raw);
    return Number.isFinite(n) ? n : 0;
  }, [walletData?.TransactionFees_persentage]);

  const initialSelectedSource = useMemo(() => {
    // For now we always default to the first main Payairo bank, if available.
    if (mainBanks.length > 0) {
      return convertToFundingSource(mainBanks[0]);
    }
    return null;
  }, [convertToFundingSource, mainBanks]);

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
  const leftPrefix = isCryptoMode && inputMode === 'asset' ? '' : '$';
  const rightSuffix = isCryptoMode && inputMode === 'asset' ? assetSymbol : '';

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
    navigation.navigate(NAVIGATION_SCREENS.OTP_SCREEN, {
      onOTPVerified: handleActionsAfterOTPVerified,
      transactionType: isCryptoMode ? 'crypto_send' : type,
    });
  }, [handleActionsAfterOTPVerified, isCryptoMode, navigation, type]);


  const handlePayPress = useCallback(() => {
    if (!isCryptoMode) {
      if (type === 'requested') {
        if (!requestId) {
          showError('Session expired. Please try again.');
          return;
        }
        requestPaymentVerification(handleActionsAfterPinVerified);
        return;
      }

      if (!selectedSource) {
        showError('Please select a bank account');
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

    const errors = validateCrypto();
    if (errors.length > 0) {
      showError(errors[0]);
      return;
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
    requestId,
    type,
    selectedSource,
    recipient_identifier,
    requestPaymentVerification,
    selectedSource?.cryptoMeta,
    showError,
    validateCrypto,
    handleActionsAfterPinVerified,
  ]);


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

              <TouchableOpacity style={styles.cryptoMaxContainer} activeOpacity={0.9} onPress={fillMax}>
                <CustomText variant="caption" style={styles.cryptoMaxText}>
                  Max: {maxAsset.toFixed(maxAsset >= 1 ? 4 : 8)} {assetSymbol} ~$
                  {maxUsd.toFixed(2)}
                </CustomText>
              </TouchableOpacity>

              <CustomText variant="caption" style={styles.cryptoEquivalentText}>
                {inputMode === 'asset'
                  ? `~$${Number(displayFiatEquivalent || 0).toFixed(2)}`
                  : `~${Number(displayAssetEquivalent || 0).toFixed(6)} ${assetSymbol}`}
              </CustomText>
            </View>
          ) : null}

        </View>

        <View style={[styles.bottomArea,]}>
          <View style={{ width: '80%' }}>
            <FundingSourceCard
              source={selectedSource}
              onPress={handlePressFundingSource}
            />
          </View>
          <PayButton disabled={isPaying} onPress={handlePayPress} />
        </View>

        {isSelectorOpen ? (
          <FundingSourceSelectorModal
            sources={sources}
            cryptoSources={cryptoSourcesForModal}
            selectedSource={selectedSource}
            onSelect={(source) => setSelectedSource(source)}
            onClose={() => setIsSelectorOpen(false)}
          />
        ) : null}

        <CryptoReceiptModal
          visible={showCryptoReceiptModal}
          onClose={() => setShowCryptoReceiptModal(false)}
          onPayNow={() => {
            setShowCryptoReceiptModal(false);
            requestPaymentVerification(handleActionsAfterPinVerified);
          }}
          tokenSymbol={assetSymbol}
          tokenAmount={assetAmount}
          priceUSD={selectedSource?.cryptoMeta?.priceUSD ?? 0}
          usdAmount={amount}
          feePercent={feePercent}
        />
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default EnterAmount;


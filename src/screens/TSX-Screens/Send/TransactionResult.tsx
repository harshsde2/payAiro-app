import { useNavigation, useRoute, CommonActions } from "@react-navigation/native";
import GenericButton from "components/GenericButton";
import HeaderTitle from "components/HeaderTitle";
import LottieView from "lottie-react-native";
import { LOTTIE_APP_LOADER, TRANSACTION_FAILED_LOTTIE, TRANSACTION_SUCCESS } from "lottie/lottie";
import moment from "moment";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { Button } from "new-ui/components/common-components/layout";
import React, { FC, useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  BackHandler
} from "react-native";
import { Theme, useTheme } from "styles";
import { useGlobalStyles } from "styles/GlobalStyles";
// import { CustomText } from "tsx-components";
import CustomText from "@new-ui/components/common-components/CustomText";
import { useTheme as useNewTheme } from "@new-ui/styles/ThemeContext";


interface TransactionData {
  id: number;
  sender_wallet_public_key?: string;
  recipient_wallet_public_key?: string;
  sender?: string; // For crypto transactions
  recipient?: string; // For crypto transactions
  sender_username: string;
  recipient_username: string;
  trade_id: string;
  from_currency: string;
  to_currency: string;
  network: string;
  transaction_id: string;
  amount: string | number;
  asset?: string; // For crypto transactions
  status: string;
  description?: string | null;
  timestamp: string;
  note?: string | null;
  sender_profile_photo?: string | null;
  recipient_profile_photo?: string | null;
  final_amount: string | number;
  Transaction_fee_persentage: string | null;
}

interface TransactionResponse {
  status: boolean;
  message: string;
  data: TransactionData | {
    message?: string;
    transaction: TransactionData;
  };
}

interface RouteParams {
  isLoading: boolean;
  transactionData?: TransactionResponse;
  isSuccess?: boolean;
  isError?: boolean;
  customTitle?: string;
  customDescription?: string;
}

const keyLabels = {
  transaction_id: "Transaction ID",
  trade_id: "Trade ID",
  from_currency: "From Currency",
  to_currency: "To Currency",
  network: "Network",
  timestamp: "Transfer Date",
  sender_username: "Sender",
  recipient_username: "Receiver ID",
  amount: "Amount",
  asset: "Asset",
  status: "Status",
  final_amount: "Final Amount",
  Transaction_fee_persentage: "Transaction Fee",
} as const;

type CoinmeTransactionData = {
  debitCurrencyAmount?: string;
  debitCurrencyCode?: string;
  creditCurrencyAmount?: string;
  creditCurrencyCode?: string;
  debitCurrencyUnitPrice?: string;
  debitCurrencyUnitPriceCode?: string;
  totalFees?: string;
  feeCurrencyCode?: string;
  transactionStatus?: string;
  partnerTransactionId?: string;
};

// ── FastAPI payment-transaction send response ────────────────────────────────
type PaymentTransactionSendData = {
  message?: string;
  data?: {
    transaction?: { partnerTransactionId?: string; transactionStatus?: string };
    paymentTransaction?: {
      id?: number;
      type?: string;           // "internal" | "external"
      status?: string;
      currency?: string;
      chain?: string;
      amount?: string;
      destinationWalletAddress?: string;
      recipientUserId?: string;
      providerTransactionId?: string;
      providerStatus?: string;
      createdAt?: string;
      updatedAt?: string;
    };
  };
  errorResponse?: unknown;
};

const isPaymentTransactionSendResponse = (tx: any): tx is PaymentTransactionSendData =>
  !!(tx && tx.data && tx.data.paymentTransaction);
// ────────────────────────────────────────────────────────────────────────────

type CoinmeTradeResponse = {
  ok?: boolean;
  message?: string;
  data?: {
    quote?: Record<string, any>;
    transaction?: Record<string, any>;
  };
  meta?: {
    tradeType?: "buy" | "sell";
    chain?: string;
    cryptoCurrencyCode?: string;
    fiatCurrencyCode?: string;
    customerId?: string;
    paymentMethodId?: string;
    providerId?: string;
    quoteId?: string;
    webSessionId?: string;
    [k: string]: any;
  };
};

const isCoinmeTradeResponse = (tx: any): tx is CoinmeTradeResponse => {
  return !!(tx && tx.meta && typeof tx.meta.tradeType === "string");
};

const getCoinmeTransactionPayload = (
  tx: CoinmeTradeResponse
): CoinmeTransactionData | null => {
  const raw = tx.data?.transaction;
  if (!raw || typeof raw !== "object") return null;
  const td = (raw as { data?: CoinmeTransactionData }).data ?? (raw as CoinmeTransactionData);
  return td && typeof td === "object" ? td : null;
};

const formatCoinmeAmountPair = (amount?: string, code?: string): string => {
  const a = amount?.trim();
  const c = code?.trim();
  if (!a && !c) return "";
  if (!a) return c || "";
  if (!c) return a;
  return `${a} ${c}`;
};

const formatCoinmeStatus = (status?: string): string => {
  if (!status?.trim()) return "";
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
};

const buildCoinmeDetailRows = (td: CoinmeTransactionData | null) => {
  const rows: { label: string; value: string }[] = [];
  if (!td) return rows;

  const pushIf = (label: string, value: string) => {
    if (!value) return;
    rows.push({ label, value });
  };

  pushIf("Paid", formatCoinmeAmountPair(td.debitCurrencyAmount, td.debitCurrencyCode));
  pushIf(
    "Received",
    formatCoinmeAmountPair(td.creditCurrencyAmount, td.creditCurrencyCode)
  );

  const rate = formatCoinmeAmountPair(
    td.debitCurrencyUnitPrice,
    td.debitCurrencyUnitPriceCode
  );
  if (rate) pushIf("Rate", rate);

  pushIf("Total fees", formatCoinmeAmountPair(td.totalFees, td.feeCurrencyCode));

  const statusLabel = formatCoinmeStatus(td.transactionStatus);
  pushIf("Status", statusLabel);

  pushIf("Reference", td.partnerTransactionId?.trim() || "");

  return rows;
};

const TransactionResult: FC = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { theme: newTheme } = useNewTheme();
  const styles = { ...useGlobalStyles(), ...customStyles(theme) };

  const params = route.params as RouteParams;

  // console.log("params =>", JSON.stringify(params, null, 2));
  const {
    isLoading = true,
    transactionData,
    isSuccess = false,
    isError = false,
    customTitle,
    customDescription
  } = params || {};

  // console.log("transactionData =>", JSON.stringify(transactionData, null, 2));

  const [showLoader, setShowLoader] = useState(isLoading);

  // Handle back button on Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!showLoader) {
        handleClose();
        return true;
      }
      return true; // Prevent back during loading
    });

    return () => backHandler.remove();
  }, [showLoader]);

  // Stop loader when data is available
  useEffect(() => {
    if (transactionData || isSuccess || isError) {
      setShowLoader(false);
    }
  }, [transactionData, isSuccess, isError]);

  const handleClose = () => {
    if (navigation.canGoBack()) {
      navigation.popToTop();
    }
  };

  const isCoinmeTrade = isCoinmeTradeResponse(transactionData);

  const getTransactionStatus = () => {
    if (showLoader) return 'loading';
    // Coinme trade response uses `ok` instead of `status`.
    if (
      transactionData?.status === true ||
      (transactionData as any)?.ok === true ||
      isSuccess
    )
      return 'success';
    if (
      transactionData?.status === false ||
      (transactionData as any)?.ok === false ||
      isError
    )
      return 'failed';
    return 'unknown';
  };

  const renderLottieAnimation = () => {
    const status = getTransactionStatus();

    if (status === 'loading') {
      return (
        <LottieView
          style={styles.lottieAnimation}
          source={LOTTIE_APP_LOADER}
          autoPlay
          loop
        />
      );
    }

    if (status === 'success') {
      return (
        <LottieView
          style={styles.lottieAnimation}
          source={TRANSACTION_SUCCESS}
          autoPlay
          loop={false}
        />
      );
    }

    if (status === 'failed') {
      return (
        <LottieView
          style={styles.lottieAnimation}
          source={TRANSACTION_FAILED_LOTTIE}
          autoPlay
          loop={false}

        />
      );
    }

    return null;
  };

  const renderTitle = () => {
    const status = getTransactionStatus();

    // Use custom title if provided
    if (customTitle) {
      const titleStyle = status === 'success'
        ? [styles.title, styles.successTitle]
        : status === 'failed'
          ? [styles.title, styles.errorTitle]
          : styles.title;

      return (
        <CustomText variant="h3" style={titleStyle}>
          {customTitle}
        </CustomText>
      );
    }

    switch (status) {
      case 'loading':
        return (
          <CustomText variant="h3" fontWeight='semiBold' style={[styles.title]}>
            Processing Transaction
          </CustomText>
        );
      case 'success':
        return (
          <CustomText variant="h3" fontWeight='semiBold' style={[styles.title]} >
            Payment Successful
          </CustomText>
        );
      case 'failed':
        return (
          <CustomText variant="h3" fontWeight='semiBold' style={[styles.title]}>
            Transaction Failed
          </CustomText>
        );
      default:
        return (
          <CustomText variant="h3" fontWeight='semiBold' style={[styles.title]}>
            Transaction Result
          </CustomText>
        );
    }
  };

  const renderDescription = () => {
    const status = getTransactionStatus();

    // Use custom description if provided
    if (customDescription) {
      return (
        <CustomText variant="body" style={styles.description}>
          {customDescription}
        </CustomText>
      );
    }

    switch (status) {
      case 'loading':
        return (
          <CustomText variant="caption" size={16} fontFamily="inter" style={styles.description}>
            Please wait while we process your transaction...
          </CustomText>
        );
      case 'success':
        if (isCoinmeTrade) {
          const tx = transactionData as CoinmeTradeResponse;
          const tradeMeta = tx.meta || {};
          const verb = tradeMeta.tradeType === 'sell' ? 'Sell' : 'Buy';
          const td = getCoinmeTransactionPayload(tx);
          const isSell = tradeMeta.tradeType === 'sell';
          const crypto = isSell
            ? td?.debitCurrencyCode || tradeMeta.cryptoCurrencyCode || 'crypto'
            : td?.creditCurrencyCode || tradeMeta.cryptoCurrencyCode || 'crypto';
          const fiat = isSell
            ? td?.creditCurrencyCode || tradeMeta.fiatCurrencyCode || 'USD'
            : td?.debitCurrencyCode || tradeMeta.fiatCurrencyCode || 'USD';
          return (
            <CustomText variant="caption" size={16} fontFamily="inter" style={styles.description}>
              Your{' '}
              <CustomText size={16} variant="caption" fontWeight="semiBold" color={newTheme.colors.primary} fontFamily="inter">
                {verb}
              </CustomText>
              {' '}of{' '}
              <CustomText size={16} variant="caption" fontWeight="semiBold" color={newTheme.colors.primary} fontFamily="inter">
                {crypto}
              </CustomText>
              {' '}({fiat}) has been completed.
            </CustomText>
          );
        }
        if (isPaymentTransactionSendResponse(transactionData)) {
          const pt = transactionData.data?.paymentTransaction;
          const amt = pt?.amount ?? '0';
          const currency = pt?.currency ?? '';
          const isExternal = pt?.type === 'external';
          const dest = isExternal
            ? pt?.destinationWalletAddress ?? 'wallet'
            : pt?.recipientUserId ?? 'user';
          const displayDest = isExternal && dest.length > 16
            ? `${dest.slice(0, 8)}...${dest.slice(-6)}`
            : dest;
          return (
            <CustomText variant="caption" size={16} fontFamily="inter" style={styles.description}>
              Your crypto send of{' '}
              <CustomText size={16} variant="caption" fontWeight="semiBold" color={newTheme.colors.primary} fontFamily="inter">
                {`${amt} ${currency}`}
              </CustomText>
              {' '}to{' '}
              <CustomText size={16} variant="caption" fontWeight="semiBold" color={newTheme.colors.primary} fontFamily="inter">
                {displayDest}
              </CustomText>
              {' '}has been initiated.
            </CustomText>
          );
        }
        return (
          <CustomText variant="caption" size={16} fontFamily="inter" style={styles.description}>
            Your payment of <CustomText size={16} variant="caption" fontWeight="semiBold" color={newTheme.colors.primary} fontFamily="inter" >{`$${(transactionData as any)?.data?.amount || 0}`}</CustomText> has successfully sent to <CustomText size={16} variant="caption" fontWeight="semiBold" color={newTheme.colors.primary} fontFamily="inter" >{(transactionData as any)?.data?.recipient_username || 'N/A'}</CustomText>.
          </CustomText>
        );
      case 'failed':
        return (
          <CustomText variant="caption" size={16} fontFamily="inter" style={styles.description}>
            There was an error processing your transaction. Please try again.
          </CustomText>
        );
      default:
        return (
          <CustomText variant="caption" size={16} fontFamily="inter" style={styles.description}>
            Transaction status unknown.
          </CustomText>
        );
    }
  };

  const renderTransactionDetails = () => {
    if (showLoader || !transactionData) return null;

    // Coinme buy/sell: major fields from `data.transaction.data` (FastAPI).
    // Renders even when `customTitle` is set (e.g. "Buy submitted").
    if (isCoinmeTrade) {
      const tx = transactionData as CoinmeTradeResponse;
      const displayArray = buildCoinmeDetailRows(getCoinmeTransactionPayload(tx));
      if (displayArray.length === 0) return null;

      return (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.detailsContainer}
        >
          <View style={{ borderColor: newTheme.colors.greyLight2, borderWidth: 1, borderRadius: newTheme.spacing.base, paddingHorizontal: newTheme.spacing.md, paddingVertical: newTheme.spacing.xsm }}>
            {displayArray.map((item, index) => (
              <View key={index} style={styles.detailRow}>
                <CustomText size={14} variant="caption" style={styles.detailLabel}>
                  {item.label}
                </CustomText>
                <CustomText
                  ellipsizeMode="tail"
                  style={styles.detailValue}
                  numberOfLines={1}
                  size={14}
                  fontWeight="semiBold"
                >
                  {item.value}
                </CustomText>
              </View>
            ))}
          </View>
        </ScrollView>
      );
    }

    // FastAPI payment-transaction send response
    if (isPaymentTransactionSendResponse(transactionData)) {
      const pt = transactionData.data?.paymentTransaction;
      const txn = transactionData.data?.transaction;
      if (!pt) return null;

      const isExternal = pt.type === 'external';
      const destFull = isExternal
        ? pt.destinationWalletAddress ?? ''
        : pt.recipientUserId ?? '';
      const displayDest = isExternal && destFull.length > 20
        ? `${destFull.slice(0, 10)}...${destFull.slice(-8)}`
        : destFull;

      const rows: { label: string; value: string }[] = [
        { label: 'Amount', value: `${pt.amount ?? ''} ${pt.currency ?? ''}`.trim() },
        { label: 'Chain', value: pt.chain ?? '' },
        { label: 'Type', value: pt.type === 'external' ? 'External (Wallet)' : 'Internal (PayAiro)' },
        { label: 'To', value: displayDest },
        { label: 'Status', value: pt.status ?? '' },
        { label: 'Provider Status', value: pt.providerStatus ?? '' },
        { label: 'Transaction ID', value: txn?.partnerTransactionId ?? pt.providerTransactionId ?? '' },
        { label: 'Date', value: pt.createdAt ? moment(pt.createdAt).format('DD MMM YYYY  h:mm A') : '' },
      ].filter(r => !!r.value);

      return (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.detailsContainer}>
          <View style={{ borderColor: newTheme.colors.greyLight2, borderWidth: 1, borderRadius: newTheme.spacing.base, paddingHorizontal: newTheme.spacing.md, paddingVertical: newTheme.spacing.xsm }}>
            {rows.map((item, index) => (
              <View key={index} style={styles.detailRow}>
                <CustomText size={14} variant="caption" style={styles.detailLabel}>
                  {item.label}
                </CustomText>
                <CustomText ellipsizeMode="tail" style={styles.detailValue} numberOfLines={1} size={14} fontWeight="semiBold">
                  {item.value}
                </CustomText>
              </View>
            ))}
          </View>
        </ScrollView>
      );
    }

    // Don't show legacy transaction details when showing custom messages
    // (like payment request success).
    if (!transactionData?.data || customTitle || customDescription) return null;

    // Handle different response structures
    // For crypto transactions: data.data.transaction
    // For regular transactions: data.data
    const actualData = 'transaction' in transactionData.data
      ? transactionData.data.transaction
      : transactionData.data;

    const displayArray = Object.entries(keyLabels).map(([key, label]) => {
      let value = actualData[key as keyof TransactionData];

      if (key === "timestamp" && value) {
        value = moment(value).format("DD MMM YYYY  h:mm A");
      }

      if (key === "amount" || key === "final_amount") {
        if (value) {
          // Check if this is a crypto transaction (has asset field)
          const asset = actualData.asset;
          if (asset && asset !== "USD") {
            // For crypto, show amount with asset symbol
            value = `${value} ${asset}`;
          } else {
            // For fiat, show with $ prefix
            value = `${value}`;
          }
        }
      }

      return { label, value };
    });

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.detailsContainer}
      >
        <View style={{borderColor: newTheme.colors.greyLight2, borderWidth: 1, borderRadius:newTheme.spacing.base, paddingHorizontal:newTheme.spacing.md,paddingVertical:newTheme.spacing.xsm}}>
        {displayArray.map((item, index) => (
          <View key={index}>
            {item?.value &&
              <View key={index} style={styles.detailRow}>
                <CustomText size={14} variant="caption" style={styles.detailLabel}>
                  {item.label}
                </CustomText>
                <CustomText
                  ellipsizeMode="tail"
                  style={styles.detailValue}
                  numberOfLines={1}
                  size={14}
                  variant="body"
                >
                  {item.value || "N/A"}
                </CustomText>
              </View>
            }
          </View>
        ))}
        </View>
      </ScrollView>
    );
  };

  const renderActionButton = () => {
    if (showLoader) return null;

    return (
      <View style={styles.buttonContainer}>
        {/* <GenericButton
          title="Done"
          cStyle={styles.doneButton}
          onPress={handleClose}
        /> */}
        <Button onPress={handleClose} >
          Done
        </Button>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderTitle
        leftIcon="sd"
        onPressLeft={showLoader ? undefined : handleClose}
        title="Transaction"
      />

      <View style={styles.animationContainer}>
        {renderLottieAnimation()}
      </View>

      <View style={styles.contentContainer}>
        {renderTitle()}

        <View style={styles.descriptionContainer}>
          {renderDescription()}
        </View>

        {renderTransactionDetails()}
        {renderActionButton()}
      </View>
    </SafeAreaView>
  );
};

export default TransactionResult;

const customStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.palette.white,
    },
    animationContainer: {
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: theme.spacing.spacing[2],
    },
    lottieAnimation: {
      width: 250,
      height: 150,
    },
    contentContainer: {
      flex: 1,
      backgroundColor: theme.colors.palette.white,
      borderTopEndRadius: theme.spacing.spacing[8],
      borderTopStartRadius: theme.spacing.spacing[8],
      padding: theme.spacing.spacing[5],
      marginTop: theme.spacing.spacing[2],
      alignItems: "center",
    },
    title: {
      textAlign: "center",
      marginBottom: theme.spacing.spacing[3],
    },
    successTitle: {
      // color: theme.colors.palette.green600,
      color: '#000',
    },
    errorTitle: {
      color: theme.colors.palette.error,
    },
    descriptionContainer: {
      width: "100%",
      marginBottom: theme.spacing.spacing[4],
    },
    description: {
      textAlign: "center",
      color: '#838383',
      letterSpacing: 0.1,
      fontWeight: '400',
      fontFamily: 'inter',
    },
    detailsContainer: {
      width: "100%",
      // maxHeight: 300,
      marginBottom: theme.spacing.spacing[4],
    },
    detailRow: {
      marginVertical: theme.spacing.spacing[2],
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      paddingHorizontal: theme.spacing.spacing[1],
    },
    detailLabel: {
      flex: 1,
      color: theme.colors.text.tertiary,
    },
    detailValue: {
      flex: 1,
      textAlign: "right",
      color: theme.colors.text.primary,
      fontWeight: "500",
    },
    buttonContainer: {
      width: "100%",
      paddingTop: theme.spacing.spacing[3],
    },
    doneButton: {
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
      marginVertical: theme.spacing.spacing[2],
    },
  });

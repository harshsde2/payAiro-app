import React, { FC, useRef } from "react";
import {
  View,
  StyleSheet,
  Image,
  Linking,
  Alert,
  ScrollView,
  Clipboard,
  TouchableOpacity,
  Platform,
} from "react-native";
import ViewShot from "react-native-view-shot";
import Share from "react-native-share";
import RNFS from "react-native-fs";
import { useNavigation, useRoute } from "@react-navigation/native";
import moment from "moment";
import { formatDetailDate, formatDetailTime } from "utils/dateUtils";
import Svg, { SvgUri, Circle, Path } from "react-native-svg";
import { useTheme, Theme } from "styles";
import CustomText from "tsx-components/CustomText";
import { SvgIcons } from "constants/svgs";
import Button from "@new-ui/components/common-components/layout/Button";
import ScreenWrapper from "@new-ui/components/common-components/ScreenWrapper";
import { INewTransactionDetailsProps } from "./types";
import CashOnRampTransactionDetailsBody from "./CashOnRampTransactionDetailsBody";
import CashOffRampTransactionDetailsBody from "./CashOffRampTransactionDetailsBody";
import StateComplianceReceiptBody from "./StateComplianceReceiptBody";
import useSelectorAction from "hooks/useSelectorAction";
import { useAppLock } from "hooks/useAppLock";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { useTheme as useNewTheme } from "@new-ui/styles/ThemeContext";
// OR use react-native's built-in method for Android

// Typography variants for transaction slip - change these to adjust font size globally
const SLIP_LABEL_VARIANT = "caption" as const;
const SLIP_VALUE_VARIANT = "caption" as const;

// Font size styles for transaction slip - adjust fontSize here to change size directly
// You can also modify these in the styles function below
const SLIP_LABEL_FONT_SIZE = 11; // Change this value to adjust label font size
const SLIP_VALUE_FONT_SIZE = 11; // Change this value to adjust value font size

const COINME_WEB_URL = "https://coinme.com";

const CoinmeGlobeIcon: FC<{ color: string; size?: number }> = ({
  color,
  size = 14,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.4" />
    <Path d="M12 3v18M3 12h18" stroke={color} strokeWidth="1.4" />
    <Path
      d="M5.5 5.5c3 4.5 3 8.5 0 13M18.5 5.5c-3 4.5-3 8.5 0 13"
      stroke={color}
      strokeWidth="1.2"
    />
  </Svg>
);

const NewTransactionDetails: FC = () => {
  const route = useRoute();
  const { theme } = useTheme();
  const { theme: newUITheme } = useNewTheme();
  const screenshotRef = useRef<ViewShot>(null);
  const {walletData} = useSelectorAction() as any;
  const { setNativeModalVisible } = useAppLock();

  const navigation = useNavigation<any>();

  const { transactionData } =
    route.params as INewTransactionDetailsProps["route"]["params"];

  if (transactionData?.transaction_type === "cash_onramp") {
    return (
      <CashOnRampTransactionDetailsBody
        transactionData={transactionData}
        onClose={() => navigation.goBack()}
      />
    );
  }

  if (transactionData?.transaction_type === "cash_offramp") {
    return (
      <CashOffRampTransactionDetailsBody
        transactionData={transactionData}
        onClose={() => navigation.goBack()}
      />
    );
  }

  // State compliance receipt (CT/MN/CA): the backend attaches a state-aware
  // regulatoryReceipt to debit buy/sell trades — render it verbatim when present.
  if (
    transactionData?.regulatory_receipt?.receiptFields?.length &&
    (transactionData?.transaction_type === "crypto_buy" ||
      transactionData?.transaction_type === "crypto_sell")
  ) {
    return (
      <StateComplianceReceiptBody
        transactionData={transactionData}
        receipt={transactionData.regulatory_receipt}
        onClose={() => navigation.goBack()}
      />
    );
  }

  // console.log("transactionData =>", JSON.stringify(transactionData, null, 2));

  // Get slip text styles - these can be modified in the styles function below
  const slipStyles = styles(theme);

  // console.log("transactionData =>", JSON.stringify(transactionData, null, 2));
  const userDetails = transactionData?.display_party;

  // Direction
  const isIncoming = transactionData.direction === "incoming";

  // Status logic
  const status = transactionData.status?.toLowerCase();
  const isSuccess = status === "success" || status === "complete";
  const isPending =
    status === "pending" || status === "processing" || status === "storing";
  const isFailed = status === "failed" || status === "cancelled";

  let statusText = "Completed";
  let statusBg = newUITheme.colors.success;

  if (isPending) {
    statusText =
      status?.charAt(0).toUpperCase() + status?.slice(1) || "Pending";
    statusBg = newUITheme.colors.warning;
  } else if (isFailed) {
    statusText = status === "cancelled" ? "Cancelled" : "Failed";
    statusBg = newUITheme.colors.error;
  }

  // Amount formatting
  const amount = parseFloat(transactionData.amount || "0");
  const formattedAmount = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Display party info
  const displayUsername =
    transactionData.display_party?.username ||
    transactionData.display_party?.identifier ||
    "Unknown";
  const displayProfilePhoto = transactionData.display_party?.profile_photo;

  // Sender & Recipient
  const senderUsername =
    transactionData.sender?.username ||
    transactionData.sender?.email ||
    "Unknown";
  const recipientUsername =
    transactionData.recipient?.username ||
    transactionData.recipient?.email ||
    "Unknown";

  // Bank details
  const bankName = transactionData.bank_details?.bank_name || "Payairo Bank";
  const accountNumberMasked =
    transactionData.bank_details?.account_number_masked || null;

  // Fee calculation based on transaction type and walletData.fees
  const getFeePercentage = (): number => {
    const fees = walletData?.fees || {};
    const txType = transactionData.transaction_type;

    // Map transaction types to fee types
    if (txType === "crypto_buy") return fees.BUY || 0;
    if (txType === "crypto_sell") return fees.SELL || 0;
    if (txType === "crypto_send" || txType === "crypto_receive") return fees.TRANSACTION || 0;
    if (txType === "crypto_withdrawal") return fees.TRANSACTION || 0;
    
    // For fiat transactions, check transfer method
    if (txType === "fiat_bank_transfer_out" || txType === "fiat_bank_transfer_in") {
      const transferMethod = transactionData.bank_details?.transfer_method?.toUpperCase();
      if (transferMethod === "RTP") return fees.RTP || 0;
      if (transferMethod === "ACH") return fees.ACH || 0;
      return fees.TRANSACTION || 0;
    }
    
    // Default to TRANSACTION fee for other fiat transactions
    return fees.TRANSACTION || 0;
  };

  const feePercentage = getFeePercentage();
  
  // Calculate fee amount - use API fee if available, otherwise calculate from percentage
  let feeAmount = parseFloat(transactionData.fee?.amount || "0");
  const feeCurrency = transactionData.fee?.currency || transactionData.currency || "USD";
  
  // If fee amount is 0 but we have a fee percentage, calculate it
  if (feeAmount === 0 && feePercentage > 0) {
    const txType = transactionData.transaction_type;
    // For crypto buy, calculate fee from the original USD amount paid
    if (txType === "crypto_buy") {
      const usdAmount = parseFloat(transactionData.amount || "0");
      feeAmount = (usdAmount * feePercentage) / 100;
    }
    // For crypto sell, calculate fee from the USD value
    else if (txType === "crypto_sell") {
      const usdValue = parseFloat(transactionData.crypto_details?.usd_value || transactionData.final_amount || "0");
      feeAmount = (usdValue * feePercentage) / 100;
    }
    // For other transactions, calculate from transaction amount
    else {
      const transactionAmount = parseFloat(transactionData.amount || "0");
      feeAmount = (transactionAmount * feePercentage) / 100;
    }
  }
  
  // Use API fee percentage if available, otherwise use calculated percentage
  const displayFeePercentage = transactionData.fee?.percentage 
    ? parseFloat(transactionData.fee.percentage) 
    : feePercentage;

  // Crypto details
  // Note: isCrypto === false means crypto transaction (matches Redux state convention)
  const isCrypto = transactionData.transaction_category !== "crypto";
  const cryptoDetails = transactionData.crypto_details;
  const cryptoAsset = cryptoDetails?.asset || cryptoDetails?.token;
  const cryptoNetwork = cryptoDetails?.network;
  const cryptoIconUrl = cryptoDetails?.icon_url;
  const fromCurrency = cryptoDetails?.from_currency;
  const toCurrency = cryptoDetails?.to_currency;
  const txHash = cryptoDetails?.tx_hash;
  const fromAddress = cryptoDetails?.from_address;
  const toAddress = cryptoDetails?.to_address;
  const exchangeRate = cryptoDetails?.exchange_rate;
  const usdValue = cryptoDetails?.usd_value;

  // External-wallet receive: the sender is an off-platform wallet, so there's no known
  // display party (username/identifier) — fall back to the on-chain from_address instead
  // of "Unknown" in the header subtitle and the "Received From" receipt row.
  const shortenAddress = (addr?: string | null): string =>
    addr && addr.length > 16 ? `${addr.substring(0, 10)}...${addr.slice(-4)}` : addr || "";
  const hasKnownParty = !!displayUsername && displayUsername !== "Unknown";
  const receivedFromDisplay = hasKnownParty
    ? displayUsername
    : fromAddress
    ? shortenAddress(fromAddress)
    : "Unknown";

  // Determine transaction scenario
  const txType = transactionData.transaction_type;
  const isCryptoBuy = txType === "crypto_buy";
  const isCryptoSell = txType === "crypto_sell";
  const isCryptoSend = txType === "crypto_send";
  const isCryptoReceive = txType === "crypto_receive";
  const isCryptoWithdrawal = txType === "crypto_withdrawal";

  // Currency symbol - for crypto show token, for fiat show symbol
  // Note: isCrypto === false means crypto transaction
  const getCurrencyDisplay = (): string => {
    if (!isCrypto && cryptoAsset) {
      return cryptoAsset;
    }
    return transactionData.currency_symbol !== transactionData.currency
      ? transactionData.currency_symbol
      : "$";
  };
  const currencySymbol = getCurrencyDisplay();

  // Get transaction title based on scenario (for crypto)
  const getCryptoTitle = (): string => {
    if (isCryptoBuy) return `Purchase ${cryptoAsset || "Crypto"}`;
    if (isCryptoSell) return `Sold ${cryptoAsset || "Crypto"}`;
    if (isCryptoSend) return `Sent ${cryptoAsset || "Crypto"}`;
    if (isCryptoReceive) return `Received ${cryptoAsset || "Crypto"}`;
    if (isCryptoWithdrawal) return `Withdrawn ${cryptoAsset || "Crypto"}`;
    return getTransactionTypeLabel();
  };

  // Get transaction subtitle based on scenario (for crypto)
  const getCryptoSubtitle = (): string | null => {
    if (isCryptoSend) return `To ${displayUsername}`;
    if (isCryptoReceive) return `From ${receivedFromDisplay}`;
    if (isCryptoWithdrawal) {
      return displayUsername === "External Wallet"
        ? "To External Wallet"
        : `To ${displayUsername}`;
    }
    return null; // No subtitle for Buy/Sell
  };

  // Get decimal places based on crypto type - BTC and ETH show 5, others show 2
  const getCryptoDecimalPlaces = (token: string | null | undefined): number => {
    const upperToken = token?.toUpperCase();
    if (upperToken === "BTC" || upperToken === "ETH") {
      return 5;
    }
    return 2;
  };

  const getCryptoBuyReceivedDisplay = (): string => {
    const raw = parseFloat(
      transactionData.final_amount || transactionData.amount || "0"
    );
    const usdParsed =
      usdValue != null && String(usdValue).trim() !== ""
        ? parseFloat(String(usdValue))
        : NaN;
    const token = toCurrency || cryptoAsset || "Crypto";
    if (
      Number.isFinite(raw) &&
      Number.isFinite(usdParsed) &&
      Math.abs(raw - usdParsed) < 0.0005
    ) {
      return `${usdParsed.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} USD`;
    }
    const decimals = getCryptoDecimalPlaces(token);
    return `${raw.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })} ${token}`;
  };

  // Get amount display for crypto transactions
  const getCryptoAmount = (): { amount: string; currency: string } => {
    if (isCryptoBuy) {
      const rawUsd =
        usdValue != null && String(usdValue).trim() !== ""
          ? parseFloat(String(usdValue))
          : NaN;
      const fromFiat = (fromCurrency ?? "").toUpperCase();
      const txCur = (transactionData.currency ?? "").toUpperCase();
      const amt = parseFloat(
        transactionData.final_amount || transactionData.amount || "0"
      );
      let usdNum = Number.isFinite(rawUsd) ? rawUsd : NaN;
      if (!Number.isFinite(usdNum)) {
        if (fromFiat === "USD" && (txCur === "USD" || txCur === fromFiat)) {
          usdNum = amt;
        } else if (fromFiat === "USD" && Number.isFinite(amt)) {
          usdNum = amt;
        } else {
          usdNum = Number.isFinite(amt) ? amt : 0;
        }
      }
      return {
        amount: usdNum.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        currency: "USD",
      };
    }
    if (isCryptoSell) {
      // Show final_amount in USD
      return {
        amount: parseFloat(
          transactionData.final_amount || transactionData.amount || "0"
        ).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        currency: "USD",
      };
    }
    // For Send, Receive, Withdrawal - show amount with currency
    const decimals = getCryptoDecimalPlaces(cryptoAsset);
    return {
      amount: parseFloat(transactionData.amount || "0").toLocaleString(
        "en-US",
        {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }
      ),
      currency: currencySymbol,
    };
  };

  // Get date/time label based on scenario
  const getDateLabel = (): string => {
    if (isCryptoBuy) return "Purchase Date";
    if (isCryptoSell) return "Sale Date";
    return "Transfer Date";
  };

  const getTimeLabel = (): string => {
    if (isCryptoBuy) return "Purchase Time";
    if (isCryptoSell) return "Sale Time";
    return "Transfer Time";
  };

  // Get transaction ID label based on scenario
  const getTransactionIdLabel = (): string => {
    if (isCryptoBuy || isCryptoSell) return "Order ID";
    return "Transaction ID";
  };

  // Transaction type label (for non-crypto or fallback)
  const getTransactionTypeLabel = (): string => {
    const txType = transactionData.transaction_type;

    const typeLabels: Record<string, string> = {
      fiat_send: "Money Sent",
      fiat_receive: "Money Received",
      fiat_deposit: "Deposit",
      fiat_withdrawal: "Withdrawal",
      fiat_bank_transfer_in: "Bank Transfer In",
      fiat_bank_transfer_out: "Bank Transfer Out",
      fiat_card_deposit: "Card Deposit",
      fiat_card_purchase: "Card Purchase",
      fiat_merchant_payment: "Merchant Payment",
      fiat_merchant_refund: "Merchant Refund",
      crypto_buy: "Crypto Purchase",
      crypto_sell: "Crypto Sale",
      crypto_send: "Crypto Sent",
      crypto_receive: "Crypto Received",
      crypto_withdrawal: "Crypto Withdrawal",
      crypto_deposit: "Crypto Deposit",
      crypto_swap: "Crypto Swap",
    };

    return typeLabels[txType] || txType?.replace(/_/g, " ") || "Transaction";
  };

  // Copy transaction ID
  const handleCopyTransactionId = () => {
    Clipboard.setString(transactionData.transaction_id);
    Alert.alert("Copied", "Transaction ID copied to clipboard");
  };

  // Download receipt as PNG
  const handleDownload = async () => {
    try {
      if (screenshotRef.current && screenshotRef.current.capture) {
        const uri = await screenshotRef.current.capture();

        // Generate filename with timestamp
        const timestamp = moment().format("YYYY-MM-DD_HH-mm-ss");
        const fileName = `PayAiro_Transaction_${timestamp}.png`;

        // Define the save directory
        let saveDir: string;
        let locationInfo: string;

        if (Platform.OS === "android") {
          saveDir = `${RNFS.DownloadDirectoryPath}/${fileName}`;
          locationInfo =
            "Downloads folder\n\nYou can find it in:\n• Files app > Downloads\n• Or use a file manager app";
        } else {
          saveDir = `${RNFS.DocumentDirectoryPath}/${fileName}`;
          locationInfo =
            "Files app > On My iPhone > PayAiro\n\nOr connect to iTunes/Finder to access";
        }

        // Process the URI - remove file:// prefix if present for RNFS operations
        const sourcePath = uri.startsWith("file://")
          ? uri.replace("file://", "")
          : uri;

        // Copy the captured image to the save directory
        await RNFS.copyFile(sourcePath, saveDir);

        // For Android: Trigger media scan to make file visible in Downloads app
        if (Platform.OS === "android") {
          try {
            // Use react-native's Linking to trigger media scan
            const { NativeModules } = require("react-native");
            if (NativeModules.MediaScanner) {
              NativeModules.MediaScanner.scanFile(saveDir);
            }
          } catch (scanError) {
            console.log("Media scan not available:", scanError);
          }
        }

        // Show success message with location instructions
        Alert.alert(
          "Download Successful",
          `Transaction receipt saved!\n\nFile: ${fileName}\n\n${locationInfo}\n\nFull path:\n${saveDir}`,
          [{ text: "OK" }]
        );
      }
    } catch (error: any) {
      console.error("Download failed:", error);
      Alert.alert(
        "Error",
        `Failed to download transaction receipt.\n\nError: ${
          error.message || "Unknown error"
        }\n\nPlease check app permissions.`,
        [{ text: "OK" }]
      );
    }
  };

  // Share transaction (screenshot)
  const handleScreenshotShare = async () => {
    // Set flag BEFORE showing native share modal
    setNativeModalVisible(true);
    
    try {
      if (screenshotRef.current && screenshotRef.current.capture) {
        const uri = await screenshotRef.current.capture();

        const shareOptions = {
          title: "PayAiro Transaction Receipt",
          message: "PayAiro Transaction Receipt",
          url: uri,
          type: "image/png",
        };

        await Share.open(shareOptions);
      }
    } catch (error: any) {
      // On Android, closing the native share sheet often throws a "User did not share" / cancel-style error.
      // We silently ignore user-cancelled shares and only log real failures.
      const raw = error ?? {};
      const message =
        (typeof raw === "string" ? raw : raw.message) ||
        raw?.error?.message ||
        raw?.error ||
        "";

      const normalizedMessage = String(message).toLowerCase();
      const isUserCancelled =
        normalizedMessage.includes("user did not share") ||
        normalizedMessage.includes("cancel") ||
        raw?.error?.code === "ECANCELED";

      if (isUserCancelled) {
        // Do nothing visible if the user just cancels sharing
        console.log("Share cancelled by user");
        return;
      }

      console.error("Screenshot sharing failed:", error);
      Alert.alert("Error", "Failed to capture and share screenshot");
    } finally {
      // Reset flag AFTER share modal closes (with delay to ensure app state change completes first)
      // The delay is important because the app state change to 'active' may happen AFTER Share.open() resolves/rejects
      setTimeout(() => {
        setNativeModalVisible(false);
      }, 1000);
    }
  };

  // Get initials for avatar placeholder
  const getInitials = (name: string): string => {
    return name?.charAt(0).toUpperCase() || "?";
  };

  // Check if profile photo is valid
  const isValidPhoto = (photo: string | null | undefined): boolean => {
    return !!photo && photo !== "null" && photo !== "";
  };

  // Copy handlers for crypto details
  const handleCopyTxHash = () => {
    if (txHash) {
      Clipboard.setString(txHash);
      Alert.alert("Copied", "Transaction hash copied to clipboard");
    }
  };

  const handleCopyFromAddress = () => {
    if (fromAddress) {
      Clipboard.setString(fromAddress);
      Alert.alert("Copied", "From address copied to clipboard");
    }
  };

  const handleCopyToAddress = () => {
    if (toAddress) {
      Clipboard.setString(toAddress);
      Alert.alert("Copied", "To address copied to clipboard");
    }
  };

  // Render avatar for header
  const renderHeaderAvatar = () => {
    // isCrypto === false means crypto transaction
    const imageUrl =
      !isCrypto && isValidPhoto(cryptoIconUrl)
        ? cryptoIconUrl
        : displayProfilePhoto;

    if (isValidPhoto(imageUrl) && imageUrl) {
      if (imageUrl.toLowerCase().endsWith(".svg")) {
        return (
          <View style={styles(theme).avatarBig}>
            <SvgUri uri={imageUrl} width={80} height={80} />
          </View>
        );
      }
      return (
        <TouchableOpacity disabled={!isCrypto} onPress={() => navigation.replace(NAVIGATION_SCREENS.USER_PROFILE, { userDetails })}>
          <Image source={{ uri: imageUrl }} style={styles(theme).avatarBig} />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity disabled={!isCrypto} activeOpacity={0.8} onPress={() => navigation.replace(NAVIGATION_SCREENS.USER_PROFILE, { userDetails })} style={styles(theme).avatarPlaceholderBig}>
        <CustomText variant="h2" color={theme.colors.palette.white}>
          {getInitials(displayUsername)}
        </CustomText>
      </TouchableOpacity>
    );
  };

  // Render crypto asset icon
  const renderCryptoAssetIcon = (iconUrl: string | null | undefined) => {
    if (isValidPhoto(iconUrl) && iconUrl) {
      if (iconUrl.toLowerCase().endsWith(".svg")) {
        return (
          <SvgUri
            uri={iconUrl}
            width={20}
            height={20}
            style={{ marginRight: 8 }}
          />
        );
      }
      return (
        <Image
          source={{ uri: iconUrl }}
          style={{ width: 20, height: 20, marginRight: 8 }}
          resizeMode="contain"
        />
      );
    }
    return null;
  };

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={["bottom"]}
      backgroundColor={newUITheme.colors.white}
      padding={0}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <ViewShot
          ref={screenshotRef}
          options={{
            format: "png",
            quality: 0.9,
            result: "tmpfile",
          }}
          style={styles(theme).screenshotContainer}
        >
          {/* Header / Summary Block */}
          <View style={styles(theme).headerSection}>
            <View style={styles(theme).avatarContainerBig}>
              {renderHeaderAvatar()}
            </View>

            {/* Title - Dynamic based on crypto scenario */}
            {!isCrypto ? (
              <>
                <CustomText
                  variant="h2"
                  color={theme.colors.text.primary}
                  style={{ marginBottom: 4, fontSize: 20, fontWeight: "600" }}
                >
                  {getCryptoTitle()}
                </CustomText>
                {/* Subtitle for Send/Receive/Withdrawal */}
                {getCryptoSubtitle() && (
                  <CustomText
                    variant="body1"
                    color={theme.colors.text.secondary}
                    style={{ marginBottom: 8, fontSize: 14 }}
                  >
                    {getCryptoSubtitle()}
                  </CustomText>
                )}
              </>
            ) : (
              <CustomText
                variant="body1"
                color={theme.colors.text.primary}
                style={{ marginBottom: 4, fontSize: 16 }}
              >
                {isIncoming ? "From" : "To"} {displayUsername}
              </CustomText>
            )}

            {/* Amount - Dynamic based on crypto scenario */}
            {!isCrypto ? (
              <CustomText
                variant="h1"
                style={[
                  styles(theme).amountText,
                  { color: theme.colors.palette.black },
                ]}
              >
                {getCryptoAmount().amount} {getCryptoAmount().currency}
              </CustomText>
            ) : (
              <CustomText
                variant="h1"
                style={[
                  styles(theme).amountText,
                  {
                    color: isIncoming
                      ? theme.colors.palette.green700
                      : theme.colors.palette.black,
                  },
                ]}
              >
                {currencySymbol} {formattedAmount}
              </CustomText>
            )}

            <View
              style={[styles(theme).statusBadge, { backgroundColor: statusBg }]}
            >
              <CustomText
                variant="caption"
                fontWeight="semiBold"
                style={{ color: theme.colors.palette.white }}
              >
                {statusText}
              </CustomText>
            </View>

            {/* Transaction Type Badge - Only for fiat */}
            {isCrypto && (
              <CustomText
                variant="caption"
                color={theme.colors.text.secondary}
                style={{ marginTop: 8 }}
              >
                {getTransactionTypeLabel()}
              </CustomText>
            )}
          </View>

          {/* White Card Section */}
          <View style={styles(theme).whiteCard}>
            {/* Date - Dynamic label based on scenario */}
            <View style={styles(theme).detailRow}>
              <CustomText
                variant={SLIP_LABEL_VARIANT}
                color={theme.colors.text.secondary}
                style={slipStyles.slipLabelText}
              >
                {!isCrypto ? getDateLabel() : "Transfer Date"}
              </CustomText>
              <CustomText
                variant={SLIP_VALUE_VARIANT}
                fontWeight="semiBold"
                color={theme.colors.text.primary}
                style={slipStyles.slipValueText}
              >
                {formatDetailDate(transactionData.created_at)}
              </CustomText>
            </View>

            {/* Time - Dynamic label based on scenario */}
            <View style={styles(theme).detailRow}>
              <CustomText
                variant={SLIP_LABEL_VARIANT}
                color={theme.colors.text.secondary}
                style={slipStyles.slipLabelText}
              >
                {!isCrypto ? getTimeLabel() : "Transfer Time"}
              </CustomText>
              <CustomText
                variant={SLIP_VALUE_VARIANT}
                fontWeight="semiBold"
                color={theme.colors.text.primary}
                style={slipStyles.slipValueText}
              >
                {formatDetailTime(transactionData.created_at)}
              </CustomText>
            </View>

            {/* Transaction ID / Order ID - Dynamic label based on scenario */}
            <View style={styles(theme).detailRow}>
              <CustomText
                variant={SLIP_LABEL_VARIANT}
                color={theme.colors.text.secondary}
                style={slipStyles.slipLabelText}
              >
                {!isCrypto ? getTransactionIdLabel() : "Transaction ID"}
              </CustomText>
              <TouchableOpacity
                onPress={handleCopyTransactionId}
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <CustomText
                  variant={SLIP_VALUE_VARIANT}
                  fontWeight="semiBold"
                  color={theme.colors.text.primary}
                  numberOfLines={1}
                  style={[slipStyles.slipValueText, { maxWidth: 150 }]}
                >
                  {transactionData.transaction_id.length > 16
                    ? `${transactionData.transaction_id.substring(0, 16)}...`
                    : transactionData.transaction_id}
                </CustomText>
                <SvgIcons.CopyOutlineBlack
                  width={14}
                  height={14}
                  // color={theme.colors.text.primary}
                />
              </TouchableOpacity>
            </View>

            {/* Sender - Only for fiat transactions */}
            {isCrypto && (
              <View style={styles(theme).detailRow}>
                <CustomText
                  variant={SLIP_LABEL_VARIANT}
                  color={theme.colors.text.secondary}
                  style={slipStyles.slipLabelText}
                >
                  Sender
                </CustomText>
                <CustomText
                  variant={SLIP_VALUE_VARIANT}
                  fontWeight="semiBold"
                  color={theme.colors.text.primary}
                  style={slipStyles.slipValueText}
                >
                  {senderUsername}
                </CustomText>
              </View>
            )}

            {/* Receiver - Only for fiat transactions */}
            {isCrypto && transactionData.recipient && (
              <View style={styles(theme).detailRow}>
                <CustomText
                  variant={SLIP_LABEL_VARIANT}
                  color={theme.colors.text.secondary}
                  style={slipStyles.slipLabelText}
                >
                  Receiver
                </CustomText>
                <CustomText
                  variant={SLIP_VALUE_VARIANT}
                  fontWeight="semiBold"
                  color={theme.colors.text.primary}
                  style={slipStyles.slipValueText}
                >
                  {recipientUsername}
                </CustomText>
              </View>
            )}

            {/* Category - Only for fiat transactions */}
            {isCrypto && transactionData.category && (
              <View style={styles(theme).detailRow}>
                <CustomText
                  variant={SLIP_LABEL_VARIANT}
                  color={theme.colors.text.secondary}
                  style={slipStyles.slipLabelText}
                >
                  Category
                </CustomText>
                <CustomText
                  variant={SLIP_VALUE_VARIANT}
                  fontWeight="semiBold"
                  color={theme.colors.text.primary}
                  style={slipStyles.slipValueText}
                >
                  {transactionData.category
                    .split("_")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </CustomText>
              </View>
            )}

            {/* Bank Details (for fiat only) */}
            {isCrypto && (
              <>
                <View style={styles(theme).detailRow}>
                  <CustomText
                    variant={SLIP_LABEL_VARIANT}
                    color={theme.colors.text.secondary}
                    style={slipStyles.slipLabelText}
                  >
                    Bank
                  </CustomText>
                  <CustomText
                    variant={SLIP_VALUE_VARIANT}
                    fontWeight="semiBold"
                    color={theme.colors.text.primary}
                    style={slipStyles.slipValueText}
                  >
                    {bankName}
                  </CustomText>
                </View>

                {accountNumberMasked && (
                  <View style={styles(theme).detailRow}>
                    <CustomText
                      variant={SLIP_LABEL_VARIANT}
                      color={theme.colors.text.secondary}
                      style={slipStyles.slipLabelText}
                    >
                      Account Number
                    </CustomText>
                    <CustomText
                      variant={SLIP_VALUE_VARIANT}
                      fontWeight="semiBold"
                      color={theme.colors.text.primary}
                      style={slipStyles.slipValueText}
                    >
                      {accountNumberMasked}
                    </CustomText>
                  </View>
                )}
              </>
            )}

            {/* Fee - Only for fiat transactions (crypto Send shows fee in its own section) */}
            {isCrypto && (feeAmount > 0 || displayFeePercentage > 0) && (
              <View style={styles(theme).detailRow}>
                <CustomText
                  variant={SLIP_LABEL_VARIANT}
                  color={theme.colors.text.secondary}
                  style={slipStyles.slipLabelText}
                >
                  Transaction Fee
                </CustomText>
                <CustomText
                  variant={SLIP_VALUE_VARIANT}
                  fontWeight="semiBold"
                  color={theme.colors.text.primary}
                  style={slipStyles.slipValueText}
                >
                  {currencySymbol} {feeAmount.toFixed(2)}
                  {displayFeePercentage > 0 && ` (${displayFeePercentage.toFixed(2)}%)`}
                </CustomText>
              </View>
            )}

            {/* Crypto Details Section - Scenario-based display */}
            {!isCrypto && (
              <>
                {/* ========== CRYPTO BUY ========== */}
                {isCryptoBuy && (
                  <>
                    {/* Asset Purchased */}
                    {cryptoAsset && (
                      <View style={styles(theme).detailRow}>
                        <CustomText
                          variant={SLIP_LABEL_VARIANT}
                          color={theme.colors.text.secondary}
                          style={slipStyles.slipLabelText}
                        >
                          Asset Purchased
                        </CustomText>
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          {renderCryptoAssetIcon(cryptoIconUrl)}
                          <CustomText
                            variant={SLIP_VALUE_VARIANT}
                            fontWeight="semiBold"
                            color={theme.colors.text.primary}
                            style={slipStyles.slipValueText}
                          >
                            {cryptoAsset}
                          </CustomText>
                        </View>
                      </View>
                    )}

                    {/* Paid In */}
                    {fromCurrency && (
                      <View style={styles(theme).detailRow}>
                        <CustomText
                          variant={SLIP_LABEL_VARIANT}
                          color={theme.colors.text.secondary}
                          style={slipStyles.slipLabelText}
                        >
                          Paid In
                        </CustomText>
                        <CustomText
                          variant={SLIP_VALUE_VARIANT}
                          fontWeight="semiBold"
                          color={theme.colors.text.primary}
                          style={slipStyles.slipValueText}
                        >
                          {fromCurrency}
                        </CustomText>
                      </View>
                    )}

                    {/* Received */}
                    {toCurrency && (
                      <View style={styles(theme).detailRow}>
                        <CustomText
                          variant={SLIP_LABEL_VARIANT}
                          color={theme.colors.text.secondary}
                          style={slipStyles.slipLabelText}
                        >
                          Received
                        </CustomText>
                        <CustomText
                          variant={SLIP_VALUE_VARIANT}
                          fontWeight="semiBold"
                          color={theme.colors.text.primary}
                          style={slipStyles.slipValueText}
                        >
                          {getCryptoBuyReceivedDisplay()}
                        </CustomText>
                      </View>
                    )}

                    {/* Exchange Rate */}
                    {exchangeRate && (
                      <View style={styles(theme).detailRow}>
                        <CustomText
                          variant={SLIP_LABEL_VARIANT}
                          color={theme.colors.text.secondary}
                          style={slipStyles.slipLabelText}
                        >
                          Exchange Rate
                        </CustomText>
                        <CustomText
                          variant={SLIP_VALUE_VARIANT}
                          fontWeight="semiBold"
                          color={theme.colors.text.primary}
                          style={slipStyles.slipValueText}
                        >
                          1 {fromCurrency || "USD"} ={" "}
                          {parseFloat(exchangeRate).toFixed(2)}{" "}
                          {toCurrency || cryptoAsset}
                        </CustomText>
                      </View>
                    )}

                    {/* USD Value */}
                    {usdValue && (
                      <View style={styles(theme).detailRow}>
                        <CustomText
                          variant={SLIP_LABEL_VARIANT}
                          color={theme.colors.text.secondary}
                          style={slipStyles.slipLabelText}
                        >
                          USD Value
                        </CustomText>
                        <CustomText
                          variant={SLIP_VALUE_VARIANT}
                          fontWeight="semiBold"
                          color={theme.colors.text.primary}
                          style={slipStyles.slipValueText}
                        >
                          ${parseFloat(usdValue).toFixed(2)}
                        </CustomText>
                      </View>
                    )}

                    {/* Transaction Fee */}
                    {(feeAmount > 0 || displayFeePercentage > 0) && (
                      <View style={styles(theme).detailRow}>
                        <CustomText
                          variant={SLIP_LABEL_VARIANT}
                          color={theme.colors.text.secondary}
                          style={slipStyles.slipLabelText}
                        >
                          Transaction Fee
                        </CustomText>
                        <CustomText
                          variant={SLIP_VALUE_VARIANT}
                          fontWeight="semiBold"
                          color={theme.colors.text.primary}
                          style={slipStyles.slipValueText}
                        >
                          ${feeAmount.toFixed(2)} ({displayFeePercentage.toFixed(2)}%)
                        </CustomText>
                      </View>
                    )}
                  </>
                )}

                {/* ========== CRYPTO SELL ========== */}
                {isCryptoSell && (
                  <>
                    {/* Asset Sold */}
                    {fromCurrency && (
                      <View style={styles(theme).detailRow}>
                        <CustomText
                          variant={SLIP_LABEL_VARIANT}
                          color={theme.colors.text.secondary}
                          style={slipStyles.slipLabelText}
                        >
                          Asset Sold
                        </CustomText>
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          {renderCryptoAssetIcon(cryptoIconUrl)}
                          <CustomText
                            variant={SLIP_VALUE_VARIANT}
                            fontWeight="semiBold"
                            color={theme.colors.text.primary}
                            style={slipStyles.slipValueText}
                          >
                            {fromCurrency}
                          </CustomText>
                        </View>
                      </View>
                    )}

                    {/* Received */}
                    <View style={styles(theme).detailRow}>
                      <CustomText
                        variant={SLIP_LABEL_VARIANT}
                        color={theme.colors.text.secondary}
                        style={slipStyles.slipLabelText}
                      >
                        Received
                      </CustomText>
                      <CustomText
                        variant={SLIP_VALUE_VARIANT}
                        fontWeight="semiBold"
                        color={theme.colors.text.primary}
                        style={slipStyles.slipValueText}
                      >
                        {parseFloat(
                          transactionData.final_amount ||
                            transactionData.amount ||
                            "0"
                        ).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        USD
                      </CustomText>
                    </View>

                    {/* Exchange Rate */}
                    {exchangeRate && (
                      <View style={styles(theme).detailRow}>
                        <CustomText
                          variant={SLIP_LABEL_VARIANT}
                          color={theme.colors.text.secondary}
                        >
                          Exchange Rate
                        </CustomText>
                        <CustomText
                          variant={SLIP_VALUE_VARIANT}
                          fontWeight="semiBold"
                          color={theme.colors.text.primary}
                        >
                          1 {fromCurrency} ={" "}
                          {parseFloat(exchangeRate).toFixed(2)} USD
                        </CustomText>
                      </View>
                    )}

                    {/* USD Value */}
                    {usdValue && (
                      <View style={styles(theme).detailRow}>
                        <CustomText
                          variant={SLIP_LABEL_VARIANT}
                          color={theme.colors.text.secondary}
                        >
                          USD Value
                        </CustomText>
                        <CustomText
                          variant={SLIP_VALUE_VARIANT}
                          fontWeight="semiBold"
                          color={theme.colors.text.primary}
                        >
                          ${parseFloat(usdValue).toFixed(2)}
                        </CustomText>
                      </View>
                    )}

                    {/* Transaction Fee */}
                    {(feeAmount > 0 || displayFeePercentage > 0) && (
                      <View style={styles(theme).detailRow}>
                        <CustomText
                          variant={SLIP_LABEL_VARIANT}
                          color={theme.colors.text.secondary}
                          style={slipStyles.slipLabelText}
                        >
                          Transaction Fee
                        </CustomText>
                        <CustomText
                          variant={SLIP_VALUE_VARIANT}
                          fontWeight="semiBold"
                          color={theme.colors.text.primary}
                          style={slipStyles.slipValueText}
                        >
                          ${feeAmount.toFixed(2)} ({displayFeePercentage.toFixed(2)}%)
                        </CustomText>
                      </View>
                    )}
                  </>
                )}

                {/* ========== CRYPTO SEND ========== */}
                {isCryptoSend && (
                  <>
                    {/* Sent To */}
                    <View style={styles(theme).detailRow}>
                      <CustomText
                        variant={SLIP_LABEL_VARIANT}
                        color={theme.colors.text.secondary}
                        style={slipStyles.slipLabelText}
                      >
                        Sent To
                      </CustomText>
                      <CustomText
                        variant={SLIP_VALUE_VARIANT}
                        fontWeight="semiBold"
                        color={theme.colors.text.primary}
                        style={slipStyles.slipValueText}
                      >
                        {displayUsername}
                      </CustomText>
                    </View>

                    {/* Network */}
                    {/* {cryptoNetwork && (
                      <View style={styles(theme).detailRow}>
                        <CustomText
                          variant={SLIP_LABEL_VARIANT}
                          color={theme.colors.text.secondary}
                          style={slipStyles.slipLabelText}
                        >
                          Network
                        </CustomText>
                        <CustomText
                          variant={SLIP_VALUE_VARIANT}
                          fontWeight="semiBold"
                          color={theme.colors.text.primary}
                          style={slipStyles.slipValueText}
                        >
                          {cryptoNetwork}
                        </CustomText>
                      </View>
                    )} */}

                    {/* From Address */}
                    {fromAddress && (
                      <View style={styles(theme).detailRow}>
                        <CustomText
                          variant={SLIP_LABEL_VARIANT}
                          color={theme.colors.text.secondary}
                          style={slipStyles.slipLabelText}
                        >
                          From Address
                        </CustomText>
                        <TouchableOpacity
                          onPress={handleCopyFromAddress}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <CustomText
                            variant={SLIP_VALUE_VARIANT}
                            fontWeight="semiBold"
                            color={theme.colors.text.primary}
                            numberOfLines={1}
                            style={[
                              slipStyles.slipValueText,
                              { maxWidth: 150 },
                            ]}
                          >
                            {fromAddress.length > 16
                              ? `${fromAddress.substring(0, 16)}...`
                              : fromAddress}
                          </CustomText>
                          <SvgIcons.CopyOutlineBlack
                            width={14}
                            height={14}
                            color={theme.colors.text.primary}
                          />
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* To Address */}
                    {/* {toAddress && (
                      <View style={styles(theme).detailRow}>
                        <CustomText
                          variant={SLIP_LABEL_VARIANT}
                          color={theme.colors.text.secondary}
                        >
                          To Address
                        </CustomText>
                        <TouchableOpacity
                          onPress={handleCopyToAddress}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <CustomText
                            variant={SLIP_VALUE_VARIANT}
                            fontWeight="semiBold"
                            color={theme.colors.text.primary}
                            numberOfLines={1}
                            style={{ maxWidth: 150 }}
                          >
                            {toAddress.length > 16
                              ? `${toAddress.substring(0, 16)}...`
                              : toAddress}
                          </CustomText>
                          <SvgIcons.CopyOutlineBlack
                            width={14}
                            height={14}
                            color={theme.colors.text.primary}
                          />
                        </TouchableOpacity>
                      </View>
                    )} */}

                    {/* Transaction Hash */}
                    {/* {txHash && (
                      <View style={styles(theme).detailRow}>
                        <CustomText
                          variant={SLIP_LABEL_VARIANT}
                          color={theme.colors.text.secondary}
                        >
                          Tx Hash
                        </CustomText>
                        <TouchableOpacity
                          onPress={handleCopyTxHash}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <CustomText
                            variant={SLIP_VALUE_VARIANT}
                            fontWeight="semiBold"
                            color={theme.colors.text.primary}
                            numberOfLines={1}
                            style={{ maxWidth: 150 }}
                          >
                            {txHash.length > 16
                              ? `${txHash.substring(0, 16)}...`
                              : txHash}
                          </CustomText>
                          <SvgIcons.CopyOutlineBlack
                            width={14}
                            height={14}
                            color={theme.colors.text.primary}
                          />
                        </TouchableOpacity>
                      </View>
                    )} */}

                    {/* USD Value */}
                    {usdValue && (
                      <View style={styles(theme).detailRow}>
                        <CustomText
                          variant={SLIP_LABEL_VARIANT}
                          color={theme.colors.text.secondary}
                        >
                          USD Value
                        </CustomText>
                        <CustomText
                          variant={SLIP_VALUE_VARIANT}
                          fontWeight="semiBold"
                          color={theme.colors.text.primary}
                        >
                          ${parseFloat(usdValue).toFixed(2)}
                        </CustomText>
                      </View>
                    )}

                    {/* Fee */}
                    {(feeAmount > 0 || displayFeePercentage > 0) && (
                      <View style={styles(theme).detailRow}>
                        <CustomText
                          variant={SLIP_LABEL_VARIANT}
                          color={theme.colors.text.secondary}
                          style={slipStyles.slipLabelText}
                        >
                          Transaction Fee
                        </CustomText>
                        <CustomText
                          variant={SLIP_VALUE_VARIANT}
                          fontWeight="semiBold"
                          color={theme.colors.text.primary}
                          style={slipStyles.slipValueText}
                        >
                          {currencySymbol} {feeAmount.toFixed(2)}
                          {displayFeePercentage > 0 && ` (${displayFeePercentage.toFixed(2)}%)`}
                        </CustomText>
                      </View>
                    )}
                  </>
                )}

                {/* ========== CRYPTO RECEIVE ========== */}
                {isCryptoReceive && (
                  <>
                    {/* Received From */}
                    <View style={styles(theme).detailRow}>
                      <CustomText
                        variant={SLIP_LABEL_VARIANT}
                        color={theme.colors.text.secondary}
                        style={slipStyles.slipLabelText}
                      >
                        Received From
                      </CustomText>
                      <CustomText
                        variant={SLIP_VALUE_VARIANT}
                        fontWeight="semiBold"
                        color={theme.colors.text.primary}
                        style={slipStyles.slipValueText}
                      >
                        {receivedFromDisplay}
                      </CustomText>
                    </View>

                    {/* Network */}
                    {cryptoNetwork && (
                      <View style={styles(theme).detailRow}>
                        <CustomText
                          variant={SLIP_LABEL_VARIANT}
                          color={theme.colors.text.secondary}
                          style={slipStyles.slipLabelText}
                        >
                          Network
                        </CustomText>
                        <CustomText
                          variant={SLIP_VALUE_VARIANT}
                          fontWeight="semiBold"
                          color={theme.colors.text.primary}
                          style={slipStyles.slipValueText}
                        >
                          {cryptoNetwork}
                        </CustomText>
                      </View>
                    )}

                    {/* From Address */}
                    {fromAddress && (
                      <View style={styles(theme).detailRow}>
                        <CustomText
                          variant={SLIP_LABEL_VARIANT}
                          color={theme.colors.text.secondary}
                          style={slipStyles.slipLabelText}
                        >
                          From Address
                        </CustomText>
                        <TouchableOpacity
                          onPress={handleCopyFromAddress}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <CustomText
                            variant={SLIP_VALUE_VARIANT}
                            fontWeight="semiBold"
                            color={theme.colors.text.primary}
                            numberOfLines={1}
                            style={[
                              slipStyles.slipValueText,
                              { maxWidth: 150 },
                            ]}
                          >
                            {fromAddress.length > 16
                              ? `${fromAddress.substring(0, 16)}...`
                              : fromAddress}
                          </CustomText>
                          <SvgIcons.CopyOutlineBlack
                            width={14}
                            height={14}
                            color={theme.colors.text.primary}
                          />
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* To Address */}
                    {toAddress && (
                      <View style={styles(theme).detailRow}>
                        <CustomText
                          variant={SLIP_LABEL_VARIANT}
                          color={theme.colors.text.secondary}
                          style={slipStyles.slipLabelText}
                        >
                          To Address
                        </CustomText>
                        <TouchableOpacity
                          onPress={handleCopyToAddress}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <CustomText
                            variant={SLIP_VALUE_VARIANT}
                            fontWeight="semiBold"
                            color={theme.colors.text.primary}
                            numberOfLines={1}
                            style={[
                              slipStyles.slipValueText,
                              { maxWidth: 150 },
                            ]}
                          >
                            {toAddress.length > 16
                              ? `${toAddress.substring(0, 16)}...`
                              : toAddress}
                          </CustomText>
                          <SvgIcons.CopyOutlineBlack
                            width={14}
                            height={14}
                            color={theme.colors.text.primary}
                          />
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Transaction Hash */}
                    {txHash && (
                      <View style={styles(theme).detailRow}>
                        <CustomText
                          variant={SLIP_LABEL_VARIANT}
                          color={theme.colors.text.secondary}
                          style={slipStyles.slipLabelText}
                        >
                          Tx Hash
                        </CustomText>
                        <TouchableOpacity
                          onPress={handleCopyTxHash}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <CustomText
                            variant={SLIP_VALUE_VARIANT}
                            fontWeight="semiBold"
                            color={theme.colors.text.primary}
                            numberOfLines={1}
                            style={[
                              slipStyles.slipValueText,
                              { maxWidth: 150 },
                            ]}
                          >
                            {txHash.length > 16
                              ? `${txHash.substring(0, 16)}...`
                              : txHash}
                          </CustomText>
                          <SvgIcons.CopyOutlineBlack
                            width={14}
                            height={14}
                            color={theme.colors.text.primary}
                          />
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* USD Value */}
                    {usdValue && (
                      <View style={styles(theme).detailRow}>
                        <CustomText
                          variant={SLIP_LABEL_VARIANT}
                          color={theme.colors.text.secondary}
                          style={slipStyles.slipLabelText}
                        >
                          USD Value
                        </CustomText>
                        <CustomText
                          variant={SLIP_VALUE_VARIANT}
                          fontWeight="semiBold"
                          color={theme.colors.text.primary}
                          style={slipStyles.slipValueText}
                        >
                          ${parseFloat(usdValue).toFixed(2)}
                        </CustomText>
                      </View>
                    )}
                  </>
                )}

                {/* ========== CRYPTO WITHDRAWAL ========== */}
                {isCryptoWithdrawal && (
                  <>
                    {/* Withdrawn To */}
                    <View style={styles(theme).detailRow}>
                      <CustomText
                        variant={SLIP_LABEL_VARIANT}
                        color={theme.colors.text.secondary}
                        style={slipStyles.slipLabelText}
                      >
                        Withdrawn To
                      </CustomText>
                      <CustomText
                        variant={SLIP_VALUE_VARIANT}
                        fontWeight="semiBold"
                        color={theme.colors.text.primary}
                        style={slipStyles.slipValueText}
                      >
                        {displayUsername}
                      </CustomText>
                    </View>

                    {/* Network */}
                    {cryptoNetwork && (
                      <View style={styles(theme).detailRow}>
                        <CustomText
                          variant={SLIP_LABEL_VARIANT}
                          color={theme.colors.text.secondary}
                          style={slipStyles.slipLabelText}
                        >
                          Network
                        </CustomText>
                        <CustomText
                          variant={SLIP_VALUE_VARIANT}
                          fontWeight="semiBold"
                          color={theme.colors.text.primary}
                          style={slipStyles.slipValueText}
                        >
                          {cryptoNetwork}
                        </CustomText>
                      </View>
                    )}

                    {/* From Address */}
                    {/* {fromAddress && (
                    <View style={styles(theme).detailRow}>
                      <CustomText 
                        variant={SLIP_LABEL_VARIANT} 
                        color={theme.colors.text.secondary}
                        style={slipStyles.slipLabelText}
                      >
                        From Address
                      </CustomText>
                      <TouchableOpacity
                        onPress={handleCopyFromAddress}
                        style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                      >
                        <CustomText
                          variant={SLIP_VALUE_VARIANT}
                          fontWeight="semiBold"
                          color={theme.colors.text.primary}
                          numberOfLines={1}
                          style={[slipStyles.slipValueText, { maxWidth: 150 }]}
                        >
                          {fromAddress.length > 16 ? `${fromAddress.substring(0, 16)}...` : fromAddress}
                        </CustomText>
                        <SvgIcons.CopyOutlineBlack
                          width={14}
                          height={14}
                          color={theme.colors.text.primary}
                        />
                      </TouchableOpacity>
                    </View>
                  )} */}

                    {/* To Address (External Address) */}
                    {toAddress && (
                      <View style={styles(theme).detailRow}>
                        <CustomText
                          variant={SLIP_LABEL_VARIANT}
                          color={theme.colors.text.secondary}
                          style={slipStyles.slipLabelText}
                        >
                          To Address
                        </CustomText>
                        <TouchableOpacity
                          onPress={handleCopyToAddress}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <CustomText
                            variant={SLIP_VALUE_VARIANT}
                            fontWeight="semiBold"
                            color={theme.colors.text.primary}
                            numberOfLines={1}
                            style={[
                              slipStyles.slipValueText,
                              { maxWidth: 150 },
                            ]}
                          >
                            {toAddress.length > 16
                              ? `${toAddress.substring(0, 16)}...`
                              : toAddress}
                          </CustomText>
                          <SvgIcons.CopyOutlineBlack
                            width={14}
                            height={14}
                            color={theme.colors.text.primary}
                          />
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* USD Value */}
                    {usdValue && (
                      <View style={styles(theme).detailRow}>
                        <CustomText
                          variant={SLIP_LABEL_VARIANT}
                          color={theme.colors.text.secondary}
                          style={slipStyles.slipLabelText}
                        >
                          USD Value
                        </CustomText>
                        <CustomText
                          variant={SLIP_VALUE_VARIANT}
                          fontWeight="semiBold"
                          color={theme.colors.text.primary}
                          style={slipStyles.slipValueText}
                        >
                          ${parseFloat(usdValue).toFixed(2)}
                        </CustomText>
                      </View>
                    )}

                    {/* Transaction Fee */}
                    {(feeAmount > 0 || displayFeePercentage > 0) && (
                      <View style={styles(theme).detailRow}>
                        <CustomText
                          variant={SLIP_LABEL_VARIANT}
                          color={theme.colors.text.secondary}
                          style={slipStyles.slipLabelText}
                        >
                          Transaction Fee
                        </CustomText>
                        <CustomText
                          variant={SLIP_VALUE_VARIANT}
                          fontWeight="semiBold"
                          color={theme.colors.text.primary}
                          style={slipStyles.slipValueText}
                        >
                          {currencySymbol} {feeAmount.toFixed(2)}
                          {displayFeePercentage > 0 && ` (${displayFeePercentage.toFixed(2)}%)`}
                        </CustomText>
                      </View>
                    )}
                  </>
                )}
              </>
            )}

            {/* Note */}
            {transactionData.note && (
              <View style={[styles(theme).detailRow, { borderBottomWidth: 0 }]}>
                <CustomText
                  variant={SLIP_LABEL_VARIANT}
                  color={theme.colors.text.secondary}
                  style={slipStyles.slipLabelText}
                >
                  Note
                </CustomText>
                <CustomText
                  variant={SLIP_VALUE_VARIANT}
                  fontWeight="semiBold"
                  color={theme.colors.text.primary}
                  style={[
                    slipStyles.slipValueText,
                    { maxWidth: 200, textAlign: "right" },
                  ]}
                >
                  {transactionData.note}
                </CustomText>
              </View>
            )}
          </View>
          <View style={slipStyles.coinmeFooter}>
            <CustomText
              variant="subtitle1"
              fontWeight="semiBold"
              color={theme.colors.text.primary}
              style={slipStyles.coinmeFooterTitle}
            >
              Powered by Coinme
            </CustomText>
            <CustomText
              variant="body2"
              color={theme.colors.text.tertiary}
              style={slipStyles.coinmeFooterAddress}
            >
              255 S. King Street Suite 800 Seattle, WA 98104
            </CustomText>
            <TouchableOpacity
              activeOpacity={0.7}
              style={slipStyles.coinmeLinkRow}
              onPress={() => Linking.openURL(COINME_WEB_URL)}
            >
              <CoinmeGlobeIcon color={theme.colors.palette.blue500} size={14} />
              <CustomText
                variant="body2"
                color={theme.colors.palette.blue500}
                style={slipStyles.coinmeLinkText}
              >
                coinme.com
              </CustomText>
            </TouchableOpacity>
          </View>
        </ViewShot>

        <View style={{ paddingHorizontal: 20, marginBottom: 40 }}>
          <Button onPress={handleScreenshotShare}>{"Share"}</Button>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = (theme: Theme) =>
  StyleSheet.create({
    headerSection: {
      alignItems: "center",
      paddingVertical: 20,
      backgroundColor: theme.colors.palette.white,
    },
    avatarContainerBig: {
      marginBottom: 12,
    },
    avatarBig: {
      width: 80,
      height: 80,
      borderRadius: 40,
    },
    avatarPlaceholderBig: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.palette.green700,
      justifyContent: "center",
      alignItems: "center",
    },
    amountText: {
      fontSize: 40,
      fontWeight: "800",
      marginBottom: 8,
      marginTop: 4,
      fontFamily: "System",
      textAlign: "center",
    },
    statusBadge: {
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 20,
      marginTop: 4,
    },
    whiteCard: {
      backgroundColor: theme.colors.palette.white,
      marginHorizontal: 20,
      borderRadius: 8,
      paddingHorizontal: 20,
      paddingVertical: 10,
      marginVertical: 20,
      borderWidth: 1,
      borderColor: theme.colors.palette.grey300,
    },
    detailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.palette.grey100,
    },
    // Slip text styles - adjust fontSize here for direct control
    slipLabelText: {
      fontSize: SLIP_LABEL_FONT_SIZE, // Change this value to adjust label font size
    },
    slipValueText: {
      fontSize: SLIP_VALUE_FONT_SIZE, // Change this value to adjust value font size
    },
    screenshotContainer: {
      backgroundColor: theme.colors.palette.white,
      borderRadius: 8,
      padding: 0,
    },
    coinmeFooter: {
      paddingHorizontal: 20,
      marginBottom: 40,
      alignItems: "center",
    },
    coinmeFooterTitle: {
      textAlign: "center",
      marginBottom: 6,
    },
    coinmeFooterAddress: {
      textAlign: "center",
      marginBottom: 8,
    },
    coinmeLinkRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    coinmeLinkText: {
      marginTop: 1,
    },
  });

export default NewTransactionDetails;

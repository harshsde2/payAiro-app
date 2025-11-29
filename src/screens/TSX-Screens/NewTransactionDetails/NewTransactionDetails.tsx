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
import { useRoute } from "@react-navigation/native";
import moment from "moment";
import { SvgUri } from "react-native-svg";
import { useTheme, Theme } from "styles";
import { ScreenContainer } from "HOC";
import HeaderTitle from "components/HeaderTitle";
import CustomText from "tsx-components/CustomText";
import { SvgIcons } from "constants/svgs";
import GenericButton from "components/GenericButton";
import { INewTransactionDetailsProps } from "./types";
// OR use react-native's built-in method for Android

// Typography variants for transaction slip - change these to adjust font size globally
const SLIP_LABEL_VARIANT = "caption" as const;
const SLIP_VALUE_VARIANT = "caption" as const;


// Font size styles for transaction slip - adjust fontSize here to change size directly
// You can also modify these in the styles function below
const SLIP_LABEL_FONT_SIZE = 11; // Change this value to adjust label font size
const SLIP_VALUE_FONT_SIZE = 11; // Change this value to adjust value font size

const NewTransactionDetails: FC = () => {
  const route = useRoute();
  const { theme } = useTheme();
  const screenshotRef = useRef<ViewShot>(null);
  
  const { transactionData } =
    route.params as INewTransactionDetailsProps["route"]["params"];

  // Get slip text styles - these can be modified in the styles function below
  const slipStyles = styles(theme);

  console.log("transactionData =>", JSON.stringify(transactionData, null, 2));

  // Direction
  const isIncoming = transactionData.direction === "incoming";

  // Status logic
  const status = transactionData.status?.toLowerCase();
  const isSuccess = status === "success" || status === "complete";
  const isPending =
    status === "pending" || status === "processing" || status === "storing";
  const isFailed = status === "failed" || status === "cancelled";

  let statusText = "Completed";
  let statusBg = theme.colors.palette.green700;

  if (isPending) {
    statusText = status?.charAt(0).toUpperCase() + status?.slice(1) || "Pending";
    statusBg = theme.colors.palette.orange500;
  } else if (isFailed) {
    statusText = status === "cancelled" ? "Cancelled" : "Failed";
    statusBg = theme.colors.palette.red500;
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

  // Fee
  const feeAmount = parseFloat(transactionData.fee?.amount || "0");

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
    if (isCryptoBuy) return `Bought ${cryptoAsset || "Crypto"}`;
    if (isCryptoSell) return `Sold ${cryptoAsset || "Crypto"}`;
    if (isCryptoSend) return `Sent ${cryptoAsset || "Crypto"}`;
    if (isCryptoReceive) return `Received ${cryptoAsset || "Crypto"}`;
    if (isCryptoWithdrawal) return `Withdrawn ${cryptoAsset || "Crypto"}`;
    return getTransactionTypeLabel();
  };

  // Get transaction subtitle based on scenario (for crypto)
  const getCryptoSubtitle = (): string | null => {
    if (isCryptoSend) return `To ${displayUsername}`;
    if (isCryptoReceive) return `From ${displayUsername}`;
    if (isCryptoWithdrawal) {
      return displayUsername === "External Wallet" 
        ? "To External Wallet" 
        : `To ${displayUsername}`;
    }
    return null; // No subtitle for Buy/Sell
  };

  // Get amount display for crypto transactions
  const getCryptoAmount = (): { amount: string; currency: string } => {
    if (isCryptoBuy) {
      // Show final_amount (crypto received)
      return {
        amount: parseFloat(transactionData.final_amount || transactionData.amount || "0").toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 8,
        }),
        currency: toCurrency || cryptoAsset || "Crypto",
      };
    }
    if (isCryptoSell) {
      // Show final_amount in USD
      return {
        amount: parseFloat(transactionData.final_amount || transactionData.amount || "0").toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        currency: "USD",
      };
    }
    // For Send, Receive, Withdrawal - show amount with currency
    return {
      amount: parseFloat(transactionData.amount || "0").toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 8,
      }),
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
          locationInfo = "Downloads folder\n\nYou can find it in:\n• Files app > Downloads\n• Or use a file manager app";
        } else {
          saveDir = `${RNFS.DocumentDirectoryPath}/${fileName}`;
          locationInfo = "Files app > On My iPhone > PayAiro\n\nOr connect to iTunes/Finder to access";
        }

        // Process the URI - remove file:// prefix if present for RNFS operations
        const sourcePath = uri.startsWith("file://") ? uri.replace("file://", "") : uri;

        // Copy the captured image to the save directory
        await RNFS.copyFile(sourcePath, saveDir);

        // For Android: Trigger media scan to make file visible in Downloads app
        if (Platform.OS === "android") {
          try {
            // Use react-native's Linking to trigger media scan
            const { NativeModules } = require('react-native');
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
        `Failed to download transaction receipt.\n\nError: ${error.message || "Unknown error"}\n\nPlease check app permissions.`,
        [{ text: "OK" }]
      );
    }
  };

  // Share transaction (screenshot)
  const handleScreenshotShare = async () => {
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
    const imageUrl = !isCrypto && isValidPhoto(cryptoIconUrl) ? cryptoIconUrl : displayProfilePhoto;

    if (isValidPhoto(imageUrl) && imageUrl) {
      if (imageUrl.toLowerCase().endsWith(".svg")) {
        return (
          <View style={styles(theme).avatarBig}>
            <SvgUri
              uri={imageUrl}
              width={80}
              height={80}
            />
          </View>
        );
      }
      return <Image source={{ uri: imageUrl }} style={styles(theme).avatarBig} />;
    }

    return (
      <View style={styles(theme).avatarPlaceholderBig}>
        <CustomText variant="h2" color={theme.colors.palette.white}>
          {getInitials(displayUsername)}
        </CustomText>
      </View>
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
    <ScreenContainer padding={0} backgroundColor={theme.colors.palette.green50}>
      <HeaderTitle 
        title="Transaction Details" 
        leftIcon="back"
        rightIcon={
          <SvgIcons.ShareIcon width={30} height={30} />
        }
        onPressRight={handleScreenshotShare}
      />
      
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
                { color: isIncoming ? theme.colors.palette.green700 : theme.colors.palette.black },
              ]}
            >
              {currencySymbol} {formattedAmount}
            </CustomText>
          )}

            <View style={[styles(theme).statusBadge, { backgroundColor: statusBg }]}>
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
              {moment(transactionData.created_at).format("DD MMM YYYY")}
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
              {moment(transactionData.created_at).format("h:mm a")}
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
          {isCrypto && feeAmount > 0 && (
            <View style={styles(theme).detailRow}>
              <CustomText 
                variant={SLIP_LABEL_VARIANT} 
                color={theme.colors.text.secondary}
                style={slipStyles.slipLabelText}
              >
                Fee
              </CustomText>
              <CustomText
                variant={SLIP_VALUE_VARIANT}
                fontWeight="semiBold"
                color={theme.colors.text.primary}
                style={slipStyles.slipValueText}
              >
                {currencySymbol} {feeAmount.toFixed(2)}
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
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
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
                        {parseFloat(transactionData.final_amount || transactionData.amount || "0").toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 8,
                        })} {toCurrency}
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
                        1 {fromCurrency || "USD"} = {parseFloat(exchangeRate).toFixed(2)} {toCurrency || cryptoAsset}
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
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
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
                      {parseFloat(transactionData.final_amount || transactionData.amount || "0").toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })} USD
                    </CustomText>
                  </View>

                  {/* Exchange Rate */}
                  {exchangeRate && (
                    <View style={styles(theme).detailRow}>
                      <CustomText variant={SLIP_LABEL_VARIANT} color={theme.colors.text.secondary}>
                        Exchange Rate
                      </CustomText>
                      <CustomText
                        variant={SLIP_VALUE_VARIANT}
                        fontWeight="semiBold"
                        color={theme.colors.text.primary}
                      >
                        1 {fromCurrency} = {parseFloat(exchangeRate).toFixed(2)} USD
                      </CustomText>
                    </View>
                  )}

                  {/* USD Value */}
                  {usdValue && (
                    <View style={styles(theme).detailRow}>
                      <CustomText variant={SLIP_LABEL_VARIANT} color={theme.colors.text.secondary}>
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
                  )}

                  {/* To Address */}
                  {toAddress && (
                    <View style={styles(theme).detailRow}>
                      <CustomText variant={SLIP_LABEL_VARIANT} color={theme.colors.text.secondary}>
                        To Address
                      </CustomText>
                      <TouchableOpacity
                        onPress={handleCopyToAddress}
                        style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                      >
                        <CustomText
                          variant={SLIP_VALUE_VARIANT}
                          fontWeight="semiBold"
                          color={theme.colors.text.primary}
                          numberOfLines={1}
                          style={{ maxWidth: 150 }}
                        >
                          {toAddress.length > 16 ? `${toAddress.substring(0, 16)}...` : toAddress}
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
                      <CustomText variant={SLIP_LABEL_VARIANT} color={theme.colors.text.secondary}>
                        Tx Hash
                      </CustomText>
                      <TouchableOpacity
                        onPress={handleCopyTxHash}
                        style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                      >
                        <CustomText
                          variant={SLIP_VALUE_VARIANT}
                          fontWeight="semiBold"
                          color={theme.colors.text.primary}
                          numberOfLines={1}
                          style={{ maxWidth: 150 }}
                        >
                          {txHash.length > 16 ? `${txHash.substring(0, 16)}...` : txHash}
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
                      <CustomText variant={SLIP_LABEL_VARIANT} color={theme.colors.text.secondary}>
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
                  {feeAmount > 0 && (
                    <View style={styles(theme).detailRow}>
                      <CustomText variant={SLIP_LABEL_VARIANT} color={theme.colors.text.secondary}>
                        Fee
                      </CustomText>
                      <CustomText
                        variant={SLIP_VALUE_VARIANT}
                        fontWeight="semiBold"
                        color={theme.colors.text.primary}
                      >
                        {currencySymbol} {feeAmount.toFixed(2)}
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
                        style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                      >
                        <CustomText
                          variant={SLIP_VALUE_VARIANT}
                          fontWeight="semiBold"
                          color={theme.colors.text.primary}
                          numberOfLines={1}
                          style={[slipStyles.slipValueText, { maxWidth: 150 }]}
                        >
                          {toAddress.length > 16 ? `${toAddress.substring(0, 16)}...` : toAddress}
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
                        style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                      >
                        <CustomText
                          variant={SLIP_VALUE_VARIANT}
                          fontWeight="semiBold"
                          color={theme.colors.text.primary}
                          numberOfLines={1}
                          style={[slipStyles.slipValueText, { maxWidth: 150 }]}
                        >
                          {txHash.length > 16 ? `${txHash.substring(0, 16)}...` : txHash}
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
                  )}

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
                        style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                      >
                        <CustomText
                          variant={SLIP_VALUE_VARIANT}
                          fontWeight="semiBold"
                          color={theme.colors.text.primary}
                          numberOfLines={1}
                          style={[slipStyles.slipValueText, { maxWidth: 150 }]}
                        >
                          {toAddress.length > 16 ? `${toAddress.substring(0, 16)}...` : toAddress}
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
                style={[slipStyles.slipValueText, { maxWidth: 200, textAlign: "right" }]}
              >
                {transactionData.note}
              </CustomText>
            </View>
          )}
        </View>
        </ViewShot>
        
        <View style={{ paddingHorizontal: 20, marginBottom: 40 }}>
          <GenericButton title="Download" onPress={handleDownload} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = (theme: Theme) =>
  StyleSheet.create({
  headerSection: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: theme.colors.palette.green50,
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
    backgroundColor: theme.colors.palette.green50,
    borderRadius: 8,
    padding: 0,
    
  },
});

export default NewTransactionDetails;

import React, { FC } from "react";
import {
  View,
  StyleSheet,
  Image,
  Linking,
  Alert,
  ScrollView,
  Clipboard,
  TouchableOpacity,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import moment from "moment";
import { useTheme, Theme } from "styles";
import { ScreenContainer } from "HOC";
import HeaderTitle from "components/HeaderTitle";
import CustomText from "tsx-components/CustomText";
import { SvgIcons } from "constants/svgs";
import GenericButton from "components/GenericButton";
import { INewTransactionDetailsProps } from "./types";

const NewTransactionDetails: FC = () => {
  const route = useRoute();
  const { theme } = useTheme();

  const { transactionData } =
    route.params as INewTransactionDetailsProps["route"]["params"];

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

  // Currency symbol
  const currencySymbol =
    transactionData.currency_symbol !== transactionData.currency
      ? transactionData.currency_symbol
      : "$";

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
  const isCrypto = transactionData.transaction_category === "crypto";
  const cryptoAsset = transactionData.crypto_details?.asset || transactionData.crypto_details?.token;
  const cryptoNetwork = transactionData.crypto_details?.network;

  // Transaction type label
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

  // Download receipt
  const handleDownload = () => {
    Alert.alert("Download", "Download receipt feature coming soon.");
  };

  // Share transaction
  const handleShare = () => {
    const shareText = `Transaction Details\nID: ${transactionData.transaction_id}\nAmount: ${currencySymbol}${formattedAmount}\nStatus: ${statusText}`;
    Linking.openURL(`https://wa.me/?text=${encodeURIComponent(shareText)}`);
  };

  // Get initials for avatar placeholder
  const getInitials = (name: string): string => {
    return name?.charAt(0).toUpperCase() || "?";
  };

  // Check if profile photo is valid
  const isValidPhoto = (photo: string | null | undefined): boolean => {
    return !!photo && photo !== "null" && photo !== "";
  };

  return (
    <ScreenContainer padding={0} backgroundColor={theme.colors.palette.green50}>
      <HeaderTitle
        title="Transaction Details"
        leftIcon="back"
        rightIcon={
          <CustomText variant="body1" fontWeight="semiBold">
            Share
          </CustomText>
        }
        onPressRight={handleShare}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header / Summary Block */}
        <View style={styles(theme).headerSection}>
          <View style={styles(theme).avatarContainerBig}>
            {isValidPhoto(displayProfilePhoto) ? (
              <Image
                source={{ uri: displayProfilePhoto! }}
                style={styles(theme).avatarBig}
              />
            ) : (
              <View style={styles(theme).avatarPlaceholderBig}>
                <CustomText variant="h2" color={theme.colors.palette.white}>
                  {getInitials(displayUsername)}
                </CustomText>
              </View>
            )}
          </View>

          <CustomText
            variant="body1"
            color={theme.colors.text.primary}
            style={{ marginBottom: 4, fontSize: 16 }}
          >
            {isIncoming ? "From" : "To"} {displayUsername}
          </CustomText>

          <CustomText
            variant="h1"
            style={[
              styles(theme).amountText,
              { color: isIncoming ? theme.colors.palette.green700 : theme.colors.palette.black },
            ]}
          >
            {currencySymbol}
            {formattedAmount}
          </CustomText>

          <View style={[styles(theme).statusBadge, { backgroundColor: statusBg }]}>
            <CustomText
              variant="caption"
              fontWeight="semiBold"
              style={{ color: theme.colors.palette.white }}
            >
              {statusText}
            </CustomText>
          </View>

          {/* Transaction Type Badge */}
          <CustomText
            variant="caption"
            color={theme.colors.text.secondary}
            style={{ marginTop: 8 }}
          >
            {getTransactionTypeLabel()}
          </CustomText>
        </View>

        {/* White Card Section */}
        <View style={styles(theme).whiteCard}>
          {/* Transfer Date */}
          <View style={styles(theme).detailRow}>
            <CustomText variant="body2" color={theme.colors.text.secondary}>
              Transfer Date
            </CustomText>
            <CustomText
              variant="body2"
              fontWeight="semiBold"
              color={theme.colors.text.primary}
            >
              {moment(transactionData.created_at).format("DD MMM YYYY")}
            </CustomText>
          </View>

          {/* Transfer Time */}
          <View style={styles(theme).detailRow}>
            <CustomText variant="body2" color={theme.colors.text.secondary}>
              Transfer Time
            </CustomText>
            <CustomText
              variant="body2"
              fontWeight="semiBold"
              color={theme.colors.text.primary}
            >
              {moment(transactionData.created_at).format("h:mm a")}
            </CustomText>
          </View>

          {/* Transaction ID */}
          <View style={styles(theme).detailRow}>
            <CustomText variant="body2" color={theme.colors.text.secondary}>
              Transaction ID
            </CustomText>
            <TouchableOpacity
              onPress={handleCopyTransactionId}
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <CustomText
                variant="body2"
                fontWeight="semiBold"
                color={theme.colors.text.primary}
                numberOfLines={1}
                style={{ maxWidth: 150 }}
              >
                {transactionData.transaction_id.length > 16
                  ? `${transactionData.transaction_id.substring(0, 16)}...`
                  : transactionData.transaction_id}
              </CustomText>
              <SvgIcons.Copy
                width={14}
                height={14}
                color={theme.colors.text.primary}
              />
            </TouchableOpacity>
          </View>

          {/* Sender */}
          <View style={styles(theme).detailRow}>
            <CustomText variant="body2" color={theme.colors.text.secondary}>
              Sender
            </CustomText>
            <CustomText
              variant="body2"
              fontWeight="semiBold"
              color={theme.colors.text.primary}
            >
              {senderUsername}
            </CustomText>
          </View>

          {/* Receiver */}
          <View style={styles(theme).detailRow}>
            <CustomText variant="body2" color={theme.colors.text.secondary}>
              Receiver
            </CustomText>
            <CustomText
              variant="body2"
              fontWeight="semiBold"
              color={theme.colors.text.primary}
            >
              {recipientUsername}
            </CustomText>
          </View>

          {/* Category */}
          {transactionData.category && (
            <View style={styles(theme).detailRow}>
              <CustomText variant="body2" color={theme.colors.text.secondary}>
                Category
              </CustomText>
              <CustomText
                variant="body2"
                fontWeight="semiBold"
                color={theme.colors.text.primary}
              >
                {transactionData.category
                  .split("_")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </CustomText>
            </View>
          )}

          {/* Bank */}
          <View style={styles(theme).detailRow}>
            <CustomText variant="body2" color={theme.colors.text.secondary}>
              Bank
            </CustomText>
            <CustomText
              variant="body2"
              fontWeight="semiBold"
              color={theme.colors.text.primary}
            >
              {bankName}
            </CustomText>
          </View>

          {/* Account Number */}
          {accountNumberMasked && (
            <View style={styles(theme).detailRow}>
              <CustomText variant="body2" color={theme.colors.text.secondary}>
                Account Number
              </CustomText>
              <CustomText
                variant="body2"
                fontWeight="semiBold"
                color={theme.colors.text.primary}
              >
                {accountNumberMasked}
              </CustomText>
            </View>
          )}

          {/* Fee */}
          {feeAmount > 0 && (
            <View style={styles(theme).detailRow}>
              <CustomText variant="body2" color={theme.colors.text.secondary}>
                Fee
              </CustomText>
              <CustomText
                variant="body2"
                fontWeight="semiBold"
                color={theme.colors.text.primary}
              >
                {currencySymbol}
                {feeAmount.toFixed(2)}
              </CustomText>
            </View>
          )}

          {/* Crypto Details */}
          {isCrypto && cryptoAsset && (
            <View style={styles(theme).detailRow}>
              <CustomText variant="body2" color={theme.colors.text.secondary}>
                Asset
              </CustomText>
              <CustomText
                variant="body2"
                fontWeight="semiBold"
                color={theme.colors.text.primary}
              >
                {cryptoAsset}
              </CustomText>
            </View>
          )}

          {isCrypto && cryptoNetwork && (
            <View style={styles(theme).detailRow}>
              <CustomText variant="body2" color={theme.colors.text.secondary}>
                Network
              </CustomText>
              <CustomText
                variant="body2"
                fontWeight="semiBold"
                color={theme.colors.text.primary}
              >
                {cryptoNetwork}
              </CustomText>
            </View>
          )}

          {/* Note */}
          {transactionData.note && (
            <View style={[styles(theme).detailRow, { borderBottomWidth: 0 }]}>
              <CustomText variant="body2" color={theme.colors.text.secondary}>
                Note
              </CustomText>
              <CustomText
                variant="body2"
                fontWeight="semiBold"
                color={theme.colors.text.primary}
                style={{ maxWidth: 200, textAlign: "right" }}
              >
                {transactionData.note}
              </CustomText>
            </View>
          )}
        </View>

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
      borderRadius: 24,
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
  });

export default NewTransactionDetails;

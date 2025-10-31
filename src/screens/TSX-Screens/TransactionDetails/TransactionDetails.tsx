import React, { FC, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  Linking,
  Share,
  Alert,
} from "react-native";
import ViewShot, { captureRef } from "react-native-view-shot";
import { useNavigation, useRoute } from "@react-navigation/native";
import moment from "moment";
import { Theme, useTheme } from "styles";
import { CustomText } from "tsx-components";
import {
  ITransactionDetailsProps,
  IFiatTransaction,
  ICryptoSendReceiveTransaction,
  ICryptoBuyTransaction,
  ICryptoTransferTransaction,
} from "./types";
import { defaultImage } from "utils/configs";
import useSelectorAction from "hooks/useSelectorAction";
import { ScreenContainer } from "HOC";
import HeaderTitle from "components/HeaderTitle";
import { useGlobalStyles } from "styles/GlobalStyles";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";

const TransactionDetails: FC = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const styles = { ...transactionDetailsStyles(theme), ...useGlobalStyles() };
  const { walletData } = useSelectorAction() as any;
  const screenshotRef = useRef<ViewShot>(null);

  const { transactionData, isCrypto = false } =
    route.params as ITransactionDetailsProps["route"]["params"];

  const isSentByMe =
    (transactionData as IFiatTransaction).sender_username ===
    walletData?.username;
  const recipient = isSentByMe
    ? (transactionData as IFiatTransaction).recipient_username
    : (transactionData as IFiatTransaction).sender_username;
  // console.log("transactionData =>",JSON.stringify(transactionData,null,2))
  const isFiatTransaction = (data: any): data is IFiatTransaction => {
    return "transaction_id" in data && "sender_username" in data;
  };

  const isCryptoSendReceiveTransaction = (
    data: any
  ): data is ICryptoSendReceiveTransaction => {
    return "tx_hash" in data && "payairoTag" in data;
  };

  const isCryptoBuyTransaction = (data: any): data is ICryptoBuyTransaction => {
    return (
      "trade_id" in data &&
      "type" in data &&
      (data.type === "buy" || data.type === "sell")
    );
  };

  const isCryptoTransferTransaction = (
    data: any
  ): data is ICryptoTransferTransaction => {
    return (
      ("type" in data && data.type === "send") ||
      ("type" in data && data.type === "receive")
    );
  };

  const renderStatusBadge = (status: string) => {
    const normalizedStatus = status?.toLowerCase();
    const isSuccess = normalizedStatus === "success" || normalizedStatus === "complete";
    const isPending =
      normalizedStatus === "new" || normalizedStatus === "pending";

    let statusText = "Failed";
    let statusStyle = styles.failedBadge;
    let dotStyle = styles.failedDot;
    let textStyle = styles.failedText;

    if (isSuccess) {
      statusText = "Successful";
      statusStyle = styles.successBadge;
      dotStyle = styles.successDot;
      textStyle = styles.successText;
    } else if (isPending) {
      statusText = "Pending";
      statusStyle = styles.pendingBadge;
      dotStyle = styles.pendingDot;
      textStyle = styles.pendingText;
    }

    return (
      <View style={[styles.statusBadge, statusStyle]}>
        <View style={[styles.statusDot, dotStyle]} />
        <Text style={[styles.statusText, textStyle]}>{statusText}</Text>
      </View>
    );
  };

  const renderTransactionHeader = () => {
    if (isFiatTransaction(transactionData)) {
      const data = transactionData as IFiatTransaction;
      const isSent = walletData?.username === data.sender_username;

      return (
        <View style={styles.transactionHeader}>
          {renderStatusBadge(data.status)}

          <CustomText variant="h2" style={styles.transactionId}>
            Transaction ID #{data.id}
          </CustomText>

          <Text style={styles.transactionDate}>
            on {moment(data.created_at).format("MMM DD, YYYY")}
          </Text>

          <View style={styles.userSection}>
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                {(
                  isSent
                    ? data.recipient_profile_photo
                    : data.sender_profile_photo
                ) ? (
                  <Image
                    source={{
                      uri: `https://app.payairo.com${
                        isSent
                          ? data.recipient_profile_photo
                          : data.sender_profile_photo
                      }`,
                    }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {(isSent ? data.recipient_username : data.sender_username)
                        ?.slice(0, 2)
                        ?.toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userLabel}>
                  {isSent ? "Paid to" : "Received from"}
                </Text>
                <CustomText variant="h3" style={styles.userName}>
                  {isSent ? data.recipient_username : data.sender_username}
                </CustomText>
              </View>
            </View>
            <CustomText variant="h2" style={styles.amount}>
              ${parseFloat(data.amount).toFixed(2)}
            </CustomText>
          </View>
        </View>
      );
    } else if (isCryptoSendReceiveTransaction(transactionData)) {
      const data = transactionData as ICryptoSendReceiveTransaction;

      return (
        <View style={styles.transactionHeader}>
          {renderStatusBadge("success")}

          <CustomText variant="h2" style={styles.transactionId}>
            Transaction ID #{data.tx_hash.slice(0, 8)}...
          </CustomText>

          <Text style={styles.transactionDate}>
            on {moment(data.timestamp).format("MMM DD, YYYY")}
          </Text>

          <View style={styles.userSection}>
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {data.payairoTag?.slice(0, 2)?.toUpperCase() ||
                      data.token?.slice(0, 2)}
                  </Text>
                </View>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userLabel}>Paid to</Text>
                <CustomText variant="h3" style={styles.userName}>
                  {data.payairoTag || data.to_address}
                </CustomText>
              </View>
            </View>
            <CustomText variant="h2" style={styles.amount}>
              {parseFloat(data.value).toFixed(8)} {data.token?.toUpperCase()}
            </CustomText>
          </View>
        </View>
      );
    } else if (isCryptoBuyTransaction(transactionData)) {
      const data = transactionData as ICryptoBuyTransaction;
      const isBuy = data.type === "buy";

      return (
        <View style={styles.transactionHeader}>
          {renderStatusBadge(data.status)}

          <CustomText variant="h2" style={styles.transactionId}>
            Transaction ID #{data.id}
          </CustomText>

          <Text style={styles.transactionDate}>
            on {moment(data.created_at).format("MMM DD, YYYY")}
          </Text>

          <View style={styles.userSection}>
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                {data.icon ? (
                  <Image source={{ uri: data.icon }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {data.to_currency?.slice(0, 2)?.toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userLabel}>
                  {isBuy ? "Bought" : "Sold"}
                </Text>
                <CustomText variant="h3" style={styles.userName}>
                  {data.to_currency?.toUpperCase()} on {data.network}
                </CustomText>
              </View>
            </View>
            <CustomText variant="h2" style={styles.amount}>
              ${parseFloat(data.amount).toFixed(2)}
            </CustomText>
          </View>
        </View>
      );
    } else if (isCryptoTransferTransaction(transactionData)) {
      const data = transactionData as ICryptoTransferTransaction;

      const isSent = data.type === "send";
      const receiverName = isSent
        ? data.recipient_username || data.recipient_email || data.withdrawal_address || "Unknown"
        : data.sender_username || data.sender_email || "Unknown";

      return (
        <View style={styles.transactionHeader}>
          {renderStatusBadge(data.status)}
          <CustomText variant="h2" style={styles.transactionId}>
            Transaction ID #{data.id}
          </CustomText>
          <Text style={styles.transactionDate}>
            on {moment(data.created_at).format("MMM DD, YYYY")}
          </Text>
          <View style={styles.userSection}>
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                {data.icon ? (
                  <Image source={{ uri: data.icon }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {data.to_currency?.slice(0, 2)?.toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userLabel}>{isSent ? "Paid to" : "Received from"}</Text>
                <CustomText variant="h3" style={styles.userName}>
                  {receiverName}
                </CustomText>
            <CustomText variant="h2" style={styles.amount}>
              {parseFloat(data.final_amount).toFixed(8)} {data.to_currency?.toUpperCase()}
            </CustomText>
              </View>
            </View>
          </View>
        </View>
      );
    }
  };

  const renderTransactionDetails = () => {
    if (isFiatTransaction(transactionData)) {
      // console.log("transactionData =>",JSON.stringify(transactionData,null,2))
      const data = transactionData as IFiatTransaction;
      const isSent = walletData?.username === data.sender_username;
      const finalAmount = data.final_amount
        ? parseFloat(data.final_amount)
        : parseFloat(data.amount);
      const additionalFee = data.final_amount
        ? finalAmount - parseFloat(data.amount)
        : 0;

      return (
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Receiver</Text>
            <Text style={styles.detailValue}>
              {isSent ? data.recipient_username : data.sender_username}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transfer Amount</Text>
            <Text style={styles.detailValue}>
              ${parseFloat(data.amount).toFixed(2)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Additional Fee</Text>
            <Text style={styles.detailValue}>${additionalFee.toFixed(2)}</Text>
          </View>

          <View style={[styles.detailRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>${finalAmount.toFixed(2)}</Text>
          </View>
        </View>
      );
    } else if (isCryptoSendReceiveTransaction(transactionData)) {
      const data = transactionData as ICryptoSendReceiveTransaction;

      return (
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Receiver</Text>
            <Text style={styles.detailValue}>
              {data.payairoTag || data.to_address}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transfer Amount</Text>
            <Text style={styles.detailValue}>
              {parseFloat(data.value).toFixed(8)} {data.token?.toUpperCase()}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Network Fee</Text>
            <Text style={styles.detailValue}>
              ~0.001 {data.token?.toUpperCase()}
            </Text>
          </View>

          <View style={[styles.detailRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>
              {parseFloat(data.value).toFixed(8)} {data.token?.toUpperCase()}
            </Text>
          </View>
        </View>
      );
    } else if (isCryptoBuyTransaction(transactionData)) {
      const data = transactionData as ICryptoBuyTransaction;
      const finalAmount = data.final_amount
        ? parseFloat(data.final_amount)
        : parseFloat(data.amount);
      const transactionFee = data.final_amount
        ? parseFloat(data.amount) - finalAmount
        : 0;
      const isBuy = data.type === "buy";

      return (
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction Type</Text>
            <Text style={styles.detailValue}>
              {isBuy ? "Buy" : "Sell"} {data.to_currency?.toUpperCase()}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Network</Text>
            <Text style={styles.detailValue}>{data.network}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount</Text>
            <Text style={styles.detailValue}>
              ${parseFloat(data.amount).toFixed(2)}
            </Text>
          </View>

          {data.final_amount && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transaction Fee</Text>
              <Text style={styles.detailValue}>
                ${Math.abs(transactionFee).toFixed(2)} (
                {data.Transaction_fee_persentage || "0"}%)
              </Text>
            </View>
          )}

          <View style={[styles.detailRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Final Amount</Text>
            <Text style={styles.totalValue}>${finalAmount.toFixed(2)}</Text>
          </View>
        </View>
      );
    } else if (isCryptoTransferTransaction(transactionData)) {
      const data = transactionData as ICryptoTransferTransaction;
      const isSent = data.type === "send";

      return (
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{isSent ? "Receiver" : "Sender"}</Text>
            <Text style={styles.detailValue}>
              {isSent
                ? data.recipient_username || data.recipient_email || data.withdrawal_address || "Unknown"
                : data.sender_username || data.sender_email || "Unknown"}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transfer Amount</Text>
            <Text style={styles.detailValue}>
              {parseFloat(data.final_amount).toFixed(8)} {data.to_currency?.toUpperCase()}
            </Text>
          </View>

          {data.network ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Network</Text>
              <Text style={styles.detailValue}>{data.network}</Text>
            </View>
          ) : null}

          <View style={[styles.detailRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>
              {parseFloat(data.final_amount).toFixed(8)} {data.to_currency?.toUpperCase()}
            </Text>
          </View>
        </View>
      );
    }
  };

  const handlePayAgain = () => {
    navigation.replace(NAVIGATION_SCREENS.SCAN_PAY, {
      sender: recipient,
      type: "receive",
    });
  };

  const handleShare = () => {
    let shareText = "";

    if (isFiatTransaction(transactionData)) {
      const data = transactionData as IFiatTransaction;
      const finalAmount = data.final_amount
        ? parseFloat(data.final_amount)
        : parseFloat(data.amount);
      const additionalFee = data.final_amount
        ? finalAmount - parseFloat(data.amount)
        : 0;
      const statusText =
        data.status?.toLowerCase() === "success"
          ? "Successful"
          : data.status?.toLowerCase() === "pending" ||
            data.status?.toLowerCase() === "new"
          ? "Pending"
          : "Failed";

      shareText = `💳 PayAiro Transaction Receipt
      
🔹 Status: ${statusText}
🔹 Transaction ID: #${data.id}
🔹 Date: ${moment(data.created_at).format("MMM DD, YYYY")}

💰 Transaction Details:
• Transfer Amount: $${parseFloat(data.amount).toFixed(2)}
• Additional Fee: $${additionalFee.toFixed(2)}
• Total Amount: $${finalAmount.toFixed(2)}

Powered by PayAiro 🚀`;
    } else if (isCryptoSendReceiveTransaction(transactionData)) {
      const data = transactionData as ICryptoSendReceiveTransaction;

      shareText = `₿ PayAiro Crypto Transaction Receipt
      
🔹 Status: Successful
🔹 Transaction ID: #${data.tx_hash.slice(0, 8)}...
🔹 Date: ${moment(data.timestamp).format("MMM DD, YYYY")}

💰 Transaction Details:
• Transfer Amount: ${parseFloat(data.value).toFixed(
        8
      )} ${data.token?.toUpperCase()}
• Network Fee: ~0.001 ${data.token?.toUpperCase()}
• Total Amount: ${parseFloat(data.value).toFixed(
        8
      )} ${data.token?.toUpperCase()}

Powered by PayAiro 🚀`;
    } else if (isCryptoBuyTransaction(transactionData)) {
      const data = transactionData as ICryptoBuyTransaction;
      const finalAmount = data.final_amount
        ? parseFloat(data.final_amount)
        : parseFloat(data.amount);
      const statusText =
        data.status?.toLowerCase() === "success"
          ? "Successful"
          : data.status?.toLowerCase() === "pending" ||
            data.status?.toLowerCase() === "new"
          ? "Pending"
          : "Failed";
      const isBuy = data.type === "buy";

      shareText = `₿ PayAiro Crypto ${isBuy ? "Purchase" : "Sale"} Receipt
      
🔹 Status: ${statusText}
🔹 Transaction ID: #${data.id}
🔹 Date: ${moment(data.created_at).format("MMM DD, YYYY")}

💰 Transaction Details:
• Type: ${isBuy ? "Buy" : "Sell"} ${data.to_currency?.toUpperCase()}
• Network: ${data.network}
• Amount: $${parseFloat(data.amount).toFixed(2)}
• Final Amount: $${finalAmount.toFixed(2)}

Powered by PayAiro 🚀`;
    } else if (isCryptoTransferTransaction(transactionData)) {
      const data = transactionData as ICryptoTransferTransaction;
      const normalized = (data.status || "").toLowerCase();
      const statusText =
        normalized === "success" || normalized === "complete"
          ? "Successful"
          : normalized === "pending" || normalized === "new"
          ? "Pending"
          : "Failed";
      const isSent = data.type === "send";

      shareText = `₿ PayAiro Crypto ${isSent ? "Transfer" : "Receipt"}
      
🔹 Status: ${statusText}
🔹 Transaction ID: #${data.id}
🔹 Date: ${moment(data.created_at).format("MMM DD, YYYY")}

💰 Transaction Details:
• ${isSent ? "To" : "From"}: ${
        isSent
          ? data.recipient_username || data.recipient_email || data.withdrawal_address || "Unknown"
          : data.sender_username || data.sender_email || "Unknown"
      }
• Amount: ${parseFloat(data.final_amount).toFixed(8)} ${data.to_currency?.toUpperCase()}

Powered by PayAiro 🚀`;
    } else {
      shareText = `💳 PayAiro Transaction Receipt
      
Check out my transaction details!
      
      Powered by PayAiro 🚀`;
    }

    Linking.openURL(`https://wa.me/?text=${encodeURIComponent(shareText)}`);
  };

  const handleScreenshotShare = async () => {
    try {
      if (screenshotRef.current && screenshotRef.current.capture) {
        const uri = await screenshotRef.current.capture();

        await Share.share({
          url: uri,
          message: "PayAiro Transaction Receipt",
        });
      }
    } catch (error) {
      console.error("Screenshot sharing failed:", error);
      Alert.alert("Error", "Failed to capture and share screenshot");
    }
  };

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      <TouchableOpacity onPress={handlePayAgain} style={styles.payAgainButton}>
        <Text style={styles.payAgainText}>Pay Again</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleScreenshotShare}
        style={styles.shareButton}
      >
        <Text style={styles.shareText}>Share Screenshot</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenContainer padding={0}>
      <HeaderTitle title="Details" leftIcon="back" />

      <ScrollView
        style={[
          styles.whiteSheetContainer,
          {
            paddingHorizontal: 10,
            paddingBottom: 10,
            paddingTop: 0,
            marginTop: 0,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ViewShot
          ref={screenshotRef}
          options={{
            format: "png",
            quality: 0.9,
            result: "tmpfile",
          }}
          style={styles.screenshotContainer}
        >
          {renderTransactionHeader()}
          {renderTransactionDetails()}
        </ViewShot>
        {renderActionButtons()}
      </ScrollView>
    </ScreenContainer>
  );
};

export default TransactionDetails;

const transactionDetailsStyles = (theme: Theme) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.spacing[5],
      paddingVertical: theme.spacing.spacing[4],
      backgroundColor: theme.colors.palette.white,
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.palette.grey100,
      justifyContent: "center",
      alignItems: "center",
    },
    backIcon: {
      fontSize: 20,
      color: theme.colors.text.primary,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text.primary,
    },
    headerSpacer: {
      width: 44,
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.spacing[5],
    },
    transactionHeader: {
      backgroundColor: theme.colors.palette.white,
      borderRadius: theme.spacing.spacing[4],
      padding: theme.spacing.spacing[5],
      marginTop: theme.spacing.spacing[2],
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      paddingHorizontal: theme.spacing.spacing[3],
      paddingVertical: theme.spacing.spacing[2],
      borderRadius: theme.spacing.spacing[4],
      marginBottom: theme.spacing.spacing[2],
    },
    successBadge: {
      backgroundColor: theme.colors.palette.green50,
    },
    failedBadge: {
      backgroundColor: theme.colors.palette.red500,
    },
    pendingBadge: {
      backgroundColor: "#FFF3CD",
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: theme.spacing.spacing[2],
    },
    successDot: {
      backgroundColor: theme.colors.palette.green500,
    },
    failedDot: {
      backgroundColor: theme.colors.palette.red500,
    },
    pendingDot: {
      backgroundColor: theme.colors.palette.orange500,
    },
    statusText: {
      fontSize: 14,
      fontWeight: "500",
    },
    successText: {
      color: theme.colors.palette.green500,
    },
    failedText: {
      color: theme.colors.palette.red500,
    },
    pendingText: {
      color: theme.colors.palette.orange500,
    },
    transactionId: {
      fontSize: 24,
      fontWeight: "600",
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.spacing[2],
    },
    transactionDate: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.spacing[8],
    },
    userSection: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    userInfo: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    avatarContainer: {
      marginRight: theme.spacing.spacing[4],
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
    },
    avatarPlaceholder: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: theme.colors.palette.orange500,
      justifyContent: "center",
      alignItems: "center",
    },
    avatarText: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.palette.orange500,
    },
    userDetails: {
      flex: 1,
      minWidth: 100,
    },
    userLabel: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.spacing[1],
    },
    userName: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text.primary,
    },
    amount: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.text.primary,
    },
    detailsSection: {
      backgroundColor: theme.colors.palette.white,
      borderRadius: theme.spacing.spacing[4],
      padding: theme.spacing.spacing[5],
      marginTop: theme.spacing.spacing[2],
      marginBottom: theme.spacing.spacing[2],
    },
    detailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: theme.spacing.spacing[4],
    },
    detailLabel: {
      fontSize: 16,
      color: theme.colors.text.secondary,
      flex: 1,
    },
    detailValue: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.colors.text.primary,
      textAlign: "right",
    },
    totalRow: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.palette.grey200,
      marginTop: theme.spacing.spacing[2],
      paddingTop: theme.spacing.spacing[4],
    },
    totalLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text.primary,
      flex: 1,
    },
    totalValue: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text.primary,
      textAlign: "right",
    },
    actionButtons: {
      paddingHorizontal: theme.spacing.spacing[5],
      paddingBottom: theme.spacing.spacing[16],
      gap: theme.spacing.spacing[3],
    },
    payAgainButton: {
      backgroundColor: theme.colors.text.primary,
      borderRadius: theme.spacing.spacing[6],
      paddingVertical: theme.spacing.spacing[4],
      alignItems: "center",
    },
    payAgainText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.palette.white,
    },
    shareButton: {
      backgroundColor: theme.colors.palette.green700,
      borderRadius: theme.spacing.spacing[6],
      paddingVertical: theme.spacing.spacing[4],
      alignItems: "center",
    },
    shareText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.palette.white,
    },
    shareButtonsRow: {
      flexDirection: "row",
      gap: theme.spacing.spacing[3],
    },
    shareTextButton: {
      flex: 1,
      backgroundColor: theme.colors.palette.blue500,
      borderRadius: theme.spacing.spacing[6],
      paddingVertical: theme.spacing.spacing[4],
      alignItems: "center",
    },
    screenshotContainer: {
      backgroundColor: theme.colors.palette.white,
      borderRadius: theme.spacing.spacing[3],
      padding: theme.spacing.spacing[4],
    },
  });

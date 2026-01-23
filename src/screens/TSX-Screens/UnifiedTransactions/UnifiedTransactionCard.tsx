import React, { memo } from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import moment from "moment";
import { useTheme, Theme } from "styles";
import CustomText from "tsx-components/CustomText";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { IUnifiedTransaction, IUnifiedTransactionCardProps } from "./types";

const UnifiedTransactionCard: React.FC<IUnifiedTransactionCardProps> = ({
  transaction,
  onPress,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation<any>();

  // Determine if transaction is incoming or outgoing
  const isIncoming = transaction.direction === "incoming";

  // Get display name from display_party
  const displayName =
    transaction.display_party?.username ||
    transaction.display_party?.identifier ||
    "Unknown";

  // Get decimal places based on crypto type
  const getDecimalPlaces = (): number => {
    const isCrypto = transaction.transaction_category === "crypto";
    if (isCrypto) {
      const token = transaction.crypto_details?.token?.toUpperCase();
      // BTC and ETH show 5 decimal places, others show 2
      if (token === "BTC" || token === "ETH") {
        return 5;
      }
      return 2;
    }
    return 2;
  };

  // Get display amount - for crypto_sell with USD currency, use usd_value from crypto_details
  const getDisplayAmount = (): string => {
    // For crypto_sell transactions where currency is USD, show the USD value received
    if (
      transaction.transaction_type === "crypto_sell" &&
      transaction.currency?.toUpperCase() === "USD" &&
      transaction.crypto_details?.usd_value
    ) {
      return parseFloat(transaction.crypto_details.usd_value).toFixed(2);
    }
    return parseFloat(transaction.amount || "0").toFixed(getDecimalPlaces());
  };

  // Format amount
  const formattedAmount = getDisplayAmount();
  const sign = isIncoming ? "+" : "-";
  const amountColor = isIncoming
    ? theme.colors.palette.success
    : theme.colors.palette.error;

  // Get currency display - for crypto show token, for fiat show symbol
  const getCurrencyDisplay = (): string => {
    const isCrypto = transaction.transaction_category === "crypto";
    if (isCrypto && transaction.crypto_details?.token) {
      return transaction.crypto_details.token;
    }
    return transaction.currency_symbol || transaction.currency || "$";
  };

  // Format date
  const formattedDate = moment(transaction.created_at).format("DD-MMM-YYYY, LT");

  // Get status color
  const getStatusColor = () => {
    const status = transaction.status?.toLowerCase();
    switch (status) {
      case "success":
      case "complete":
        return theme.colors.palette.success;
      case "pending":
      case "processing":
        return theme.colors.palette.warning;
      case "failed":
      case "cancelled":
        return theme.colors.palette.error;
      default:
        return theme.colors.text.tertiary;
    }
  };

  // Get transaction type label
  const getTransactionTypeLabel = (): string => {
    switch (transaction.transaction_type) {
      case "fiat_send":
        return "Sent";
      case "fiat_receive":
        return "Received";
      case "fiat_deposit":
        return "Deposit";
      case "fiat_withdrawal":
        return "Withdrawal";
      case "fiat_bank_transfer_in":
        return "Bank Transfer In";
      case "fiat_bank_transfer_out":
        return "Bank Transfer Out";
      case "fiat_card_deposit":
        return "Card Deposit";
      case "fiat_card_purchase":
        return "Card Purchase";
      case "fiat_merchant_payment":
        return "Merchant Payment";
      case "fiat_merchant_refund":
        return "Merchant Refund";
      case "crypto_buy":
        return "Crypto Purchase";
      case "crypto_sell":
        return "Crypto Sale";
      case "crypto_send":
        return "Crypto Sent";
      case "crypto_receive":
        return "Crypto Received";
      case "crypto_withdrawal":
        return "Crypto Withdrawal";
      case "crypto_deposit":
        return "Crypto Deposit";
      case "crypto_swap":
        return "Crypto Swap";
      default:
        const txType = transaction.transaction_type as string;
        return txType?.replace(/_/g, " ") || "Transaction";
    }
  };

  // Get subtitle text
  const getSubtitle = (): string => {
    if (transaction.merchant_details?.project_name) {
      return transaction.merchant_details.project_name;
    }
    if (transaction.category) {
      return transaction.category
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
    return getTransactionTypeLabel();
  };

  // Handle card press
  const handlePress = () => {
    if (onPress) {
      onPress(transaction);
    } else {
      navigation.navigate(NAVIGATION_SCREENS.NEW_TRANSACTION_DETAILS, {
        transactionData: transaction,
        isCrypto: false,
      });
    }
  };

  // Get initials for avatar
  const getInitials = (): string => {
    const name = displayName || "";
    if (name.includes("@")) {
      return name.charAt(0).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  // Render avatar
  const renderAvatar = () => {
    const isCrypto = transaction.transaction_category === "crypto";
    const cryptoIcon = transaction.crypto_details?.icon_url;
    const profilePhoto = transaction.display_party?.profile_photo;

    // For crypto transactions, prefer crypto icon, then profile photo
    const imageUrl = isCrypto && cryptoIcon ? cryptoIcon : profilePhoto;

    if (imageUrl && imageUrl !== "null" && imageUrl !== "") {
      // Check if it's an SVG file
      const isSvg = imageUrl?.toLowerCase()?.endsWith(".svg");
      
      if (isSvg) {
        return ;
      } else {
        return <Image source={{ uri: imageUrl }} style={styles.avatarImage} />;
      }
    }

    return (
      <View style={styles.avatarPlaceholder}>
        <CustomText
          variant="subtitle2"
          fontWeight="bold"
          color={theme.colors.palette.white}
        >
          {getInitials()}
        </CustomText>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Avatar/Icon */}
        <View style={styles.iconContainer}>{renderAvatar()}</View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <CustomText
            variant="subtitle2"
            fontWeight="semiBold"
            style={styles.title}
            numberOfLines={1}
          >
            {displayName}
          </CustomText>
          <CustomText
            variant="caption"
            color={theme.colors.text.tertiary}
            style={styles.subtitle}
            numberOfLines={1}
          >
            {getSubtitle()}
          </CustomText>
        </View>

        {/* Amount and Date */}
        <View style={styles.amountContainer}>
          <CustomText
            variant="subtitle2"
            fontWeight="semiBold"
            color={amountColor}
          >
            {sign}
            {getCurrencyDisplay()} {formattedAmount}
          </CustomText>
          <CustomText variant="caption" color={theme.colors.text.tertiary}>
            {formattedDate}
          </CustomText>
        </View>
      </View>

      {/* Status indicator for non-success transactions */}
      {transaction.status?.toLowerCase() !== "success" &&
        transaction.status?.toLowerCase() !== "complete" && (
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor() },
              ]}
            />
            <CustomText
              variant="caption"
              color={getStatusColor()}
              style={styles.statusText}
            >
              {transaction.status?.charAt(0).toUpperCase() +
                transaction.status?.slice(1).toLowerCase()}
            </CustomText>
          </View>
        )}
    </TouchableOpacity>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.card.background,
      borderRadius: 12,
      padding: theme.spacing.spacing.sm,
      marginBottom: theme.spacing.spacing.xs,
      borderWidth: 1,
      borderColor: theme.colors.card.border,
      shadowColor: theme.colors.shadow.default,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    content: {
      flexDirection: "row",
      alignItems: "center",
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: theme.spacing.spacing.sm,
      overflow: "hidden",
    },
    avatarImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    avatarPlaceholder: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.palette.green700,
      justifyContent: "center",
      alignItems: "center",
    },
    textContainer: {
      flex: 1,
      justifyContent: "center",
    },
    title: {
      marginBottom: 2,
    },
    subtitle: {
      marginTop: 2,
    },
    amountContainer: {
      alignItems: "flex-end",
    },
    statusContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: theme.spacing.spacing.xs,
      paddingTop: theme.spacing.spacing.xs,
      borderTopWidth: 1,
      borderTopColor: theme.colors.card.border,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 6,
    },
    statusText: {
      textTransform: "capitalize",
    },
  });

export default memo(UnifiedTransactionCard);


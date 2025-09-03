import { View, Text, TouchableOpacity, Linking } from "react-native";
import React from "react";
import { SvgXml } from "react-native-svg";
import { SVGFailure, SVGSuccess } from "../constants/images";
import Fonts from "../constants/Fonts";
import moment from "moment";
import useSelectorAction from "../hooks/useSelectorAction";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "styles";
import UserAvatar from "tsx-components/UserAvatar";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";

export default function TransactionCard({ item, isCrypto, isMerchent }) {
  const { walletData, isCrypto: isCryptoView } = useSelectorAction();
  const navigation = useNavigation();
  const { theme } = useTheme();

  // console.log("walletData item:", JSON.stringify(walletData, null, 2));

  const isTransactionbyProject = item?.project_name;
  const type = item?.type == "refund";
  const isCryptoBuy = item?.type == "buy";
  // const isSentByProject = isTransactionbyProject && type;

  const isSent = isCryptoView
    ? (!type && isTransactionbyProject) ||
      walletData?.username === item?.sender_username
    : isCryptoBuy;

  const displaySender = isSent
    ? item?.recipient_username
    : item?.sender_username;

  const displayName = isCryptoView
    ? isTransactionbyProject
      ? isTransactionbyProject
      : displaySender
    : walletData?.fortress
    ? item?.network ?? item.token
    : item?.payairoTag;

  // console.log("displayName =>", JSON.stringify(item, null, 2));

  const formattedAmount = parseFloat(item?.amount ?? item?.value ?? "0");
  const sign = isSent ? "-" : "+";
  const amountColor = isSent ? "red" : "green";
  const formatted =
    item?.category &&
    item?.category
      .split("_") // Split into ['family', 'friends']
      .map(
        (
          word // Capitalize each word
        ) => word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(" ");

  // console.log("sent =>", JSON.stringify(item, null, 2));
  const handlePress = () => {
    // Navigate to the new TransactionDetails modal for both fiat and crypto transactions
    navigation.navigate(NAVIGATION_SCREENS.TRANSACTION_DETAILS_MODAL, {
      transactionData: item,
      isCrypto: isCrypto,
    });
  };

  // console.log(" item----->", JSON.stringify(displayName, null, 2));

  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        disabled={isCrypto && !isMerchent && item?.web3}
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginVertical: 5,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {!isCrypto && !isMerchent ? (
            <SvgXml xml={item?.type === "sell" ? SVGFailure : SVGSuccess} />
          ) : (
            <UserAvatar
              currentUserWalletPublicKey={walletData?.wallet_public_key}
              item={item}
            />
          )}
          <View style={{ marginLeft: 10 }}>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: Fonts.semibold,
                fontSize: 14,
                maxWidth: 180,
              }}
            >
              {displayName}
            </Text>

            <Text
              style={{ fontFamily: Fonts.regular, fontSize: 12, marginTop: 5 }}
            >
              {moment(item?.timestamp ?? item?.created_at).format(
                "DD-MMM-YYYY, LT"
              )}
            </Text>
          </View>
        </View>

        <Text
          style={{
            fontFamily: Fonts.bold,
            fontSize: 16,
            color: amountColor,
          }}
        >
          {sign}${formattedAmount.toFixed(2)}
          {isCrypto && !isMerchent
            ? ` ${item?.token?.toUpperCase() ?? "USD"}`
            : ""}
        </Text>
      </TouchableOpacity>
      <View
        style={{
          borderBottomWidth: 1,
          marginVertical: 7,
          borderColor: "rgba(224, 224, 224, 1)",
        }}
      />
    </>
  );
}

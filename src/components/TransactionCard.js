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
    : item?.network;

  const formattedAmount = parseFloat(item?.amount ?? item?.value ?? "0");
  const sign = isSent ? "-" : "+";
  const amountColor = isSent ? "red" : "green";

  // console.log("sent =>", JSON.stringify(item, null, 2));
  const handlePress = () => {
    if (isMerchent || type) {
      navigation.navigate(NAVIGATION_SCREENS.TRANSACTION_SUCCESS, {
        transactionDetails: [
          { Amount: item?.amount },
          type
            ? { Type: !item?.order_id ? item?.type : "Paid" }
            : { OrderID: item?.order_id },
          { Merchant: item?.project_name },
          { Date: moment(item?.created_at).format("DD-MMM-YYYY") },
          {
            Time: moment(item?.created_at).format("h:mm a"),
          },
          { Status: item?.status?.toUpperCase() },
        ],
      });
    } else if (!isCrypto && item?.web3) {
      Linking.openURL(`https://sepolia.etherscan.io/tx/0x${item?.tx_hash}`);
    } else if (!isCrypto && !item?.web3) {
      navigation.navigate("SendReceipt", {
        transactionDetails: [
          { From: item?.from_currency },
          { To: item?.to_currency },
          { Network: item?.network },
          { "Trade Id": item?.trade_id },
          { Amount: item?.amount },
          { "Account ID": item?.account_id },
        ],
      });
    } else {
      navigation.navigate(NAVIGATION_SCREENS.TRANSACTION_SUCCESS, {
        transactionDetails: [
          { "Transaction Id": item?.transaction_id },
          {
            "Transfer Date": moment(item?.timestamp ?? item?.created_at).format(
              "DD MMM YYYY"
            ),
          },
          { Sender: item?.sender_username },
          { "Receiver ID": item?.recipient_username },
          { "Requested Amount": item?.amount },
          { "Successfully Sent": item?.amount },
        ],
      });
    }
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

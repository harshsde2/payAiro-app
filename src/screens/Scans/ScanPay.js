import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Alert,
  ToastAndroid,
  TouchableOpacity,
} from "react-native";
import Container from "../../HOC/Container";
import PincodeKeypad from "../../components/PincodeKeypad";
import { SvgXml } from "react-native-svg";
import {
  SVGDownArrow,
  SVGDownArrow3,
  SVGLeftArrow,
  SVGProfile,
  SVGUSD,
} from "../../constants/images";
import Fonts from "../../constants/Fonts";
import GenericButton from "../../components/GenericButton";
import { useNavigation } from "@react-navigation/native";
import {
  confirmPayment,
  confirmPaymentQR,
  cryptoTransfer,
  getBlockchains,
  payUserContact,
  paymentRequested,
  sendPayAero,
} from "../../services/Services";
import useSelectorAction from "../../hooks/useSelectorAction";
import moment from "moment";
import PincodeScreen from "../Authentications/PincodeScreen";
import { getPin } from "../../services/Auth";
import { SCREENS } from "../../constants/SCREENS";
import useDispatchAction from "../../hooks/useDispatchAction";
import {
  setErrorMsg,
  setNetworkLists,
  setSuccessMsg,
} from "../../redux/slices/authenticationSlice";
import Loader from "../../components/Loader";
import FullScreenModal from "../../components/FullScreenModal";
import SelectionNetwork from "../../components/SelectionNetwork";
import SelectionTokens from "../../components/SelectedTokens";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import PinScreen from "tsx-components/modals/PinScreen";
import { ScreenContainer } from "HOC";
import HeaderTitle from "components/HeaderTitle";
import { CustomText } from "tsx-components";
import { useTheme } from "styles";

export default function ScanPay(props) {
  const { type, sender, bank } = props?.route?.params;
  const { theme } = useTheme();

  // console.log("props?.route?.params =>",JSON.stringify(props?.route?.params,null, 2))

  const pinScreenRef = useRef(null);

  const { tokens, isCrypto, walletData } = useSelectorAction();
  // console.log(
  //   "sender?.requester_details =>",
  //   JSON.stringify(walletData, null, 2)
  // );
  const [amount, setAmount] = useState("0"); // State to store the input value
  const navigation = useNavigation();
  const [spin, setspin] = useState(false);
  // console.log(sender, 'newSender!!!!');
  const [pinvisible, setpinvisible] = useState(""); // State to store the input value
  const [isVisibleBank, setisVisibleBank] = useState(false); // State to store the input value
  const [bankSelected, setbankSelected] = useState(null); // State to store the input value
  const [isVisible2, setisVisible2] = useState(false);
  const [isVisible3, setisVisible3] = useState(false);

  const [networkLists, setnetworkLists] = useState([]);
  const [selectedNetwork, setselectedNetwork] = useState([]);
  const [tokenLists, settokenLists] = useState([]);
  const [selectedToken, setselectedToken] = useState(null);
  useEffect(() => {
    getBlockchain();
  }, []);

  const handleContactPayment = async () => {
    setspin(true);

    console.log(
      "sender?.request_details?.request_id",
      sender?.request_details?.request_id
    );
    const data = await payUserContact(
      sender?.request_details?.request_id,
      tokens?.access
    );
    console.log(data, "datsPay");
    if (data && data?.data.status) {
      useDispatchAction(setSuccessMsg("Transaction Paid Successfully"));
      navigation.replace(SCREENS.Dashboard);
    } else {
      useDispatchAction(
        setErrorMsg("Did Not have enough amount or some error happens")
      );
    }
    setspin(false);
  };
  const handleMercentPayment = async () => {
    setspin(true);

    const formData = new FormData();
    console.log(sender, "sender");
    const order_id = sender?.order_id ?? sender?.orderID ?? sender;
    formData.append("order_id", order_id);
    console.log(formData, "formData");
    let data;
    if (sender?.qrtype === "merchant") {
      data = await confirmPaymentQR(formData, tokens?.access);
      if (data && data.status) {
        useDispatchAction(setSuccessMsg("Payment Successfully"));
        navigation.navigate(NAVIGATION_SCREENS.NEW_DASHBOARD);
      } else {
        useDispatchAction(
          setErrorMsg("Did Not have enough amount or some error happens")
        );
      }
      console.log(data, "dataatattata");
      setspin(false);

      return;
    }
    data = await confirmPayment(formData, tokens?.access);
    console.log(data, "confirmPayment");
    if (data && data?.status) {
      navigation.replace("TransactionSuccess", {
        data: null,
        transactionDetails: [
          { "Transaction Id": data?.data?.transaction_id },
          {
            "Transfer Date": moment(data?.data?.transaction_complete).format(
              "DD MMM YYYY"
            ),
          },
          { "Transaction Status": data?.data?.transaction_status },
          { "Requested Amount": data?.data?.transaction_amount },
          { "Successfully Sent": data?.data?.transaction_amount },
        ],
      });
    } else {
      Alert.alert("Something Went Wrong", "Please Check Your Balance & Status");
    }
    setspin(false);
  };

  const handleSend = async () => {
    console.log(JSON.stringify(bank, null, 2), "bankkkkkkkk");
    setspin(true);
    try {
      const payload = {
        recipient_value: sender?.address ?? sender,
        amount: sender?.amount ?? amount,
      };
      const formData = new FormData();
      formData.append("recipient", sender?.address ?? sender);
      formData.append("amount", sender?.amount ?? amount);
      formData.append(
        "transaction_fees",
        walletData?.TransactionFees_persentage
      );
      formData.append(
        "account_type",
        bank.bank_type == "external"
          ? "external"
          : bank?.account_type === "personal"
          ? "bank"
          : bank
      );
      console.log(JSON.stringify(formData, null, 2), "payload Datatat");
      const data = await sendPayAero(formData, tokens?.access, true);
      console.log("send resp ", JSON.stringify(data, null, 2));
      if (data && data.status) {
        navigation.navigate("TransactionSuccess", {
          data: data?.data?.transaction,
          transactionDetails: [
            {
              "Transfer Date": moment(data?.data?.timestamp).format(
                "DD MMM YYYY"
              ),
            },
            { Sender: data?.data?.sender_username },
            { "Receiver ID": data?.data?.recipient_username },
            { " Amount": data?.data?.amount },
            { "Successfully Sent": data?.data?.final_amount },
            {
              "Transaction Fee Percentage": `${data?.data?.Transaction_fee_persentage} %`,
            },
          ],
        });
      } else {
        useDispatchAction(
          setErrorMsg(
            data.data.error ||
              "Operation is forbidden. Custodial account is suspended or Level 2 KYC Pending"
          )
        );
      }
      setspin(false);
    } catch (error) {
      console.log(error, "error");
      setspin(false);
    }
  };

  const handleCrypto = async () => {
    try {
      const payload = {
        asset: selectedToken?.symbol?.toLowerCase(),
        network: selectedNetwork?.networks?.toLowerCase(),
        amount: amount,
        account_type: !bank.account_type
          ? "external"
          : bank?.account_type === "personal"
          ? "bank"
          : bank?.account_type,
        receiver: sender,
      };
      console.log(payload, "payloadssss");
      const data = await cryptoTransfer(payload, tokens?.access);
      console.log(data, "dataCrypto");
      if (data && data?.status) {
        useDispatchAction(setSuccessMsg("Succcessfully Transfered"));
        navigation.navigate("TransactionSuccess", {
          data: data?.data?.transaction,
          transactionDetails: [
            {
              "Transfer Date": moment(
                data?.data?.transaction?.timestamp
              ).format("DD MMM YYYY"),
            },
            {
              "Transaction Id": data?.data?.transaction?.transaction_id,
            },
            { Sender: data?.data?.transaction?.sender },
            { "Receiver ID": data?.data?.transaction?.recipient },
            { " Amount": data?.data?.transaction?.amount },
            { "Successfully Sent": data?.data?.transaction?.amount },
          ],
        });
      } else {
        useDispatchAction(
          setErrorMsg(data?.data?.error?.title ?? "Something went wrong")
        );
      }
    } catch (error) {
      useDispatchAction(setErrorMsg("Something went wrong"));
    }
  };
  const handleKeyPress = (key) => {
    if (type !== "request") {
      setAmount((prev) => {
        if (key === ".") {
          // Prevent multiple decimals
          return prev.includes(".") ? prev : prev + key;
        }
        return prev === "0" ? key : prev + key; // Replace initial '0' or append key
      });
    }
  };

  const handleRequested = async () => {
    setspin(true);

    const formData = new FormData();
    formData.append("amount", sender?.amount ?? amount);
    console.log(formData, "formData");
    if (sender?.order_id) {
      formData.append("order_id", sender?.orderID);
    } else {
      formData.append("recipient_email_or_wallet_public_key", sender);
    }
    console.log(formData, "formData");
    const data = await paymentRequested(formData, tokens?.access);
    console.log(data, "requested");
    if (data && data?.status) {
      useDispatchAction(setSuccessMsg("Payment request created successfully."));
      navigation.replace(SCREENS.Dashboard);
    } else {
      useDispatchAction(
        setErrorMsg("Already have pending request with this account")
      );
    }

    setspin(false);
  };

  // Handle backspace
  const handleBackspace = () => {
    setAmount((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0")); // Remove last character or reset to '0'
  };

  const getBlockchain = async () => {
    const data = await getBlockchains(tokens?.access);
    if (data && data?.data?.blockchains) {
      setnetworkLists(data?.data?.blockchains);
      setselectedNetwork(data?.data?.blockchains[0]);
      setselectedToken(data?.data?.blockchains[0]?.tokens[0]);
    }
  };

  const handleCheckPin = () => {
    if (pinScreenRef.current) {
      pinScreenRef.current?.checkUserPin();
    }
  };

  const handleActionsAfterPinVerified = () => {
    type === "request"
      ? sender?.requester_details
        ? handleContactPayment()
        : handleMercentPayment()
      : type === "requested"
      ? handleRequested()
      : type === "merchantSend"
      ? handleSend()
      : type === "receiveMerchent"
      ? handleMercentPayment()
      : type === "crypto"
      ? handleCrypto()
      : handleSend();
  };

  function getAmountAfterDeduction(amount, percentage) {
    const fee = (amount * percentage) / 100;
    const finalAmount = amount - fee;
    return parseFloat(finalAmount.toFixed(2)); // rounded to 2 decimal places
  }

  function getAmountAfterAddition(amount, percentage) {
    const fee = (amount * percentage) / 100;
    const finalAmount = amount + fee;
    return parseFloat(finalAmount.toFixed(2)); // rounded to 2 decimal places
  }

  const isRequestMoney = type === "request" || type === "receive";

  const result = getAmountAfterDeduction(
    parseInt(amount),
    parseInt(walletData?.TransactionFees_persentage)
  );

  const actualAmount = amount ? parseFloat(amount).toFixed(2) : "0.00";

  return (
    <ScreenContainer padding={0}>
      {/* Display the amount */}
      <Loader spin={spin} />

      <SelectionNetwork
        isVisible={isVisible2}
        data={networkLists}
        onSelected={(i) => {
          setselectedNetwork(i);
          settokenLists(
            networkLists?.filter((item) => item?.networks === i?.networks)
          );
        }}
        onClose={() => setisVisible2(false)}
      />

      <SelectionTokens
        isVisible={isVisible3}
        data={selectedNetwork?.tokens}
        onSelected={(i) => {
          setselectedToken(i);
        }}
        onClose={() => setisVisible3(false)}
      />
      {isVisibleBank && (
        <FullScreenModal
          isVisible={isVisibleBank}
          onClose={() => setisVisibleBank(false)}
          sendAmount={amount}
          onCancel={(e) => {
            setbankSelected(e);
            setisVisibleBank(false);
            setpinvisible(true);
          }}
        />
      )}

      <PinScreen
        ref={pinScreenRef}
        onAction={handleActionsAfterPinVerified}
        accountNumber={bank?.account_number}
      />

      {!isCrypto && (
        <TouchableOpacity
          onPress={() => setisVisible2(true)}
          style={{
            backgroundColor: "rgba(224, 239, 225, 1)",
            padding: 5,
            borderRadius: 40,
            elevation: 3,
            borderWidth: 1,
            borderColor: "rgba(224, 239, 225, 1)",
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            minWidth: "30%",
            marginTop: 30,
            alignSelf: "flex-end",
            marginRight: 10,
            // backfaceVisibility: 'hidden',
          }}
        >
          <SvgXml xml={SVGUSD} />

          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              marginLeft: 5,
            }}
          >
            <Text
              style={{
                color: "#000",
                fontSize: 14,
                fontFamily: Fonts.semibold,
                marginRight: 5,
              }}
            >
              {selectedNetwork?.networks?.toUpperCase()}
            </Text>
            <SvgXml xml={SVGDownArrow3} />
          </View>
        </TouchableOpacity>
      )}

      <HeaderTitle title={"Payment"} leftIcon={SVGLeftArrow} />
      <View
        style={{
          justifyContent: "center",
          flexDirection: "row",
          alignItems: "center",
          marginTop: 80,
        }}
      >
        <Text style={{ color: "#000", fontSize: 72, fontFamily: Fonts.bold }}>
          $
          {type === "request"
            ? sender?.amount || sender?.request_details?.amount
            : type === "merchantSend"
            ? sender?.amount
            : amount}
        </Text>
      </View>
      <View style={{ marginTop: 20, alignItems: "center" }}>
        {amount && (
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              width: "90%",
              borderRadius: 12,
              backgroundColor: "rgba(224, 239, 225, 1)",
              padding: 10,
              paddingHorizontal: 20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                width: "100%",
                paddingVertical: 10,
              }}
            >
              <CustomText fontWeight={"regular"} style={{ flex: 1 }}>
                Transaction Fee:
              </CustomText>
              <CustomText
                fontWeight={"regular"}
              >{`${walletData?.TransactionFees_persentage} %`}</CustomText>
            </View>
            <View
              style={{
                width: "100%",
                height: 1,
                backgroundColor: theme.colors.palette.green300,
              }}
            />
            <View
              style={{
                flexDirection: "row",
                width: "100%",
                paddingVertical: 10,
              }}
            >
              <CustomText fontWeight={"semiBold"} style={{ flex: 1 }}>
                Amount you will pay:
              </CustomText>
              <CustomText fontWeight={"semiBold"}>{result}</CustomText>
            </View>
          </View>
        )}
      </View>

      {!isCrypto && (
        <TouchableOpacity
          onPress={() => setisVisible3(true)}
          style={{
            backgroundColor: "rgba(44, 106, 63, 1)",
            padding: 8,
            borderRadius: 40,
            elevation: 3,

            // borderWidth: 1,
            // borderColor: 'rgba(224, 239, 225, 1)',
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            // minWidth: '30%',
            // marginTop: 30,
            alignSelf: "center",
            // marginRight: 10,
            // backfaceVisibility: 'hidden',
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 12,
                fontFamily: Fonts.semibold,
                marginRight: 5,
                // textAlign: 'center',
              }}
            >
              {selectedToken?.symbol?.toUpperCase()}
            </Text>
            <SvgXml xml={SVGDownArrow} width={10} height={10} />
          </View>
        </TouchableOpacity>
      )}

      {/* Card display */}

      {/* Pincode Keypad */}
      <PincodeKeypad
        isTransparent={true}
        handleBackspace={handleBackspace} // Backspace handler
        handleKeyPress={handleKeyPress} // Keypress handler
      />
      <View
        style={{
          justifyContent: "space-between",
          flexDirection: "row",
          alignItems: "center",
          marginHorizontal: 10,
        }}
      >
        {type === "receive" && (
          <GenericButton
            title={"Pay"}
            cStyle={{ width: "100%" }}
            onPress={() => {
              // setisVisibleBank(true);
              // setpinvisible(true);
              handleCheckPin();
            }}
          />
        )}
        {type === "receiveMerchent" && (
          <GenericButton
            title={"Pay"}
            cStyle={{ width: "100%" }}
            onPress={() => {
              // setisVisibleBank(true);
              handleCheckPin();
            }}
          />
        )}
        {type === "request" && (
          <GenericButton
            title={"Pay"}
            cStyle={{ width: "100%" }}
            onPress={() => {
              // setisVisibleBank(true);
              handleCheckPin();
            }}
          />
        )}
        {type === "widthdraw" && (
          <GenericButton
            title={"Next"}
            cStyle={{ width: "100%", backgroundColor: "grey" }}
            onPress={() => navigation.navigate("Widhdraw")}
          />
        )}

        {type === "requested" && (
          <GenericButton
            title={"Request"}
            cStyle={{ width: "100%", backgroundColor: "grey" }}
            onPress={() => {
              handleCheckPin();
            }}
          />
        )}

        {(type === "merchantSend" || type === "crypto") && (
          <GenericButton
            title={"Pay"}
            cStyle={{ width: "100%" }}
            onPress={() => {
              handleCheckPin();
            }}
          />
        )}
      </View>
    </ScreenContainer>
  );
}

import { useNavigation } from "@react-navigation/native";
import { ScreenContainer } from "HOC";
import HeaderTitle from "components/HeaderTitle";
import moment from "moment";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { useUserToUserTransfer } from "query/hooks";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useTheme } from "styles";
import { CustomText } from "tsx-components";
import PinScreen from "tsx-components/modals/PinScreen";
import FullScreenModal from "../../components/FullScreenModal";
import GenericButton from "../../components/GenericButton";
import PincodeKeypad from "../../components/PincodeKeypad";
import SelectionTokens from "../../components/SelectedTokens";
import SelectionNetwork from "../../components/SelectionNetwork";
import Fonts from "../../constants/Fonts";
import { SCREENS } from "../../constants/SCREENS";
import useDispatchAction from "../../hooks/useDispatchAction";
import useSelectorAction from "../../hooks/useSelectorAction";
import {
  setErrorMsg,
  setSuccessMsg
} from "../../redux/slices/authenticationSlice";
import {
  confirmPayment,
  confirmPaymentQR,
  cryptoTransfer,
  getBlockchains,
  payUserContact,
  paymentRequested
} from "../../services/Services";
import { SvgIcons } from "constants/svgs";
import { IScanPayProps, PinScreenRef } from "./types";

export default function ScanPay(props: IScanPayProps) {
  const { type, sender, bank } = props?.route?.params;
  const { theme } = useTheme();

  const { tokens, isCrypto, walletData, bankLists } = useSelectorAction() as any;

  const DROPDOWN_LISTS = (bankLists || []).map((item: any) => {
    const last4 = item?.account_number?.slice(-4);
    const maskedAccount = `•••• ${last4}`;
    const isExternalAccount =
      item?.account_type === "checking" || item?.account_type === "savings";
    const accountType = !isExternalAccount
      ? item?.account_type?.toUpperCase()
      : "external";

    return {
      label: `${item?.bank_name} (${maskedAccount}) ${accountType}`,
      value: item?.account_type,
    } as { label: string; value: string };
  });

  const pinScreenRef = useRef<PinScreenRef | null>(null);


  const [amount, setAmount] = useState<string>("0");
  const navigation = useNavigation<any>();
  const [spin, setspin] = useState<boolean>(false);
  const [pinvisible, setpinvisible] = useState<boolean>(false);
  const [isVisibleBank, setisVisibleBank] = useState<boolean>(false);
  const [bankSelected, setbankSelected] = useState<any>(null);
  const [isVisible2, setisVisible2] = useState<boolean>(false);
  const [isVisible3, setisVisible3] = useState<boolean>(false);

  const [networkLists, setnetworkLists] = useState<any[]>([]);
  const [selectedNetwork, setselectedNetwork] = useState<any>([]);
  const [tokenLists, settokenLists] = useState<any[]>([]);
  const [selectedToken, setselectedToken] = useState<any>(null);

  const {
    mutate: handleUserToUserTransfer,
    isPending: isPendingCreatePin,
    isSuccess: isSuccessCreatePin,
  } = useUserToUserTransfer() as any;

  useEffect(() => {
    getBlockchain();
  }, []);

  const handleContactPayment = async () => {
    setspin(true);

    console.log(
      "sender?.request_details?.request_id",
      (sender as any)?.request_details?.request_id
    );
    const data = await payUserContact(
      (sender as any)?.request_details?.request_id,
      tokens?.access
    );
    if (data && data?.data.status) {
      useDispatchAction(setSuccessMsg("Transaction Paid Successfully"));
      navigation.replace(SCREENS.Dashboard as never);
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
    const order_id = (sender as any)?.order_id ?? (sender as any)?.orderID ?? sender;
    formData.append("order_id", order_id as string);
    console.log(formData, "formData");
    let data: any;
    if ((sender as any)?.qrtype === "merchant") {
      data = await confirmPaymentQR(formData, tokens?.access);
      if (data && data.status) {
        useDispatchAction(setSuccessMsg("Payment Successfully"));
        navigation.navigate(NAVIGATION_SCREENS.NEW_DASHBOARD as never);
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
      navigation.replace("TransactionSuccess" as never, {
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
      } as never);
    } else {
      Alert.alert("Something Went Wrong", "Please Check Your Balance & Status");
    }
    setspin(false);
  };

  const handleSend = async () => {
    if (Number(amount) < 5) {
      useDispatchAction(setErrorMsg("Minimum amount is 5"));
      return;
    }

    if (Number(amount) > 100000) {
      useDispatchAction(setErrorMsg("Amount cannot exceed ₹1,00,000"));
      return;
    }

    const payload = {
      recipient_value: (sender as any)?.address ?? sender,
      amount: (sender as any)?.amount ?? amount,
    };

    const formData = new FormData();

    if (walletData?.fortress) {
      formData.append("recipient", (sender as any)?.address ?? (sender as string));
      formData.append(
        "transaction_fees",
        walletData?.TransactionFees_persentage
      );
      formData.append(
        "account_type",
        (bank as any)?.bank_type == "external"
          ? "external"
          : (bank as any)?.account_type === "personal"
          ? "bank"
          : (bank as any)
          ? (bank as any)
          : "bank"
      );
      formData.append("amount", (sender as any)?.amount ?? amount);
    } else {
      formData.append("amount", (sender as any)?.amount ?? amount);
      formData.append("recipient_identifier", (sender as any)?.address ?? (sender as string));
    }

    navigation.navigate(NAVIGATION_SCREENS.TRANSACTION_RESULT as never, {
      isLoading: true,
      transactionData: null,
      isSuccess: false,
      isError: false,
    } as never);

    setspin(true);

    handleUserToUserTransfer(formData, {
      onSuccess: (data: any) => {
        if (data?.data && data?.status) {
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
          useDispatchAction(
            setErrorMsg(
              data?.data?.data?.error ||
                "Operation is forbidden. Custodial account is suspended or Level 2 KYC Pending"
            )
          );
        }
      },
      onError: (error: unknown) => {
        console.log("error =>", JSON.stringify(error, null, 2));
        navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT as never, {
          isLoading: false,
          transactionData: null,
          isSuccess: false,
          isError: true,
        } as never);
      },
      onSettled: () => {
        setspin(false);
      },
    });
  };

  const handleCrypto = async () => {
    try {
      if (Number(amount) > 100000) {
        useDispatchAction(setErrorMsg("Amount cannot exceed ₹1,00,000"));
        return;
      }

      const payload = {
        asset: selectedToken?.symbol?.toLowerCase(),
        network: selectedNetwork?.networks?.toLowerCase(),
        amount: amount,
        account_type: !(bank as any).account_type
          ? "external"
          : (bank as any)?.account_type === "personal"
          ? "bank"
          : (bank as any)?.account_type,
        receiver: sender,
      } as any;
      console.log(payload, "payloadssss");
      const data = await cryptoTransfer(payload, tokens?.access);
      console.log(data, "dataCrypto");
      if (data && data?.status) {
        useDispatchAction(setSuccessMsg("Succcessfully Transfered"));
        navigation.navigate("TransactionSuccess" as never, {
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
        } as never);
      } else {
        useDispatchAction(
          setErrorMsg(data?.data?.error?.title ?? "Something went wrong")
        );
      }
    } catch (error) {
      useDispatchAction(setErrorMsg("Something went wrong"));
    }
  };

  const handleKeyPress = (key: string) => {
    if (type !== "request") {
      setAmount((prev) => {
        if (key === ".") {
          return prev.includes(".") ? prev : prev + key;
        }
        const newAmount = prev === "0" ? key : prev + key;
        // Limit to 1 lakh (100,000)
        if (Number(newAmount) > 100000) {
          useDispatchAction(setErrorMsg("Amount cannot exceed ₹1,00,000"));
          return prev;
        }
        return newAmount;
      });
    }
  };

  const handleRequested = async () => {
    if (Number(amount) > 100000) {
      useDispatchAction(setErrorMsg("Amount cannot exceed ₹1,00,000"));
      return;
    }

    setspin(true);

    const formData = new FormData();
    formData.append("amount", (sender as any)?.amount ?? amount);
    console.log(formData, "formData");
    if ((sender as any)?.order_id) {
      formData.append("order_id", (sender as any)?.orderID);
    } else {
      formData.append("recipient_email_or_wallet_public_key", sender as string);
    }
    console.log(formData, "formData");
    const data = await paymentRequested(formData, tokens?.access);
    console.log(data, "requested");
    if (data && data?.status) {
      useDispatchAction(setSuccessMsg("Payment request created successfully."));
      navigation.replace(SCREENS.Dashboard as never);
    } else {
      useDispatchAction(
        setErrorMsg("Already have pending request with this account")
      );
    }

    setspin(false);
  };

  const handleBackspace = () => {
    setAmount((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
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
    // Navigate to OTP screen after PIN verification
    navigation.navigate(NAVIGATION_SCREENS.OTP_SCREEN, {
      onOTPVerified: handleActionsAfterOTPVerified,
      transactionType: type,
    });
  };

  const handleActionsAfterOTPVerified = () => {
    // Execute the actual transaction after OTP verification
    type === "request"
      ? (sender as any)?.requester_details
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

  function getAmountAfterDeduction(amountVal: number, percentage: number) {
    const fee = (amountVal * percentage) / 100;
    const finalAmount = amountVal + fee;
    return parseFloat(finalAmount.toFixed(2));
  }

  function getAmountAfterAddition(amountVal: number, percentage: number) {
    const fee = (amountVal * percentage) / 100;
    const finalAmount = amountVal + fee;
    return parseFloat(finalAmount.toFixed(2));
  }

  const isRequestMoney = type === "request" || type === "receive";

  const result = getAmountAfterDeduction(
    parseInt(((sender as any)?.amount ?? amount) as string),
    parseInt((walletData?.TransactionFees_persentage as any) as string)
  );

  return (
    <ScreenContainer scrollable padding={0}>
      <SelectionNetwork
        isVisible={isVisible2}
        data={networkLists}
        onSelected={(i: any) => {
          setselectedNetwork(i);
          settokenLists(
            networkLists?.filter((item: any) => item?.networks === i?.networks)
          );
        }}
        onClose={() => setisVisible2(false)}
        type={undefined as any}
      />

      <SelectionTokens
        isVisible={isVisible3}
        data={selectedNetwork?.tokens}
        onSelected={(i: any) => {
          setselectedToken(i);
        }}
        onClose={() => setisVisible3(false)}
        type={undefined as any}
      />
      {isVisibleBank && (
        <FullScreenModal
          isVisible={isVisibleBank}
          onClose={() => setisVisibleBank(false)}
          sendAmount={amount}
          onCancel={(e: any) => {
            setbankSelected(e);
            setisVisibleBank(false);
            setpinvisible(true);
          }}
          data={bankSelected}
          onSelected={(e: any) => setbankSelected(e)}
        />
      )}

      <PinScreen
        ref={pinScreenRef}
        onAction={() => {
          handleActionsAfterPinVerified();
        }}
        accountNumber={(bank as any)?.account_number}
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
          }}
        >
          <SvgIcons.DollarIcon />
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
            <SvgIcons.ChevronDown />
          </View>
        </TouchableOpacity>
      )}

      <HeaderTitle title={"Payment"} leftIcon={'true'} />
      <View
        style={{
          justifyContent: "center",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#000", fontSize: 72, fontFamily: Fonts.bold }}>
          $
          {type === "request"
            ? (sender as any)?.amount || (sender as any)?.request_details?.amount
            : type === "merchantSend"
            ? (sender as any)?.amount
            : amount}
        </Text>
      </View>
      <View style={{ marginTop: 20, alignItems: "center" }}>
        {amount && type !== "requested" && walletData?.fortress && (
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
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            alignSelf: "center",
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
              }}
            >
              {selectedToken?.symbol?.toUpperCase()}
            </Text>
            <SvgIcons.ChevronDown width={10} height={10} />
          </View>
        </TouchableOpacity>
      )}

      <View
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          marginBottom: 20,
          paddingHorizontal: 10,
          flex: 1,
        }}
      >
        <PincodeKeypad
          isTransparent={true}
          handleBackspace={handleBackspace}
          handleKeyPress={handleKeyPress}
          type={undefined}
          showPin={false}
          pincode={""}
          error={""}
          marginFmTop={0}
          isNotDecimals={false}
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
                handleCheckPin();
              }}
            />
          )}
          {type === "receiveMerchent" && (
            <GenericButton
              title={"Pay"}
              cStyle={{ width: "100%" }}
              onPress={() => {
                handleCheckPin();
              }}
            />
          )}
          {type === "request" && (
            <GenericButton
              title={"Pay"}
              cStyle={{ width: "100%" }}
              onPress={() => {
                handleCheckPin();
              }}
            />
          )}
          {type === "widthdraw" && (
            <GenericButton
              title={"Next"}
              cStyle={{ width: "100%", backgroundColor: "grey" }}
              onPress={() => navigation.navigate("Widhdraw" as never)}
            />
          )}

          {type === "requested" && (
            <GenericButton
              title={"Request"}
              cStyle={{ width: "100%", backgroundColor: "grey" }}
              onPress={() => {
                navigation.navigate(NAVIGATION_SCREENS.OTP_SCREEN, {
                  onOTPVerified: handleActionsAfterOTPVerified,
                  transactionType: type,
                });
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
      </View>
    </ScreenContainer>
  );
}



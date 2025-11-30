import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
  Pressable,
} from "react-native";
import React, { useState, useRef } from "react";
import { ScreenContainer } from "HOC";
import HeaderTitle from "components/HeaderTitle";
import { SvgIcons } from "constants/svgs";
import { CustomText } from "tsx-components";
import { Theme, useTheme } from "styles";
import DashboardSection from "tsx-components/DashboardSection";
import MyDropdown from "tsx-components/MyDropdown";
import useSelectorAction from "hooks/useSelectorAction";
import AmountInputDisplay from "./AmountInputDisplay";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useCommonAddBalanceStyles } from "./Styles";
import GenericButton from "components/GenericButton";
import useDispatchAction from "hooks/useDispatchAction";
import { setShowLoader } from "redux/slices/authenticationSlice";
import { showError, showSuccess } from "../../../utils/toast";
import { selfTransfer } from "services/Services";
import { useIntraAccountTransfer } from "query/hooks";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import CommonModal from "tsx-components/modals/CommonModal";
import Fonts from "constants/Fonts";
import TextInputField from "components/TextInputField";

const DebitCardScreen = () => {
  const routes = useRoute();
  const { amount: paramsAmount, souceAccount: paramsSouceAccount } = (
    routes as any
  ).params;

  const inputRef = useRef<TextInput>(null);

  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const customStyle = customStyles(theme);
  const styles = { ...useCommonAddBalanceStyles(), ...customStyle };
  const [otp, setOtp] = useState(["", "", "", "", "", ""]); // OTP array
  const inputs = useRef<any>([]); // Refs for the input fields

  const { tokens, bankLists, bankBalance } = useSelectorAction();

  const [amount, setAmount] = useState(paramsAmount || "");
  const [selectedAccount, setSelectedAccount] = useState({
    id: "",
    icon: "",
    title: "",
    value: "",
  });
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);

  const {
    isPending,
    isSuccess,
    mutate: handleIntraAccountTransfer,
  } = useIntraAccountTransfer();

  // console.log("selectedAccount =>", selectedAccount);
  // console.log("paramsSouceAccount =>", paramsSouceAccount);

  const DROPDOWN_LISTS = bankLists.map((item: any) => {
    const last4 = item.account_number?.slice(-4);
    const maskedAccount = `•••• ${last4}`;
    const isExternalAccount =
      item?.account_type === "checking" || item?.account_type === "savings";
    const accountType = !isExternalAccount
      ? item?.account_type.toUpperCase()
      : "external";

    return {
      label: `${item?.bank_name} (${maskedAccount}) ${accountType}`,
      value: item?.account_type,
    };
  });

  // console.log(JSON.stringify(bankLists, null, 2));

  const DEBIT_CARD_LIST = [
    {
      id: 0,
      title: `12345678908765`,
      icon: <SvgIcons.DebitCard />,
      rightIcon: <SvgIcons.Visa />,
      bank_type: "",
      value: "",
    },
    {
      id: 1,
      title: `12345678908765`,
      icon: <SvgIcons.DebitCard />,
      rightIcon: <SvgIcons.MasterCard />,
      bank_type: "",
      value: "",
    },
    {
      id: 2,
      title: `Add Debit Card`,
      icon: <SvgIcons.PlusCircleIcon width={40} height={30} />,
      // rightIcon: <SvgIcons.MasterCard />,
      isAddButton: true,
      bank_type: "",
      value: "",
    },
  ];

  const [souceAccount, setsouceAccount] = useState(DROPDOWN_LISTS[0].value);

  const handleSelfTransfer = async () => {
    if (
      paramsAmount === "" ||
      paramsSouceAccount === "" ||
      selectedAccount.title === ""
    ) {
      showError("One or more field are empty");
      return;
    }

    const formData = new FormData();
    formData.append("amount", paramsAmount);
    formData.append("source_account_type", selectedAccount.value);
    formData.append("destination_account_type", paramsSouceAccount);

    useDispatchAction(setShowLoader(true));

    console.log(formData);

    handleIntraAccountTransfer(formData as any, {
      onSuccess: (data) => {
        console.log("data =>", JSON.stringify(data.data, null, 2));
        showSuccess(data?.data?.message);
        navigation.reset({
          index: 0,
          routes: [{ name: NAVIGATION_SCREENS.NEW_DASHBOARD }],
        });
      },
      onError: (error: any) => {
        showError("Something went wrong");
      },
      onSettled: () => {
        useDispatchAction(setShowLoader(false));
      },
    });
  };

  // console.log(
  //   "account list =>",
  //   ACCOUNT_LIST.filter(
  //     (item) => item.bank_type.toLowerCase() === paramsSouceAccount
  //   )
  // );
  // console.log("paramsSouceAccount list =>", paramsSouceAccount);
  const dorpdownSelectedValue =
    paramsSouceAccount.toLowerCase() == "external"
      ? "checking"
      : paramsSouceAccount.toLowerCase();

  // console.log("zsdasfas =>");
  const handleOtpChange = (text: any, index: any) => {
    if (/^[0-9]$/.test(text) || text === "") {
      // Only allow numbers or empty text
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      // Move to the next input if a number is entered
      if (text && index < otp.length - 1) {
        inputs.current[index + 1]?.focus();
      }

      // Move to the previous input if backspace is pressed and field is empty
      if (!text && index > 0) {
        inputs.current[index - 1]?.focus();
      }
    }
  };

  const handleKeyPress = (key: any, index: any) => {
    if (key === "Backspace") {
      if (otp[index] === "") {
        // Move to the previous input if current is empty
        if (index > 0) {
          inputs.current[index - 1]?.focus();
        }
      } else {
        // Clear the current input
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  return (
    <ScreenContainer padding={0}>
      <HeaderTitle title="Add Balance" leftIcon="true" />

      {showVerifyModal && (
        <CommonModal
          onClose={() => setShowVerifyModal(false)}
          isVisible={showVerifyModal}
          containerStyle={{ justifyContent: "center", alignItems: "center" }}
          isOnOutsidePressClose={false}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={[
              styles.whiteSheetContainer,
              {
                maxHeight: 270,
                width: "95%",
                borderRadius: theme.spacing.spacing[8],
                padding: 20,
              },
            ]}
          >
            <CustomText variant={"subtitle1"} style={{}}>
              Enter OTP
            </CustomText>
            {/* OTP Input Fields */}
            <View style={styles.otpContainer}>
              {otp.map((_, index) => (
                <TextInput
                  key={index}
                  style={[styles.otpInput, otp[index] && styles.otpInputActive]}
                  maxLength={1}
                  keyboardType="number-pad"
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={({ nativeEvent }) =>
                    handleKeyPress(nativeEvent.key, index)
                  }
                  ref={(input) => (inputs.current[index] = input)} // Assign ref dynamically
                  value={otp[index]}
                />
              ))}
            </View>
            <GenericButton
              onPress={() => {
                setShowAddCardModal(true);
              }}
              title={"Verify OTP"}
              cStyle={{ width: "90%", alignSelf: "center" }}
              showLoader={true}
            />
            <GenericButton
              onPress={() => {
                setShowVerifyModal(false);
              }}
              title={"Cancel"}
              cStyle={{
                width: "90%",
                alignSelf: "center",
                backgroundColor: "black",
                marginTop: 10,
              }}
            />
          </Pressable>
        </CommonModal>
      )}
      {showAddCardModal && (
        <CommonModal
          onClose={() => setShowAddCardModal(false)}
          isVisible={showAddCardModal}
          containerStyle={{ justifyContent: "flex-end", alignItems: "center" }}
          isOnOutsidePressClose={false}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={[
              styles.whiteSheetContainer,
              {
                flex: 2 / 3,
              },
            ]}
          >
            <View style={{ width: "80%", alignSelf: "center" }}>
              <Text
                style={{
                  fontFamily: Fonts.bold,
                  textAlign: "center",
                  fontSize: 30,
                }}
              >
                Debit card Detail
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.regular,
                  textAlign: "center",
                  marginTop: 5,
                }}
              >
                Linking an external account allows you to move money in and out
                of your PayAiro App balance.
              </Text>
            </View>
            <View style={{ marginVertical: 40 }}>
              <TextInputField
                placeholder={"Yourname@crypto.com"}
                label={"Enter card number"}
              />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  marginVertical: 10,
                }}
              >
                <TextInputField
                  label="MM/YY"
                  placeholder={"12/28"}
                  value={""}
                  onChange={() => {}}
                  cStyle={{ width: "48%" }}
                />
                <TextInputField
                  label="CVV"
                  placeholder={"282"}
                  value={""}
                  onChange={() => {}}
                  cStyle={{ width: "48%" }}
                />
              </View>
              <GenericButton
                title="Add Card"
                cStyle={{ marginTop: 25 }}
                onPress={() => {
                  // navigation.navigate(SCREENS.Dob);
                }}
              />
              <GenericButton
                title={"Cancel"}
                cStyle={{ backgroundColor: "#000", marginVertical: 10 }}
                tStyle={{ color: "white" }}
                onPress={() => {
                  setShowAddCardModal(false);
                }}
              />
            </View>
          </Pressable>
        </CommonModal>
      )}

      <View style={{ paddingHorizontal: 20 }}>
        {/* Selected Bank */}
        <View style={{ width: "100%" }}>
          <MyDropdown
            placeholder={"Source Account Type"}
            data={DROPDOWN_LISTS}
            value={dorpdownSelectedValue}
            search={false}
            itemTextStyle={{
              fontSize: 14,
              fontFamily: theme?.typography.fontFamily.montserrat,
            }}
            placeholderStyle={{ paddingLeft: 10 }}
            selectedTextStyle={{ paddingLeft: 10 }}
            selectedTextProps={{ numberOfLines: 1 }}
            style={{
              borderRadius: theme.spacing.spacing[2],
              padding: 10,
              borderColor: theme.colors.palette.grey300,
              borderWidth: 0.5,
              paddingLeft: 10,
            }}
            disable={true}
            renderLeftIcon={() => <SvgIcons.Bank />}
            onChange={(item: any) => setsouceAccount(item)}
          />
        </View>
      </View>
      <AmountInputDisplay amount={amount} setAmount={setAmount} />
      <CustomText align="center" size={14} variant="caption">
        Current Balance: ${(bankBalance as any)?.bank_account?.usd}
      </CustomText>

      <View style={[styles.whiteSheetContainer]}>
        {/* {" "} */}
        <DashboardSection title="Select your Debit Card">
          {DEBIT_CARD_LIST.filter(
            (item: any) =>
              !item.title
                .toLowerCase()
                .includes(
                  paramsSouceAccount.toLowerCase() == "checking"
                    ? "external"
                    : paramsSouceAccount.toLowerCase()
                )
          ).map((item: any) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => {
                if (!item?.isAddButton) {
                  setSelectedAccount(item);
                } else if (item?.isAddButton) {
                  setSelectedAccount(item);
                  setShowVerifyModal(true);
                }
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 16,
                borderRadius: 14,
                backgroundColor:
                  selectedAccount?.id === item.id
                    ? theme.colors.palette.green200
                    : theme.colors.palette.grey250,
                borderWidth: 1,
                borderColor: theme.colors.palette.grey300,
                marginBottom: 10,
                // paddingHorizontal: 20,
              }}
            >
              <View
                style={{
                  height: 20,
                  width: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor:
                    selectedAccount?.id === item.id
                      ? theme.colors.palette.primary
                      : theme.colors.palette.grey400,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 10,
                }}
              >
                {selectedAccount?.id === item.id && (
                  <View
                    style={{
                      height: 10,
                      width: 10,
                      borderRadius: 5,
                      backgroundColor: theme.colors.palette.primary,
                    }}
                  />
                )}
              </View>
              {item.icon}
              <CustomText
                color={theme.colors.palette.black}
                variant="subtitle1"
                size={12}
                style={{ marginLeft: 10, flex: 1 }}
              >
                {item.title}
              </CustomText>
              {item.rightIcon}
            </TouchableOpacity>
          ))}
        </DashboardSection>
        {(!showVerifyModal || showAddCardModal) && (
          <GenericButton
            title="Add Balance"
            onPress={() => {
              // handleSelfTransfer();
            }}
            showLoader={true}
            isLoading={isPending}
            disabled={isPending}
          />
        )}
      </View>
    </ScreenContainer>
  );
};

export default DebitCardScreen;

const customStyles = (theme: Theme) =>
  StyleSheet.create({
    otpInputActive: {
      borderColor: theme.colors.palette.green700,
      borderWidth: 2,
    },
    otpContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      marginVertical: 20,
    },
    otpInput: {
      width: 40,
      height: 50,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: "#ccc",
      textAlign: "center",
      fontSize: 18,
      backgroundColor: "#fff",
    },
    subtitle: {
      fontSize: 16,
      // color: "#666",
      marginBottom: 20,
      fontFamily: Fonts.regular,
      color: "black",
    },
    bold: {
      fontFamily: Fonts.semibold,
    },
    label: {
      fontSize: 14,
      fontFamily: Fonts.semibold,
      marginBottom: 5,
    },
    pinContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    pinInput: {
      width: 70,
      height: 60,
      borderRadius: 35,
      borderWidth: 1,
      borderColor: "rgba(0, 119, 4, 0.4)",
      textAlign: "center",
      fontSize: 22,
      backgroundColor: "rgba(0, 119, 4, 0.07)",
    },
    successContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 10,
    },
    successText: {
      color: "green",
      fontSize: 16,
      fontWeight: "bold",
    },
  });

import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
  Pressable,
  ToastAndroid,
  Platform,
  Alert,
  Clipboard,
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
import {
  setErrorMsg,
  setShowLoader,
  setSuccessMsg,
} from "redux/slices/authenticationSlice";
import { selfTransfer } from "services/Services";
import { useIntraAccountTransfer } from "query/hooks";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { NotifyOnChangeProps } from "@tanstack/react-query";
import ConfirmationModalComponent from "tsx-components/ConfirmationModalComponent";
import CommonModal from "tsx-components/modals/CommonModal";
import Share from "react-native-share";

const ACHTransfer = () => {
  const routes = useRoute();
  const { amount: paramsAmount, souceAccount: paramsSouceAccount } = (
    routes as any
  ).params;

  const inputRef = useRef<TextInput>(null);

  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const customStyle = customStyles(theme);
  const styles = { ...useCommonAddBalanceStyles(), ...customStyle };

  const { tokens, bankLists, bankBalance } = useSelectorAction();

  const [amount, setAmount] = useState(paramsAmount || "");
  const [selectedAccount, setSelectedAccount] = useState<any>({
    id: "",
    icon: "",
    title: "",
    value: "",
  });
  const [showExtenalModel, setShowExternalModal] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);

  const {
    isPending,
    isSuccess,
    mutate: handleIntraAccountTransfer,
  } = useIntraAccountTransfer();

  // console.log("selectedAccount =>", selectedAccount);
  // console.log("paramsSouceAccount =>", paramsSouceAccount);

  const selectedBank = bankLists.filter((bank: any) =>
    bank?.account_type?.toLowerCase()?.includes(
        paramsSouceAccount?.toLowerCase() == "external"
          ? "checking"
          : paramsSouceAccount?.toLowerCase()
      )
  ) as any;

  // console.log(
  //   "paramsSouceAccount =>",
  //   JSON.stringify(selectedAccount[0], null, 2)
  // );

  const DROPDOWN_LISTS = bankLists.map((item: any) => {
    const last4 = item?.account_number?.slice(-4);
    const maskedAccount = `•••• ${last4}`;
    const isExternalAccount =
      item?.account_type === "checking" || item?.account_type === "savings";
    const accountType = !isExternalAccount
      ? item?.account_type?.toUpperCase()
      : "external";

    return {
      label: `${item?.bank_name || ""} (${maskedAccount || ""}) ${accountType || ""}`,
      value: item?.account_type || "",
    };
  });

  // console.log(JSON.stringify(bankLists, null, 2));

  const ACCOUNT_LIST = bankLists.map((item: any, index: any) => {
    const last4 = item?.account_number?.slice(-4);
    const maskedAccount = `•••• ${last4}`;
    const isExternalAccount =
      item?.account_type === "checking" || item?.account_type === "savings";
    const accountType = !isExternalAccount
      ? item?.account_type?.toUpperCase()
      : "external";

    return {
      id: index,
      title: `${item?.bank_name || ""} (${maskedAccount || ""}) ${accountType || ""}`,
      icon: <SvgIcons.Bank />,
      bank_type: accountType,
      value: accountType?.toLowerCase() || "",
    };
  });

  const [souceAccount, setsouceAccount] = useState(DROPDOWN_LISTS[0]?.value || "");

  const handleSelfTransfer = async () => {
    if (
      paramsAmount === "" ||
      paramsSouceAccount === "" ||
      selectedAccount?.title === ""
    ) {
      useDispatchAction(setErrorMsg("One or more field are empty"));
      return;
    }

    const formData = new FormData();
    formData.append("amount", paramsAmount);
    formData.append("source_account_type", selectedAccount?.value);
    formData.append("destination_account_type", paramsSouceAccount);

    useDispatchAction(setShowLoader(true));

    // console.log(formData);

    handleIntraAccountTransfer(formData as any, {
      onSuccess: (data) => {
        // console.log("data =>", JSON.stringify(data.data, null, 2));
        useDispatchAction(setSuccessMsg(data?.data?.message));
        navigation.reset({
          index: 0,
          routes: [{ name: NAVIGATION_SCREENS.NEW_DASHBOARD }],
        });
      },
      onError: (error: any) => {
        useDispatchAction(setErrorMsg("Something went wrong"));
      },
      onSettled: () => {
        useDispatchAction(setShowLoader(false));
      },
    });
  };

  const shareOptions = {
    message: `Account Details:
    Routing Number: ${selectedBank[0]?.ref_code || ""}
    Account Number: ${selectedBank[0]?.account_number || ""}
    Bank Name: ${selectedBank[0]?.bank_name || ""}
    Amount: ${paramsAmount}`,
  };

  const handleShare = async () => {
    try {
      const res = await Share.open(shareOptions);

      console.log("Share result:", res);
    } catch (err) {
      console.log("Error sharing:", err);
    }
  };

  const copyToClipboard = () => {
    Clipboard.setString(shareOptions.message);

    // Display a success message
    if (Platform.OS === "android") {
      ToastAndroid.show("Account Details Copied", ToastAndroid.SHORT);
    } else if (Platform.OS === "ios") {
      Alert.alert("Account Details Copied");
    }
  };

  // console.log(
  //   "account list =>",
  //   ACCOUNT_LIST.filter(
  //     (item) => item.bank_type.toLowerCase() === paramsSouceAccount
  //   )
  // );
  // console.log("paramsSouceAccount list =>", paramsSouceAccount);
  const dorpdownSelectedValue =
    paramsSouceAccount?.toLowerCase() == "external"
      ? "checking"
      : paramsSouceAccount?.toLowerCase() || "";
  return (
    <ScreenContainer padding={0}>
      <HeaderTitle title="Account Transfer" leftIcon="true" />
      {showExtenalModel && (
        <CommonModal
          isVisible={showExtenalModel}
          onClose={() => {
            setShowExternalModal(false);
          }}
          containerStyle={{ justifyContent: "flex-end", alignItems: "center" }}
        >
          <Pressable
            style={[styles.whiteSheetContainer, { flex: 1 / 2 }]}
            onPress={(e) => e.stopPropagation()}
          >
            <CustomText style={styles.title} variant="h3">
              External Account
            </CustomText>
            <CustomText style={styles.title} variant="caption">
              Linking an external account allows you to move money in and out of
              your Payairo App balance.
            </CustomText>
            <View style={styles.row}>
              <CustomText variant={"caption"} style={styles.label}>
                Routing Number
              </CustomText>
                <CustomText>{selectedBank[0]?.ref_code || "17147714"}</CustomText>
            </View>
            <View style={styles.row}>
              <CustomText variant={"caption"} style={styles.label}>
                Account Number
              </CustomText>
              <CustomText>{selectedBank[0]?.account_number || ""}</CustomText>
            </View>
            <View style={styles.row}>
              <CustomText variant={"caption"} style={styles.label}>
                Bank Name
              </CustomText>
              <CustomText>{selectedBank[0]?.bank_name || ""}</CustomText>
            </View>
            <View style={styles.row}>
              <CustomText variant={"caption"} style={styles.label}>
                Amount
              </CustomText>
              <CustomText>${paramsAmount || ""  }</CustomText>
            </View>

            <View style={{ marginVertical: 20, gap: 10 }}>
              <GenericButton
                title={"Share"}
                onPress={() => {
                  handleShare();
                }}
              />
              <GenericButton
                title={"Copy"}
                cStyle={{ backgroundColor: "black" }}
                onPress={() => {
                  copyToClipboard();
                  // setShowConfirmationModal(false);
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
              fontFamily: theme?.typography?.fontFamily?.montserrat,
            }}
            placeholderStyle={{ paddingLeft: 10 }}
            selectedTextStyle={{ paddingLeft: 10 }}
            selectedTextProps={{ numberOfLines: 1 }}
            style={{
              borderRadius: theme?.spacing?.spacing[2],
              padding: 10,
              borderColor: theme?.colors?.palette?.grey300,
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
        <DashboardSection title="Select your Account">
          {ACCOUNT_LIST.filter(
            (item: any) =>
              !item?.title
                ?.toLowerCase()
                ?.includes(
                  paramsSouceAccount?.toLowerCase() == "checking"
                    ? "external"
                    : paramsSouceAccount?.toLowerCase()
                )
          )
            .filter((item) => !item?.title?.toLowerCase()?.includes("ira"))
            .map((item) => (
              <TouchableOpacity
                key={item?.id}
                onPress={() => setSelectedAccount(item)}
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
                  style={{ marginLeft: 10 }}
                >
                  {item.title}
                </CustomText>
              </TouchableOpacity>
            ))}
          <TouchableOpacity
            onPress={() => setShowExternalModal(true)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
              borderRadius: 14,
              backgroundColor: showExtenalModel
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
                borderColor: showExtenalModel
                  ? theme.colors.palette.primary
                  : theme.colors.palette.grey400,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 10,
              }}
            >
              {showExtenalModel && (
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
            <SvgIcons.Bank />
            <CustomText
              color={theme.colors.palette.black}
              variant="subtitle1"
              size={12}
              style={{ marginLeft: 10 }}
            >
              {"External Account"}
            </CustomText>
          </TouchableOpacity>
        </DashboardSection>
        <GenericButton
          title="Add Balance"
          onPress={() => {
            handleSelfTransfer();
          }}
          showLoader={true}
          isLoading={isPending}
          disabled={isPending}
        />
      </View>
    </ScreenContainer>
  );
};

export default ACHTransfer;

const customStyles = (theme: Theme) =>
  StyleSheet.create({
    title: {
      //   fontSize: 20,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 15,
    },

    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginVertical: 6,
    },
    label: {
      color: "#444",
      fontSize: 16,
      marginVertical: 3,
    },
    labelBold: {
      fontWeight: "bold",
      color: "#000",
    },
    total: {
      fontWeight: "bold",
      color: "green",
    },
  });

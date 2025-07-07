import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import CommonHeaderv2 from "../../HOC/CommonHeaderv2";
import HeaderTitle2 from "../../components/HeaderTitle2";
import { SVGLeftArrow, SVGSearch } from "../../constants/images";
import TextInputField from "../../components/TextInputField";
import GenericButton from "../../components/GenericButton";
import { selfTransfer } from "../../services/Services";
import useSelectorAction from "../../hooks/useSelectorAction";
import useDispatchAction from "../../hooks/useDispatchAction";
import {
  setErrorMsg,
  setSuccessMsg,
} from "../../redux/slices/authenticationSlice";
import { useNavigation } from "@react-navigation/native";
import { ScreenContainer } from "HOC";
import HeaderTitle from "components/HeaderTitle";
import { useGlobalStyles } from "styles/GlobalStyles";
import MyDropdown from "tsx-components/MyDropdown";
import { useTheme } from "styles";

export default function IntraAccountTransfer() {
  const { tokens, bankLists } = useSelectorAction();
  const { theme } = useTheme();
  const globalStyles = useGlobalStyles();

  const DROPDOWN_LISTS = bankLists.map((item) => {
    const last4 = item.account_number?.slice(-4); // Get last 4 digits
    const maskedAccount = `•••• ${last4}`;
    const isExternalAccount =
      item?.account_type === "checking" || item?.account_type === "savings";
    const accountType = !isExternalAccount
      ? item?.account_type.toUpperCase()
      : "external"; // Fallback if account_type is not available

    return {
      label: `${item?.bank_name} (${maskedAccount}) ${accountType}`,
      value: item?.account_type, // use account_id or any unique field as value
    };
  });

  // console.log("DROPDOWN_LISTS:", JSON.stringify(DROPDOWN_LISTS, null, 2));

  const [souceAccount, setsouceAccount] = useState(null);
  const [destinationAccount, setdestinationAccount] = useState(null);
  const [amount, setamount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const handleSelfTransfer = async () => {
    try {
      setIsLoading(true);
      if (amount === "" || destinationAccount === "" || souceAccount === "") {
        useDispatchAction(setErrorMsg("One or more field are empty"));
        return;
      }
      console.log("condition:", souceAccount === destinationAccount);
      if (destinationAccount === souceAccount) {
        useDispatchAction(setErrorMsg("Cannot keep the same account type"));
        return;
      }

      console.log("P ->", {
        amount: amount,
        source_account_type: souceAccount,
        destination_account_type: destinationAccount,
      });

      const data = await selfTransfer(
        {
          amount: amount,
          source_account_type: souceAccount,
          destination_account_type: destinationAccount,
        },
        tokens?.access
      );
      if (data && data?.status) {
        useDispatchAction(setSuccessMsg(data?.data?.message));
        navigation.goBack();
      } else {
        useDispatchAction(
          setErrorMsg(data?.data?.error ?? "Something went wrong")
        );
      }
    } catch (error) {
      console.log(error);
      useDispatchAction(setErrorMsg(error?.message ?? "Something went wrong"));
    } finally {
      setIsLoading(false);
    }
  };

  // console.log("souceAccount:", souceAccount);
  // console.log("destinationAccount:", destinationAccount);
  return (
    <ScreenContainer padding={0}>
      <HeaderTitle leftIcon={SVGLeftArrow} title={"Intra Account Transfer"} />
      <View style={[globalStyles.whiteSheetContainer]}>
        <MyDropdown
          label={"Source Account Type"}
          placeholder={"Source Account Type"}
          data={DROPDOWN_LISTS.filter(
            (item) => !item.value.toLowerCase().includes("ira")
          )}
          value={souceAccount}
          search={false}
          itemTextStyle={{
            fontSize: 14,
            fontFamily: theme?.typography.fontFamily.montserrat,
          }}
          onChange={(item) => setsouceAccount(item)}
        />
        <MyDropdown
          label={"Destination Account Type"}
          placeholder={"Destination Account Type"}
          data={DROPDOWN_LISTS}
          value={destinationAccount}
          search={false}
          itemTextStyle={{
            fontSize: 14,
            fontFamily: theme?.typography.fontFamily.montserrat,
          }}
          onChange={(item) => setdestinationAccount(item)}
        />

        <TextInputField
          placeholder="Enter amount"
          value={amount}
          onChange={setamount}
          label={"Amount"}
        />
        <GenericButton
          onPress={handleSelfTransfer}
          title={"Transfer"}
          showLoader={true}
          isLoading={isLoading}
          cStyle={{ marginTop: 280 }}
        />
      </View>
    </ScreenContainer>
  );
}

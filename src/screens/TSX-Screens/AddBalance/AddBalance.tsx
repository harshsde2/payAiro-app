import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { Theme, useTheme } from "styles";
import { useCommonAddBalanceStyles } from "./Styles";
import { ScreenContainer } from "HOC";
import HeaderTitle from "components/HeaderTitle";
import useSelectorAction from "hooks/useSelectorAction";
import MyDropdown from "tsx-components/MyDropdown";
import { SvgIcons } from "constants/svgs";
import DashboardSection from "tsx-components/DashboardSection";
import { CustomText } from "tsx-components";
import { useNavigation } from "@react-navigation/native";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import AmountInputDisplay from "./AmountInputDisplay";

const AddBalance = () => {
  const { bankLists, bankBalance } = useSelectorAction();

  const PAYMENT_METHODS = [
    {
      title: "Account Transfer",
      icon: <SvgIcons.ACHTransfer />,
      navigation: NAVIGATION_SCREENS.ACH_TRANSFER,
    },
    // {
    //   title: "Debit Card",
    //   icon: <SvgIcons.DebitCard />,
    //   navigation: NAVIGATION_SCREENS.DEBIT_CARD_SCREEN,
    // },
    // {
    //   title: "Apple Pay/Google Pay",
    //   icon: <SvgIcons.ApplePay />,
    //   navigation: NAVIGATION_SCREENS.COMING_SOON,
    // },
    // {
    //   title: "Crypto Wallet",
    //   icon: <SvgIcons.CryptoWallet />,
    //   navigation: NAVIGATION_SCREENS.COMING_SOON,
    // },
  ];

  const DROPDOWN_LISTS = bankLists.map((item: any) => {
    const last4 = item.account_number?.slice(-4);
    const maskedAccount = `•••• ${last4}`;
    const isExternalAccount =
      item?.account_type === "checking" || item?.account_type === "savings";
    const accountType = !isExternalAccount
      ? item?.account_type?.toUpperCase()
      : "external";

    return {
      label: `${item?.bank_name || ""} (${maskedAccount || ""}) ${accountType || ""}`,
      value: accountType?.toLowerCase() || "",
    };
  });

  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const customStyle = customStyles(theme);
  const styles = { ...useCommonAddBalanceStyles(), ...customStyle };

  const [souceAccount, setsouceAccount] = useState(DROPDOWN_LISTS[0]?.value || "");
  const [amount, setAmount] = useState("");

  const current_balance = (bankBalance as any)?.bank_account?.usd;

  // console.log(bankBalance);

  return (
    <ScreenContainer scrollable padding={0}>
      <HeaderTitle title="Add Balance" leftIcon="true" />

      {/* Dropdown Section */}
      <View style={{ width: "100%", paddingHorizontal: 20 }}>
        <MyDropdown
          placeholder={"Source Account Type"}
          data={DROPDOWN_LISTS.filter(
            (item) => !item?.value?.toLowerCase()?.includes("ira")
          )}
          value={souceAccount}
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
          renderLeftIcon={() => <SvgIcons.Bank />}
          onChange={(item: any) => setsouceAccount(item)}
        />
      </View>
      <AmountInputDisplay
        amount={amount}
        setAmount={(amount) => {
          setAmount(amount);
        }}
      />
      <CustomText align="center" size={14} variant="caption">
        Current Balance: ${current_balance}
      </CustomText>
      {/* Payment Method Selection */}
      <View style={[styles.whiteSheetContainer]}>
        <DashboardSection title="Select Payment Method">
          {PAYMENT_METHODS.map((method, index) => (
            <TouchableOpacity
              key={index}
              style={{
                width: "100%",
                borderRadius: theme?.spacing?.spacing[2],
                padding: 10,
                borderColor: theme?.colors?.palette?.grey300,
                borderWidth: 0.5,
                backgroundColor: theme?.colors?.palette?.grey250,
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
                opacity: amount === "" || parseInt(amount) <= 0 ? 0.6 : 1,
              }}
              onPress={() =>
                navigation.navigate(method?.navigation, {
                  amount,
                  souceAccount,
                  title: "Add Balance",
                })
              }
              disabled={amount === "" || parseInt(amount) <= 0}
            >
              {method.icon}
              <CustomText
                style={{ flex: 1, paddingLeft: 10 }}
                variant="subtitle1"
              >
                {method?.title}
              </CustomText>
              <SvgIcons.ChevronRight />
            </TouchableOpacity>
          ))}
        </DashboardSection>
      </View>
    </ScreenContainer>
  );
};

export default AddBalance;

const customStyles = (theme: Theme) => StyleSheet.create({});

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

  const BANK_LISTS = bankLists.map((item: any) => {
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
      bank_name: item?.bank_name || "",
      account_number: item?.account_number || "",
      account_type: accountType || "",
      guid: item?.guid || item?.account_guid || "",
    };
  });

  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const customStyle = customStyles(theme);
  const styles = { ...useCommonAddBalanceStyles(), ...customStyle };

  const [selectedBank, setSelectedBank] = useState(BANK_LISTS[0] || null);
  const [amount, setAmount] = useState("");
  const current_balance = (bankBalance as any)?.bank_account?.usd;

  console.log("BANK_LISTS ->",JSON.stringify(BANK_LISTS,null,2));

  return (
    <ScreenContainer scrollable padding={0}>
      <HeaderTitle title="Add Balance" leftIcon="true" />

      {/* Bank Selection Button */}
      <View style={{ width: "100%", paddingHorizontal: 20 }}>
        <TouchableOpacity
          style={{
            borderRadius: theme?.spacing?.spacing[2],
            padding: 5,
            borderColor: theme?.colors?.palette?.grey300,
            borderWidth: 0.5,
            backgroundColor: theme?.colors?.palette?.grey250,
            flexDirection: "row",
            alignItems: "center",
          }}
          onPress={() => 
            navigation.navigate(NAVIGATION_SCREENS.BANK_SELECTION, {
              bankList: BANK_LISTS.filter(
                (item) => !item?.value?.toLowerCase()?.includes("ira")
              ),
              selectedBank,
              onSelectBank: setSelectedBank,
            })
          }
        >
          <SvgIcons.Bank />
          <View style={{ flex: 1, paddingLeft: 10 }}>
            <CustomText variant="subtitle2">
              {selectedBank ? selectedBank.bank_name : "Select Source Account"}
            </CustomText>
            {selectedBank && (
              <CustomText variant="caption">
                {selectedBank.label.split("(")[1]?.split(")")[0]} • {selectedBank.account_type}
              </CustomText>
            )}
          </View>
          <SvgIcons.ChevronDown width={20} height={20} />
        </TouchableOpacity>
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
              onPress={() => {
                console.log("Navigating with selectedBank ->", JSON.stringify(selectedBank, null, 2));
                navigation.navigate(method?.navigation, {
                  amount,
                  selectedBank,
                  title: "Add Balance",
                });
              }}
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

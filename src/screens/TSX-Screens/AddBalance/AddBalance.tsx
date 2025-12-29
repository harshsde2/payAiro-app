import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, { useState, useMemo } from "react";
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

  // Memoize BANK_LISTS to prevent recreation on every render
  const BANK_LISTS = useMemo(() => {
    return bankLists.map((item: any) => {
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
  }, [bankLists]);

  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const customStyle = customStyles(theme);
  const styles = { ...useCommonAddBalanceStyles(), ...customStyle };

  // Find external account from the bank list
  const externalAccount = useMemo(() => {
    return BANK_LISTS.find(
      (item: any) => item?.value?.toLowerCase() === "external"
    );
  }, [BANK_LISTS]);

  // Check if user has an external account connected
  const hasExternalAccount = !!externalAccount;

  // Auto-select external account if available, otherwise null
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const current_balance = (bankBalance as any)?.bank_account?.usd;

  // Track if initial selection has been made
  const hasInitializedRef = React.useRef(false);

  // Update selectedBank when externalAccount becomes available (only once)
  React.useEffect(() => {
    if (externalAccount && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      setSelectedBank(externalAccount);
    }
  }, [externalAccount]);

  console.log("BANK_LISTS ->",JSON.stringify(BANK_LISTS,null,2));

  // Check if user can proceed (has external account and valid amount)
  const canProceed = hasExternalAccount && amount !== "" && parseInt(amount) > 0;

  return (
    <ScreenContainer scrollable padding={0}>
      <HeaderTitle title="Add Balance" leftIcon="true" />

      {/* No External Account Warning */}
      {!hasExternalAccount && (
        <View style={customStyle.warningContainer}>
          <SvgIcons.InfoNote width={24} height={24} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <CustomText variant="subtitle2" style={{ marginBottom: 4 }}>
              No External Account Connected
            </CustomText>
            <CustomText variant="caption" style={{ color: theme?.colors?.palette?.grey500 }}>
              To add balance to your Payairo account, you need to connect an external bank account first.
            </CustomText>
          </View>
        </View>
      )}

      {/* Bank Selection Display (Non-editable when external account exists) */}
      <View style={{ width: "100%", paddingHorizontal: 20 }}>
        <View
          style={{
            borderRadius: theme?.spacing?.spacing[2],
            padding: 10,
            borderColor: hasExternalAccount 
              ? theme?.colors?.palette?.primary 
              : theme?.colors?.palette?.grey300,
            borderWidth: hasExternalAccount ? 1 : 0.5,
            backgroundColor: hasExternalAccount 
              ? theme?.colors?.palette?.green100 
              : theme?.colors?.palette?.grey250,
            flexDirection: "row",
            alignItems: "center",
            opacity: hasExternalAccount ? 1 : 0.5,
          }}
        >
          <SvgIcons.Bank />
          <View style={{ flex: 1, paddingLeft: 10 }}>
            <CustomText variant="subtitle2">
              {selectedBank ? selectedBank.bank_name : "No External Account"}
            </CustomText>
            {selectedBank ? (
              <CustomText variant="caption">
                {selectedBank.label.split("(")[1]?.split(")")[0]} • {selectedBank.account_type}
              </CustomText>
            ) : (
              <CustomText variant="caption" style={{ color: theme?.colors?.palette?.grey500 }}>
                Connect an external account to add balance
              </CustomText>
            )}
          </View>
          {hasExternalAccount && (
            <CustomText variant="caption" style={{ color: theme?.colors?.palette?.grey500 }}>
              From
            </CustomText>
          )}
        </View>
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
                opacity: !canProceed ? 0.6 : 1,
              }}
              onPress={() => {
                console.log("Navigating with selectedBank ->", JSON.stringify(selectedBank, null, 2));
                navigation.navigate(method?.navigation, {
                  amount,
                  selectedBank,
                  title: "Add Balance",
                });
              }}
              disabled={!canProceed}
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

const customStyles = (theme: Theme) => StyleSheet.create({
  warningContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: theme?.colors?.palette?.yellow100 || "#FFF9E6",
    borderRadius: theme?.spacing?.spacing[2] || 8,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme?.colors?.palette?.yellow400 || "#FFD666",
  },
});

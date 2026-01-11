import {
  View,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { ScreenContainer } from "HOC";
import HeaderTitle from "components/HeaderTitle";
import { SvgIcons } from "constants/svgs";
import { CustomText } from "tsx-components";
import { Theme, useTheme } from "styles";
import DashboardSection from "tsx-components/DashboardSection";
import useSelectorAction from "hooks/useSelectorAction";
import AmountInputDisplay from "./AmountInputDisplay";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useCommonAddBalanceStyles } from "./Styles";
import GenericButton from "components/GenericButton";
import useDispatchAction from "hooks/useDispatchAction";
import { setShowLoader } from "redux/slices/authenticationSlice";
import { showError, showSuccess } from "../../../utils/toast";
import { useIntraAccountTransfer } from "query/hooks";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";

const ACHTransfer = () => {
  const routes = useRoute();
  // Only accept amount from route params - make screen independent
  const { amount: paramsAmount } = (routes as any).params || {};

  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const customStyle = customStyles(theme);
  const styles = { ...useCommonAddBalanceStyles(), ...customStyle };

  const { bankLists, bankBalance, walletData } = useSelectorAction();
  const fees = (walletData as any)?.fees?.ACH;

  const [amount, setAmount] = useState(paramsAmount || "");
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasInitializedRef = useRef(false);

  const {
    isPending,
    mutate: handleIntraAccountTransfer,
  } = useIntraAccountTransfer();

  // Build formatted bank list from Redux bankLists
  // Format: External accounts first, then MAIN account
  const BANK_LISTS = useMemo(() => {
    return bankLists.map((item: any) => {
      const last4 = item?.account_number?.slice(-4);
      const maskedAccount = `•••• ${last4}`;
      const isExternalAccount =
        item?.account_type === "checking" || item?.account_type === "savings";
      const accountType = !isExternalAccount
        ? item?.account_type?.toUpperCase()
        : "EXTERNAL";

      return {
        label: `${item?.bank_name || ""} (${maskedAccount || ""}) ${accountType || ""}`,
        value: accountType?.toLowerCase() || "",
        bank_name: item?.bank_name || "",
        account_number: item?.account_number || "",
        account_type: accountType || "",
        guid: item?.guid || item?.account_guid || "",
        originalAccountType: item?.account_type || "",
      };
    });
  }, [bankLists]);

  // Separate external accounts
  const externalAccounts = useMemo(() => {
    return BANK_LISTS.filter((item: any) => item.value === "external");
  }, [BANK_LISTS]);

  // Check if user has external account
  const hasExternalAccount = externalAccounts.length > 0;

  // Auto-select external account as source if available, otherwise show warning
  useEffect(() => {
    if (!hasInitializedRef.current && BANK_LISTS.length > 0) {
      hasInitializedRef.current = true;
      if (hasExternalAccount && externalAccounts.length > 0) {
        // Auto-select first external account as source
        setSelectedBank(externalAccounts[0]);
      }
    }
  }, [BANK_LISTS, hasExternalAccount, externalAccounts]);

  // Build destination account list (excluding selected source account)
  const DESTINATION_ACCOUNT_LIST = useMemo(() => {
    if (!selectedBank) return [];

    // Filter out the selected source account and IRA accounts
    return BANK_LISTS.filter((item: any) => {
      // Exclude selected source account
      if (item.guid === selectedBank.guid) return false;
      // Exclude IRA accounts
      if (item.originalAccountType?.toLowerCase().includes("ira")) return false;
      return true;
    }).map((item: any, index: number) => ({
      id: index,
      title: item.label,
      icon: <SvgIcons.Bank />,
      bank_type: item.account_type,
      value: item.value,
      guid: item.guid,
      bank_name: item.bank_name,
      account_number: item.account_number,
      account_type: item.account_type,
    }));
  }, [BANK_LISTS, selectedBank]);

  const handleSelfTransfer = async () => {
    // Validation
    if (!amount || amount === "" || parseFloat(amount) <= 0) {
      showError("Please enter a valid amount");
      return;
    }

    if (!selectedBank) {
      showError("Please select a source account");
      return;
    }

    if (!selectedAccount) {
      showError("Please select a destination account");
      return;
    }

    // Clear previous error before making new request
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("amount", amount);
    formData.append("source_account_type", selectedBank.value); // Source: where money comes FROM
    formData.append("destination_account_type", selectedAccount.value); // Destination: where money goes TO
    formData.append("bank_account_id", selectedBank.guid); // Source account GUID

    handleIntraAccountTransfer(formData as any, {
      onSuccess: (data) => {
        showSuccess(data?.data?.message || "Transfer successful");
        navigation.reset({
          index: 0,
          routes: [{ name: NAVIGATION_SCREENS.NEW_DASHBOARD }],
        });
      },
      onError: (error: any) => {
        const errorMsg =
          error?.response?.data?.data?.message ||
          error?.response?.data?.message ||
          "Something went wrong";
        showError(errorMsg);
        // Set error message to display on screen
        setErrorMessage(errorMsg);
      },
      onSettled: () => {
        useDispatchAction(setShowLoader(false));
      },
    });
  };





  


  return (
    <ScreenContainer padding={0}>
      <HeaderTitle title="Account Transfer" leftIcon="true" />

      {/* No External Account Warning */}
      {!hasExternalAccount && (
        <View style={customStyle.warningContainer}>
          <SvgIcons.InfoNote width={24} height={24} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <CustomText variant="subtitle2" style={{ marginBottom: 4 }}>
              No External Account Connected
            </CustomText>
            <CustomText
              variant="caption"
              style={{ color: theme?.colors?.palette?.grey500 }}
            >
              To add balance to your Payairo account, you need to connect an
              external bank account first.
            </CustomText>
          </View>
        </View>
      )}

      {/* Source Account Display (Pre-selected and Disabled) */}
      {selectedBank && (
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <View
            style={{
              borderRadius: theme?.spacing?.spacing[2],
              padding: 15,
              borderColor: theme?.colors?.palette?.grey300,
              borderWidth: 0.5,
              backgroundColor: theme?.colors?.palette?.grey100,
              flexDirection: "row",
              alignItems: "center",
              opacity: 0.6,
            }}
          >
            <SvgIcons.Bank />
            <View style={{ flex: 1, paddingLeft: 10 }}>
              <CustomText variant="subtitle2">
                {selectedBank.bank_name}
              </CustomText>
              <CustomText variant="caption">
                {selectedBank.label.split("(")[1]?.split(")")[0]} •{" "}
                {selectedBank.account_type}
              </CustomText>
            </View>
            <CustomText
              variant="caption"
              style={{ color: theme?.colors?.palette?.grey500 }}
            >
              From
            </CustomText>
          </View>
        </View>
      )}

      <AmountInputDisplay editable={false}  amount={amount} setAmount={setAmount} />
      <CustomText align="center" size={14} variant="caption">
        Current Balance: ${(bankBalance as any)?.bank_account?.usd || "0.00"}
      </CustomText>

      {/* Transfer Flow Header */}
      <View style={{ paddingHorizontal: 20, marginVertical: 10 }}>
        <CustomText
          variant="subtitle2"
          align="center"
          style={{ marginBottom: 5 }}
        >
          Transfer Flow
        </CustomText>
        <CustomText
          variant="caption"
          align="center"
          style={{ color: theme?.colors?.palette?.grey500 }}
        >
          Money will be transferred 'From' the source account 'To' the
          destination account.
        </CustomText>
      </View>

      <View style={[styles.whiteSheetContainer]}>
        <DashboardSection title="Select Destination Account">
          {DESTINATION_ACCOUNT_LIST.length > 0 ? (
            DESTINATION_ACCOUNT_LIST.map((item) => (
              <TouchableOpacity
                key={item.id}
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
                <CustomText
                  variant="caption"
                  style={{
                    color: theme?.colors?.palette?.grey500,
                    fontWeight: "bold",
                  }}
                >
                  To
                </CustomText>
              </TouchableOpacity>
            ))
          ) : (
            <CustomText
              variant="caption"
              style={{
                color: theme?.colors?.palette?.grey500,
                textAlign: "center",
                padding: 16,
              }}
            >
              No destination accounts available
            </CustomText>
          )}
        </DashboardSection>

        {/* Error Message Display */}
        {errorMessage && (
          <View style={customStyle.errorContainer}>
            <SvgIcons.ToastCross width={16} height={16} fill="#C92A2A" />
            <View style={{ flex: 1, paddingLeft: 10 }}>
              <CustomText variant="caption" style={customStyle.errorText}>
                {errorMessage}
              </CustomText>
            </View>
          </View>
        )}

        <GenericButton
          title="Add Balance"
          onPress={handleSelfTransfer}
          showLoader={true}
          isLoading={isPending}
          disabled={isPending || !hasExternalAccount || !selectedAccount}
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
    errorContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#FFEBEE",
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: "#C92A2A",
    },

    errorText: {
      color: "#C92A2A",
      fontSize: 14,
      fontFamily: theme.typography.fontFamily.montserratSemiBold,
      // marginLeft: 10,
    },
  });

import { View, Text, Pressable } from "react-native";
import React, { FC, useState } from "react";
import { useTheme } from "styles";
import CustomText from "./CustomText";
import GenericButton from "components/GenericButton";
import useSelectorAction from "hooks/useSelectorAction";
import MyDropdown from "./MyDropdown";

interface ConfirmationModalComponentProps {
  onCancelPress: () => void;
  onConfirmPress: () => void;
  headerText: string;
  descriptionText: string;
  amountText: string;
  selectedAccount: string;
  onBankSelect: (bank: string) => void;
}

const ConfirmationModalComponent: FC<ConfirmationModalComponentProps> = ({
  onCancelPress,
  onConfirmPress,
  headerText,
  descriptionText,
  amountText,
  selectedAccount,
  onBankSelect,
}) => {
  const { theme } = useTheme();
  const { tokens, bankLists, walletData } = useSelectorAction();

  const DROPDOWN_LISTS = bankLists.map((item: any) => {
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

  function getAmountAfterDeduction(amount: any, percentage: any) {
    const fee = (amount * percentage) / 100;
    const finalAmount = amount + fee;
    return parseFloat(finalAmount.toFixed(2)); // rounded to 2 decimal places
  }

  const result = getAmountAfterDeduction(
    parseInt(walletData?.Iraaccountfee),
    parseInt(walletData?.TransactionFees_persentage)
  );
  // const total =
  //   (Number(walletData?.Iraaccountfee) *
  //     walletData?.TransactionFees_persentage) /
  //   100;

  // console.log("walletData?.Iraaccountfee =>", walletData?.Iraaccountfee);
  return (
    <Pressable
      style={{
        width: "95%",
        backgroundColor: "white",
        padding: 10,
        // height: 100,
        borderRadius: theme.spacing.spacing[5],
      }}
      onPress={(e) => e.stopPropagation()}
    >
      <CustomText
        size={16}
        style={{ textAlign: "center", marginTop: 20 }}
        fontWeight="semiBold"
        variant="caption"
      >
        {headerText}
      </CustomText>
      <CustomText
        size={12}
        // fontWeight={"semiBold"}
        style={{ textAlign: "center", marginVertical: 10 }}
        variant="caption"
      >
        {descriptionText}
      </CustomText>
      <CustomText
        size={14}
        fontWeight={"semiBold"}
        style={{ marginVertical: 10, marginLeft: 10 }}
        variant="caption"
      >
        {`Total amount to paid: $${result}`}
      </CustomText>
      <View style={{ width: "100%", marginVertical: 10 }}>
        <MyDropdown
          label={"Select Account to pay"}
          placeholder={"Select Account"}
          data={DROPDOWN_LISTS.filter(
            (item) => !item.value.toLowerCase().includes("ira")
          )} // Filter out external accounts if needed
          // Filter out external accounts if needed
          value={selectedAccount}
          search={false}
          itemTextStyle={{
            fontSize: 14,
            fontFamily: theme?.typography.fontFamily.montserrat,
          }}
          onChange={(item: any) => onBankSelect(item)}
        />
      </View>
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          padding: 10,
          justifyContent: "space-between",
        }}
      >
        <GenericButton
          title="Cancel"
          onPress={() => {
            onCancelPress();
          }}
          cStyle={{ width: "45%", backgroundColor: "black" }}
        />
        <GenericButton
          title="Confirm"
          onPress={() => {
            onConfirmPress();
          }}
          cStyle={{ width: "45%" }}
          disabled={selectedAccount == ""}
        />
      </View>
    </Pressable>
  );
};

export default ConfirmationModalComponent;

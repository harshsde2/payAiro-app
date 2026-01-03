import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
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
import { apiClient } from "api";
import { AUTH } from "api/endpoints";
import { showError } from "utils/toast";

const AddBalance = () => {
  const { bankBalance } = useSelectorAction();

  const PAYMENT_METHODS = [
    {
      title: "Debit Card",
      icon: <SvgIcons.DebitCard />,
      type: "coinflow",
    },
    {
      title: "Apple Pay/Google Pay",
      icon: <SvgIcons.ApplePay />,
      type: "coinflow",
    },
    {
      title: "Account Transfer",
      icon: <SvgIcons.ACHTransfer />,
      type: "coinflow",
    },
  ];

  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const customStyle = customStyles(theme);
  const styles = { ...useCommonAddBalanceStyles(), ...customStyle };

  const [amount, setAmount] = useState("");
  const [loadingPaymentMethod, setLoadingPaymentMethod] = useState<string | null>(null);
  const current_balance = (bankBalance as any)?.bank_account?.usd;

  // Handle coinflow checkout
  const handleCoinflowCheckout = async (paymentMethodTitle: string) => {
    if (!amount || parseInt(amount) <= 0) {
      showError("Please enter a valid amount");
      return;
    }

    setLoadingPaymentMethod(paymentMethodTitle);
    try {
      const amountInCents = Math.round(parseFloat(amount));
      const response = await apiClient.post<{
        status: boolean;
        message: string;
        data: {
          status: boolean;
          message: string;
          checkout_link: string;
          amount_usd: number;
          amount_cents: number;
        };
      }>(AUTH.COINFLOW_CHECKOUT, {
        amount: amountInCents,
      });

      if (response?.data?.checkout_link) {
        console.log("✅ Checkout link generated successfully");
        console.log("🔗 Checkout URL:", response.data.checkout_link);
        console.log("⏰ Timestamp:", new Date().toISOString());
        // Test this URL in Safari on iOS device to see if it works outside WebView
        navigation.navigate(NAVIGATION_SCREENS.COINFLOW_CHECKOUT_WEBVIEW as never, {
          checkoutLink: response.data.checkout_link,
        });
      } else {
        showError(response?.message || "Failed to generate checkout link");
      }
    } catch (error: any) {
      console.error("Coinflow checkout error:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to initiate checkout. Please try again.";
      showError(errorMessage);
    } finally {
      setLoadingPaymentMethod(null);
    }
  };

  return (
    <ScreenContainer scrollable padding={0}>
      <HeaderTitle title="Add Balance" leftIcon="true" />

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
          {PAYMENT_METHODS.map((method, index) => {
            const isCoinflow = method.type === "coinflow";
            const isValidAmount = amount !== "" && parseInt(amount) > 0;
            const isThisMethodLoading = loadingPaymentMethod === method.title;
            const isDisabled = isThisMethodLoading || (loadingPaymentMethod !== null) || !isValidAmount;

            return (
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
                  opacity: isDisabled && !isThisMethodLoading ? 0.6 : 1,
                }}
                onPress={() => {
                  if (isCoinflow) {
                    handleCoinflowCheckout(method.title);
                  }
                }}
                disabled={isDisabled}
              >
                {method.icon}
                <CustomText
                  style={{ flex: 1, paddingLeft: 10 }}
                  variant="subtitle1"
                >
                  {method?.title}
                </CustomText>
                {isThisMethodLoading ? (
                  <ActivityIndicator size="small" color={theme?.colors?.palette?.primary} />
                ) : (
                  <SvgIcons.ChevronRight />
                )}
              </TouchableOpacity>
            );
          })}
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

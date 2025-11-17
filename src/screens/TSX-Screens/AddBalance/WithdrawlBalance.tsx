import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  InteractionManager,
} from "react-native";
import React, { useState, useRef } from "react";
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
import PaymentTypeSelectionModal from "tsx-components/modals/PaymentTypeSelectionModal";
import GenericButton from "components/GenericButton";
import { useExternalWithdrawal } from "query/hooks/useBank";
import PinScreen from "tsx-components/modals/PinScreen";
import { PinScreenRef } from "tsx-components/modals/modal.types";

const WithdrawlBalance = () => {
  const { bankLists, bankBalance } = useSelectorAction();

  const BANK_LISTS = bankLists
    .filter((item: any) => item?.bank_type === "external")
    .map((item: any) => {
      const last4 = item.account_number?.slice(-4);
      const maskedAccount = `•••• ${last4}`;
      const isExternalAccount =
        item?.account_type === "checking" || item?.account_type === "savings";
      const accountType = !isExternalAccount
        ? item?.account_type?.toUpperCase()
        : "external";

      return {
        label: `${item?.bank_name || ""} (${maskedAccount || ""}) ${
          accountType || ""
        }`,
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
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState<"ach" | "rtp" | null>(null);
  const current_balance = (bankBalance as any)?.bank_account?.usd;
  const withdrawalMutation = useExternalWithdrawal();
  const pinScreenRef = useRef<PinScreenRef | null>(null);

  const handleProceed = () => {
    // Validation checks
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    const withdrawalAmount = parseFloat(amount);

    // Minimum amount validation
    if (withdrawalAmount < 1) {
      Alert.alert("Error", "Minimum withdrawal amount is $1");
      return;
    }

    // Maximum amount validation (if needed)
    if (withdrawalAmount > 100000) {
      Alert.alert("Error", "Maximum withdrawal amount is $100,000");
      return;
    }

    // Balance validation
    if (!current_balance || withdrawalAmount > current_balance) {
      Alert.alert("Error", "Insufficient balance");
      return;
    }

    if (!selectedBank) {
      Alert.alert("Error", "Please select a source account");
      return;
    }

    if (!selectedBank?.guid) {
      Alert.alert("Error", "Invalid bank selection");
      return;
    }

    // Show payment type selection modal first
    setIsPaymentModalVisible(true);
  };

  const handleClosePaymentModal = () => {
    // Close modal and reset selection if user closes without confirming
    setIsPaymentModalVisible(false);
    if (!selectedPaymentType) {
      setSelectedPaymentType(null);
    }
  };

  const handlePaymentTypeSelect = (paymentType: "ach" | "rtp") => {
    // Store selected payment type
    setSelectedPaymentType(paymentType);
    
    // Note: Modal is already closed by PaymentTypeSelectionModal's handleConfirm
    // Wait for payment modal to close completely before opening PIN modal
    // Use InteractionManager and setTimeout to ensure smooth transition
    InteractionManager.runAfterInteractions(() => {
      setTimeout(() => {
        // Start PIN verification flow after payment modal closes
        if (pinScreenRef.current && pinScreenRef.current.checkUserPin) {
          pinScreenRef.current.checkUserPin();
        }
      }, 500); // Increased delay to ensure modal is fully closed
    });
  };

  const handleActionsAfterPinVerified = () => {
    // Navigate to OTP screen after PIN verification
    navigation.navigate(NAVIGATION_SCREENS.OTP_SCREEN, {
      onOTPVerified: handleActionsAfterOTPVerified,
      transactionType: "withdrawal",
    });
  };

  const handleActionsAfterOTPVerified = async () => {
    // Execute withdrawal API call after OTP verification
    if (!selectedBank?.guid || !selectedPaymentType) {
      Alert.alert("Error", "Invalid withdrawal details");
      return;
    }

    const withdrawalAmount = parseFloat(amount);

    // Navigate to transaction result screen with loading state
    navigation.navigate(NAVIGATION_SCREENS.TRANSACTION_RESULT, {
      isLoading: true,
      transactionData: null,
      isSuccess: false,
      isError: false,
    });

    try {
      const data = await withdrawalMutation.mutateAsync({
        amount: withdrawalAmount,
        payment_type: selectedPaymentType,
        external_account_id: selectedBank.guid,
      });

      console.log("data => withdrawal ->", JSON.stringify(data, null, 2));

      // Navigate to transaction result with success state
      navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT, {
        isLoading: false,
        transactionData: {
          status: data?.status || true,
          message: data?.message || "Withdrawal request submitted successfully",
          data: {
            transaction: {
              transaction_id: data?.data?.transaction_id || data?.data?.id || "N/A",
              amount: withdrawalAmount.toString(),
              status: "completed",
              timestamp: new Date().toISOString(),
              payment_type: selectedPaymentType.toUpperCase(),
              external_account_id: selectedBank.guid,
              bank_name: selectedBank.bank_name,
            },
          },
        },
        isSuccess: true,
        isError: false,
      });
    } catch (error: any) {
      console.log("withdrawal error =>", JSON.stringify(error, null, 2));
      
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to process withdrawal";

      // Navigate to transaction result with error state
      navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT, {
        isLoading: false,
        transactionData: {
          status: false,
          message: errorMessage,
          data: {
            transaction: {
              amount: withdrawalAmount.toString(),
              status: "failed",
              timestamp: new Date().toISOString(),
              payment_type: selectedPaymentType.toUpperCase(),
            },
          },
        },
        isSuccess: false,
        isError: true,
      });
    } finally {
      // Reset selected payment type after API call
      setSelectedPaymentType(null);
    }
  };

  const isProceedDisabled =
    !amount ||
    parseFloat(amount) <= 0 ||
    !selectedBank ||
    withdrawalMutation.isPending ||
    (current_balance && parseFloat(amount) > current_balance);

  return (
    <ScreenContainer scrollable padding={0}>
      <HeaderTitle title="Withdrawal Balance" leftIcon="true" />

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
        <DashboardSection title="Select Source Account">
          {/* Bank Selection Button */}
          <View style={{ width: "100%",  }}>
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
                  {selectedBank
                    ? selectedBank.bank_name
                    : "Select Source Account"}
                </CustomText>
                {selectedBank && (
                  <CustomText variant="caption">
                    {selectedBank.label.split("(")[1]?.split(")")[0]} •{" "}
                    {selectedBank.account_type}
                  </CustomText>
                )}
              </View>
              <SvgIcons.ChevronDown width={20} height={20} />
            </TouchableOpacity>
          </View>
        </DashboardSection>
      </View>

      {/* Proceed Button */}
      <View style={styles.proceedButtonContainer}>
        <GenericButton
          title="Proceed"
          onPress={handleProceed}
          disabled={isProceedDisabled}
          showLoader={withdrawalMutation.isPending}
          isLoading={withdrawalMutation.isPending}
        />
      </View>

      {/* Payment Type Selection Modal */}
      <PaymentTypeSelectionModal
        isVisible={isPaymentModalVisible}
        onClose={handleClosePaymentModal}
        onSelect={handlePaymentTypeSelect}
        amount={amount}
      />

      {/* PIN Screen */}
      <PinScreen
        ref={pinScreenRef}
        onAction={handleActionsAfterPinVerified}
        accountNumber={selectedBank?.account_number || ""}
      />
    </ScreenContainer>
  );
};

export default WithdrawlBalance;

const customStyles = (theme: Theme) =>
  StyleSheet.create({
    proceedButtonContainer: {
      paddingHorizontal: theme.spacing.spacing.lg,
      paddingVertical: theme.spacing.spacing.md,
      paddingBottom: theme.spacing.spacing.xl,
    },
  });

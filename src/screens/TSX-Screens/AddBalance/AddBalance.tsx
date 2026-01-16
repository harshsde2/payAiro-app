import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import React, { useMemo, useState } from "react";
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
import InAppBrowser from "react-native-inappbrowser-reborn";
import { isProduction } from "config/env.config";
import BankDetailsModal from "components/common-components/BankDetailsModal";
import LocationUnavailableModal from "components/common-components/LocationUnavailableModal";

// Helper function to get icon component by key
const getPaymentIcon = (
  iconKey: "DebitCard" | "ApplePay" | "ACHTransfer" | "CryptoWallet" | "Bank"
) => {
  switch (iconKey) {
    case "DebitCard":
      return <SvgIcons.DebitCard />;
    case "ApplePay":
      return <SvgIcons.ApplePay />;
    case "ACHTransfer":
      return <SvgIcons.ACHTransfer />;
    case "CryptoWallet":
      return <SvgIcons.CryptoWallet />;
    case "Bank":
      return <SvgIcons.Bank width={30} height={30} style={{ marginHorizontal:8 }} />;
    default:
      return null;
  }
};

// Payment method configurations (without icons - icons are created in component)
const PAYMENT_METHOD_CONFIGS = [
  {
    title: "Debit Card",
    iconKey: "DebitCard" as const,
    type: "coinflow" as const,
    navigation: NAVIGATION_SCREENS.COINFLOW_CHECKOUT_WEBVIEW,
    showInProduction: false, // Hide in production
    isDisabled: true,
  },
  {
    title: "Apple Pay/Google Pay",
    iconKey: "ApplePay" as const,
    type: "coinflow" as const,
    navigation: NAVIGATION_SCREENS.COINFLOW_CHECKOUT_WEBVIEW,
    showInProduction: false, // Hide in production
    isDisabled: true,
  },
  {
    title: "Account Transfer",
    iconKey: "ACHTransfer" as const,
    type: "ACH" as const,
    navigation: NAVIGATION_SCREENS.ACH_TRANSFER,
    showInProduction: true, // Always show
    isDisabled: true,
  },
  {
    title: "Crypto Wallet",
    iconKey: "CryptoWallet" as const,
    type: "CryptoWallet" as const,
    navigation: NAVIGATION_SCREENS.ADD_CRYPTO,
    showInProduction: true, // Always show
    isDisabled: false,
  },
  {
    title: "Bank Account",
    iconKey: "Bank" as const,
    type: "Bank" as const,
    navigation: NAVIGATION_SCREENS.ADD_CRYPTO,
    showInProduction: true, // Always show
    isDisabled: false,
  },
] as const;

const AddBalance = () => {
  const { bankBalance, bankLists } = useSelectorAction();

  // Filter and create payment methods with icons based on environment
  const PAYMENT_METHODS = useMemo(() => {
    const isProd = isProduction();

    // Filter methods based on environment
    const filteredConfigs = isProd
      ? PAYMENT_METHOD_CONFIGS.filter((method) => method.showInProduction)
      : PAYMENT_METHOD_CONFIGS;

    // Create payment methods with icons
    return filteredConfigs.map((config) => ({
      title: config.title,
      icon: getPaymentIcon(config.iconKey),
      type: config.type,
      navigation: config.navigation,
      isDisabled: config.isDisabled,
    }));
  }, []);

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
  }, [bankLists]);

  console.log("BANK_LISTS =>", JSON.stringify(BANK_LISTS, null, 2));

  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const customStyle = customStyles(theme);
  const styles = { ...useCommonAddBalanceStyles(), ...customStyle };

  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [loadingPaymentMethod, setLoadingPaymentMethod] = useState<
    string | null
  >(null);
  const [hasAmountError, setHasAmountError] = useState(false);
  const [isBankDetailsModalVisible, setIsBankDetailsModalVisible] = useState(false);
  const [isLocationUnavailableModalVisible, setIsLocationUnavailableModalVisible] = useState(false);
  const current_balance = (bankBalance as any)?.bank_account?.usd;

  // Track if initial selection has been made
  const hasInitializedRef = React.useRef(false);

  // Find external account from the bank list
  const externalAccount = useMemo(() => {
    return BANK_LISTS.find(
      (item: any) => item?.value?.toLowerCase() === "external"
    );
  }, [BANK_LISTS]);

  // Check if user has an external account connected
  const hasExternalAccount = !!externalAccount;

  // Update selectedBank when externalAccount becomes available (only once)
  React.useEffect(() => {
    if (externalAccount && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      setSelectedBank(externalAccount);
    }
  }, [externalAccount]);

  // Handle coinflow checkout
  const handleCoinflowCheckout = async (paymentMethodTitle: string) => {
    if (!amount || parseInt(amount) <= 0) {
      setHasAmountError(true);
      showError("Please enter a valid amount");
      // Reset error after animation completes
      setTimeout(() => {
        setHasAmountError(false);
      }, 1000);
      return;
    }

    // Clear error if amount is valid
    setHasAmountError(false);

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

        navigation.navigate(NAVIGATION_SCREENS.TEST_WEBVIEW, {
          checkoutLink: response.data.checkout_link,
        });
        // Check if InAppBrowser is available
        // const isAvailable = await InAppBrowser.isAvailable();

        // if (isAvailable) {
        //   try {
        //     // Open in-app browser with payment success detection
        //     const result = await InAppBrowser.open(
        //       response.data.checkout_link,
        //       {
        //         // iOS options
        //         dismissButtonStyle: "cancel",
        //         preferredBarTintColor:
        //           theme?.colors?.palette?.primary || "#4F378B",
        //         preferredControlTintColor: "#FFFFFF",
        //         readerMode: false,
        //         animated: true,
        //         modalPresentationStyle: "fullScreen",
        //         modalTransitionStyle: "coverVertical",
        //         modalEnabled: true,
        //         enableBarCollapsing: false,
        //         // Android options
        //         showTitle: true,
        //         toolbarColor: theme?.colors?.palette?.primary || "#4F378B",
        //         secondaryToolbarColor: "#000000",
        //         navigationBarColor: "#000000",
        //         navigationBarDividerColor: "transparent",
        //         enableUrlBarHiding: true,
        //         enableDefaultShare: true,
        //         forceCloseOnRedirection: false,
        //         animations: {
        //           startEnter: "slide_in_right",
        //           startExit: "slide_out_left",
        //           endEnter: "slide_in_left",
        //           endExit: "slide_out_right",
        //         },
        //         headers: {
        //           "Accept-Language": "en-US",
        //         },
        //       }
        //     );

        //     // Handle browser result
        //     if (result.type === "cancel") {
        //       console.log("User cancelled the checkout");
        //       // User closed the browser, no action needed
        //     } else if (result.type === "dismiss") {
        //       console.log("Browser was dismissed");
        //     }
        //   } catch (error: any) {
        //     console.error("InAppBrowser error:", error);
        //     showError("Failed to open checkout page. Please try again.");
        //   }
        // } else {
        //   // Fallback to WebView screen if InAppBrowser is not available
        //   navigation.navigate(
        //     NAVIGATION_SCREENS.COINFLOW_CHECKOUT_WEBVIEW as never,
        //     {
        //       checkoutLink: response.data.checkout_link,
        //     }
        //   );
        // }
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


  const item = {
    "symbol": "USDC_NPL",
    "logo": "https://app.payairo.com/media/svgs/logo_2.svg",
    "network": "Polygon",
    "name": "USDC_NPL"
  }

  return (
    <ScreenContainer scrollable padding={0}>
      <HeaderTitle title="Add Balance" leftIcon="true" />
      {/* <View style={customStyle.dropdownButtonContainer}>
        <TouchableOpacity
          style={customStyle.dropdownButton}
          onPress={() => setIsBankDetailsModalVisible(true)}
        >
          <SvgIcons.Bank width={20} height={20} />
          <CustomText variant="body2" style={customStyle.dropdownButtonText}>
            View Bank Details
          </CustomText>
          <SvgIcons.ChevronDown width={16} height={16} />
        </TouchableOpacity>
      </View> */}
      <AmountInputDisplay
        amount={amount}
        setAmount={(amount) => {
          setAmount(amount);
          // Clear error when user starts typing
          if (hasAmountError) {
            setHasAmountError(false);
          }
        }}
        hasError={hasAmountError}
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
            const isOtherMethodLoading =
              loadingPaymentMethod !== null &&
              loadingPaymentMethod !== method.title;
            // Only disable if another method is loading, not if amount is invalid
            const isDisabled = isThisMethodLoading || isOtherMethodLoading 

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
                  // Show reduced opacity if amount is invalid or if disabled
                  opacity:
                    method.isDisabled ? (!isValidAmount || isDisabled ) && !isThisMethodLoading 
                      ? 0.6
                      : 1 : 1,
                }}
                onPress={() => {
                  if (method.type === "ACH") {
                    if (amount === "") {
                      showError("Please enter valid amount");
                      return;
                    }
                    navigation.navigate(method?.navigation, {
                      amount,
                    });
                  } else if (method.type === "coinflow") {
                    handleCoinflowCheckout(method.title);
                    // showError("This feature is not available yet");
                  } else if (method.type === "CryptoWallet") {
                    navigation.navigate(method?.navigation, {
                      item,
                    });
                  } else if (method.type === "Bank") {
                    setIsBankDetailsModalVisible(true)
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
                  <ActivityIndicator
                    size="small"
                    color={theme?.colors?.palette?.primary}
                  />
                ) : (
                  <SvgIcons.ChevronRight />
                )}
              </TouchableOpacity>
            );
          })}
        </DashboardSection>
      </View>
      <BankDetailsModal
        isVisible={isBankDetailsModalVisible}
        onClose={() => setIsBankDetailsModalVisible(false)}
        bankList={BANK_LISTS}
      />
    </ScreenContainer>
  );
};

export default AddBalance;

const customStyles = (theme: Theme) =>
  StyleSheet.create({
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
    dropdownButtonContainer: {
      paddingHorizontal: theme?.spacing?.spacing[5] || 20,
      paddingTop: theme?.spacing?.spacing[3] || 12,
      paddingBottom: theme?.spacing?.spacing[2] || 8,
    },
    dropdownButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme?.colors?.palette?.grey250 || theme?.colors?.palette?.grey100,
      borderRadius: theme?.spacing?.spacing[2] || 8,
      padding: theme?.spacing?.spacing[3] || 12,
      borderWidth: 1,
      borderColor: theme?.colors?.palette?.grey300,
      gap: theme?.spacing?.spacing[2] || 8,
    },
    dropdownButtonText: {
      flex: 1,
      marginLeft: theme?.spacing?.spacing[2] || 8,
    },
  });

import { View, Text, StyleSheet, Pressable, Image, Keyboard } from "react-native";
import React, { useRef, useState, useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ScreenContainer } from "HOC";
import HeaderTitle from "components/HeaderTitle";
import { Theme, useTheme } from "styles";
import { useGlobalStyles } from "styles/GlobalStyles";
import { CustomText } from "tsx-components";
import { SvgIcons } from "constants/svgs";
import { SvgUri } from "react-native-svg";
import AmountInputDisplay from "../AddBalance/AmountInputDisplay";
import GenericButton from "components/GenericButton";
import useSelectorAction from "hooks/useSelectorAction";
import CommonModal from "tsx-components/modals/CommonModal";
import { useCryptoBuy, useCryptoSell, useCryptoBalanceByAsset, useRefreshCryptoBalance, cryptoKeys } from "query/hooks";
import { bankKeys } from "query/hooks/useBank";
import { queryClient } from "query/queryClient";
import { showError, showSuccess } from "../../../utils/toast";
import { useDispatch } from "react-redux";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import PinScreen from "tsx-components/modals/PinScreen";

const CryptoSell = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const pinScreenRef = useRef<any>(null);
  
  const { details } = route.params as any;

  // console.log("details =>", JSON.stringify(details, null, 2));
  const { walletData, totalDisbursable } = useSelectorAction() as any;
  // console.log("walletData =>", JSON.stringify(walletData?.fees?.SELL, null, 2));
  const fees = walletData?.fees?.SELL;

  // Robust edge case handling for details
  useEffect(() => {
    if (!details) {
      showError("Invalid crypto details. Please try again.");
      navigation.goBack();
    }
  }, [details, navigation]);

  // Return early if details are invalid (but after hooks)
  if (!details) {
    return null;
  }

  const symbol = details?.symbol || "CRYPTO";
  const sell_price = details?.sell_price ?? null;
  const logo = details?.logo || null;

  // Validate sell_price
  const isValidPrice = sell_price !== null && sell_price !== undefined && !isNaN(Number(sell_price)) && Number(sell_price) > 0;
  const formattedPrice = isValidPrice ? Number(sell_price).toFixed(6).replace(/\.?0+$/, "") : null;

  const { theme } = useTheme();
  const { spacing, colors } = theme;
  const styles = { ...useGlobalStyles(), ...custonStyles(theme) };

  const [amount, setAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  
  const {
    mutate: handleSellCripto,
    isPending,
    isError,
    isSuccess,
  } = useCryptoSell();

  const { refreshBalance } = useRefreshCryptoBalance();

  const { data: cryptoBalanceData, isLoading: isBalanceLoading } = useCryptoBalanceByAsset(symbol);
  
  const availableBalance = cryptoBalanceData?.data?.platform_available || "0.00";

  const handleCheckPin = () => {
    if (pinScreenRef.current) {
      pinScreenRef.current?.checkUserPin();
    }
  };

  const handleActionsAfterPinVerified = () => {
    navigation.navigate(NAVIGATION_SCREENS.OTP_SCREEN, {
      onOTPVerified: handleActionsAfterOTPVerified,
      transactionType: 'crypto_sell',
    });
  };

  const handleActionsAfterOTPVerified = () => {
    console.log("handleActionsAfterOTPVerified called");
    onSellClick();
  };

  const getUSDAmount = () => {
    if (!amount || amount === "" || amount === "0") return 0;
    const parsedAmount = parseFloat(amount);
    
    if (isNaN(parsedAmount) || parsedAmount <= 0) return 0;
    
    if (selectedCurrency === "USD") {
      return parsedAmount;
    }
    if (!isValidPrice || sell_price === 0) return 0;
    const result = parsedAmount * Number(sell_price);
    return isNaN(result) || !isFinite(result) ? 0 : result;
  };

  // Smart USD formatter - shows accurate decimal values for crypto conversions
  const formatUSDValue = (value: number): string => {
    if (value === 0) return "0.00";
    
    // Check if there are significant digits beyond 2 decimal places
    const twoDecimal = value.toFixed(2);
    const sixDecimal = value.toFixed(6);
    
    // If the 6-decimal version differs from 2-decimal, show more precision
    if (parseFloat(sixDecimal) !== parseFloat(twoDecimal)) {
      // Trim trailing zeros but keep meaningful decimals
      return sixDecimal.replace(/0+$/, "").replace(/\.$/, "");
    }
    
    return twoDecimal;
  };

  // Smart crypto formatter
  const formatCryptoValue = (value: number): string => {
    if (value === 0) return "0.00";
    // Show up to 8 decimals for crypto, trim trailing zeros
    return value.toFixed(8).replace(/\.?0+$/, "");
  };

  const usdAmount = getUSDAmount();
  const feePercentage = parseFloat(fees || 0);
  const feeAmount = (usdAmount * feePercentage) / 100;
  const total = usdAmount - feeAmount; // USD after fee deduction (for display - what user receives)
  
  // Calculate ORIGINAL crypto amount (for API - backend handles fees)
  const getCryptoAmountForApi = () => {
    if (!amount || amount === "" || amount === "0") return 0;
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return 0;
    
    if (selectedCurrency === "USD") {
      // Calculate crypto from ORIGINAL usdAmount (no fee deduction)
      if (usdAmount <= 0) return 0;
      if (!isValidPrice || sell_price === 0) return 0;
      const result = usdAmount / Number(sell_price);
      return isNaN(result) || !isFinite(result) ? 0 : result;
    }
    // When entering crypto directly, return the entered amount
    return parsedAmount;
  };
  
  // Calculate DISPLAY crypto amount (what user is selling - same as original for sell)
  // For SELL: User sells crypto, receives USD after fees
  // So crypto amount shown = original crypto amount (what they're selling)
  // USD shown = after fee deduction (what they receive)
  const cryptoAmountForApi = getCryptoAmountForApi(); // Send to backend
  const cryptoAmount = cryptoAmountForApi; // For sell, display the crypto being sold (original amount)

  const handleCurrencyChange = (newCurrency: string) => {
    if (!amount || amount === "" || amount === "0") {
      setSelectedCurrency(newCurrency);
      return;
    }

    const currentAmount = parseFloat(amount);
    if (isNaN(currentAmount) || currentAmount <= 0) {
      setSelectedCurrency(newCurrency);
      return;
    }

    if (!isValidPrice || sell_price === 0) {
      showError("Price data unavailable. Please try again later.");
      return;
    }

    let convertedAmount: number;
    let formattedAmount: string;
    
    if (selectedCurrency === "USD" && newCurrency !== "USD") {
      convertedAmount = currentAmount / Number(sell_price);
      if (isNaN(convertedAmount) || !isFinite(convertedAmount)) {
        showError("Invalid conversion. Please try again.");
        return;
      }
      formattedAmount = convertedAmount.toFixed(8).replace(/\.?0+$/, "");
    } else if (selectedCurrency !== "USD" && newCurrency === "USD") {
      convertedAmount = currentAmount * Number(sell_price);
      if (isNaN(convertedAmount) || !isFinite(convertedAmount)) {
        showError("Invalid conversion. Please try again.");
        return;
      }
      formattedAmount = convertedAmount.toFixed(2);
    } else {
      setSelectedCurrency(newCurrency);
      return;
    }

    setAmount(formattedAmount);
    setSelectedCurrency(newCurrency);
  };

  // Validate sell data - returns true if valid, false otherwise
  const validateSellData = (): boolean => {
    if (!isValidPrice || sell_price === 0) {
      showError("Price data unavailable. Please try again later.");
      return false;
    }

    if (!amount || amount.trim() === "" || parseFloat(amount) <= 1.99) {
      showError("$2.00 or more is required to sell");
      return false;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || !isFinite(parsedAmount)) {
      showError("Invalid amount format. Please enter a valid number.");
      return false;
    }

    if (cryptoAmount <= 0 || isNaN(cryptoAmount) || !isFinite(cryptoAmount)) {
      showError("Invalid crypto amount");
      return false;
    }

    const availableBalanceNum = parseFloat(availableBalance);
    if (isNaN(availableBalanceNum)) {
      showError("Unable to fetch balance. Please try again.");
      return false;
    }

    if (cryptoAmount > availableBalanceNum) {
      showError(`Insufficient balance. Available: ${availableBalance} ${symbol}`);
      return false;
    }

    return true;
  };

  // Handle Proceed button click - validate first, then show modal
  const handleProceed = () => {
    Keyboard.dismiss();
    if (validateSellData()) {
      setShowConfirmationModal(true);
    }
  };

  const onSellClick = async () => {
    console.log("onSellClick called");

    // Send ORIGINAL values to backend (backend handles fee deduction)
    let payload = {
      amount: cryptoAmountForApi.toString(),
      asset: symbol,
      fiat: "USD",
      usd_amount: usdAmount,
    };

    // console.log("payload =>", JSON.stringify(payload, null, 2));

    navigation.navigate(NAVIGATION_SCREENS.TRANSACTION_RESULT, {
      isLoading: true,
      transactionData: null,
      isSuccess: false,
      isError: false,
    });

    handleSellCripto(payload as any, {
      onSuccess: async (data) => {
        if (data?.status) {
          // Refresh the crypto balance after successful sell
          try {
            await refreshBalance(symbol);
          } catch (error) {
            console.log("Error refreshing balance after sell:", error);
          }

          // ✅ CRITICAL: Invalidate aggregated crypto balances (for NewDashboardCard)
          queryClient.invalidateQueries({ queryKey: cryptoKeys.allCryptoBalances() });
          
          // ✅ CRITICAL: Invalidate bank balance (for NewDashboardCard in Fiat mode)
          queryClient.invalidateQueries({ queryKey: bankKeys.balance() });

          navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT, {
            isLoading: false,
            transactionData: data,
            isSuccess: true,
            isError: false,
          });
          showSuccess(`Successfully sold ${cryptoAmount.toFixed(8)} ${symbol}`);
        } else {
          // console.log("data =>", JSON.stringify(data, null, 2));

          navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT, {
            isLoading: false,
            transactionData: data,
            isSuccess: false,
            isError: true,
          });
        }
      },
      onError: (error: any) => {
        console.log("error =>", JSON.stringify(error.response, null, 2));
        navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT, {
          isLoading: false,
          transactionData: null,
          isSuccess: false,
          isError: true,
        });
        
        try {
          const errors = JSON.parse(error.response.data.data.details);
          const errorsfunds = JSON.parse(error.response.data.data.details)?.title;
          showError(errors.errors.Funds[0] || errorsfunds || `Something went wrong!`);
        } catch (parseError) {
          showError(`Something went wrong!`);
        }
      },
      onSettled: () => {},
    });
  };

  const isValidAmount = amount && parseFloat(amount) > 0 && !isNaN(parseFloat(amount));

  return (
    <ScreenContainer avoidKeyboard scrollable padding={0}>
      <CommonModal
        isVisible={showConfirmationModal}
        onClose={() => {
          setShowConfirmationModal(false);
        }}
        containerStyle={{ justifyContent: "flex-end", alignItems: "center" }}
      >
        <Pressable
          style={[
            styles.whiteSheetContainer,
            { width: "100%", maxHeight: 400 },
          ]}
        >
          <CustomText style={styles.title} variant="h3">
            Summary
          </CustomText>
          <View style={styles.row}>
            <CustomText variant={"caption"} style={styles.label}>
              Token
            </CustomText>
            <CustomText>{symbol}</CustomText>
          </View>
          <View style={styles.row}>
            <CustomText variant={"caption"} style={styles.label}>
              Amount
            </CustomText>
            <Text>{isValidAmount ? formatCryptoValue(cryptoAmount) : "0.00"} {symbol}</Text>
          </View>
          <View style={styles.row}>
            <CustomText variant={"caption"} style={styles.label}>
              Price per {symbol}
            </CustomText>
            <CustomText>{formattedPrice ? `$${formattedPrice}` : "N/A"}</CustomText>
          </View>
          <View style={styles.row}>
            <CustomText variant={"caption"} style={styles.label}>
              Subtotal
            </CustomText>
            <Text>${isValidAmount ? formatUSDValue(usdAmount) : "0.00"}</Text>
          </View>
          <View style={styles.row}>
            <CustomText variant={"caption"} style={styles.label}>
              Fees ({feePercentage}%)
            </CustomText>
            <Text>${isValidAmount ? formatUSDValue(feeAmount) : "0.00"}</Text>
          </View>
          <View style={styles.row}>
            <CustomText
              variant={"subtitle2"}
              size={14}
              style={styles.labelBold}
            >
              You Receive
            </CustomText>
            <CustomText size={14} variant={"subtitle2"} style={styles.total}>
              ${isValidAmount ? formatUSDValue(total) : "0.00"}
            </CustomText>
          </View>
          <View style={{ marginVertical: 20, gap: 10 }}>
            <GenericButton
              title={"Confirm"}
              onPress={() => {
                setShowConfirmationModal(false);
                setTimeout(() => {
                  handleCheckPin();
                }, 1000);
              }}
              showLoader={true}
              isLoading={isPending}
            />
            <GenericButton
              title={"Cancel"}
              cStyle={{ backgroundColor: "black" }}
              onPress={() => {
                setShowConfirmationModal(false);
              }}
            />
          </View>
        </Pressable>
      </CommonModal>
      <HeaderTitle leftIcon="true" title="Sell" />
      <View style={[styles.whiteSheetContainer]}>
        <View style={[{ flex: 1 }]}>
          <View style={[styles.nameContainer]}>
            {(() => {
              const logoUri = logo as string | undefined;
              const isValidLogo = typeof logoUri === "string" && logoUri.trim().length > 0;
              const isSvgLogo = isValidLogo && (logoUri!.toLowerCase().endsWith(".svg") || logoUri!.toLowerCase().includes("svg+xml"));

              if (!isValidLogo) {
                return <SvgIcons.DollarIcon width={30} height={30} />;
              }

              return (
                <View style={{width: 30, height: 30}}>
                  {isSvgLogo ? (
                    <SvgUri uri={logoUri!} width={30} height={30} />
                  ) : (
                    <Image source={{ uri: logoUri! }} style={{ width: 30, height: 30 }} resizeMode="contain" />
                  )}
                </View>
              );
            })()}
            <View style={styles.nameAndPriceContainer}>
              <CustomText
                size={14}
                variant={"subtitle2"}
              >{`${symbol}`}</CustomText>
              {formattedPrice && (
                <CustomText
                  size={12}
                  variant={"caption"}
                  style={styles.priceText}
                >{`$${formattedPrice} USD`}</CustomText>
              )}
            </View>
          </View>
          <AmountInputDisplay
            showDollarIcon={selectedCurrency === "USD"}
            amount={amount}
            setAmount={setAmount}
            suffixText={` ${symbol}`}
            selectedCurrency={selectedCurrency}
            onCurrencyChange={handleCurrencyChange}
            maxLimit={10000000}
          />
          <Pressable 
            style={[styles.maxBalanceContainer]}
            // onPress={() => {
            //   if (!isBalanceLoading && availableBalance !== "0.00") {
            //     setAmount(availableBalance);
            //     setSelectedCurrency(symbol);
            //   }
            // }}
          >
            {/* <SvgIcons.CheckSquareIcon /> */}
            <CustomText
              variant="subtitle2"
              size={10}
            >{`Balance: ${isBalanceLoading ? "Loading..." : availableBalance} ${symbol}`}</CustomText>
          </Pressable>
          <View style={[styles.totalInUSDContainer]}>
            <View style={[styles.totalInUSDText]}>
              <CustomText
                size={12}
                color="white"
                variant="subtitle2"
              >
                {selectedCurrency === "USD"
                  ? `${isValidAmount ? formatCryptoValue(cryptoAmount) : "0.00"} ${symbol}`
                  : `$${isValidAmount ? formatUSDValue(usdAmount) : "0.00"} USD`}
              </CustomText>
            </View>
          </View>
        </View>
        <GenericButton
          title="Proceed"
          onPress={handleProceed}
          disabled={!isValidAmount}
        />
      </View>

      <PinScreen
        ref={pinScreenRef}
        onAction={() => {
          handleActionsAfterPinVerified();
        }}
        accountNumber={""}
      />
    </ScreenContainer>
  );
};

export default CryptoSell;

const custonStyles = (theme: Theme) =>
  StyleSheet.create({
    textInputAndFilterContainer: {
      width: "100%",
      flex: 1,
      maxHeight: 70,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
    },
    testInputContainer: {
      flex: 1,
      marginRight: 10,
    },
    nameContainer: {
      backgroundColor: theme.colors.palette.grey100,
      borderColor: theme.colors.palette.grey300,
      borderWidth: 1 / 2,
      borderRadius: theme.spacing.spacing[4],
      width: "100%",
      paddingVertical: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingHorizontal: 5,
    },
    nameAndPriceContainer: {
      flex: 1,
      flexDirection: "column",
      gap: 2,
    },
    priceText: {
      color: theme.colors.palette.grey600,
    },
    maxBalanceContainer: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 10,
      marginVertical: 10,
    },
    title: {
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 6,
    },
    subtitle: {
      color: "#666",
      textAlign: "center",
      marginBottom: 20,
    },
    input: {
      fontSize: 20,
      fontWeight: "bold",
      textAlign: "center",
      paddingVertical: 6,
      paddingHorizontal: 12,
      minWidth: 60,
    },
    counterContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
      borderWidth: 1,
      borderColor: theme.colors.palette.grey200,
      borderRadius: theme.spacing.spacing[3],
    },
    totalInUSDContainer: {
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: theme.spacing.spacing[4],
    },
    totalInUSDText: {
      width: "50%",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.palette.green700,
      borderRadius: theme.spacing.spacing[4],
      paddingVertical: 5,
    },
    counterButton: {
      borderRadius: 10,
      padding: 10,
    },
    counterText: {
      marginHorizontal: 20,
      fontSize: 20,
      fontWeight: "bold",
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginVertical: 6,
    },
    label: {
      color: "#444",
    },
    labelBold: {
      fontWeight: "bold",
      color: "#000",
    },
    total: {
      fontWeight: "bold",
      color: "green",
    },
    buyButton: {
      backgroundColor: "#2F6B3B",
      borderRadius: 50,
      paddingVertical: 14,
      alignItems: "center",
      marginTop: 24,
    },
    buyText: {
      color: "#fff",
      fontWeight: "600",
      fontSize: 16,
    },
  });
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import React, { useRef, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ScreenContainer } from "HOC";
import HeaderTitle from "components/HeaderTitle";
import { Theme, useTheme } from "styles";
import { useGlobalStyles } from "styles/GlobalStyles";
import { CustomText } from "tsx-components";
import { SvgIcons } from "constants/svgs";
import AmountInputDisplay from "../AddBalance/AmountInputDisplay";
import GenericButton from "components/GenericButton";
import useSelectorAction from "hooks/useSelectorAction";
import CommonModal from "tsx-components/modals/CommonModal";
import { cryptoKeys, useCryptoBuy, useRefreshCryptoBalance } from "query/hooks";
import { showError, showSuccess } from "../../../utils/toast";
import { useDispatch } from "react-redux";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import PinScreen from "tsx-components/modals/PinScreen";
import { userContactKeys } from "query/queryKeys";
import { queryClient } from "query/queryClient";
import { SvgUri } from "react-native-svg";

const CryptoBuy = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const pinScreenRef = useRef<any>(null);

  const { details } = route.params as any;
  const { walletData } = useSelectorAction() as any;
  const { symbol, buy_price, logo } = details;
  const { theme } = useTheme();
  const { spacing, colors } = theme;
  const styles = { ...useGlobalStyles(), ...custonStyles(theme) };

  const [amount, setAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  
  const {
    mutate: handleBuyCripto,
    isPending,
    isError,
    isSuccess,
  } = useCryptoBuy();

  const { refreshBalance } = useRefreshCryptoBalance();

  const handleCheckPin = () => {
    if (pinScreenRef.current) {
      pinScreenRef.current?.checkUserPin();
    }
  };

  const handleActionsAfterPinVerified = () => {
    navigation.navigate(NAVIGATION_SCREENS.OTP_SCREEN, {
      onOTPVerified: handleActionsAfterOTPVerified,
      transactionType: "crypto_buy",
    });
  };

  const handleActionsAfterOTPVerified = () => {
    onBuyClick();
  };

  const getCryptoAmount = () => {
    if (!amount || amount === "" || amount === "0") return 0;
    const parsedAmount = parseFloat(amount);
    
    if (isNaN(parsedAmount) || parsedAmount <= 0) return 0;
    
    if (selectedCurrency === "USD") {
      return parsedAmount / buy_price;
    }
    return parsedAmount;
  };

  const getUSDAmount = () => {
    if (!amount || amount === "" || amount === "0") return 0;
    const parsedAmount = parseFloat(amount);
    
    if (isNaN(parsedAmount) || parsedAmount <= 0) return 0;
    
    if (selectedCurrency === "USD") {
      return parsedAmount;
    }
    return parsedAmount * buy_price;
  };

  const cryptoAmount = getCryptoAmount();
  const usdAmount = getUSDAmount();
  const feePercentage = parseFloat(walletData?.TransactionFees_persentage || 0);
  const feeAmount = (usdAmount * feePercentage) / 100;
  const total = usdAmount + feeAmount;

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

    let convertedAmount: number;
    let formattedAmount: string;
    
    if (selectedCurrency === "USD" && newCurrency !== "USD") {
      convertedAmount = currentAmount / buy_price;
      formattedAmount = convertedAmount.toFixed(8).replace(/\.?0+$/, "");
    } else if (selectedCurrency !== "USD" && newCurrency === "USD") {
      convertedAmount = currentAmount * buy_price;
      formattedAmount = convertedAmount.toFixed(2);
    } else {
      setSelectedCurrency(newCurrency);
      return;
    }

    setAmount(formattedAmount);
    setSelectedCurrency(newCurrency);
  };

  const onBuyClick = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      showError("Please enter a valid amount");
      return;
    }

    if (cryptoAmount <= 0) {
      showError("Invalid crypto amount");
      return;
    }

    let payload = {
      amount: cryptoAmount.toString(),
      asset: symbol,
      fiat: "USD",
      usd_amount: total,
    };

    navigation.navigate(NAVIGATION_SCREENS.TRANSACTION_RESULT, {
      isLoading: true,
      transactionData: null,
      isSuccess: false,
      isError: false,
    });

    handleBuyCripto(payload as any, {
      onSuccess: async (data) => {
        if (data?.status) {
          // Refresh the crypto balance after successful purchase
          try {
            await refreshBalance(symbol);
          } catch (error) {
            console.log("Error refreshing balance after purchase:", error);
          }

          navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT, {
            isLoading: false,
            transactionData: data,
            isSuccess: true,
            isError: false,
          });
          showSuccess(`Successfully bought ${cryptoAmount.toFixed(8)} ${symbol}`);
        } else {
          navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT, {
            isLoading: false,
            transactionData: data,
            isSuccess: false,
            isError: true,
          });
        }
      },
      onError: (error: any) => {
        navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT, {
          isLoading: false,
          transactionData: null,
          isSuccess: false,
          isError: true,
        });

        try {
          const errors = JSON.parse(error.response.data.data.details);
          const errorsfunds = JSON.parse(
            error.response.data.data.details
          )?.title;
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
            <Text>{isValidAmount ? cryptoAmount.toFixed(8) : "0.00"} {symbol}</Text>
          </View>
          <View style={styles.row}>
            <CustomText variant={"caption"} style={styles.label}>
              Price per {symbol}
            </CustomText>
            <CustomText>${buy_price}</CustomText>
          </View>
          <View style={styles.row}>
            <CustomText variant={"caption"} style={styles.label}>
              Subtotal
            </CustomText>
            <Text>${isValidAmount ? usdAmount.toFixed(2) : "0.00"}</Text>
          </View>
          <View style={styles.row}>
            <CustomText variant={"caption"} style={styles.label}>
              Fees ({feePercentage}%)
            </CustomText>
            <Text>${isValidAmount ? feeAmount.toFixed(2) : "0.00"}</Text>
          </View>
          <View style={styles.row}>
            <CustomText
              variant={"subtitle2"}
              size={14}
              style={styles.labelBold}
            >
              Total
            </CustomText>
            <CustomText size={14} variant={"subtitle2"} style={styles.total}>
              ${isValidAmount ? total.toFixed(2) : "0.00"}
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
      <HeaderTitle leftIcon="true" title="Buy" />
      <View style={[styles.whiteSheetContainer]}>
        <View style={[{ flex: 1 }]}>
          <View style={[styles.nameContainer]}>
            {(() => {
              const logoUri = logo as string | undefined;
              const isValidLogo =
                typeof logoUri === "string" && logoUri.trim().length > 0;
              const isSvgLogo =
                isValidLogo &&
                (logoUri!.toLowerCase().endsWith(".svg") ||
                  logoUri!.toLowerCase().includes("svg+xml"));

              if (!isValidLogo) {
                return <SvgIcons.DollarIcon width={30} height={30} />;
              }

              return (
                <View style={{ width: 30, height: 30 }}>
                  {isSvgLogo ? (
                    <SvgUri uri={logoUri!} width={30} height={30} />
                  ) : (
                    <Image
                      source={{ uri: logoUri! }}
                      style={{ width: 30, height: 30 }}
                      resizeMode="contain"
                    />
                  )}
                </View>
              );
            })()}
            <CustomText
              size={14}
              variant={"subtitle2"}
            >{`${symbol} (${symbol})`}</CustomText>
          </View>
          <AmountInputDisplay
            showDollarIcon={selectedCurrency === "USD"}
            amount={amount}
            setAmount={setAmount}
            suffixText={` ${symbol}`}
            maxLimit={10000000}
            selectedCurrency={selectedCurrency}
            onCurrencyChange={handleCurrencyChange}
          />
          <View style={[styles.totalInUSDContainer]}>
            <View style={[styles.totalInUSDText]}>
              <CustomText
                size={12}
                color="white"
                variant="subtitle2"
              >
                {selectedCurrency === "USD"
                  ? `${isValidAmount ? cryptoAmount.toFixed(8) : "0.00"} ${symbol}`
                  : `${isValidAmount ? usdAmount.toFixed(2) : "0.00"} USD`}
              </CustomText>
            </View>
          </View>
        </View>
        <GenericButton
          title="Proceed"
          onPress={() => {
            setShowConfirmationModal(true);
          }}
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

export default CryptoBuy;

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
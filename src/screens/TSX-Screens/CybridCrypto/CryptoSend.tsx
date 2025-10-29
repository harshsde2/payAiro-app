import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Image,
} from "react-native";
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
import {
  useCryptoBuy,
  useCryptoTransfer,
  useVerifyUser,
  useCryptoWithdrawal,
  useCryptoBalanceByAsset,
} from "query/hooks";
import { setErrorMsg, setSuccessMsg } from "redux/slices/authenticationSlice";
import useDispatchAction from "hooks/useDispatchAction";
import { useDispatch } from "react-redux";
import DashboardSection from "tsx-components/DashboardSection";
import TextInputField from "components/TextInputField";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import PinScreen from "tsx-components/modals/PinScreen";
import { SvgUri } from "react-native-svg";

const CryptoSend = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();

  const pinScreenRef = useRef<any>(null);

  const dispatch = useDispatch();

  const { details } = route.params as any;

  console.log("details ->",details)
  const { walletData } = useSelectorAction() as any;

  const { symbol, buy_price, logo } = details;
  const chainName = symbol.slice(0, 3);

  const { theme } = useTheme();
  const { spacing, colors } = theme;
  const styles = { ...useGlobalStyles(), ...custonStyles(theme) };

  const [amount, setAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [showFinalPage, setShowFinalPage] = useState(false);
  const [isOnChain, setIsOnChain] = useState(false);

  const [isPendingVerifyUser, setIspendingverifyUser] = useState(false);
  const [spin, setspin] = useState(false);

  const {
    mutate: handleSendCripto,
    isPending,
  } = useCryptoTransfer();

  const { data: cryptoBalanceData, isLoading: isBalanceLoading } = useCryptoBalanceByAsset(symbol);
  const availableBalance = cryptoBalanceData?.data?.rounded_balance || "0.00";

  const {
    mutate: handleVerifyUser,
    isPending: isVerifyUserPending,
    isError: isVerifyUserError,
    isSuccess: isVerifyUserSuccess,
  } = useVerifyUser();

  const { mutate: initiateWithdrawal, isPending: isWithdrawalPending } =
    useCryptoWithdrawal();

  const handleCheckPin = () => {
    if (pinScreenRef.current) {
      pinScreenRef.current?.checkUserPin();
    }
  };

  const handleActionsAfterPinVerified = () => {
    navigation.navigate(NAVIGATION_SCREENS.OTP_SCREEN, {
      onOTPVerified: isOnChain
        ? handleActionsAfterOTPVerifiedWithdrawal
        : handleActionsAfterOTPVerified,
      transactionType: isOnChain ? "crypto_withdrawal" : "crypto_send",
    });
  };

  const handleActionsAfterOTPVerified = () => {
    onSendClick();
  };

  const handleActionsAfterOTPVerifiedWithdrawal = () => {
    onWithdrawClick();
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

  const onSendClick = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      dispatch(setErrorMsg("Please enter a valid amount"));
      return;
    }

    if (cryptoAmount <= 0) {
      dispatch(setErrorMsg("Invalid crypto amount"));
      return;
    }

    const availableBalanceNum = parseFloat(availableBalance);
    if (cryptoAmount > availableBalanceNum) {
      dispatch(setErrorMsg(`Insufficient balance. Available: ${availableBalance} ${symbol}`));
      return;
    }

    if (Number(usdAmount) > 100000) {
      dispatch(setErrorMsg("Amount cannot exceed ₹1,00,000"));
      return;
    }

    let payload = {
      account_type: "",
      amount: cryptoAmount.toString(),
      asset: chainName,
      network: details?.network || "",
      receiver: recipient,
    };

    navigation.navigate(NAVIGATION_SCREENS.TRANSACTION_RESULT, {
      isLoading: true,
      transactionData: null,
      isSuccess: false,
      isError: false,
    });

    setspin(true);
    handleSendCripto(payload as any, {
      onSuccess: (data) => {
        if (data?.status) {
          navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT, {
            isLoading: false,
            transactionData: data,
            isSuccess: true,
            isError: false,
          });
          dispatch(setSuccessMsg(data?.data?.message));
        } else {
          navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT, {
            isLoading: false,
            transactionData: data,
            isSuccess: false,
            isError: true,
          });
          useDispatchAction(
            setErrorMsg(
              data?.data?.data.error ||
                "Operation is forbidden. Custodial account is suspended or Level 2 KYC Pending"
            )
          );
        }
      },
      onError: (error: any) => {
        navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT, {
          isLoading: false,
          transactionData: null,
          isSuccess: false,
          isError: true,
        });
        const errors = error.response.data.data.error;
      },
      onSettled: () => {
        setspin(false);
      },
    });
  };

  const onWithdrawClick = async () => {
    if (!recipient || recipient.trim().length < 10) {
      dispatch(setErrorMsg("Please enter a valid wallet address"));
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      dispatch(setErrorMsg("Please enter a valid amount"));
      return;
    }

    if (cryptoAmount <= 0) {
      dispatch(setErrorMsg("Invalid crypto amount"));
      return;
    }

    const availableBalanceNum = parseFloat(availableBalance);
    if (cryptoAmount > availableBalanceNum) {
      dispatch(setErrorMsg(`Insufficient balance. Available: ${availableBalance} ${symbol}`));
      return;
    }

    const payload = {
      asset: symbol,
      amount: cryptoAmount,
      usd_amount: Number(usdAmount.toFixed(2)),
      withdrawal_address: recipient.trim(),
    } as any;

    navigation.navigate(NAVIGATION_SCREENS.TRANSACTION_RESULT, {
      isLoading: true,
      transactionData: null,
      isSuccess: false,
      isError: false,
    });

    setspin(true);
    initiateWithdrawal(payload, {
      onSuccess: (data: any) => {
        if (data?.status) {
          navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT, {
            isLoading: false,
            transactionData: data,
            isSuccess: true,
            isError: false,
          });
          dispatch(
            setSuccessMsg(
              data?.data?.message || "Withdrawal initiated successfully"
            )
          );
        } else {
          navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT, {
            isLoading: false,
            transactionData: data,
            isSuccess: false,
            isError: true,
          });
          dispatch(setErrorMsg(data?.data?.message || "Withdrawal failed"));
        }
      },
      onError: (error: any) => {
        navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT, {
          isLoading: false,
          transactionData: null,
          isSuccess: false,
          isError: true,
        });
        const message =
          error?.response?.data?.data?.message ||
          error?.response?.data?.message ||
          "Something went wrong!";
        dispatch(setErrorMsg(message));
      },
      onSettled: () => {
        setspin(false);
      },
    });
  };

  const onVerifyUser = async () => {
    const formData = new FormData();
    formData.append("identifier", recipient.trim());
    setIspendingverifyUser(true);
    handleVerifyUser(formData as any, {
      onSuccess: (data) => {
        setIspendingverifyUser(false);
        if (data?.status) {
          setShowFinalPage(true);
        }
      },
      onError: (error: any) => {
        setIspendingverifyUser(false);
        const errors = error.response.data.data.message;
        dispatch(setErrorMsg(errors || `Something went wrong!`));
      },
      onSettled: () => {
        setIspendingverifyUser(false);
      },
    });
  };

  const isValidAmount = amount && parseFloat(amount) > 0 && !isNaN(parseFloat(amount));

  const onQRScanClick = () =>{
      navigation.navigate(NAVIGATION_SCREENS.QR_SCANNER,{
        onScanSuccess:(id:string) =>{
          console.log("chla ->",id)
          setRecipient(id);
        }
      })
  }

  return (
    <ScreenContainer avoidKeyboard scrollable padding={0}>
      <HeaderTitle leftIcon={!showFinalPage ? "true" : ""} title="Send" />

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, !isOnChain && styles.toggleButtonActive]}
          onPress={() => {
            if (isOnChain) {
              setIsOnChain(false);
              setShowFinalPage(false);
              setRecipient("");
            }
          }}
        >
          <CustomText
            fontWeight="semiBold"
            size={16}
            color={
              !isOnChain
                ? theme.colors.palette.white
                : theme.colors.palette.grey900
            }
          >
            Off Chain
          </CustomText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, isOnChain && styles.toggleButtonActive]}
          onPress={() => {
            if (!isOnChain) {
              setIsOnChain(true);
              setShowFinalPage(false);
              setRecipient("");
            }
          }}
        >
          <CustomText
            fontWeight="semiBold"
            size={16}
            color={
              isOnChain
                ? theme.colors.palette.white
                : theme.colors.palette.grey900
            }
          >
            On Chain
          </CustomText>
        </TouchableOpacity>
      </View>

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
              title={"Pay Now"}
              onPress={() => {
                handleCheckPin();
              }}
              showLoader={true}
              isLoading={isOnChain ? isWithdrawalPending : isPending}
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

      <PinScreen
        ref={pinScreenRef}
        onAction={() => {
          handleActionsAfterPinVerified();
        }}
        accountNumber={""}
      />
      <View style={[styles.whiteSheetContainer]}>
        {showFinalPage && recipient ? (
          <View style={[{ flex: 1 }]}>
            <View style={[{ flex: 1, alignItems: "center" }]}>
              <View style={[{ alignItems: "center", gap: 5 }]}>
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
                <CustomText variant={"subtitle2"}>
                  {symbol.slice(0, 3)}
                </CustomText>
                <CustomText size={10} variant={"caption"}>
                  {symbol.slice(4)}
                </CustomText>
              </View>
              <AmountInputDisplay
                showDollarIcon={selectedCurrency === "USD"}
                amount={amount}
                setAmount={setAmount}
                suffixText={` ${symbol.slice(0, 3)}`}
                selectedCurrency={selectedCurrency}
                onCurrencyChange={handleCurrencyChange}
                maxLimit={10000000}
              />
              <Pressable 
                style={[styles.maxBalanceContainer]}
              >
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
                      ? `${isValidAmount ? cryptoAmount.toFixed(8) : "0.00"} ${symbol}`
                      : `${isValidAmount ? usdAmount.toFixed(2) : "0.00"} USD`}
                  </CustomText>
                </View>
              </View>
              <TextInputField
                label="From"
                placeholder={"PayAiroTag, Phone, Email"}
                rightIcon={""}
                editable={false}
                value={walletData?.username}
                onChange={() => {}}
              />
              <TextInputField
                label={isOnChain ? "Wallet Address" : "To"}
                placeholder={isOnChain ? "0x..." : "PayAiroTag, Phone, Email"}
                rightIcon={""}
                editable={false}
                value={recipient}
                onChange={setRecipient}
              />
            </View>
            <GenericButton
              title="proceed"
              onPress={() => {
                setShowConfirmationModal(true);
              }}
              disabled={!isValidAmount}
              cStyle={{ marginVertical: 10 }}
            />
            <GenericButton
              title="Back"
              onPress={() => {
                setShowFinalPage(false);
              }}
              disabled={!recipient}
              cStyle={{ marginVertical: 10, backgroundColor: "#000" }}
            />
          </View>
        ) : (
          <View style={[{ flex: 1 }]}>
            <View style={[{ flex: 1 }]}>
              <DashboardSection titleStyle={{ fontSize: 14 }} title="Token">
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
                  >{`${symbol} (${symbol.slice(0, 3)})`}</CustomText>
                </View>
              </DashboardSection>
              <DashboardSection
                titleStyle={{ fontSize: 14 }}
                title={isOnChain ? "Wallet Address" : "To"}
              >
                <TextInputField
                  placeholder={isOnChain ? "0x..." : "PayAiroTag, Phone, Email"}
                  rightIcon={""}
                  value={recipient}
                  rightIconComponent={isOnChain ? "scanner" :""}
                  onRightIconClick={onQRScanClick}
                  onChange={setRecipient}
                />
              </DashboardSection>
            </View>
            <GenericButton
              title="Next"
              onPress={() => {
                if (isOnChain) {
                  setShowFinalPage(true);
                } else {
                  onVerifyUser();
                }
              }}
              showLoader={true}
              isLoading={isOnChain ? false : isPendingVerifyUser}
              disabled={!recipient}
            />
          </View>
        )}
      </View>
    </ScreenContainer>
  );
};

export default CryptoSend;

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
    maxBalanceContainer: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 10,
      marginVertical: 10,
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
    toggleContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 10,
      marginHorizontal: 20,
      marginTop: 10,
      marginBottom: 10,
      backgroundColor: theme.colors.palette.green200,
      borderRadius: theme.spacing.spacing[3],
      padding: 4,
    },
    toggleButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: theme.spacing.spacing[2],
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
    },
    toggleButtonActive: {
      backgroundColor: theme.colors.palette.green700,
    },
  });
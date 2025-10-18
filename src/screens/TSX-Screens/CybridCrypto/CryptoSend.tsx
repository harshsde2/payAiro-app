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
} from "query/hooks";
import { setErrorMsg, setSuccessMsg } from "redux/slices/authenticationSlice";
import useDispatchAction from "hooks/useDispatchAction";
import { useDispatch } from "react-redux";
import DashboardSection from "tsx-components/DashboardSection";
import TextInputField from "components/TextInputField";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import PinScreen from "tsx-components/modals/PinScreen";
import { SvgUri } from "react-native-svg";
// import ResultModal from "tsx-components/modals/ResultModal"; // Replaced with TransactionResult screen

const CryptoSend = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();

  const pinScreenRef = useRef<any>(null);

  const dispatch = useDispatch();

  const { details } = route.params as any;
  const { walletData } = useSelectorAction() as any;

  const { symbol, buy_price, logo } = details;
  const chainName = symbol.slice(0, 3);

  const { theme } = useTheme();
  const { spacing, colors } = theme;
  const styles = { ...useGlobalStyles(), ...custonStyles(theme) };

  const [amount, setAmount] = useState("");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [showFinalPage, setShowFinalPage] = useState(false);
  const [isOnChain, setIsOnChain] = useState(false);

  // const [showResultModal, setShowResultModal] = useState(false); // No longer needed - using TransactionResult screen
  // const [isError, setIsError] = useState(false); // No longer needed - using TransactionResult screen
  const [isPendingVerifyUser, setIspendingverifyUser] = useState(false);
  // const [isSuccess, setIsSuccess] = useState(false); // No longer needed - using TransactionResult screen
  // const [successData, setSuccessData] = useState({}); // No longer needed - using TransactionResult screen
  const [spin, setspin] = useState(false);

  // API hooks
  const {
    mutate: handleSendCripto,
    isPending,
    // isError,
    // isSuccess,
  } = useCryptoTransfer();

  const {
    mutate: handleVerifyUser,
    isPending: isVerifyUserPending,
    isError: isVerifyUserError,
    isSuccess: isVerifyUserSuccess,
  } = useVerifyUser();

  const { mutate: initiateWithdrawal, isPending: isWithdrawalPending } =
    useCryptoWithdrawal();

  // console.log("details =====>", JSON.stringify(chainName, null, 2));

  const handleCheckPin = () => {
    if (pinScreenRef.current) {
      pinScreenRef.current?.checkUserPin();
    }
  };

  const handleActionsAfterPinVerified = () => {
    // Navigate to OTP screen after PIN verification
    navigation.navigate(NAVIGATION_SCREENS.OTP_SCREEN, {
      onOTPVerified: isOnChain
        ? handleActionsAfterOTPVerifiedWithdrawal
        : handleActionsAfterOTPVerified,
      transactionType: isOnChain ? "crypto_withdrawal" : "crypto_send",
    });
  };

  const handleActionsAfterOTPVerified = () => {
    // Execute the crypto send transaction after OTP verification
    onSendClick();
  };

  const handleActionsAfterOTPVerifiedWithdrawal = () => {
    onWithdrawClick();
  };

  // Handle Send API and validation
  const onSendClick = async () => {
    if (Number(amount) > 100000) {
      dispatch(setErrorMsg("Amount cannot exceed ₹1,00,000"));
      return;
    }

    let payload = {
      account_type: "",
      amount: amount,
      asset: chainName,
      network: details?.network || "",
      receiver: recipient,
    };
    console.log("payload =>", payload);

    // Navigate to TransactionResult with loading state
    navigation.navigate(NAVIGATION_SCREENS.TRANSACTION_RESULT, {
      isLoading: true,
      transactionData: null,
      isSuccess: false,
      isError: false,
    });

    setspin(true);
    handleSendCripto(payload as any, {
      onSuccess: (data) => {
        console.log("rep =>", JSON.stringify(data, null, 2));
        if (data?.status) {
          // Navigate to TransactionResult with success data
          navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT, {
            isLoading: false,
            transactionData: data,
            isSuccess: true,
            isError: false,
          });
          dispatch(setSuccessMsg(data?.data?.message));
        } else {
          // Navigate to TransactionResult with error state
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
        console.log("errors.   eee  =>", error.response);
        // Navigate to TransactionResult with error state
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

  // Handle on-chain Withdrawal (external wallet)
  const onWithdrawClick = async () => {
    if (!recipient || recipient.trim().length < 10) {
      dispatch(setErrorMsg("Please enter a valid wallet address"));
      return;
    }
    if (!amount || Number(amount) <= 0) {
      dispatch(setErrorMsg("Please enter a valid amount"));
      return;
    }

    const usdAmount = Number(amount) * Number(buy_price || 0);

    const payload = {
      asset: symbol,
      amount: Number(amount),
      usd_amount: Number(usdAmount.toFixed(2)),
      withdrawal_address: recipient.trim(),
    } as any;

    // Navigate to TransactionResult with loading state
    navigation.navigate(NAVIGATION_SCREENS.TRANSACTION_RESULT, {
      isLoading: true,
      transactionData: null,
      isSuccess: false,
      isError: false,
    });

    setspin(true);
    initiateWithdrawal(payload, {
      onSuccess: (data: any) => {
        // console.log("onSuccess ->",JSON.stringify(data,null,2))

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
        console.log("error ->",JSON.stringify(error,null,2))
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

  // Handle Send API and validation
  const onVerifyUser = async () => {
    console.log("onVerifyUser step 1");
    const formData = new FormData();
    formData.append("identifier", recipient.trim());
    console.log("onVerifyUser step 2");
    setIspendingverifyUser(true);
    handleVerifyUser(formData as any, {
      onSuccess: (data) => {
        setIspendingverifyUser(false);
        console.log("onVerifyUser step 3");
        console.log("rep =>", JSON.stringify(data, null, 2));
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
        console.log("on settle");
      },
    });
  };

  const total =
    parseInt(amount) * buy_price +
    parseInt(walletData?.TransactionFees_persentage);
  return (
    <ScreenContainer avoidKeyboard scrollable padding={0}>
      <HeaderTitle leftIcon={!showFinalPage ? "true" : ""} title="Send" />

      {/* Toggle: Off Chain / On Chain */}
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
      {/* Common modal for summary */}
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
            <Text>{amount.length > 0 ? amount : "0.00"}</Text>
          </View>
          <View style={styles.row}>
            <CustomText variant={"caption"} style={styles.label}>
              Fees
            </CustomText>
            <Text>{`${walletData?.TransactionFees_persentage}%`}</Text>
          </View>
          <View style={styles.row}>
            <CustomText variant={"caption"} style={styles.label}>
              Price
            </CustomText>
            <CustomText>${buy_price}</CustomText>
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
              ${total || "0.00"}
            </CustomText>
          </View>
          <View style={{ marginVertical: 20, gap: 10 }}>
            <GenericButton
              title={"Pay Now"}
              onPress={() => {
                handleCheckPin();

                // setShowConfirmationModal(false);
                // isSellingMode ? onSellClick() : onBuyClick();
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
                showDollarIcon={false}
                amount={amount}
                setAmount={setAmount}
                suffixText={` ${symbol.slice(0, 3)}`}
              />
              <View style={[styles.totalInUSDContainer]}>
                <View style={[styles.totalInUSDText]}>
                <CustomText
                size={12}
                // style={{ width: "auto" }}
                color="white"
                variant="subtitle2"
              >{`${
                amount
                  ? (parseFloat(amount) * parseFloat(buy_price)).toFixed(2)
                  : "0.00"
              }  USD`}</CustomText>
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
              disabled={!amount}
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
      // backgroundColor: theme.colors.palette.green700,
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
      //   fontSize: 20,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 6,
    },
    subtitle: {
      //   fontSize: 14,
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
      //   backgroundColor: "#f1f1f1",
      borderRadius: 10,
      //   borderWidth: 1,
      //   borderColor: theme.colors.palette.grey200,
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

import { View, Text, StyleSheet, Pressable } from "react-native";
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
import { useCryptoBuy } from "query/hooks";
import { setErrorMsg, setSuccessMsg } from "redux/slices/authenticationSlice";
import useDispatchAction from "hooks/useDispatchAction";
import { useDispatch } from "react-redux";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import PinScreen from "tsx-components/modals/PinScreen";

const CryptoSell = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const pinScreenRef = useRef<any>(null);
  
  const { details } = route.params as any;
  const { walletData } = useSelectorAction() as any;
  const { symbol, sell_price } = details;
  const { theme } = useTheme();
  const { spacing, colors } = theme;
  const styles = { ...useGlobalStyles(), ...custonStyles(theme) };

  const [amount, setAmount] = useState("");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const {
    mutate: handleBuyCripto,
    isPending,
    isError,
    isSuccess,
  } = useCryptoBuy();
  const availableBalance = 49.1;

  // console.log("details =====>", JSON.stringify(details, null, 2));

  const handleCheckPin = () => {
    if (pinScreenRef.current) {
      pinScreenRef.current?.checkUserPin();
    }
  };

  const onSellClick = async () => {
    let payload = {
      amount: amount,
      asset: symbol.slice(0, 3),
      fiat: "USD",
    };

    // Navigate to TransactionResult with loading state
    navigation.navigate(NAVIGATION_SCREENS.TRANSACTION_RESULT, {
      isLoading: true,
      transactionData: null,
      isSuccess: false,
      isError: false,
    });

    handleBuyCripto(payload as any, {
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
          dispatch(
            setSuccessMsg(`Successfully sold ${amount} ${symbol.slice(0, 3)}`)
          );
        } else {
          // Navigate to TransactionResult with error state
          navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT, {
            isLoading: false,
            transactionData: data,
            isSuccess: false,
            isError: true,
          });
        }
      },
      onError: (error: any) => {
        console.log("error ====>", JSON.stringify(error.response, null, 2));
        // Navigate to TransactionResult with error state
        navigation.replace(NAVIGATION_SCREENS.TRANSACTION_RESULT, {
          isLoading: false,
          transactionData: null,
          isSuccess: false,
          isError: true,
        });
        
        try {
          const errors = JSON.parse(error.response.data.data.details);
          const errorsfunds = JSON.parse(error.response.data.data.details)?.title;
          dispatch(
            setErrorMsg(
              errors.errors.Funds[0] || errorsfunds || `Something went wrong!`
            )
          );
        } catch (parseError) {
          dispatch(setErrorMsg(`Something went wrong!`));
        }
      },
      onSettled: () => {},
    });
  };

  const total =
    parseInt(amount) * sell_price +
    parseInt(walletData?.TransactionFees_persentage);
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
            <CustomText>${sell_price}</CustomText>
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
            <SvgIcons.Bitcoin width={30} height={30} />
            <CustomText
              size={14}
              variant={"subtitle2"}
            >{`${symbol} (${symbol.slice(0, 3)})`}</CustomText>
          </View>
          <AmountInputDisplay
            showDollarIcon={false}
            amount={amount}
            setAmount={setAmount}
            suffixText={` ${symbol.slice(0, 3)}`}
          />
          <View style={[styles.maxBalanceContainer]}>
            <SvgIcons.CheckSquareIcon />
            <CustomText
              variant="subtitle2"
              size={10}
            >{`Max Balance: ${availableBalance}`}</CustomText>
          </View>
          <View style={[styles.totalInUSDContainer]}>
            <View style={[styles.totalInUSDText]}>
              <CustomText
                size={12}
                // style={{ width: "auto" }}
                color="white"
                variant="subtitle2"
              >{`~ ${
                amount ? parseInt(amount) * parseInt(sell_price) : "0.00"
              } ${symbol.slice(4)}`}</CustomText>
            </View>
          </View>
        </View>
        <GenericButton
          title="Proceed"
          onPress={() => {
            setShowConfirmationModal(true);
          }}
        />
      </View>

      <PinScreen
        ref={pinScreenRef}
        onAction={() => {
          onSellClick();
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
    maxBalanceContainer: {
      width: "100%",
      flexDirection: "row",
      //   backgroundColor: "red",
      justifyContent: "center",
      alignItems: "center",
      gap: 10,
      marginVertical: 10,
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
  });

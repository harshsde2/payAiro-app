import { useNavigation } from "@react-navigation/native";
import GenericButton from "components/GenericButton";
import { SVGMinus, SVGPlus } from "constants/images";
import useDispatchAction from "hooks/useDispatchAction";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { RWAKeys, useBuyRWA, useSellRWA } from "query/hooks";
import { queryClient } from "query/queryClient";
import React, { FC, useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SvgXml } from "react-native-svg";
import { setErrorMsg, setSuccessMsg } from "redux/slices/authenticationSlice";
import { Theme, useTheme } from "styles";
import { CustomText } from "tsx-components";

interface BuyNowModalProps {
  isVisible?: boolean;
  onClose: () => void;
  data?: any;
  isSellingMode?: boolean;
}

const BuyNowModal: FC<BuyNowModalProps> = ({
  isVisible,
  onClose,
  data,
  isSellingMode,
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const styles = customStyles(theme);
  const [quantity, setQuantity] = useState<number>(0);

  const buttonName = isSellingMode ? "Sell" : "Buy";

  console.log(JSON.stringify(data, null, 2));
  const {
    mutate: handleBuyRWA,
    isPending: isPendingBuyRWA,
    isSuccess: isSuccessBuyRWA,
  } = useBuyRWA();
  const {
    mutate: handleSellRWA,
    isPending: isPendingSellRWA,
    isSuccess: isSuccessSellRWA,
  } = useSellRWA();

  const onSuccessBuyAndSell = async () => {
    await queryClient.invalidateQueries(RWAKeys.rwaHoldings());
    await queryClient.refetchQueries(RWAKeys.rwaHoldings());
  };

  const onSuccess = async (data: any) => {
    if (isSellingMode) {
      useDispatchAction(setSuccessMsg(`Successfully Sell ${quantity} Share`));
    } else {
      useDispatchAction(setSuccessMsg(`Successfully buy ${quantity} Share`));
    }
    onClose();
    navigation.navigate(NAVIGATION_SCREENS.TRANSACTION_SUCCESS_SCREEN, {
      transactionDetails: data.data,
    });
    await onSuccessBuyAndSell();
  };

  const onBuyClick = async () => {
    let payload = {
      amount: quantity,
      asset_type_id: data?.fortress_id,
    };

    handleBuyRWA(payload as any, {
      onSuccess: (data) => {
        console.log("rep =>", JSON.stringify(data, null, 2));
        if (data?.status) {
          onSuccess(data);
        }
      },
      onError: (error: any) => {
        const errors = JSON.parse(error.response.data.data.details);
        console.log("errors=>", errors);
        // console.log("error =>", JSON.stringify(error.response, null, 2));
        onClose();
        useDispatchAction(
          setErrorMsg(errors.errors.Funds[0] || `Something went wrong!`)
        );
      },
      onSettled: () => {},
    });
  };

  const pricePerShare = data.price_per_token;
  const fee = 0.0;
  const total = quantity * pricePerShare + fee;

  const handleChange = (type: "increment" | "decrement") => {
    setQuantity((prev) =>
      type === "increment"
        ? prev < data?.amount
          ? prev + 1
          : Math.round(data?.amount)
        : prev > 0
        ? prev - 1
        : 0
    );
  };

  const handleSellChange = (type: "increment" | "decrement") => {
    setQuantity((prev) =>
      type === "increment"
        ? prev < data?.quantity
          ? prev + 1
          : Math.round(data?.quantity)
        : prev > 0
        ? prev - 1
        : 0
    );
  };

  const onSellClick = async () => {
    let payload = {
      amount: quantity,
      asset_type_id: data?.fortress_id,
    };

    handleSellRWA(payload as any, {
      onSuccess: (data) => {
        console.log("rep =>", JSON.stringify(data, null, 2));
        if (data?.status) {
          onSuccess(data);
        }
      },
      onError: (error: any) => {
        onClose();
        const errors = JSON.parse(error.response.data.data.details);
        console.log("errors=>", errors);
        useDispatchAction(setErrorMsg(`Something went wrong!`));
      },
      onSettled: () => {},
    });
  };
  return (
    <Modal
      animationType="slide"
      transparent
      visible={isVisible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalContainer} onPress={onClose}>
        <Pressable
          style={styles.modalContent}
          onPress={(e) => e.stopPropagation()}
        >
          {!isSellingMode ? (
            <View>
              <CustomText style={styles.title} variant="h3">
                Buy a Asset
              </CustomText>
              <CustomText style={styles.subtitle} variant="caption">
                Select the number of shares you want to buy
              </CustomText>

              <View
                style={{
                  width: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View style={styles.counterContainer}>
                  <TouchableOpacity
                    onPress={() => handleChange("decrement")}
                    style={styles.counterButton}
                  >
                    <SvgXml xml={SVGMinus} width={35} height={35} />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={quantity.toString()}
                    onChangeText={(text) => {
                      const numericValue = Math.max(
                        0,
                        parseInt(text.replace(/[^0-9]/g, ""), 10) || 0
                      );

                      if (!isSellingMode && data?.amount !== undefined) {
                        const maxQty = Math.round(data.amount);
                        setQuantity(
                          numericValue > maxQty ? maxQty : numericValue
                        );
                      } else {
                        setQuantity(numericValue);
                      }
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => handleChange("increment")}
                    style={styles.counterButton}
                  >
                    <SvgXml xml={SVGPlus} width={35} height={35} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <View>
              <CustomText style={styles.title} variant="h3">
                Sell a Asset
              </CustomText>
              <CustomText style={styles.subtitle} variant="caption">
                Select the number of shares you want to sell
              </CustomText>

              <View
                style={{
                  width: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View style={styles.counterContainer}>
                  <TouchableOpacity
                    onPress={() => handleSellChange("decrement")}
                    style={styles.counterButton}
                  >
                    <SvgXml xml={SVGMinus} width={35} height={35} />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={quantity.toString()}
                    onChangeText={(text) => {
                      const numericValue = Math.max(
                        0,
                        parseInt(text.replace(/[^0-9]/g, ""), 10) || 0
                      );

                      if (isSellingMode && data?.quantity !== undefined) {
                        const maxQty = Math.round(data.quantity);
                        setQuantity(
                          numericValue > maxQty ? maxQty : numericValue
                        );
                      } else {
                        setQuantity(numericValue);
                      }
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => handleSellChange("increment")}
                    style={styles.counterButton}
                  >
                    <SvgXml xml={SVGPlus} width={35} height={35} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          <View style={styles.row}>
            <CustomText variant={"caption"} style={styles.label}>
              Price per Share
            </CustomText>
            <CustomText>${pricePerShare}</CustomText>
          </View>
          <View style={styles.row}>
            <CustomText variant={"caption"} style={styles.label}>
              Fees
            </CustomText>
            <Text>${fee}</Text>
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
              ${total.toFixed(2)}
            </CustomText>
          </View>
          <View style={{ marginVertical: 20 }}>
            <GenericButton
              title={buttonName}
              onPress={() => {
                isSellingMode ? onSellClick() : onBuyClick();
              }}
              showLoader={true}
              isLoading={isSellingMode ? isPendingSellRWA : isPendingBuyRWA}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default BuyNowModal;

const customStyles = (theme: Theme) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.4)",
    },
    modalContent: {
      backgroundColor: "#fff",
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
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
  });

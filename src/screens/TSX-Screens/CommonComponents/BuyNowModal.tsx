import { useNavigation } from "@react-navigation/native";
import GenericButton from "components/GenericButton";
import { SVGMinus, SVGPlus } from "constants/images";
import useSelectorAction from "hooks/useSelectorAction";
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
import { useDispatch } from "react-redux";
import { setErrorMsg } from "redux/slices/authenticationSlice";
import { showError, showSuccess } from "../../../utils/toast";
import { Theme, useTheme } from "styles";
import { useGlobalStyles } from "styles/GlobalStyles";
import { CustomText } from "tsx-components";
import CommonModal from "tsx-components/modals/CommonModal";
import MyDropdown from "tsx-components/MyDropdown";

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
  const dispatch = useDispatch();
  const { tokens, bankLists } = useSelectorAction();

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

  // console.log("Dropdown =>", JSON.stringify(DROPDOWN_LISTS, null, 2));

  const styles = customStyles(theme);
  const globalStyles = useGlobalStyles();

  const [quantity, setQuantity] = useState<number>(0);
  const [souceAccount, setsouceAccount] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

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
      showSuccess(`Successfully Sell ${quantity} Share`);
    } else {
      showSuccess(`Successfully buy ${quantity} Share`);
    }
    onClose();
    navigation.navigate(NAVIGATION_SCREENS.TRANSACTION_SUCCESS_SCREEN, {
      transactionDetails: data.data,
    });
    await onSuccessBuyAndSell();
  };

  const onBuyClick = async () => {
    if (quantity == 0) {
      showError(`Quantity should be greater than 0`);
      return;
    }
    if (souceAccount == null) {
      showError(`Please select the bank account`);
      return;
    }
    let payload = {
      amount: quantity,
      asset_type_id: data?.fortress_id,
      fund_source: souceAccount == "personal" ? "bank" : souceAccount,
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
        const errorsfunds = JSON.parse(error.response.data.data.details)?.title;
        // console.log("errors.  =>", errorsfunds);
        console.log("error ====>", JSON.stringify(error.response, null, 2));
        dispatch(
          setErrorMsg(
            errors.errors.Funds[0] || errorsfunds || `Something went wrong!`
          )
        );
        onClose();
      },
      onSettled: () => {},
    });
  };

  console.log("souceAccount =>", souceAccount);

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
        console.log("errors=>", JSON.stringify(error, null, 2));
        onClose();
        const errors = JSON.parse(error.response.data.data.details);
        showError(`Something went wrong!`);
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
      <CommonModal
        isVisible={showConfirmationModal}
        onClose={() => {
          setShowConfirmationModal(false);
        }}
        containerStyle={{ justifyContent: "flex-end", alignItems: "center" }}
      >
        <Pressable
          style={[
            globalStyles.whiteSheetContainer,
            { width: "100%", maxHeight: 400 },
          ]}
        >
          <CustomText style={styles.title} variant="h3">
            Summary
          </CustomText>
          <View style={styles.row}>
            <CustomText variant={"caption"} style={styles.label}>
              Asset Type
            </CustomText>
            <CustomText>{data?.asset_type}</CustomText>
          </View>
          <View style={styles.row}>
            <CustomText variant={"caption"} style={styles.label}>
              Asset name
            </CustomText>
            <Text>{data?.name}</Text>
          </View>
          <View style={styles.row}>
            <CustomText variant={"caption"} style={styles.label}>
              Quantity
            </CustomText>
            <Text>{quantity}</Text>
          </View>
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
          <View style={{ marginVertical: 20, gap: 10 }}>
            <GenericButton
              title={"Confirm"}
              onPress={() => {
                setShowConfirmationModal(false);
                isSellingMode ? onSellClick() : onBuyClick();
              }}
              showLoader={true}
              isLoading={isSellingMode ? isPendingSellRWA : isPendingBuyRWA}
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
          {!isSellingMode && (
            <MyDropdown
              required
              containerStyles={{ marginBottom: 10 }}
              label={"Select Bank Account"}
              placeholder={"Select Bank Account"}
              data={DROPDOWN_LISTS.filter(
                (item) => !item.value.toLowerCase().includes("checking")
              )} // Filter out external accounts if needed
              // Filter out external accounts if needed
              value={souceAccount}
              search={false}
              itemTextStyle={{
                fontSize: 14,
                fontFamily: theme?.typography.fontFamily.montserrat,
              }}
              onChange={(item: any) => setsouceAccount(item)}
            />
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
                setShowConfirmationModal(true);
                // isSellingMode ? onSellClick() : onBuyClick();
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

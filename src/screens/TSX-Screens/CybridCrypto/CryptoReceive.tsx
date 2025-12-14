import { useNavigation, useRoute } from "@react-navigation/native";
import { ScreenContainer } from "HOC";
import GenericButton from "components/GenericButton";
import HeaderTitle from "components/HeaderTitle";
import { SvgIcons } from "constants/svgs";
import useSelectorAction from "hooks/useSelectorAction";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Clipboard,
  Platform,
  Pressable,
  StyleSheet,
  ToastAndroid,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import Share from "react-native-share";
import ViewShot from "react-native-view-shot";
import { useDispatch } from "react-redux";
import { Theme, useTheme } from "styles";
import { useGlobalStyles } from "styles/GlobalStyles";
import { CustomText } from "tsx-components";
import CommonModal from "tsx-components/modals/CommonModal";
import AmountInputDisplay from "../AddBalance/AmountInputDisplay";
import TextInputField from "components/TextInputField";
import { useDepositAddress } from "query/hooks/useCrypto";

export default function Receive() {
  const route = useRoute();
  const dispatch = useDispatch();
  const { details } = route.params as any;
  const { walletData, bankLists } = useSelectorAction() as any;
  const { symbol, buy_price } = details;
  const { theme } = useTheme();
  const { spacing, colors } = theme;
  const styles = { ...useGlobalStyles(), ...customStyles(theme) };

  const [amount, setAmount] = useState("");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [recipient, setRecipient] = useState("");

  const navigation = useNavigation<any>();

  const viewShotRef = useRef<any>(null);
  const [showShareDetailsModal, setShowShareDetailsModal] = useState(false);
  const [showQRCodeDetailsModal, setShowQRCodeDetailsModal] = useState(false);
  const [isOnChain, setIsOnChain] = useState(false); // false = Off Chain, true = On Chain
  const [depositAddress, setDepositAddress] = useState("");

  // Deposit address mutation hook
  const depositAddressMutation = useDepositAddress();
  const [checkedBoxArray, setcheckedBoxArray] = useState([
    {
      id: 0,
      name: "Qr Code",
      isChecked: false,
    },
    {
      id: 1,
      name: "PayAiro Tag",
      isChecked: false,
    },
    {
      id: 2,
      name: "Bank Details",
      isChecked: false,
    },
  ]);

  // Fetch deposit address when switching to On Chain
  useEffect(() => {
    if (isOnChain && !depositAddress) {
      handleGetDepositAddress();
    }
  }, [isOnChain]);

  const handleGetDepositAddress = async () => {
    try {
      const response = await depositAddressMutation.mutateAsync({
        asset: symbol,
      });
      
      // Check if the response indicates address is under review
      if (response?.data?.status === false && !response?.data?.address) {
        const message = response?.data?.message || "Your deposit address is under review. Please try again later.";
        Alert.alert("Address Under Review", message);
        setIsOnChain(false); // Revert to off-chain
        return;
      }
      
      // Check if address is available
      if (response?.data?.address) {
        setDepositAddress(response.data.address);
      } else {
        Alert.alert("Error", "Unable to retrieve deposit address. Please try again.");
        setIsOnChain(false); // Revert to off-chain
      }
    } catch (error) {
      console.log("Error fetching deposit address:", error);
      Alert.alert("Error", "Failed to get deposit address. Please try again.");
      setIsOnChain(false); // Revert to off-chain on error
    }
  };

  const handleToggleChainType = () => {
    setIsOnChain(!isOnChain);
  };

  const handleShare = async () => {
    try {
      const uri = await viewShotRef.current.capture();

      // Step 1: Get only checked items
      const selectedItems = checkedBoxArray.filter((item) => item.isChecked);

      // Step 2: Build dynamic message
      let message = "Use the following credentials:\n\n";

      selectedItems.forEach(({ name }) => {
        switch (name) {
          case "Qr Code":
            message += "Scan the QR to send Money\n";
            break;
          case "PayAiro Tag":
            message += `PayAiro Tag: ${walletData?.username}\n`;
            break;
          case "Bank Details":
            message += `Bank Name: ${bankLists[0]?.bank_name}\n`;
            message += `Routing Number: ${bankLists[0]?.ref_code}\n`;
            message += `Account Number: ${bankLists[0]?.account_number}\n`;
            break;
        }
      });

      if (selectedItems.length === 0) {
        Alert.alert("Please select at least one detail to share.");
        return;
      }

      // Step 3: Share
      const shareOptions = {
        title: "PayAiro QR",
        message: message.trim(),
        url: uri,
        type: "image/png",
      };

      const res = await Share.open(shareOptions);
      console.log("Share result:", res);
    } catch (err) {
      console.log("Error sharing:", err);
    }
  };

  // console.log("wallet data =>",walletData)

  const copyToClipboard = (text: string, label: string = "Text") => {
    Clipboard.setString(text);

    // Display a success message
    if (Platform.OS === "android") {
      ToastAndroid.show(`${label} copied`, ToastAndroid.SHORT);
    } else if (Platform.OS === "ios") {
      Alert.alert(`${label} copied`);
    }
  };

  // Get the QR code value based on chain type
  const getQRCodeValue = () => {
    if (isOnChain) {
      return depositAddress || "loading";
    }
    return `sending: ${walletData?.username}`;
  };

  // Get the display label based on chain type
  const getDisplayLabel = () => {
    if (isOnChain) {
      return "PayAiro Wallet Address:";
    }
    return "PayAiro Tag:";
  };

  // Get the display value based on chain type
  const getDisplayValue = () => {
    if (isOnChain) {
      return depositAddress;
    }
    return walletData?.username;
  };
  return (
    <ScreenContainer scrollable padding={0}>
      <HeaderTitle
        leftIcon={"true"}
        title={"Receive"}
        rightIcon={<SvgIcons.QRCodeIcon width={25} height={25} />}
        onPressRight={() => {
          setShowQRCodeDetailsModal(true);
        }}
      />
      {showShareDetailsModal && (
        <CommonModal
          isVisible={showShareDetailsModal}
          onClose={() => {
            setShowShareDetailsModal(false);
          }}
          containerStyle={{ justifyContent: "flex-end", alignItems: "center" }}
        >
          <Pressable
            style={[styles.whiteSheetContainer, { flex: 2 / 5, width: "100%" }]}
            onPress={(e) => e.stopPropagation()}
          >
            <CustomText style={styles.title} variant="h3">
              Share Details
            </CustomText>
            <CustomText style={styles.title} variant="caption">
              Select the option you want to share with others.
            </CustomText>
            {checkedBoxArray.map((item, index) => {
              const { isChecked, id, name } = item;
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    // const temp = {
                    //   ...item,
                    //   isChecked: id == index ? !isChecked : isChecked,
                    // };
                    // const arr = [...checkedBoxArray];
                    // arr.splice(index, 1, temp);

                    const updated = checkedBoxArray.map((item) =>
                      item.id === index
                        ? { ...item, isChecked: !isChecked }
                        : item
                    );
                    setcheckedBoxArray(updated);
                  }}
                  style={[styles.row]}
                >
                  {!isChecked ? (
                    <SvgIcons.UnCheckbox
                      style={{
                        borderWidth: 1,
                        borderColor: "black",
                        borderRadius: 5,
                      }}
                    />
                  ) : (
                    <SvgIcons.Checkedbox
                      style={{
                        borderWidth: 1,
                        borderColor: "black",
                        borderRadius: 5,
                      }}
                    />
                  )}
                  <CustomText
                    fontWeight="semiBold"
                    size={17}
                    variant={"caption"}
                    style={styles.label}
                  >
                    {name}
                  </CustomText>
                </TouchableOpacity>
              );
            })}

            <View style={{ marginVertical: 20, gap: 10 }}>
              <GenericButton
                title={"Share"}
                onPress={() => {
                  handleShare();
                }}
              />
            </View>
          </Pressable>
        </CommonModal>
      )}
      <CommonModal
        isVisible={showQRCodeDetailsModal}
        onClose={() => setShowQRCodeDetailsModal(false)}
      >
        <Pressable
          style={[styles.whiteSheetContainer, { flex: 0, height: 450 }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[{ height: 450 }]}>
            <View
              style={{
                alignSelf: "center",
                marginTop: 30,
                padding: 20,
                borderRadius: 20,
              }}
            >
              <ViewShot
                ref={viewShotRef}
                options={{ format: "png", quality: 0.9 }}
              >
                {depositAddressMutation.isPending || (isOnChain && !depositAddress) ? (
                  <View style={{ width: 200, height: 200, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={theme.colors.palette.green700} />
                  </View>
                ) : (
                  <QRCode value={getQRCodeValue()} size={200} />
                )}
              </ViewShot>
            </View>
            <View
              style={{
                width: "100%",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 10,
                marginVertical: 10,
                paddingHorizontal: 30,
                paddingVertical: 10,
              }}
            >
              <CustomText size={14} fontWeight="semiBold">
                {getDisplayLabel()}
              </CustomText>
              <CustomText
                fontWeight="semiBold"
                size={14}
                color={theme.colors.palette.green700}
                numberOfLines={1}
                style={{ maxWidth: 150 }}
              >
                {getDisplayValue()}
              </CustomText>
              <SvgIcons.CopyOutlineBlack
                onPress={() => copyToClipboard(getDisplayValue(), isOnChain ? "Wallet Address" : "PayAiro Tag")}
              />
            </View>
          </View>
        </Pressable>
      </CommonModal>
      <View style={[{ flex: 1 }]}>
        {/* Toggle Buttons */}
        {/* <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              !isOnChain && styles.toggleButtonActive,
            ]}
            onPress={() => {
              if (isOnChain) {
                setIsOnChain(false);
              }
            }}
          >
            <CustomText
              fontWeight="semiBold"
              size={16}
              color={!isOnChain ? theme.colors.palette.white : theme.colors.palette.grey900}
            >
              Off Chain QR
            </CustomText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              isOnChain && styles.toggleButtonActive,
            ]}
            onPress={handleToggleChainType}
          >
            <CustomText
              fontWeight="semiBold"
              size={16}
              color={isOnChain ? theme.colors.palette.white : theme.colors.palette.grey900}
            >
              On Chain QR
            </CustomText>
          </TouchableOpacity>
        </View> */}

        <View
          style={[{ flex: 1, alignItems: "center", justifyContent: "center" }]}
        >
          <View
            style={[
              {
                height: 400,
                alignItems: "center",
                justifyContent: "center",
              },
            ]}
          >
            <View
              style={{
                alignSelf: "center",
                marginTop: 30,
                padding: 20,
                borderRadius: 20,
              }}
            >
              <ViewShot
                ref={viewShotRef}
                options={{ format: "png", quality: 0.9 }}
              >
                {depositAddressMutation.isPending || (isOnChain && !depositAddress) ? (
                  <View style={{ width: 200, height: 200, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={theme.colors.palette.green700} />
                  </View>
                ) : (
                  <QRCode value={getQRCodeValue()} size={200} />
                )}
              </ViewShot>
            </View>
            <View
              style={{
                width: "100%",
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                marginVertical: 10,
                paddingVertical: 10,
                paddingHorizontal: 20,
              }}
            >
              <CustomText size={14} fontWeight="semiBold">
                {getDisplayLabel()}
              </CustomText>
              <CustomText
                fontWeight="semiBold"
                size={14}
                color={theme.colors.palette.green700}
                numberOfLines={1}
                style={{ flex: 1 }}
              >
                {getDisplayValue()}
              </CustomText>
              <SvgIcons.CopyOutlineBlack
                onPress={() => copyToClipboard(getDisplayValue(), isOnChain ? "Wallet Address" : "PayAiro Tag")}
              />
            </View>
          </View>
        </View>
      </View>
      <GenericButton
        title={"Share Details"}
        cStyle={{
          backgroundColor: "black",
          borderWidth: 1,
          borderColor: "white",
          margin: 20,
          marginTop: 80,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          width: "90%",
        }}
        tStyle={{ color: "white" }}
        onPress={() => {
          setShowShareDetailsModal(true);
        }}
      />

      {/* <GenericButton
        title={"Request Payment"}
        cStyle={{
          marginHorizontal: 20,
          width: "90%",
        }}
        onPress={() =>
          navigation.navigate(NAVIGATION_SCREENS.SEND, {
            requested: true,
            type: "requested",
          })
        }
      /> */}
    </ScreenContainer>
  );
}

const customStyles = (theme: Theme) =>
  StyleSheet.create({
    title: {
      //   fontSize: 20,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 15,
    },

    row: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "flex-start",
      marginVertical: 6,
      gap: 15,
    },
    label: {
      color: "#444",
      // fontSize: 15,
      marginVertical: 3,
    },
    labelBold: {
      fontWeight: "bold",
      color: "#000",
    },
    total: {
      fontWeight: "bold",
      color: "green",
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
    toggleContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 10,
      marginHorizontal: 20,
      marginTop: 20,
      marginBottom: 10,
      backgroundColor: theme.colors.palette.green200,
      borderRadius: theme.spacing.spacing[3],
      padding: 4,
    },
    toggleButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: theme.spacing.spacing[2],
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
    },
    toggleButtonActive: {
      backgroundColor: theme.colors.palette.green700,
    },
  });

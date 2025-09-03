import { useNavigation, useRoute } from "@react-navigation/native";
import { ScreenContainer } from "HOC";
import GenericButton from "components/GenericButton";
import HeaderTitle from "components/HeaderTitle";
import { SvgIcons } from "constants/svgs";
import useSelectorAction from "hooks/useSelectorAction";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import React, { useRef, useState } from "react";
import {
  Alert,
  Clipboard,
  Platform,
  Pressable,
  StyleSheet,
  ToastAndroid,
  TouchableOpacity,
  View,
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

  const copyToClipboard = (e: string) => {
    Clipboard.setString(e);

    // Display a success message
    if (Platform.OS === "android") {
      ToastAndroid.show("PayAiro Tag copied", ToastAndroid.SHORT);
    } else if (Platform.OS === "ios") {
      Alert.alert("PayAiro Tag copied");
    }
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
          style={[styles.whiteSheetContainer, { flex: 0, height: 400 }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[{ height: 400 }]}>
            <View
              style={{
                alignSelf: "center",
                marginTop: 30,
                // backgroundColor: "#000",
                padding: 20,
                borderRadius: 20,
              }}
            >
              <ViewShot
                ref={viewShotRef}
                options={{ format: "png", quality: 0.9 }}
              >
                <QRCode value={`sending: ${walletData?.username}`} size={200} />
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
                // backgroundColor: themes.dark.colors.palette.grey200,
                paddingHorizontal: 30,
                paddingVertical: 10,
              }}
            >
              <CustomText size={16} fontWeight="semiBold">
                PayAiro Tag:
              </CustomText>
              <CustomText
                fontWeight="semiBold"
                size={16}
                color={theme.colors.palette.green700}
              >
                {walletData?.username}
              </CustomText>
              <SvgIcons.CopyOutlineBlack
                onPress={() => copyToClipboard(walletData?.username)}
              />
            </View>
          </View>
        </Pressable>
      </CommonModal>
      <View style={[{ flex: 1 }]}>
        <View
          style={[{ flex: 1, alignItems: "center", justifyContent: "center" }]}
        >
          <View
            style={[
              {
                height: 400,
                // backgroundColor: "red",
                alignItems: "center",
                justifyContent: "center",
              },
            ]}
          >
            <View
              style={{
                alignSelf: "center",
                marginTop: 30,
                // backgroundColor: "green",
                padding: 20,
                borderRadius: 20,
              }}
            >
              <ViewShot
                ref={viewShotRef}
                options={{ format: "png", quality: 0.9 }}
              >
                <QRCode value={`sending: ${walletData?.username}`} size={200} />
              </ViewShot>
            </View>
            <View
              style={{
                width: "100%",
                flexDirection: "row",
                // justifyContent: "center",
                alignItems: "center",
                gap: 10,
                marginVertical: 10,
                // backgroundColor: "blue",
                // paddingHorizontal: 30,
                paddingVertical: 10,
              }}
            >
              <CustomText size={16} fontWeight="semiBold">
                PayAiro Tag:
              </CustomText>
              <CustomText
                fontWeight="semiBold"
                size={16}
                color={theme.colors.palette.green700}
              >
                {walletData?.username}
              </CustomText>
              <SvgIcons.CopyOutlineBlack
                onPress={() => copyToClipboard(walletData?.username)}
              />
            </View>
          </View>
          {/* <TextInputField
            label="To"
            placeholder={"PayAiroTag, Phone, Email"}
            rightIcon={""}
            // editable={false}
            value={recipient}
            onChange={setRecipient}
          /> */}
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
  });

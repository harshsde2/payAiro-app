import {
  View,
  Text,
  TextInput,
  ToastAndroid,
  Alert,
  Clipboard,
  Pressable,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, { useRef, useState } from "react";
import Container from "../../HOC/Container";
import HeaderTitle from "../../components/HeaderTitle";
import { SvgXml } from "react-native-svg";
import GenericButton from "../../components/GenericButton";
import { useNavigation } from "@react-navigation/native";
import { SCREENS } from "../../constants/SCREENS";
import useSelectorAction from "../../hooks/useSelectorAction";
import QRCode from "react-native-qrcode-svg";
import Fonts from "../../constants/Fonts";
import Share from "react-native-share";
import ViewShot from "react-native-view-shot";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { ScreenContainer } from "HOC";
import { CustomText } from "tsx-components";
import { Theme, useTheme } from "styles";
import { SvgIcons } from "constants/svgs";
import CommonModal from "tsx-components/modals/CommonModal";
import { useGlobalStyles } from "styles/GlobalStyles";

export default function Receive() {
  const navigation = useNavigation<any>();
  const { walletData, bankLists } = useSelectorAction() as any;
  const { theme } = useTheme();
  const styles = { ...useGlobalStyles(), ...customStyles(theme) };
  const viewShotRef = useRef<any>(null);
  const shareCardRef = useRef<any>(null);
  const [showShareDetailsModal, setShowShareDetailsModal] = useState(false);
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
      // Step 1: Get only checked items
      const selectedItems = checkedBoxArray.filter((item) => item.isChecked);

      if (selectedItems.length === 0) {
        Alert.alert("Please select at least one detail to share.");
        return;
      }

      // Step 2: Build dynamic message for text-only sharing (fallback)
      let message = "PayAiro Payment Details\n\n";

      selectedItems.forEach(({ name }) => {
        switch (name) {
          case "Qr Code":
            message += "📱 Scan the QR code to send money\n\n";
            break;
          case "PayAiro Tag":
            message += `🏷️ PayAiro Tag: ${walletData?.username}\n\n`;
            break;
          case "Bank Details":
            const bankData = bankLists?.[bankLists.length - 1];
            if (bankData) {
              message += `🏦 Bank Details:\n`;
              message += `   Bank Name: ${bankData.bank_name || "N/A"}\n`;
              message += `   Routing Number: ${bankData.ref_code || "N/A"}\n`;
              message += `   Account Number: ${bankData.account_number || "N/A"}\n\n`;
            }
            break;
        }
      });

      // Check if QR code is selected
      const isQrSelected = selectedItems.some((item) => item.name === "Qr Code");

      if (isQrSelected && shareCardRef.current) {
        // Capture the composite share card that includes QR + all selected details
        const uri = await shareCardRef.current.capture({
          format: "png",
          quality: 0.9,
          result: "tmpfile",
        });

        // Share the composite image (contains all details)
        // On iOS, sharing image with message often ignores message, so we only share the image
        // which already contains all the text details
        const shareOptions: any = {
          title: "PayAiro Payment Details",
          subject: "PayAiro Payment Details",
          url: uri,
          type: "image/png",
          filename: `PayAiro_Payment_${walletData?.username || "details"}`,
          failOnCancel: false,
        };

        // For iOS, don't include message as it's ignored when url is present
        // The image already contains all the details
        // For Android, we can optionally include message, but image is primary
        if (Platform.OS === "android") {
          shareOptions.message = message.trim();
        }

        await Share.open(shareOptions);
      } else {
        // Share text only without QR image
        const shareOptions = {
          title: "PayAiro Payment Details",
          subject: "PayAiro Payment Details",
          message: message.trim(),
          failOnCancel: false,
        };

        await Share.open(shareOptions);
      }

      console.log("Share completed");
    } catch (err: any) {
      // User cancelled sharing - don't show error
      if (err?.message !== "User did not share") {
        console.log("Error sharing:", err);
      }
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

  console.log("banks list ->",JSON.stringify(bankLists,null,2))
  return (
    <ScreenContainer scrollable padding={0}>
      <HeaderTitle leftIcon={"true"} title={"QR Code"} />
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
          options={{ 
            format: "png", 
            quality: 0.9,
            result: "tmpfile",
          }}
          style={{
            backgroundColor: "#FFFFFF",
            padding: 20,
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <QRCode 
            value={JSON.stringify({
              type: "receive",
              username: walletData?.username,
              tag: walletData?.username,
            })} 
            size={200} 
          />
          {/* <Text style={{ 
            marginTop: 15, 
            fontSize: 14, 
            fontFamily: Fonts.semibold,
            color: "#333",
          }}>
            PayAiro Tag: {walletData?.username}
          </Text> */}
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
      <View
        style={{
          // backgroundColor: "red",
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View style={{ width: "80%", gap: 15 }}>
          <CustomText variant="subtitle1">Bank Details</CustomText>
          <View
            style={{
              // backgroundColor: "green",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <CustomText size={15} variant="caption">
              Account Holder's Name
            </CustomText>
            <CustomText size={15} fontWeight="semiBold" variant="caption">
              {bankLists[bankLists.length-1]?.account_name}
            </CustomText>
          </View>
          <View
            style={{
              // backgroundColor: "green",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <CustomText size={15} variant="caption">
              Routing Number
            </CustomText>
            <CustomText size={15} fontWeight="semiBold" variant="caption">
              {bankLists[bankLists.length-1]?.ref_code}
            </CustomText>
          </View>
          <View
            style={{
              // backgroundColor: "green",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <CustomText size={15} variant="caption">
              Account Number
            </CustomText>
            <CustomText size={15} fontWeight="semiBold" variant="caption">
              {bankLists[bankLists.length-1]?.account_number}
            </CustomText>
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
          marginTop: 60,
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

      <GenericButton
        title={"Request Payment"}
        cStyle={{
          marginHorizontal: 20,
          marginBottom: 100,
          width: "90%",
        }}
        onPress={() =>
          navigation.navigate(NAVIGATION_SCREENS.SEND, {
            requested: true,
            type: "requested",
          })
        }
      />

      {/* Hidden ViewShot for sharing composite image with all selected details */}
      <View
        style={{
          position: "absolute",
          bottom: -1000,
          left: 0,
          right: 0,
          opacity: 0,
          width: 350,
          alignSelf: "center",
        }}
        pointerEvents="none"
      >
        <ViewShot
          ref={shareCardRef}
          options={{
            format: "png",
            quality: 0.9,
            result: "tmpfile",
          }}
          style={{
            backgroundColor: theme.colors.palette.green700 || "#1a5f3f",
            padding: 20,
            borderRadius: 15,
            width: 350,
            alignItems: "center",
          }}
        >
          <View style={{ width: "100%", alignItems: "center" }}>
            {checkedBoxArray.some((item) => item.name === "Qr Code" && item.isChecked) && (
              <>
                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    padding: 15,
                    borderRadius: 10,
                    marginBottom: 15,
                    alignItems: "center",
                  }}
                >
                  <QRCode
                    value={JSON.stringify({
                      type: "receive",
                      username: walletData?.username,
                      tag: walletData?.username,
                    })}
                    size={200}
                  />
                </View>
                <CustomText
                  color="#FFFFFF"
                  size={18}
                  fontWeight="bold"
                  style={{ marginBottom: 15, textAlign: "center" }}
                >
                  PayAiro Payment Details
                </CustomText>
                <CustomText
                  color="#FFFFFF"
                  size={14}
                  style={{ marginBottom: 15, textAlign: "center" }}
                >
                  📱 Scan the QR code to send money
                </CustomText>
              </>
            )}
            {checkedBoxArray.some((item) => item.name === "PayAiro Tag" && item.isChecked) && (
              <CustomText
                color="#FFFFFF"
                size={14}
                style={{ marginBottom: 10, textAlign: "center" }}
              >
                🏷️ PayAiro Tag: {walletData?.username}
              </CustomText>
            )}
            {checkedBoxArray.some((item) => item.name === "Bank Details" && item.isChecked) &&
              bankLists?.[bankLists.length - 1] && (
                <View style={{ width: "100%", marginTop: 10 }}>
                  <CustomText
                    color="#FFFFFF"
                    size={14}
                    fontWeight="bold"
                    style={{ marginBottom: 10, textAlign: "center" }}
                  >
                    🏦 Bank Details:
                  </CustomText>
                  <CustomText
                    color="#FFFFFF"
                    size={13}
                    style={{ marginBottom: 5, textAlign: "center" }}
                  >
                    Bank Name: {bankLists[bankLists.length - 1]?.bank_name || "N/A"}
                  </CustomText>
                  <CustomText
                    color="#FFFFFF"
                    size={13}
                    style={{ marginBottom: 5, textAlign: "center" }}
                  >
                    Routing Number: {bankLists[bankLists.length - 1]?.ref_code || "N/A"}
                  </CustomText>
                  <CustomText
                    color="#FFFFFF"
                    size={13}
                    style={{ marginBottom: 10, textAlign: "center" }}
                  >
                    Account Number: {bankLists[bankLists.length - 1]?.account_number || "N/A"}
                  </CustomText>
                </View>
              )}
          </View>
        </ViewShot>
      </View>
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
  });

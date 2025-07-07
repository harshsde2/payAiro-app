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
        <ViewShot ref={viewShotRef} options={{ format: "png", quality: 0.9 }}>
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
              Bank Name
            </CustomText>
            <CustomText size={15} fontWeight="semiBold" variant="caption">
              {bankLists[0].bank_name}
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
              Routing number
            </CustomText>
            <CustomText size={15} fontWeight="semiBold" variant="caption">
              {bankLists[0].ref_code}
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
              Account number
            </CustomText>
            <CustomText size={15} fontWeight="semiBold" variant="caption">
              {bankLists[0].account_number}
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

      <GenericButton
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
      />
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

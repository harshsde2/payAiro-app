import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Clipboard,
  ToastAndroid,
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  SafeAreaView,
} from "react-native";
import React, { useRef } from "react";
import { ScreenContainer } from "../../HOC";
import HeaderTitle from "../../components/HeaderTitle";
import { SVGCopy, SVGLeftArrow } from "../../constants/images";
import Fonts from "../../constants/Fonts";
import { SvgXml } from "react-native-svg";
import useSelectorAction from "../../hooks/useSelectorAction";
import ViewShot from "react-native-view-shot";
import QRCode from "react-native-qrcode-svg";
import Share from "react-native-share";
import { useNavigation } from "@react-navigation/native";

export default function ReceiveToken() {
  const { walletData } = useSelectorAction();
  const { selectedCrypto, networkLists, tokens } = useSelectorAction();
  const navigation = useNavigation();

  const viewShotRef = useRef(null);
  const handleShare = async () => {
    try {
      const uri = await viewShotRef.current.capture();
      const shareOptions = {
        title: "Wallet Address",
        message: `
        Use following credentials
        Wallet Address:  ${walletData?.wallet_public_key} 
        PayAiro Tag : ${walletData?.username} 
        Email: ${walletData?.account_email}  
        or scan QR to send crypto`,
        url: uri,
        type: "image/png",
      };
      const res = await Share.open(shareOptions);
      console.log("Share result:", res);
    } catch (err) {
      console.log("Error sharing:", err);
    }
  };

  const copyToClipboard = (e) => {
    Clipboard.setString(e);

    // Display a success message
    if (Platform.OS === "android") {
      ToastAndroid.show("Wallet Address Copied", ToastAndroid.SHORT);
    } else if (Platform.OS === "ios") {
      Alert.alert("Text copied to clipboard!");
    }
  };

  return (
    <ScreenContainer>
      <StatusBar
        backgroundColor="transparent"
        barStyle="dark-content"
        translucent={true}
      />

      <View
        style={{
          paddingHorizontal: 15,
          flex: 1,
        }}
      >
        <HeaderTitle
          title={"Receive Token"}
          leftIcon={SVGLeftArrow}
          onPressLeft={() => navigation.goBack()}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 20,
          }}
        >
          <View
            style={{
              alignItems: "center",
              marginTop: 30,
            }}
          >
            <Text
              style={{
                textAlign: "center",
                color: "#000",
                fontSize: 14,
                fontFamily: Fonts.regular,
                marginBottom: 10,
              }}
            >
              Available Token{" "}
            </Text>

            <Text
              style={{
                textAlign: "center",
                color: "#000",
                fontSize: 42,
                fontFamily: Fonts.bold,
              }}
            >
              {Number(selectedCrypto?.balance).toFixed(5)}
            </Text>

            <TouchableOpacity
              style={{
                backgroundColor: "rgba(44, 106, 63, 1)",
                paddingHorizontal: 10,
                paddingVertical: 8,
                width: "35%",
                borderRadius: 40,
                marginVertical: 15,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: "#fff",
                  fontFamily: Fonts.semibold,
                }}
              >
                $ {Number(selectedCrypto?.balance_in_tether).toFixed(5)}
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: "#fff",
              borderTopEndRadius: 32,
              borderTopStartRadius: 32,
              padding: 20,
              marginTop: 20,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.1,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <TouchableOpacity
              onPress={handleShare}
              style={{
                alignSelf: "center",
                marginTop: 20,
                backgroundColor: "#fff",
                padding: 15,
                borderRadius: 20,
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.22,
                shadowRadius: 2.22,
                elevation: 3,
              }}
            >
              <ViewShot
                ref={viewShotRef}
                options={{ format: "png", quality: 0.9 }}
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <QRCode value={walletData?.wallet_public_key} size={200} />
              </ViewShot>
            </TouchableOpacity>

            <View
              style={{
                width: "100%",
                alignSelf: "center",
                borderRadius: 40,
                borderWidth: 1,
                borderColor: "rgba(106, 106, 106, 0.12)",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 12,
                marginTop: 40,
                backgroundColor: "rgba(106, 106, 106, 0.12)",
              }}
            >
              <TextInput
                value={walletData?.wallet_public_key}
                editable={false}
                style={{
                  color: "#000",
                  fontFamily: Fonts.semibold,
                  width: "85%",
                  fontSize: 10,
                }}
              />

              <TouchableOpacity
                onPress={() => copyToClipboard(walletData?.wallet_public_key)}
                style={{
                  padding: 5,
                }}
              >
                <SvgXml xml={SVGCopy} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleShare}
              style={{
                backgroundColor: "rgba(44, 106, 63, 1)",
                paddingVertical: 12,
                borderRadius: 40,
                marginTop: 30,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: "#fff",
                  fontFamily: Fonts.semibold,
                  fontSize: 16,
                }}
              >
                Share Address
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

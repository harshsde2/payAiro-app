import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Platform,
  InteractionManager,
  Button,
} from "react-native";
import { SvgXml } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";

// Components
import BottomNavigation from "../../components/BottomNavigation";
import Container from "../../HOC/Container";
import LogoutModal from "../../components/LogoutModal";

// Constants & Hooks
import Fonts from "../../constants/Fonts";
import { SETTINGS_LISTS } from "../../constants/constant";
import { SVGRefer, SVGRightIcon } from "../../constants/images";
import useDispatchAction from "../../hooks/useDispatchAction";
import useSelectorAction from "../../hooks/useSelectorAction";

// Services & Actions
import { getKYC } from "../../services/Services";
import {
  resetState,
  setLogin,
  setTokens,
  setUserData,
  setWalletData,
} from "../../redux/slices/authenticationSlice";
import {
  setKYCAcceopted,
  setKycStep,
  setPin,
  setUser,
  setWalletDataAuth,
} from "../../services/Auth";
import { ScreenContainer } from "HOC";
import { useDispatch } from "react-redux";
import { resetAppState } from "utils/configs";
import KYCBadge from "tsx-components/KYCBadge";
import TermAndConditionModal from "tsx-components/modals/TermAndConditionModal";

export default function SettingScreen() {
  const navigation = useNavigation();
  const [isVisible, setIsVisible] = useState(false);
  const { tokens, walletData } = useSelectorAction();
  const [kycStep, setKycStep] = useState("");
  // console.log("kyc step =>", JSON.stringify(kycStep, null, 2));

  const termsAndConditionRef = useRef(null);

  const dispatch = useDispatch();

  const setuserPin = async () => {
    await setPin("1234");
  };

  console.log(kycStep?.selfimage, "image");

  useEffect(() => {
    fetchKycStep();
  }, []);

  const fetchKycStep = async () => {
    try {
      const kycData = await getKYC(tokens?.access);
      if (kycData?.data?.step_count) {
        setKycStep(kycData?.data);
      }
    } catch (error) {
      console.log("Error fetching KYC data:", error);
    }
  };

  const handleLogout = async () => {
    resetAppState();
    setWalletDataAuth(null);
    setPin(null);
    setKYCAcceopted(null);

    setTimeout(() => {
      useDispatchAction(setLogin(false)); // optional, already in reset
    }, 100);
  };

  return (
    <ScreenContainer padding={0}>
      <BottomNavigation />
      <LogoutModal
        isVisible={isVisible}
        onCancel={() => setIsVisible(false)}
        // onClose={handleLogout}
        onClose={() => {
          setIsVisible(false);
          setTimeout(() => {
            handleLogout();
          }, 300);
        }}
      />
      <TermAndConditionModal isAgree={false} ref={termsAndConditionRef} />
      {/* <Button title="clickme" onPress={setuserPin} /> */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              marginHorizontal: 15,
              marginBottom: 20,
              marginTop: 10,
            }}
          >
            <View
              style={[
                styles.circle,
                { backgroundColor: "rgba(255, 172, 37, 1)" },
              ]}
            >
              {kycStep?.selfimage ? (
                <Image
                  source={{
                    uri: kycStep?.selfimage.includes("https://app.payairo.com")
                      ? kycStep?.selfimage
                      : "https://app.payairo.com" + kycStep?.selfimage,
                  }}
                  style={styles.image}
                />
              ) : (
                <Text style={{ ...styles.initials, color: "#000" }}>
                  {walletData?.name?.charAt(0)?.toUpperCase()}
                </Text>
              )}
            </View>
            <View
              style={{ flexDirection: "row", flex: 1, alignItems: "center" }}
            >
              <Text
                style={{
                  color: "#000",
                  marginLeft: 10,
                  fontFamily: Fonts.semibold,
                  fontSize: 18,
                }}
              >
                {walletData?.name}
              </Text>
              <KYCBadge
                status={
                  kycStep?.is_varified == true
                    ? "Verified"
                    : kycStep?.is_varified == false
                    ? "Pending"
                    : "Rejected"
                }
              />
            </View>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: "#fff",
              borderTopEndRadius: 32,
              borderTopStartRadius: 32,
              paddingVertical: 20,
              paddingHorizontal: 10,
              marginTop: 0,
            }}
          >
            <Text
              style={{
                color: "#000",
                marginLeft: 10,
                fontFamily: Fonts.bold,
                fontSize: 26,
                marginBottom: 20,
              }}
            >
              My Account
            </Text>
            {SETTINGS_LISTS.map((item, index) => (
              <TouchableOpacity
                key={`setting-${index}`}
                disabled={item.isDisvled}
                onPress={() => {
                  if (item.name === "Logout") {
                    setIsVisible(true);
                    return;
                  } else if (item.name === "Terms & Condition") {
                    termsAndConditionRef.current.showTermsAndConditions();
                    return;
                  }
                  navigation.navigate(item.route);
                }}
                style={{
                  borderRadius: 40,
                  borderWidth: 1,
                  backgroundColor: "rgba(217, 217, 217, 0.07)",
                  borderColor: "rgba(106, 106, 106, 0.08)",
                  padding: -20,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginVertical: 5,
                  marginBottom: item.name === "Logout" ? 100 : 5,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    margin: 5,
                  }}
                >
                  {typeof item.icon == "string" ? (
                    <SvgXml xml={item.icon} />
                  ) : (
                    item.icon
                  )}
                  <Text
                    style={{
                      color: "rgba(29, 29, 29, 1)",
                      marginLeft: 10,
                      fontSize: 16,
                      fontFamily: Fonts.regular,
                    }}
                  >
                    {item.name}
                  </Text>
                </View>
                {item.name === "KYC" && (
                  <Text
                    style={{
                      textAlign: "right",
                      fontFamily: Fonts.bold,
                      marginLeft: 40,
                      color: kycStep === "4" ? "green" : "orange",
                    }}
                  >
                    {kycStep === "4" ? "Verified" : "Pending"}
                  </Text>
                )}
                <SvgXml xml={SVGRightIcon} style={{ marginRight: 20 }} />
              </TouchableOpacity>
            ))}

            <SvgXml
              xml={SVGRefer}
              style={{ marginBottom: 130, alignSelf: "center" }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 60,
    height: 60,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  initials: {
    color: "#000",
    fontSize: 18,
    fontFamily: Fonts.semibold,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});

import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SvgXml } from "react-native-svg";

// Components
import BottomNavigation from "../../components/BottomNavigation";
import LogoutModal from "../../components/LogoutModal";

// Constants & Hooks
import Fonts from "../../constants/Fonts";
import { SETTINGS_LISTS } from "../../constants/constant";
import { SVGRightIcon } from "../../constants/images";
import useDispatchAction from "../../hooks/useDispatchAction";
import useSelectorAction from "../../hooks/useSelectorAction";

// Services & Actions
import { ScreenContainer } from "HOC";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { useDispatch, useSelector } from "react-redux";
import { clearAll } from "storage/mmkv";
import KYCBadge from "tsx-components/KYCBadge";
import TermAndConditionModal from "tsx-components/modals/TermAndConditionModal";
import { resetAppState } from "utils/configs";
import {
  setLogin
} from "../../redux/slices/authenticationSlice";
import {
  setKYCAcceopted,
  setPin,
  setWalletDataAuth
} from "../../services/Auth";
import { useKyc } from "../../query/hooks";
import { toKycMode } from "types/kyc";

export default function SettingScreen() {
  const navigation = useNavigation();
  const [isVisible, setIsVisible] = useState(false);
  const { tokens, walletData } = useSelectorAction();
  const [kycStep, setKycStep] = useState("");

  const kycStatus = useSelector((s) => s.authenticationSlice?.kycStatus);
  const mode = useMemo(() => toKycMode(kycStatus), [kycStatus]);
  console.log("mode =>", mode);
  // console.log("kyc step =>", JSON.stringify(kycStep, null, 2));

  // Map KYC mode to badge status
  const getKycBadgeStatus = (kycMode) => {
    switch (kycMode) {
      case "approved":
        return "Verified";
      case "pending":
      case "not_started":
      case "unknown":
        return "Pending";
      case "expired":
        return "Rejected";
      default:
        return "Pending";
    }
  };

  const termsAndConditionRef = useRef(null);
  const { data: kycData } = useKyc();

  useEffect(() => {
    if (kycData?.data?.step_count) {
      setKycStep(kycData?.data);
    }
  }, [kycData]);

  const handleLogout = async () => {
    resetAppState();
    setWalletDataAuth(null);
    setPin(null);
    setKYCAcceopted(null);
    clearAll();

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
            <TouchableOpacity onPress={() => navigation.navigate(NAVIGATION_SCREENS.PERSONAL)}
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
            </TouchableOpacity>
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
              <KYCBadge status={getKycBadgeStatus(mode)} />
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
            {SETTINGS_LISTS.map((item, index) => {
              if (
                item.name === "Cybrid User Agreement" &&
                walletData?.fortress === true
              ) {
                return null;
              }
              return (
                <TouchableOpacity
                  key={`setting-${index}`}
                  disabled={item.isDisvled}
                  onPress={() => {
                    if (item.name === "Logout") {
                      setIsVisible(true);
                      return;
                    } else if (item.name === "Terms & Condition") {
                      navigation.navigate(NAVIGATION_SCREENS.PDF_VIEWER, {
                        url: require("../../assets/pdf/Terms_and_Conditions.pdf"),
                        isFileFromLocal: true,
                        fileName: "Terms_and_Conditions.pdf",
                      });
                      return;
                    } else if (item.name === "Cybrid User Agreement") {
                      navigation.navigate(NAVIGATION_SCREENS.PDF_VIEWER, {
                        url: require("../../assets/pdf/Cybrid_User_Agreement.pdf"),
                        isFileFromLocal: true,
                        fileName: "Cybrid_User_Agreement.pdf",
                      });
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
                    {item.icon}
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
              );
            })}

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

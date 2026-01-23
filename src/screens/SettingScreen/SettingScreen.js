import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SvgXml } from "react-native-svg";

// Components
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
import HeaderTitle from "components/HeaderTitle";
import { ProfileHeader } from "components/common-components/ProfileHeader";
import { usePatchUserDetails } from "../../query/hooks/useAPIAuth";
import { setKycStatus } from "../../redux/slices/authenticationSlice";
import { showError, showSuccess } from "../../utils/toast";

export default function SettingScreen() {
  const navigation = useNavigation();
  const [isVisible, setIsVisible] = useState(false);
  const { tokens, walletData } = useSelectorAction();
  const [kycStep, setKycStep] = useState("");

  const kycStatus = useSelector((s) => s.authenticationSlice?.kycStatus);
  const mode = useMemo(() => toKycMode(kycStatus), [kycStatus]);
  const { mutate: patchUser, isPending } = usePatchUserDetails();
  // console.log("mode =>", mode);
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

  const handleStartKyc = () => {
    try {
      patchUser({ start_kyc: true }, {
        onSuccess: (data) => {
          console.log(JSON.stringify(data, null, 2), "datas");
          if (data?.status === true && data?.persona_verification_url) {
            navigation.navigate(NAVIGATION_SCREENS.CYBRID_WEB_VIEW, {
              URL: data?.persona_verification_url,
            });
            showSuccess("KYC started successfully");
            useDispatchAction(setKycStatus({ status: false, state: "pending", toast_message: "KYC started" }));
          } else {
            showSuccess("Your ID fetch successfully please click again to start KYC");
          }
        },
        onError: (error) => {
          console.log(JSON.stringify(error?.response, null, 2), "error");
          showError("Failed to start KYC");
        },
      });
    } catch (e) {
      showError("Failed to start KYC");
    }
  };

  return (
    <ScreenContainer padding={0}>
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
          <HeaderTitle title="Profile" />
          <ProfileHeader
            walletData={walletData}
            kycStep={kycStep}
            kycBadgeStatus={getKycBadgeStatus(mode)}
            kycMode={mode}
            onStartKyc={handleStartKyc}
            isKycPending={isPending}
            onProfilePress={() => navigation.navigate(NAVIGATION_SCREENS.NEW_PERSONAL)}
            onQrPress={() => navigation.navigate(NAVIGATION_SCREENS.NEW_PERSONAL)}
          />
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

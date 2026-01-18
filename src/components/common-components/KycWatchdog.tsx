import React, { useEffect, useMemo, useRef } from "react";
import { Alert } from "react-native";
import { useSelector } from "react-redux";
import { useKycStatusPolling } from "query/hooks/useKycStatusPolling";
import { toKycMode } from "types/kyc";
import useDispatchAction from "hooks/useDispatchAction";
import { resetState, setErrorMsg, setKycStatus, setLogin } from "redux/slices/authenticationSlice";
import { resetAppState } from "utils/configs";
import { setKYCAcceopted, setWalletDataAuth } from "services/Auth";
import { clearAll, setPin } from "storage/mmkv";
import { useNavigation } from "@react-navigation/native";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { DeviceEventEmitter } from "react-native";

const KycWatchdog: React.FC = () => {
  const kycStatus = useSelector((s: any) => s.authenticationSlice?.kycStatus);
  const mode = useMemo(() => toKycMode(kycStatus), [kycStatus]);

  // Start polling when status is unknown/pending/expired, but NOT when not_started
  const shouldPoll = mode !== "approved" && mode !== "not_started";
  useKycStatusPolling(shouldPoll);

  // console.log("KycWatchdog mode ->", mode);

  const handleLogout = async () => {
    try {
      resetAppState();
      await setWalletDataAuth(null);
      setPin('');
      await setKYCAcceopted(null);
      clearAll();
      // Dispatch Redux reset action synchronously
      useDispatchAction(resetState());
    } catch (error) {
      console.error("Logout error:", error);
      // Still dispatch reset even if cleanup fails
      useDispatchAction(resetState());
    }
  };

  const navigation = useNavigation<any>();
  const hasPromptedRef = useRef(false);

  useEffect(() => {
    if (mode === "expired" && !hasPromptedRef.current) {
      hasPromptedRef.current = true;
      Alert.alert(
        "KYC Expired",
        "Your KYC has expired. Would you like to restart the KYC now?",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => {
              hasPromptedRef.current = false; // allow prompt later if state toggles
            },
          },
          {
            text: "Start KYC",
            style: "default",
            onPress: () => {
              useDispatchAction(
                setKycStatus({ status: false, state: "not_started", toast_message: "Please start your KYC." })
              );
              try {
                navigation.navigate(NAVIGATION_SCREENS.SETTING_SCREEN as never);
              } catch (e) {
                // no-op if navigation stack not ready
              }
            },
          },
        ],
        { cancelable: false }
      );
    }
  }, [mode]);

  // Listen for global navigation events fired from non-React modules (e.g., interceptors)
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener("NAVIGATE_TO_PERSONAL", () => {
      try {
        navigation.navigate(NAVIGATION_SCREENS.SETTING_SCREEN as never);
      } catch (e) {
        // no-op
      }
    });
    return () => sub.remove();
  }, []);

  return null;
};

export default KycWatchdog;



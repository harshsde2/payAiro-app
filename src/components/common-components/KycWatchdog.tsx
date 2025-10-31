import React, { useEffect, useMemo } from "react";
import { Alert } from "react-native";
import { useSelector } from "react-redux";
import { useKycStatusPolling } from "query/hooks/useKycStatusPolling";
import { toKycMode } from "types/kyc";
import useDispatchAction from "hooks/useDispatchAction";
import { resetState, setLogin } from "redux/slices/authenticationSlice";
import { resetAppState } from "utils/configs";
import { setKYCAcceopted, setWalletDataAuth } from "services/Auth";
import { clearAll, setPin } from "storage/mmkv";

const KycWatchdog: React.FC = () => {
  const kycStatus = useSelector((s: any) => s.authenticationSlice?.kycStatus);
  const mode = useMemo(() => toKycMode(kycStatus), [kycStatus]);

  // Start polling when status is unknown or pending to fetch the first state
  const shouldPoll = mode !== "approved"; // unknown/pending/expired
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

  useEffect(() => {
    if (mode === "expired") {
      Alert.alert(
        "Session Expired",
        "Your KYC status is expired. Please log in again to complete KYC.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Logout",
            style: "destructive",
            onPress: () => {
              // Call async logout directly, not through useDispatchAction
              handleLogout();
            },
          },
        ],
        { cancelable: false }
      );
    }
  }, [mode]);

  return null;
};

export default KycWatchdog;



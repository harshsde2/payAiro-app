import { useNavigation, useRoute } from "@react-navigation/native";
import { ScreenContainer } from "HOC";
import { useAppLock } from "hooks/useAppLock";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { useGetReward, useUserPin, useWalletDetails } from "query/hooks";
import { useLogin, useStepCount, useVerifyOTP } from "query/hooks/useAPIAuth";
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import DeviceInfo from "react-native-device-info";
import { useDispatch } from "react-redux";
import { getItem, setItem, setPin, STORAGE_KEYS } from "storage/mmkv";
import { Theme, useTheme } from "styles";
import { CustomText } from "tsx-components";
import AuthHeader from "tsx-components/AuthHeader";
import GenericButton from "../../components/GenericButton";
import Fonts from "../../constants/Fonts";
import { SCREENS } from "../../constants/SCREENS";
import useDispatchAction from "../../hooks/useDispatchAction";
import useSelectorAction from "../../hooks/useSelectorAction";
import {
  setLogin,
  setShowGuide,
  setShowLoader,
  setTokens,
  setWalletData
} from "../../redux/slices/authenticationSlice";
import { setToken, setWalletDataAuth } from "../../services/Auth";
import { showError, showSuccess } from "../../utils/toast";
import { appContent } from "utils/appContent";

const OTP_COOLDOWN_SECONDS = 60;

export default function ConfirmOTP() {
  const getDeviceId = async () => {
    const deviceId = await DeviceInfo.getUniqueId();
    return deviceId;
  };

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { refreshPinStatus } = useAppLock();

  const { fcmToken, tokens } = useSelectorAction();
  const route = useRoute();
  const { theme } = useTheme();
  const styles = customStyles(theme);

  const {
    mutate: login,
    isPending: isPendingLogin,
    error: errorLogin,
  } = useLogin();
  const { mutate: verifyOtp, isPending, error } = useVerifyOTP();
  const { mutate: stepCount } = useStepCount();
  const {
    data: getRewardData,
    isError,
    isSuccess: isSuccessGetReward,
    refetch: refetchGetReward,
  } = useGetReward(false);

  const {
    data: data,
    isLoading: isPendingWalletDetails,
    isSuccess: isSuccessWalletDetails,
    isError: isErrorWalletDetails,
    refetch: refetchWalletDetails,
  } = useWalletDetails(false);

  const {
    data: dataUserPin,
    isLoading: isPendingUserPin,
    isSuccess: isSuccessUserPin,
    isError: isErrorUserPin,
    refetch: refetchUserPin,
  } = useUserPin(false);

  const { email } = (route as any).params;
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<any>([]);
  const [countdown, setCountdown] = useState(OTP_COOLDOWN_SECONDS);
  const [resendEnabled, setResendEnabled] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [lastOtpTimestamp, setLastOtpTimestamp] = useState<number | null>(null);
  
  // Use ref to prevent multiple simultaneous verifications
  const isVerifyingRef = useRef(false);

  const initializeOtpTimer = useCallback(() => {
    const storedTimestamp = getItem(STORAGE_KEYS.OTP_RESEND_TIMESTAMP);
    const parsedTimestamp = storedTimestamp ? Number(storedTimestamp) : NaN;
    const timestampToUse = Number.isFinite(parsedTimestamp)
      ? parsedTimestamp
      : Date.now();

    if (!Number.isFinite(parsedTimestamp)) {
      setItem(STORAGE_KEYS.OTP_RESEND_TIMESTAMP, timestampToUse.toString());
    }

    setLastOtpTimestamp(timestampToUse);
  }, []);

  const updateCountdownFromTimestamp = useCallback(() => {
    if (!lastOtpTimestamp) {
      return;
    }

    const elapsedSeconds = Math.floor(
      (Date.now() - lastOtpTimestamp) / 1000
    );
    const remaining = Math.max(0, OTP_COOLDOWN_SECONDS - elapsedSeconds);

    setCountdown(remaining);
    setResendEnabled(remaining === 0);
  }, [lastOtpTimestamp, OTP_COOLDOWN_SECONDS]);

  useEffect(() => {
    initializeOtpTimer();
  }, [initializeOtpTimer]);

  useEffect(() => {
    updateCountdownFromTimestamp();
    const intervalId = setInterval(updateCountdownFromTimestamp, 1000);

    return () => clearInterval(intervalId);
  }, [updateCountdownFromTimestamp]);

  const handleResend = () => {
    if (resendEnabled && !isVerifying) {
      const newTimestamp = Date.now();
      setItem(
        STORAGE_KEYS.OTP_RESEND_TIMESTAMP,
        newTimestamp.toString()
      );
      setLastOtpTimestamp(newTimestamp);
      setCountdown(OTP_COOLDOWN_SECONDS);
      setResendEnabled(false);
      handleResendOTP();
    }
  };

  const handleGetRewardDetails = async () => {
    await refetchGetReward();
    if (isSuccessGetReward) {
      if (getRewardData?.data?.length > 0) {
        if (getRewardData && getRewardData?.data?.length > 0) {
          setItem(STORAGE_KEYS.REDEEM_REWARD, JSON.stringify(false));
        }
      }
    }
  };

  const handleUserGuide = async () => {
    setItem(STORAGE_KEYS.GUIDE, JSON.stringify(false));
    dispatch(setShowGuide(false));
  };

  const handleOtpChange = (text: any, index: any) => {
    // Check if text length is greater than 1 (paste scenario)
    if (text.length > 1) {
      handlePasteText(text, index);
      return;
    }

    // Handle single character input or deletion
    if (/^[0-9]$/.test(text) || text === "") {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      if (text && index < otp.length - 1) {
        inputs.current[index + 1]?.focus();
      }

      if (!text && index > 0) {
        inputs.current[index - 1]?.focus();
      }
    }
  };

  // Handle pasted text
  const handlePasteText = (text: string, startIndex: number) => {
    // Extract only numbers from pasted text
    const numbers = text.replace(/[^0-9]/g, '');
    
    if (numbers.length > 0) {
      const newOtp = [...otp];
      
      // Fill from the start index onwards
      let currentIndex = startIndex;
      for (let i = 0; i < numbers.length && currentIndex < 6; i++) {
        newOtp[currentIndex] = numbers[i];
        currentIndex++;
      }
      
      setOtp(newOtp);
      
      // Focus on next empty field or last field
      const nextIndex = Math.min(currentIndex, 5);
      setTimeout(() => {
        inputs.current[nextIndex]?.focus();
      }, 0);
    }
  };

  const handleKeyPress = (key: any, index: any) => {
    if (key === "Backspace") {
      if (otp[index] === "") {
        if (index > 0) {
          inputs.current[index - 1]?.focus();
        }
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  const handleResendOTP = () => {
    login({ email: email.trim().toLowerCase() } as any, {
      onSuccess: (data) => {
        if (data?.status && data) {
          showSuccess("OTP has been sent to email");
        } else {
          showError("Something went wrong");
        }
      },
      onError: (error: any) => {
        console.log(error);
        const errorMessage = error?.response?.data?.message || error?.message || "Something went wrong";
        showError(errorMessage);
      },
    });
  };

  const getWalletD = async () => {
    try {
      const result = await refetchWalletDetails();
      const pinResp = await refetchUserPin();

      console.log("result =====>", JSON.stringify(result, null, 2));
      // console.log("pinResp =====>", JSON.stringify(pinResp, null, 2));

      const pin = pinResp.data?.data.tpin;

      if (result.isSuccess && result.data?.data) {
        const walletData = result.data.data;

        // await handleGetRewardDetails();
        // handleUserGuide();

        dispatch(setWalletData(walletData));
        setWalletDataAuth(walletData);
        setItem(STORAGE_KEYS.WALLET_DATA, JSON.stringify(walletData));
        setPin(pin);
        refreshPinStatus(); // Update app lock context with new PIN status
        dispatch(setLogin(true));
        showSuccess("Logged in Successfully");
      } else {
        throw new Error("Wallet fetch failed");
      }
    } catch (error: any) {
      console.log("error =====>", JSON.stringify(error.response, null, 2));
      showError("Something went wrong!");
    }
  };

  const handleVerifyOTP = useCallback(() => {
    // Prevent multiple simultaneous verifications
    if (isVerifyingRef.current) {
      return;
    }

    const enteredOtp = otp.join("");
    if (enteredOtp.length < 6) {
      showError("OTP Should Be 6 Digits");
      return;
    }

    // Set both ref and state
    isVerifyingRef.current = true;
    setIsVerifying(true);

    verifyOtp({ email: email.trim().toLowerCase(), otp: enteredOtp } as any, {
      onSuccess: async (data) => {
        if (data?.status) {
          console.log("data =>", JSON.stringify(data, null, 2));

          useDispatchAction(setTokens(data?.data));
          await setToken(data?.data);
          setItem(STORAGE_KEYS.AUTH_TOKENS, JSON.stringify(data?.data));
          showSuccess("OTP Verified Successfully");

          const { step, persona_verification_url } = data?.data;

          if (step === 0) {
            (navigation as any).navigate(SCREENS.Name, {
              email,
              data: data?.data,
            });
          } else if (step === 1) {
            // (navigation as any).navigate(NAVIGATION_SCREENS.CYBRID_WEB_VIEW, {
            //   URL: persona_verification_url,
            //   isUserAlreadyCreated: true,
            // });
            await getWalletD();
          } else if (step === 2) {
            await getWalletD();
          }
        } else {
          showError("Invalid OTP. Please Try Again.");
          // Reset on error
          isVerifyingRef.current = false;
          setIsVerifying(false);
        }
      },
      onError: (error: any) => {
        console.log("error :--", JSON.stringify(error.response, null, 2));
        const errorMessage =
          (error as any)?.response?.data?.message ||
          error?.message ||
          "Something went wrong";
        showError(errorMessage);
        
        // Reset on error
        isVerifyingRef.current = false;
        setIsVerifying(false);
      },
      onSettled: () => {
        useDispatchAction(setShowLoader(false));
      },
    });
  }, [otp, email, verifyOtp, navigation]);

  const isOtpComplete = otp.every((digit) => digit !== "");

  useEffect(() => {
    if (!isOtpComplete || isVerifyingRef.current || isVerifying) {
      return;
    }
    handleVerifyOTP();
  }, [isOtpComplete, isVerifying, handleVerifyOTP]);

  return (
    <ScreenContainer avoidKeyboard padding={0}>
      <View style={{ flex: 1 }}>
        <AuthHeader header={true} showAuthLogo={true} />
      </View>
      <View style={styles.content}>
        <CustomText
          variant={"h1"}
          fontFamily={theme.typography.fontFamily.montserratBold}
          style={styles.signHeaderTextStyles}
        >
         {appContent.OTP.title}
        </CustomText>
        <CustomText
          variant={"caption"}
          style={styles.signHeaderCaptionTextStyles}
        >
          {appContent.OTP.description}
        </CustomText>

        {/* OTP Input Fields */}
        <View style={styles.otpContainer}>
          {otp.map((_, index) => (
            <TextInput
              key={index}
              style={[styles.otpInput, otp[index] && styles.otpInputActive]}
              maxLength={6}
              keyboardType="number-pad"
              // textContentType="oneTimeCode" // Required for iOS (SMS & Mail suggestions)
              textContentType='oneTimeCode'
              autoComplete='sms-otp' // Standardized for cross-platform support in 2026
              importantForAutofill="yes" 
              onChangeText={(text) => handleOtpChange(text, index)}
              onKeyPress={({ nativeEvent }) =>
                handleKeyPress(nativeEvent.key, index)
              }
              ref={(input) => (inputs.current[index] = input)}
              value={otp[index]}
              editable={!isVerifying}
              contextMenuHidden={false}
            />
          ))}
        </View>

        <CustomText variant={"caption"}>Didn't receive the code?</CustomText>
        <TouchableOpacity
          style={{ marginTop: 5, marginBottom: 20 }}
          disabled={!resendEnabled || isVerifying}
          onPress={handleResend}
        >
          <CustomText
            variant={"subtitle2"}
            style={{ textDecorationLine: "underline" }}
          >
            {resendEnabled
              ? "Resend OTP"
              : `Resend OTP in ${countdown} seconds`}
          </CustomText>
        </TouchableOpacity>
        <GenericButton
          title={isVerifying ? "Verifying..." : "Verify"}
          onPress={handleVerifyOTP}
          disabled={!isOtpComplete || isVerifying || !otp.every((digit) => digit !== "")}
        />
      </View>
    </ScreenContainer>
  );
}

const customStyles = (theme: Theme) =>
  StyleSheet.create({
    content: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 20,
      backgroundColor: "#fff",
      borderTopEndRadius: 32,
      borderTopStartRadius: 32,
      paddingVertical: 20,
    },
    title: {
      fontFamily: Fonts.bold,
      textAlign: "center",
      fontSize: 32,
    },
    subtitle: {
      fontSize: 14,
      color: "#6c6c6c",
      marginBottom: 30,
      textAlign: "center",
      fontFamily: Fonts.regular,
    },
    otpContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      marginVertical: 20,
    },
    otpInput: {
      width: 40,
      height: 50,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: "#ccc",
      textAlign: "center",
      fontSize: 18,
      backgroundColor: "#fff",
    },
    signHeaderTextStyles: {
      width: "100%",
      textAlign: "center",
    },
    signHeaderCaptionTextStyles: {
      width: "100%",
      textAlign: "center",
      marginTop: 10,
    },
    otpInputActive: {
      borderColor: "#B1FF84",
      borderWidth: 2,
    },
    resendText: {
      color: "#000",
      fontFamily: Fonts.regular,
      textAlign: "center",
      fontSize: 12,
      marginTop: 30,
    },
    resendButton: {
      color: "#000",
      fontFamily: Fonts.bold,
    },
  });
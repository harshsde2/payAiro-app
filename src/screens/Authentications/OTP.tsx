import { useNavigation, useRoute } from "@react-navigation/native";
import { ScreenContainer } from "HOC";
import { useAppLock } from "hooks/useAppLock";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { useGetReward, useUserPin, useWalletDetails } from "query/hooks";
import { useLogin, useSignUp, useStepCount, useVerifyOTP } from "query/hooks/useAPIAuth";
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import DeviceInfo from "react-native-device-info";
import {
  startOtpListener,
  removeListener,
} from "react-native-otp-verify";
import { InputType } from "./types";
import { OtpInput, OtpInputRef } from "react-native-otp-entry";
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

  const { mutate: signUp, isPending: isPendingSignUp } = useSignUp();

  // Get params - support both email and phone
  const { email, phone, inputType, isEmail } = (route as any).params as {
    email?: string;
    phone?: string;
    inputType?: InputType;
    isEmail?: boolean;
  };
  
  // Determine if using phone or email
  const isPhoneLogin = inputType === "phone" || !!phone;
  const contactValue = isPhoneLogin ? phone : email;
  const [otp, setOtp] = useState("");
  const otpInputRef = useRef<OtpInputRef>(null);
  const [countdown, setCountdown] = useState(OTP_COOLDOWN_SECONDS);
  const [resendEnabled, setResendEnabled] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [lastOtpTimestamp, setLastOtpTimestamp] = useState<number | null>(null);
  
  // Use ref to prevent multiple simultaneous verifications
  const isVerifyingRef = useRef(false);

  // Auto OTP reading for Android using SMS Retriever API
  useEffect(() => {
    if (Platform.OS === "android") {
      // Start listening for OTP SMS
      startOtpListener((message) => {
        // console.log("Received SMS:", message);
        // Extract 6-digit OTP from message using regex
        const otpMatch = /(\d{6})/g.exec(message);
        if (otpMatch && otpMatch[1]) {
          const extractedOtp = otpMatch[1];
          // console.log("Extracted OTP:", extractedOtp);
          setOtp(extractedOtp);
          // Auto-fill the OTP input
          otpInputRef.current?.setValue(extractedOtp);
        }
      });

      // Cleanup listener on unmount
      return () => {
        removeListener();
      };
    }
  }, []);

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

  const handleOtpChange = useCallback((text: string) => {
    setOtp(text);
  }, []);

  const handleResendOTP = () => {
    // Build payload based on input type (email or phone)
    const payload: any = {
      location: "United States", // Default location
    };

    if (isPhoneLogin && phone) {
      payload.phone = phone;
    } else if (email) {
      payload.email = email.trim().toLowerCase();
    }

    const successMessage = isPhoneLogin
      ? "OTP has been sent to your phone"
      : "OTP has been sent to your email";

    signUp(payload, {
      onSuccess: (data) => {
        if (data?.status && data) {
          showSuccess(successMessage);
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

  const handleVerifyOTP = useCallback((otpValue?: string) => {
    // Prevent multiple simultaneous verifications
    if (isVerifyingRef.current) {
      return;
    }

    const enteredOtp = otpValue || otp;
    if (enteredOtp.length < 6) {
      showError("OTP Should Be 6 Digits");
      return;
    }

    // Set both ref and state
    isVerifyingRef.current = true;
    setIsVerifying(true);

    // Build verify payload based on input type
    const verifyPayload: any = { otp: enteredOtp };
    if (isPhoneLogin && phone) {
      verifyPayload.phone = phone;
    } else if (email) {
      verifyPayload.email = email.trim().toLowerCase();
    }

    verifyOtp(verifyPayload, {
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
              email: isPhoneLogin ? undefined : email,
              phone: isPhoneLogin ? phone : undefined,
              inputType,
              data: data?.data,
              isEmail: isEmail,
            });
          } else if (step === 1) {
            // (navigation as any).navigate(NAVIGATION_SCREENS.CYBRID_WEB_VIEW, {
            //   URL: persona_verification_url,
            //   isUserAlreadyCreated: true,
            // });
            
            // Check if this is an old user (already logged in before)
            // If wallet data exists in storage, it's an old user logging in again
            const existingWalletData = getItem(STORAGE_KEYS.WALLET_DATA);
            const isOldUser = !!existingWalletData;
            
            // If old user, mark KYC congratulations as already shown to prevent popup
            if (isOldUser) {
              setItem(STORAGE_KEYS.KYC_CONGRATULATIONS_SHOWN, "true");
            }
            
            await getWalletD();
          } else if (step === 2) {
            await getWalletD();
          }
        } else {
          showError("Invalid OTP. Please Try Again.");
          // Reset on error and clear OTP
          isVerifyingRef.current = false;
          setIsVerifying(false);
          otpInputRef.current?.clear();
          setOtp("");
        }
      },
      onError: (error: any) => {
        console.log("error :--", JSON.stringify(error.response, null, 2));
        const errorMessage =
          (error as any)?.response?.data?.message ||
          error?.message ||
          "Something went wrong";
        showError(errorMessage);
        
        // Reset on error and clear OTP
        isVerifyingRef.current = false;
        setIsVerifying(false);
        otpInputRef.current?.clear();
        setOtp("");
      },
      onSettled: () => {
        useDispatchAction(setShowLoader(false));
      },
    });
  }, [otp, email, phone, isPhoneLogin, inputType, verifyOtp, navigation]);

  const isOtpComplete = otp.length === 6;

  // Handle OTP filled - auto verify
  const handleOtpFilled = useCallback((filledOtp: string) => {
    if (isVerifyingRef.current || isVerifying) {
      return;
    }
    handleVerifyOTP(filledOtp);
  }, [isVerifying, handleVerifyOTP]);

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
          <OtpInput
            ref={otpInputRef}
            numberOfDigits={6}
            focusColor={theme.colors.palette.green800}
            autoFocus={true}
            disabled={isVerifying}
            type="numeric"
            blurOnFilled={true}
            onTextChange={handleOtpChange}
            onFilled={handleOtpFilled}
            textInputProps={{
              accessibilityLabel: "One-Time Password",
              textContentType: "oneTimeCode",
              autoComplete: "sms-otp",
            }}
            theme={{
              containerStyle: styles.otpInputContainer,
              pinCodeContainerStyle: styles.otpInput,
              pinCodeTextStyle: styles.otpInputText,
              focusedPinCodeContainerStyle: styles.otpInputActive,
              filledPinCodeContainerStyle: styles.otpInputFilled,
              disabledPinCodeContainerStyle: styles.otpInputDisabled,
            }}
          />
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
          onPress={() => handleVerifyOTP()}
          disabled={!isOtpComplete || isVerifying}
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
      width: "100%",
      marginVertical: 20,
    },
    otpInputContainer: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 8,
    },
    otpInput: {
      width: 48,
      height: 56,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: "#E0E0E0",
      backgroundColor: "#FAFAFA",
    },
    otpInputText: {
      fontSize: 20,
      fontFamily: Fonts.semibold,
      color: theme.colors.text.primary,
    },
    otpInputActive: {
      borderColor: theme.colors.palette.green800,
      borderWidth: 2,
      backgroundColor: "#fff",
    },
    otpInputFilled: {
      borderColor: "#B1FF84",
      borderWidth: 1.5,
      backgroundColor: "#fff",
    },
    otpInputDisabled: {
      borderColor: "#E0E0E0",
      backgroundColor: "#F5F5F5",
      opacity: 0.7,
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
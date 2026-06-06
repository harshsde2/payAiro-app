import CustomText from "@new-ui/components/common-components/CustomText";
import ScreenWrapper from "@new-ui/components/common-components/ScreenWrapper";
import { Button } from "@new-ui/components/common-components/layout";
import {
  OTPVerificationScreenNavigationProp,
  OTPVerificationScreenRouteProp,
} from "@new-ui/screens/Auth/types";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { otpVerificationStyles } from "@new-ui/styles/screens/auth/otpVerificationStyles";
import { useNavigation, useRoute } from "@react-navigation/native";
import { isProduction } from "config/env.config";
import useDispatchAction from "hooks/useDispatchAction";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { useUserOtpRequest, useUserOtpVerify } from "query/hooks/useAPIAuth";
import { bootstrapMainAppSession } from "auth/bootstrapMainAppSession";
import {
  persistTokens,
  saveAuthResumeParams,
  setOnboardingStep,
} from "auth/authSession";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Platform, TouchableOpacity, View } from "react-native";
import { OtpInput, OtpInputRef } from "react-native-otp-entry";
import {
  removeListener,
  startOtpListener,
} from "react-native-otp-verify";
import { useDispatch } from "react-redux";
import { setShowLoader, setTokens } from "redux/slices/newBackendAuthSlice";
import { ILoginPayload } from "screens/Authentications/types";
import { setToken } from "services/Auth";
import { getItem, setItem, STORAGE_KEYS } from "storage/mmkv";
import { appContent } from "utils/appContent";
import { getSmsHash } from "utils/smsHash";
import { showError, showSuccess } from "utils/toast";

const OTP_COOLDOWN_SECONDS = 60;

type InputType = "email" | "phone" | "invalid";

const OTPVerificationScreen: React.FC = () => {
  const navigation = useNavigation<OTPVerificationScreenNavigationProp>();
  const route = useRoute<OTPVerificationScreenRouteProp>();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const styles = otpVerificationStyles(theme);

  const params = (route.params || {}) as {
    email?: string;
    phone?: string;
    inputType?: InputType;
    isEmail?: boolean;
    type?: "login" | "signup" | "forgot";
    fullName?: string;
  };

  const { email, phone, inputType, isEmail, type = "signup", fullName } = params;
  const isPhoneLogin = inputType === "phone" || !!phone;
  const contactValue = isPhoneLogin ? phone : email;

  const { mutate: verifyOtp } = useUserOtpVerify();
  const { mutate: otpRequest } = useUserOtpRequest();

  const [otp, setOtp] = useState("");
  const otpInputRef = useRef<OtpInputRef>(null);
  const [countdown, setCountdown] = useState(OTP_COOLDOWN_SECONDS);
  const [resendEnabled, setResendEnabled] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [lastOtpTimestamp, setLastOtpTimestamp] = useState<number | null>(null);
  const isVerifyingRef = useRef(false);
  const [smsHash, setSmsHash] = useState("");
  const isProductionEnv = isProduction();

  // Auto OTP reading for Android using SMS Retriever API
  useEffect(() => {
    if (Platform.OS === "android") {
      startOtpListener((message) => {
        const otpMatch = /(\d{6})/g.exec(message);
        if (otpMatch?.[1]) {
          const extractedOtp = otpMatch[1];
          setOtp(extractedOtp);
          otpInputRef.current?.setValue(extractedOtp);
        }
      });
      return () => {
        removeListener();
      };
    }
  }, []);

  // Get SMS hash for Android OTP auto-read (for phone logins)
  useEffect(() => {
    const fetchSmsHash = async () => {
      const hash = await getSmsHash();
      if (hash) {
        setSmsHash(hash);
      }
    };
    fetchSmsHash();
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
    if (!lastOtpTimestamp) return;
    const elapsedSeconds = Math.floor((Date.now() - lastOtpTimestamp) / 1000);
    const remaining = Math.max(0, OTP_COOLDOWN_SECONDS - elapsedSeconds);
    setCountdown(remaining);
    setResendEnabled(remaining === 0);
  }, [lastOtpTimestamp]);

  useEffect(() => {
    initializeOtpTimer();
  }, [initializeOtpTimer]);

  useEffect(() => {
    updateCountdownFromTimestamp();
    const intervalId = setInterval(updateCountdownFromTimestamp, 1000);
    return () => clearInterval(intervalId);
  }, [updateCountdownFromTimestamp]);


  const handleResendOTP = useCallback(() => {
    const successMessage = isPhoneLogin
      ? "OTP has been sent to your phone"
      : "OTP has been sent to your email";

    const location = isProductionEnv ? "United States" : "india";

    const payload: ILoginPayload = { location };

    if (isPhoneLogin && phone) {
      payload.phone = phone;
      if (smsHash) {
        payload.hash = smsHash;
      }
    } else if (email) {
      payload.email = email.trim().toLowerCase();
    }

    otpRequest(payload as any, {
      onSuccess: (data) => {
        if (data?.status && data) {
          showSuccess(successMessage);
        } else {
          showError("Something went wrong");
        }
      },
      onError: (error: any) => {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong";
        showError(errorMessage);
      },
    });
  }, [isPhoneLogin, phone, email, otpRequest, smsHash, isProductionEnv]);

  const handleResend = useCallback(() => {
    if (resendEnabled && !isVerifying) {
      const newTimestamp = Date.now();
      setItem(STORAGE_KEYS.OTP_RESEND_TIMESTAMP, newTimestamp.toString());
      setLastOtpTimestamp(newTimestamp);
      setCountdown(OTP_COOLDOWN_SECONDS);
      setResendEnabled(false);
      handleResendOTP();
    }
  }, [resendEnabled, isVerifying, handleResendOTP]);

  const handleOtpChange = useCallback((text: string) => {
    setOtp(text);
  }, []);

  const handleVerifyOTP = useCallback(
    (otpValue?: string) => {
      if (isVerifyingRef.current) return;

      const enteredOtp = otpValue || otp;
      if (enteredOtp.length < 6) {
        showError("OTP Should Be 6 Digits");
        return;
      }

      isVerifyingRef.current = true;
      setIsVerifying(true);

      const phoneCountryCode = 1;
      const verifyPayload: any = { otp: enteredOtp };
      if (isPhoneLogin && phone) {
        verifyPayload.channel = "phone";
        verifyPayload.phone_country_code = phoneCountryCode;
        verifyPayload.phone_national_number = phone;
      } else if (email) {
        verifyPayload.channel = "email";
        verifyPayload.email = email.trim().toLowerCase();
      }

      verifyOtp(verifyPayload, {
        onSuccess: async (data) => {
          if (data?.status) {
            const tokenPayload = data?.data ?? {};
            useDispatchAction(setTokens(tokenPayload));
            await setToken(tokenPayload);
            persistTokens(tokenPayload);

            const step =
              typeof tokenPayload.step === "number"
                ? tokenPayload.step
                : Number(tokenPayload.step) || 0;
            setOnboardingStep(step);

            const resumeParams = {
              email: isPhoneLogin ? undefined : email,
              phone: isPhoneLogin ? phone : undefined,
              username:
                tokenPayload?.username ??
                (!isPhoneLogin && email
                  ? String(email).trim().toLowerCase()
                  : undefined),
              inputType,
              isEmail,
            };
            saveAuthResumeParams(resumeParams);

            showSuccess("OTP Verified Successfully");

            if (step === 0) {
              (navigation as any).navigate(
                NAVIGATION_SCREENS.NEW_COINME_MOBILE_AUTH,
                {
                  ...resumeParams,
                  data: tokenPayload,
                }
              );
            } else if (step === 1) {
              dispatch(setShowLoader(true));
              const result = await bootstrapMainAppSession(dispatch);
              dispatch(setShowLoader(false));
              if (!result.ok) {
                showError(result.message || "Failed to load profile", "Please try again");
              } else {
                showSuccess("Logged in Successfully");
              }
            } else if (step === 2) {
              dispatch(setShowLoader(true));
              const result = await bootstrapMainAppSession(dispatch);
              dispatch(setShowLoader(false));
              if (!result.ok) {
                showError(result.message || "Failed to load profile", "Please try again");
              } else {
                showSuccess("Logged in Successfully");
              }
            }

            isVerifyingRef.current = false;
            setIsVerifying(false);
          } else {
            showError("Invalid OTP. Please Try Again.");
            isVerifyingRef.current = false;
            setIsVerifying(false);
            otpInputRef.current?.clear();
            setOtp("");
          }
        },
        onError: (error: any) => {
          const errorMessage =
            (error as any)?.response?.data?.message ||
            error?.message ||
            "Something went wrong";
          showError(errorMessage);
          isVerifyingRef.current = false;
          setIsVerifying(false);
          otpInputRef.current?.clear();
          setOtp("");
        },
        onSettled: () => {
          useDispatchAction(setShowLoader(false));
        },
      });
    },
    [
      otp,
      email,
      phone,
      isPhoneLogin,
      inputType,
      isEmail,
      verifyOtp,
      navigation,
      dispatch,
    ]
  );

  const isOtpComplete = otp.length === 6;

  const handleOtpFilled = useCallback(
    (filledOtp: string) => {
      if (isVerifyingRef.current || isVerifying) return;
      handleVerifyOTP(filledOtp);
    },
    [isVerifying, handleVerifyOTP]
  );

  const instructionText = contactValue
    ? `${appContent.OTP.description} ${contactValue}`
    : appContent.OTP.description;

  return (
    <ScreenWrapper
      safeArea
      padding={16}
      safeAreaEdges={["bottom", "left", "right"]}
      scrollable
      contentStyle={styles.content}
    >
      <View style={styles.titleContainer}>
        <CustomText variant="h2" style={styles.title} fontWeight="semiBold">
          {appContent.OTP.title}
        </CustomText>
      </View>
      <View style={styles.instructionTextContainer}>
        <CustomText
          variant="body"
          fontFamily="inter"
          color={theme.colors.textSecondary}
          style={styles.instructionText}
        >
          {instructionText}
        </CustomText>
      </View>

      <View style={styles.otpContainer}>
        <OtpInput
          ref={otpInputRef}
          numberOfDigits={6}
          focusColor={theme.colors.primary}
          autoFocus
          disabled={isVerifying}
          type="numeric"
          blurOnFilled
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

      <View style={styles.resendContainer}>
        <CustomText variant="bodySmall" color={theme.colors.textSecondary}>
          Didn't receive the code?
        </CustomText>
        <TouchableOpacity
          style={styles.resendLink}
          disabled={!resendEnabled || isVerifying}
          onPress={handleResend}
        >
          <CustomText
            variant="bodySmall"
            style={styles.resendText}
            color={
              resendEnabled ? theme.colors.primary : theme.colors.textSecondary
            }
          >
            {resendEnabled
              ? "Resend OTP"
              : `Resend OTP in ${countdown} seconds`}
          </CustomText>
        </TouchableOpacity>
      </View>

      <Button
        onPress={() => handleVerifyOTP()}
        disabled={!isOtpComplete || isVerifying}
        loading={isVerifying}
      // style={styles.submitButton}
      >
        {isVerifying ? "Verifying..." : "Verify"}
      </Button>
    </ScreenWrapper>
  );
};

export default OTPVerificationScreen;

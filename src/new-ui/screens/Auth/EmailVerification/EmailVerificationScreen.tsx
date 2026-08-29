import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { OtpInput, OtpInputRef } from "react-native-otp-entry";
import { useDispatch, useSelector } from "react-redux";
import ScreenWrapper from "@new-ui/components/common-components/ScreenWrapper";
import CustomText from "@new-ui/components/common-components/CustomText";
import Button from "@new-ui/components/common-components/layout/Button";
import { AppIcon } from "@new-ui/assets/svgs";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { otpVerificationStyles } from "@new-ui/styles/screens/auth/otpVerificationStyles";
import {
  useUserMeEmailOtpRequest,
  useUserMeEmailOtpVerify,
  isEmailOtpVerifySuccess,
} from "query/hooks/useEmailVerification";
import { refreshUsersMe } from "auth/bootstrapMainAppSession";
import { showError, showSuccess } from "utils/toast";

const OTP_COOLDOWN_SECONDS = 60;

function maskEmail(value: unknown): string {
  const raw = String(value ?? "").trim();
  const at = raw.indexOf("@");
  if (at < 1) return "your email";
  const name = raw.slice(0, at);
  const domain = raw.slice(at);
  const head = name.slice(0, 1);
  return `${head}${"•".repeat(Math.max(name.length - 1, 1))}${domain}`;
}

type EmailVerificationParams = { onVerified?: () => void };

const EmailVerificationScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = otpVerificationStyles(theme);
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const route = useRoute<RouteProp<Record<string, EmailVerificationParams>, string>>();
  const onVerified = route.params?.onVerified;

  const usersMe = useSelector(
    (s: { authenticationSlice?: { usersMe?: Record<string, unknown> | null } }) =>
      s.authenticationSlice?.usersMe ?? null
  );

  const emailHint = useMemo(() => {
    const user = (usersMe as { user?: Record<string, unknown> })?.user;
    return maskEmail(user?.email);
  }, [usersMe]);

  const [otp, setOtp] = useState("");
  const otpInputRef = useRef<OtpInputRef>(null);
  const [countdown, setCountdown] = useState(OTP_COOLDOWN_SECONDS);
  const [resendEnabled, setResendEnabled] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const hasAutoVerifiedRef = useRef(false);

  const { mutate: requestEmailOtp, isPending: isSendingOTP } = useUserMeEmailOtpRequest();
  const { mutate: verifyEmailOtp, isPending: isVerifyingOTP } = useUserMeEmailOtpVerify();

  const fastApiErrorMessage = useCallback((error: unknown, fallback: string) => {
    const err = error as {
      response?: { data?: { message?: string; toast_message?: string } };
      message?: string;
    };
    return (
      err?.response?.data?.message ||
      err?.response?.data?.toast_message ||
      err?.message ||
      fallback
    );
  }, []);

  const handleSendOTP = useCallback(() => {
    requestEmailOtp(undefined, {
      onSuccess: (data) => {
        if (data?.ok === false) {
          showError("Couldn't send code", data?.message || "Please try again.");
          return;
        }
        showSuccess("Code sent", data?.message || "Verification code sent to your email.");
      },
      onError: (error) => {
        showError("Couldn't send code", fastApiErrorMessage(error, "Failed to send code. Please try again."));
      },
    });
  }, [fastApiErrorMessage, requestEmailOtp]);

  useEffect(() => {
    void handleSendOTP();
    setOtp("");
    setCountdown(OTP_COOLDOWN_SECONDS);
    setResendEnabled(false);
    setIsVerifying(false);
    otpInputRef.current?.clear();
  }, [handleSendOTP]);

  useEffect(() => {
    if (countdown <= 0) {
      setResendEnabled(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResend = useCallback(() => {
    if (!resendEnabled || isVerifying || isSendingOTP) return;
    setCountdown(OTP_COOLDOWN_SECONDS);
    setResendEnabled(false);
    setOtp("");
    hasAutoVerifiedRef.current = false;
    otpInputRef.current?.clear();
    void handleSendOTP();
  }, [handleSendOTP, isSendingOTP, isVerifying, resendEnabled]);

  const handleOtpChange = useCallback((text: string) => {
    setOtp(text);
  }, []);

  const handleVerifyOTP = useCallback(
    (otpValue?: string) => {
      const enteredOtp = otpValue || otp;
      if (enteredOtp.length < 6) {
        showError("Invalid code", "Please enter all 6 digits.");
        return;
      }

      setIsVerifying(true);
      verifyEmailOtp(
        { otp: enteredOtp },
        {
          onSuccess: async (data) => {
            if (!isEmailOtpVerifySuccess(data)) {
              setIsVerifying(false);
              const body = data as { message?: string };
              showError("Verification failed", body?.message || "Invalid code. Please try again.");
              otpInputRef.current?.clear();
              setOtp("");
              hasAutoVerifiedRef.current = false;
              return;
            }
            // Re-fetch /me so email_verified flips app-wide (banner clears, gate opens).
            await refreshUsersMe(dispatch);
            setIsVerifying(false);
            showSuccess("Email verified", "Your email has been verified successfully.");
            onVerified?.();
            navigation.goBack();
          },
          onError: (error) => {
            showError("Verification failed", fastApiErrorMessage(error, "Invalid code. Please try again."));
            setIsVerifying(false);
            otpInputRef.current?.clear();
            setOtp("");
            hasAutoVerifiedRef.current = false;
          },
        }
      );
    },
    [dispatch, fastApiErrorMessage, navigation, onVerified, otp, verifyEmailOtp]
  );

  const handleOtpFilled = useCallback(
    (filledOtp: string) => {
      if (hasAutoVerifiedRef.current || isVerifying || isVerifyingOTP || isSendingOTP) {
        return;
      }
      hasAutoVerifiedRef.current = true;
      handleVerifyOTP(filledOtp);
    },
    [handleVerifyOTP, isSendingOTP, isVerifying, isVerifyingOTP]
  );

  useEffect(() => {
    if (otp.length < 6) {
      hasAutoVerifiedRef.current = false;
    }
  }, [otp.length]);

  const isOtpComplete = otp.length === 6;
  const busy = isVerifying || isVerifyingOTP || isSendingOTP;

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={["top", "bottom", "left", "right"]}
      backgroundColor={theme.colors.background}
      contentStyle={{ flex: 1 }}
      scrollable
      contentContainerStyle={styles.contentContainer}
      scrollViewProps={{ keyboardShouldPersistTaps: "handled" }}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityLabel="Go back">
          <AppIcon.ArrowLeft width={25} height={25} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: "center", marginRight: 25 }}>
          <CustomText variant="h1" fontWeight="bold" size={20}>
            Verify
          </CustomText>
        </View>
      </View>

      <View style={styles.titleContainer}>
        <CustomText variant="h2" style={styles.title} fontWeight="semiBold">
          Verify your email
        </CustomText>
      </View>

      <View style={styles.instructionTextContainer}>
        <CustomText
          variant="body"
          color={theme.colors.textSecondary}
          style={styles.instructionText}
        >
          {`We've sent a 6-digit code to ${emailHint}`}
        </CustomText>
      </View>

      <View style={[styles.otpContainer, { flex: undefined, minHeight: 72 }]}>
        <OtpInput
          ref={otpInputRef}
          numberOfDigits={6}
          focusColor={theme.colors.primary}
          autoFocus
          disabled={busy}
          type="numeric"
          blurOnFilled
          onTextChange={handleOtpChange}
          onFilled={handleOtpFilled}
          textInputProps={{
            accessibilityLabel: "One-Time Password",
            textContentType: "oneTimeCode",
            autoComplete: "one-time-code",
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
          Didn&apos;t receive the code?
        </CustomText>
        <TouchableOpacity
          style={styles.resendLink}
          disabled={!resendEnabled || busy}
          onPress={handleResend}
        >
          <CustomText
            variant="bodySmall"
            style={styles.resendText}
            color={resendEnabled ? theme.colors.primary : theme.colors.textSecondary}
          >
            {resendEnabled ? "Resend code" : `Resend code in ${countdown} seconds`}
          </CustomText>
        </TouchableOpacity>
      </View>

      <Button onPress={() => handleVerifyOTP()} disabled={!isOtpComplete || busy} loading={busy}>
        {isVerifying || isVerifyingOTP ? "Verifying…" : "Verify"}
      </Button>
    </ScreenWrapper>
  );
};

export default EmailVerificationScreen;

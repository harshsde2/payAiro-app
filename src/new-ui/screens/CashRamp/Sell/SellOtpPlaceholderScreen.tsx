import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform, TouchableOpacity, View } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { OtpInput, OtpInputRef } from "react-native-otp-entry";
import { removeListener, startOtpListener } from "react-native-otp-verify";
import { useSelector } from "react-redux";
import ScreenWrapper from "@new-ui/components/common-components/ScreenWrapper";
import CustomText from "@new-ui/components/common-components/CustomText";
import Button from "@new-ui/components/common-components/layout/Button";
import { AppIcon } from "@new-ui/assets/svgs";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { otpVerificationStyles } from "@new-ui/styles/screens/auth/otpVerificationStyles";
import { useUserMePhoneOtpRequest, useUserMePhoneOtpVerify } from "query/hooks/useCashRamp";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { showError, showSuccess } from "utils/toast";
import type { SellCashRampSession } from "./sellFlow.types";
import { SELL_OTP_INSTRUCTION, SELL_OTP_TITLE } from "./sellFlowCopy";

const OTP_COOLDOWN_SECONDS = 60;

function isPhoneOtpVerifySuccess(data: unknown): boolean {
  if (!data || typeof data !== "object") return true;
  const body = data as Record<string, unknown>;
  if (body.ok === false || body.success === false || body.verified === false) return false;
  const nested = body.data;
  if (nested && typeof nested === "object") {
    const inner = nested as Record<string, unknown>;
    if (inner.ok === false || inner.success === false || inner.verified === false) return false;
  }
  return true;
}

function maskPhone(value: unknown): string {
  const raw = String(value ?? "").replace(/\D/g, "");
  if (raw.length < 4) return "your phone";
  return `•••• ${raw.slice(-4)}`;
}

const SellOtpPlaceholderScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = otpVerificationStyles(theme);
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<Record<string, { session: SellCashRampSession }>, string>>();
  const session = route.params?.session;

  const usersMe = useSelector(
    (s: { authenticationSlice?: { usersMe?: Record<string, unknown> | null } }) =>
      s.authenticationSlice?.usersMe ?? null
  );

  const phoneHint = useMemo(() => {
    const user = (usersMe as { user?: Record<string, unknown> })?.user;
    const phone =
      user?.phone_national_number ??
      user?.phone ??
      user?.mobile ??
      null;
    return maskPhone(phone);
  }, [usersMe]);

  const [otp, setOtp] = useState("");
  const otpInputRef = useRef<OtpInputRef>(null);
  const [countdown, setCountdown] = useState(OTP_COOLDOWN_SECONDS);
  const [resendEnabled, setResendEnabled] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const hasAutoVerifiedRef = useRef(false);

  const { mutate: requestPhoneOtp, isPending: isSendingOTP } = useUserMePhoneOtpRequest();
  const { mutate: verifyPhoneOtp, isPending: isVerifyingOTP } = useUserMePhoneOtpVerify();
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
    requestPhoneOtp(undefined, {
      onSuccess: (data) => {
        if (data?.ok === false) {
          showError("Couldn't send OTP", data?.message || "Please try again.");
          return;
        }
        showSuccess("OTP sent", data?.message || "OTP sent to your registered phone.");
      },
      onError: (error) => {
        showError("Couldn't send OTP", fastApiErrorMessage(error, "Failed to send OTP. Please try again."));
      },
    });
  }, [fastApiErrorMessage, requestPhoneOtp]);

  useEffect(() => {
    void handleSendOTP();
    setOtp("");
    setCountdown(OTP_COOLDOWN_SECONDS);
    setResendEnabled(false);
    setIsVerifying(false);
    otpInputRef.current?.clear();
  }, [handleSendOTP]);

  useEffect(() => {
    if (Platform.OS === "android") {
      startOtpListener((message) => {
        const otpMatch = /(\d{6})/g.exec(message);
        if (otpMatch?.[1]) {
          setOtp(otpMatch[1]);
          otpInputRef.current?.setValue(otpMatch[1]);
        }
      });
      return () => removeListener();
    }
  }, []);

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
      if (!session) {
        showError("Missing details", "Sale details are missing. Go back and try again.");
        return;
      }

      const enteredOtp = otpValue || otp;
      if (enteredOtp.length < 6) {
        showError("Invalid code", "Please enter all 6 digits.");
        return;
      }

      setIsVerifying(true);
      verifyPhoneOtp(
        { otp: enteredOtp },
        {
          onSuccess: (data) => {
            setIsVerifying(false);
            if (!isPhoneOtpVerifySuccess(data)) {
              const body = data as { message?: string };
              showError("Verification failed", body?.message || "Invalid OTP. Please try again.");
              otpInputRef.current?.clear();
              setOtp("");
              hasAutoVerifiedRef.current = false;
              return;
            }
            navigation.replace(NAVIGATION_SCREENS.NEW_CASH_SELL_READY_CODE_WAITING, {
              session,
            });
          },
          onError: (error) => {
            showError("Verification failed", fastApiErrorMessage(error, "Invalid OTP. Please try again."));
            setIsVerifying(false);
            otpInputRef.current?.clear();
            setOtp("");
          },
        }
      );
    },
    [navigation, otp, session, verifyPhoneOtp]
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

  if (!session) {
    return (
      <ScreenWrapper
        safeArea
        backgroundColor={theme.colors.background}
        contentStyle={{ flex: 1, padding: theme.spacing.base }}
      >
        <CustomText variant="body" color={theme.colors.text}>
          Missing sale details. Go back and try again.
        </CustomText>
        <Button onPress={() => navigation.goBack()} style={{ marginTop: theme.spacing.lg }}>
          Go back
        </Button>
      </ScreenWrapper>
    );
  }

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
          {SELL_OTP_TITLE}
        </CustomText>
      </View>

      <View style={styles.instructionTextContainer}>
        <CustomText
          variant="body"
          color={theme.colors.textSecondary}
          style={styles.instructionText}
        >
          {SELL_OTP_INSTRUCTION.replace("{phone}", phoneHint)}
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
            {resendEnabled ? "Resend OTP" : `Resend OTP in ${countdown} seconds`}
          </CustomText>
        </TouchableOpacity>
      </View>

      <Button
        onPress={() => handleVerifyOTP()}
        disabled={!isOtpComplete || busy}
        loading={busy}
      >
        {isVerifying || isVerifyingOTP ? "Verifying…" : "Verify"}
      </Button>
    </ScreenWrapper>
  );
};

export default SellOtpPlaceholderScreen;

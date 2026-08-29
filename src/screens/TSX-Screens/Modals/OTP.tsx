import { useNavigation, useRoute } from "@react-navigation/native";
import { ScreenContainer } from "HOC";
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { OtpInput, OtpInputRef } from "react-native-otp-entry";
import {
  startOtpListener,
  removeListener,
} from "react-native-otp-verify";
// import { CustomText } from "tsx-components";
import CustomText from "@new-ui/components/common-components/CustomText";
import GenericButton from "../../../components/GenericButton";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { useSendOTP, useVerifyUserForSendOTP } from "query/hooks/useAPIAuth";
import { showError, showSuccess } from "../../../utils/toast";
import { getSmsHash } from "utils/smsHash";
import HeaderTitle from "components/HeaderTitle";
import { SvgIcons } from "constants/svgs";
import { isProduction } from "config/env.config";
import { AppIcon } from "@new-ui/assets/svgs";
import { useTheme as useNewTheme } from "@new-ui/styles/ThemeContext";
import { ITheme } from "@new-ui/styles/themes/themeTypes";
import { Button } from "new-ui/components/common-components/layout";

interface ITransactionOTPRouteParams {
  onOTPVerified?: () => void;
  transactionType?: string;
}

const OTP = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { theme: newTheme } = useNewTheme();
  const { theme } = useTheme();

  const styles = customStyles(theme);
  const isProductionEnv = isProduction();

  const { onOTPVerified, transactionType } = (route.params as ITransactionOTPRouteParams) || {};

  const [otp, setOtp] = useState<string>("");
  const otpInputRef = useRef<OtpInputRef>(null);
  const [countdown, setCountdown] = useState<number>(60);
  const [resendEnabled, setResendEnabled] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const hasAutoVerifiedRef = useRef(false);

  const { mutate: sendOTP, isPending: isSendingOTP } = useSendOTP();
  const { mutate: verifyUserForSendOTP, isPending: isVerifyingOTP } =
    useVerifyUserForSendOTP();

  console.log("isVerifying =>", isVerifying);

  useEffect(() => {
    // Send OTP when screen opens
    handleSendOTP();

    // Reset states
    setOtp("");
    setCountdown(60);
    setResendEnabled(false);
    setIsVerifying(false);
    otpInputRef.current?.clear();
  }, []);

  // Auto OTP reading for Android using SMS Retriever API
  useEffect(() => {
    if (Platform.OS === "android") {
      // Start listening for OTP SMS
      startOtpListener((message) => {
        // console.log("Received SMS (Transaction OTP):", message);
        // Extract 6-digit OTP from message using regex
        const otpMatch = /(\d{6})/g.exec(message);
        if (otpMatch && otpMatch[1]) {
          const extractedOtp = otpMatch[1];
          console.log("Extracted OTP:", extractedOtp);
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

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendEnabled(true);
    }
  }, [countdown]);

  const handleSendOTP = async () => {
    // Fetch hash when needed (checks storage first, so fast when cached)
    const hash = await getSmsHash();

    const payload: Record<string, unknown> = {
      send_phone_otp: true,
      country_code: "91",
    };
    if (hash) {
      payload.hash = hash;
    }
    // Alert.alert("Payload =>", JSON.stringify(payload, null, 2));

    sendOTP(payload as any, {
      onSuccess: (data) => {
        console.log("OTP sent successfully:", data);
        showSuccess("OTP sent", "OTP sent to your registered email.");
      },
      onError: (error) => {
        console.log("Error sending OTP:", error);
        showError("Couldn't send OTP", "Please try again.");
      },
    });
  };

  const handleResend = () => {
    if (resendEnabled) {
      setCountdown(60);
      setResendEnabled(false);
      setOtp("");
      setErrorMessage("");
      otpInputRef.current?.clear();
      hasAutoVerifiedRef.current = false;
      handleSendOTP();
    }
  };

  const handleOtpChange = useCallback((text: string) => {
    // Clear error when user starts typing
    if (errorMessage) {
      setErrorMessage("");
    }
    setOtp(text);
  }, [errorMessage]);

  const handleVerifyOTP = useCallback((otpValue?: string) => {
    setIsVerifying(true);
    setErrorMessage(""); // Clear previous error
    const enteredOtp = otpValue || otp;

    if (enteredOtp.length < 6) {
      showError("Invalid code", "Please enter the complete OTP.");
      setErrorMessage("Please enter complete OTP");
      setIsVerifying(false);
      return;
    }

    const payload = {
      otp: enteredOtp,
    };

    verifyUserForSendOTP(payload as any, {
      onSuccess: (data) => {
        console.log("OTP verified successfully:", data);
        showSuccess("Verified", "Your OTP was verified successfully.");
        setIsVerifying(false);
        setErrorMessage("");

        // Navigate back and execute the transaction
        navigation.goBack();
        if (onOTPVerified) {
          onOTPVerified();
        }
      },
      onError: (error: any) => {
        console.log("Error verifying OTP:", error);
        const errMsg = error?.response?.data?.data?.message || error?.response?.data?.message || "Invalid OTP. Please try again.";
        showError("Verification failed", errMsg);
        setErrorMessage(errMsg);
        setIsVerifying(false);
        // Clear OTP on error
        otpInputRef.current?.clear();
        setOtp("");
      },
    });
  }, [otp, navigation, onOTPVerified, verifyUserForSendOTP]);

  const handleClose = () => {
    navigation.goBack();
  };

  const isOtpComplete = otp.length === 6;

  // Reset auto-verify ref when OTP becomes incomplete
  useEffect(() => {
    if (!isOtpComplete) {
      hasAutoVerifiedRef.current = false;
    }
  }, [isOtpComplete]);

  // Handle OTP filled - auto verify
  const handleOtpFilled = useCallback((filledOtp: string) => {
    if (
      hasAutoVerifiedRef.current ||
      isVerifying ||
      isVerifyingOTP ||
      isSendingOTP
    ) {
      return;
    }
    hasAutoVerifiedRef.current = true;
    handleVerifyOTP(filledOtp);
  }, [isVerifying, isVerifyingOTP, isSendingOTP, handleVerifyOTP]);

  return (
    <ScreenContainer avoidKeyboard padding={0}>
      <View style={styles.container}>
        {/* Header */}
        {/* <HeaderTitle title="Transaction Verification" leftIcon="true" /> */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, }} >
          <TouchableOpacity onPress={handleClose}>
            <AppIcon.ArrowLeft
            color={theme.colors.text} width={25} height={25} />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginRight: 20, }}>
            <CustomText variant='h1' fontWeight='bold' size={20}>Transaction Verification</CustomText>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <CustomText
            variant="h3"
            fontWeight='bold'
            style={styles.title}
          >
            Verify OTP
          </CustomText>
          <CustomText variant="caption" fontWeight='light' size={14} style={styles.subtitle}>
            Enter the OTP sent to your registered email address to complete
            the transaction.
          </CustomText>

          {/* OTP Input Fields */}
          <View style={styles.otpContainer}>
            <OtpInput
              ref={otpInputRef}
              numberOfDigits={6}
              focusColor={theme.colors.primary}
              autoFocus={true}
              disabled={isVerifying || isVerifyingOTP || isSendingOTP}
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
                pinCodeContainerStyle: [
                  styles.otpInput,
                  errorMessage && styles.otpInputError,
                ] as any,
                pinCodeTextStyle: styles.otpInputText,
                focusedPinCodeContainerStyle: styles.otpInputActive,
                filledPinCodeContainerStyle: styles.otpInputFilled,
                disabledPinCodeContainerStyle: styles.otpInputDisabled,
              }}
            />
            {/* Error Message Display */}
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <SvgIcons.ToastCross width={16} height={16} />
                <CustomText style={styles.errorText}>{errorMessage}</CustomText>
              </View>
            ) : null}

            {/* Resend Section */}
            <View style={styles.resendSection}>
              <CustomText variant="caption" style={styles.resendText}>
                Didn't receive the code?
              </CustomText>
              <TouchableOpacity
                style={styles.resendButton}
                disabled={!resendEnabled || isSendingOTP}
                onPress={handleResend}
              >
                <CustomText
                  variant="caption"
                  style={[
                    styles.resendButtonText,
                    (!resendEnabled || isSendingOTP) && styles.disabledText,
                  ]}
                >
                  {isSendingOTP
                    ? "Sending..."
                    : resendEnabled
                      ? "Resend OTP"
                      : `Resend in ${countdown}s`}
                </CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
          <View style={{ width: '90%', marginBottom: 40, alignSelf: 'center', }}>
            <Button
              onPress={() => handleVerifyOTP()}
              disabled={!isOtpComplete || isVerifying || isVerifyingOTP || isSendingOTP}
            >
              {isVerifying || isVerifyingOTP ? "Verifying..." : "Verify & Continue"}
            </Button>
          </View>
      </View>
    </ScreenContainer>
  );
};

const customStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.surface,
    },
    headerTitle: {
      flex: 1,
      textAlign: "center",
      color: theme.colors.text,
    },
    closeButton: {
      width: 30,
      height: 30,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 15,
      backgroundColor: theme.colors.surface,
    },
    closeText: {
      color: theme.colors.textSecondary,
      fontSize: 16,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingVertical: 30,
      alignItems: "center",
      // justifyContent: "center",
      // backgroundColor: 'red',
    },
    title: {
      textAlign: "center",
      marginBottom: 10,
      color: theme.colors.text,
    },
    subtitle: {
      textAlign: "center",
      marginBottom: 40,
      lineHeight: 20,
      paddingHorizontal: 10,
    },
    otpContainer: {
      width: "100%",
      marginBottom: 40,
      paddingHorizontal: 10,
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
      borderColor: theme.colors.border,
      // backgroundColor: theme.colors.background,
    },
    otpInputText: {
      fontSize: 20,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.text,
    },
    otpInputActive: {
      borderColor: theme.colors.primary,
      borderWidth: 2,
      backgroundColor: theme.colors.primaryLight,
    },
    otpInputFilled: {
      borderColor: theme.colors.primary,
      borderWidth: 1.5,
      backgroundColor: theme.colors.primaryLight,
    },
    otpInputDisabled: {
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      opacity: 0.7,
    },
    otpInputError: {
      borderColor: "#C92A2A",
      borderWidth: 1.5,
    },
    errorContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#FFF5F5",
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginBottom: 20,
      marginTop: 20,
      width: "100%",
      borderWidth: 1,
      borderColor: "#C92A2A",
    },
    errorText: {
      color: "#C92A2A",
      fontSize: 14,
      fontFamily: theme.typography.fontFamily.semiBold,
      marginLeft: 8,
      flex: 1,
      textAlign: "center",
    },
    resendSection: {
      alignItems: "center",
      marginBottom: 40,
      marginTop: 20,
    },
    resendText: {
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
    resendButton: {
      paddingVertical: 5,
    },
    resendButtonText: {
      color: theme.colors.primary,
      textDecorationLine: "underline",
      fontFamily: theme.typography.fontFamily.semiBold,
    },
    disabledText: {
      color: theme.colors.border,
      textDecorationLine: "none",
    },
    verifyButton: {
      width: "100%",
    },
  });

export default OTP;
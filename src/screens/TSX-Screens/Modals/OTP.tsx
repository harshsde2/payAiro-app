import { useNavigation, useRoute } from "@react-navigation/native";
import { ScreenContainer } from "HOC";
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { OtpInput, OtpInputRef } from "react-native-otp-entry";
import { CustomText } from "tsx-components";
import GenericButton from "../../../components/GenericButton";
import { Theme, useTheme } from "styles";
import { useSendOTP, useVerifyUserForSendOTP } from "query/hooks/useAPIAuth";
import { showError, showSuccess } from "../../../utils/toast";
import HeaderTitle from "components/HeaderTitle";
import { SvgIcons } from "constants/svgs";

interface ITransactionOTPRouteParams {
  onOTPVerified?: () => void;
  transactionType?: string;
}

const OTP = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { theme } = useTheme();
  const styles = customStyles(theme);

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

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendEnabled(true);
    }
  }, [countdown]);

  const handleSendOTP = () => {
    sendOTP({} as any, {
      onSuccess: (data) => {
        console.log("OTP sent successfully:", data);
        showSuccess("OTP sent to your registered email");
      },
      onError: (error) => {
        console.log("Error sending OTP:", error);
        showError("Failed to send OTP. Please try again.");
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
      showError("Please enter complete OTP");
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
        showSuccess("OTP verified successfully");
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
        showError(errMsg);
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
        <HeaderTitle title="Transaction Verification" leftIcon="true" />

        {/* Content */}
        <View style={styles.content}>
          <CustomText
            variant="h3"
            fontFamily={theme.typography.fontFamily.montserratSemiBold}
            style={styles.title}
          >
            Verify OTP
          </CustomText>
          <CustomText variant="caption" style={styles.subtitle}>
            Enter the OTP sent to your registered email address to complete
            the transaction.
          </CustomText>

          {/* OTP Input Fields */}
          <View style={styles.otpContainer}>
            <OtpInput
              ref={otpInputRef}
              numberOfDigits={6}
              focusColor={theme.colors.palette.green800}
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
                ],
                pinCodeTextStyle: styles.otpInputText,
                focusedPinCodeContainerStyle: styles.otpInputActive,
                filledPinCodeContainerStyle: styles.otpInputFilled,
                disabledPinCodeContainerStyle: styles.otpInputDisabled,
              }}
            />
          </View>

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
                variant="subtitle2"
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

          {/* Verify Button */}
          <GenericButton
            title={
              isVerifying || isVerifyingOTP ? "Verifying..." : "Verify & Continue"
            }
            onPress={() => handleVerifyOTP()}
            disabled={
              !isOtpComplete || isVerifying || isVerifyingOTP || isSendingOTP
            }
            cStyle={styles.verifyButton}
          />
        </View>
      </View>
    </ScreenContainer>
  );
};

const customStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.palette.grey200,
    },
    headerTitle: {
      flex: 1,
      textAlign: "center",
      color: theme.colors.text.primary,
    },
    closeButton: {
      width: 30,
      height: 30,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 15,
      backgroundColor: theme.colors.palette.grey100,
    },
    closeText: {
      color: theme.colors.palette.grey600,
      fontSize: 16,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingVertical: 30,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      textAlign: "center",
      marginBottom: 10,
      color: theme.colors.text.primary,
    },
    subtitle: {
      textAlign: "center",
      marginBottom: 40,
      color: theme.colors.text.secondary,
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
      borderColor: theme.colors.palette.grey300,
      backgroundColor: theme.colors.background.primary,
    },
    otpInputText: {
      fontSize: 20,
      fontFamily: theme.typography.fontFamily.montserratSemiBold,
      color: theme.colors.text.primary,
    },
    otpInputActive: {
      borderColor: theme.colors.palette.green800,
      borderWidth: 2,
      backgroundColor: theme.colors.palette.green50,
    },
    otpInputFilled: {
      borderColor: theme.colors.palette.green500,
      borderWidth: 1.5,
      backgroundColor: theme.colors.palette.green50,
    },
    otpInputDisabled: {
      borderColor: theme.colors.palette.grey300,
      backgroundColor: theme.colors.palette.grey100,
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
      width: "100%",
      borderWidth: 1,
      borderColor: "#C92A2A",
    },
    errorText: {
      color: "#C92A2A",
      fontSize: 14,
      fontFamily: theme.typography.fontFamily.montserratSemiBold,
      marginLeft: 8,
      flex: 1,
      textAlign: "center",
    },
    resendSection: {
      alignItems: "center",
      marginBottom: 40,
    },
    resendText: {
      color: theme.colors.text.secondary,
      marginBottom: 8,
    },
    resendButton: {
      paddingVertical: 5,
    },
    resendButtonText: {
      color: theme.colors.palette.green600,
      textDecorationLine: "underline",
      fontFamily: theme.typography.fontFamily.montserratSemiBold,
    },
    disabledText: {
      color: theme.colors.palette.grey400,
      textDecorationLine: "none",
    },
    verifyButton: {
      width: "100%",
    },
  });

export default OTP;
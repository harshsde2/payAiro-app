import { useNavigation, useRoute } from "@react-navigation/native";
import { ScreenContainer } from "HOC";
import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CustomText } from "tsx-components";
import GenericButton from "../../../components/GenericButton";
import { Theme, useTheme } from "styles";
import { useSendOTP, useVerifyUserForSendOTP } from "query/hooks/useAPIAuth";
import { showError, showSuccess } from "../../../utils/toast";
import HeaderTitle from "components/HeaderTitle";

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

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const inputs = useRef<any[]>([]);
  const [countdown, setCountdown] = useState<number>(60);
  const [resendEnabled, setResendEnabled] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const { mutate: sendOTP, isPending: isSendingOTP } = useSendOTP();
  const { mutate: verifyUserForSendOTP, isPending: isVerifyingOTP } =
    useVerifyUserForSendOTP();

  useEffect(() => {
    // Send OTP when screen opens
    handleSendOTP();
    
    // Reset states
    setOtp(["", "", "", "", "", ""]);
    setCountdown(60);
    setResendEnabled(false);
    setIsVerifying(false);
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
      handleSendOTP();
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    if (/^[0-9]$/.test(text) || text === "") {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      // Move to the next input if a number is entered
      if (text && index < otp.length - 1) {
        inputs.current[index + 1]?.focus();
      }

      // Move to the previous input if backspace is pressed and field is empty
      if (!text && index > 0) {
        inputs.current[index - 1]?.focus();
      }
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace") {
      if (otp[index] === "") {
        // Move to the previous input if current is empty
        if (index > 0) {
          inputs.current[index - 1]?.focus();
        }
      } else {
        // Clear the current input
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  const handleVerifyOTP = () => {
    setIsVerifying(true);
    const enteredOtp = otp.join("");
    
    if (enteredOtp.length < 6) {
      showError("Please enter complete OTP");
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
        
        // Navigate back and execute the transaction
        navigation.goBack();
        if (onOTPVerified) {
          onOTPVerified();
        }
      },
      onError: (error) => {
        console.log("Error verifying OTP:", error);
        showError("Invalid OTP. Please try again.");
        setIsVerifying(false);
      },
    });
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const isOtpComplete = otp.every((digit) => digit !== "");

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
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                style={[styles.otpInput, digit && styles.otpInputActive]}
                maxLength={1}
                keyboardType="number-pad"
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={({ nativeEvent }) =>
                  handleKeyPress(nativeEvent.key, index)
                }
                ref={(input) => (inputs.current[index] = input)}
                value={digit}
                selectTextOnFocus
              />
            ))}
          </View>

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
            onPress={handleVerifyOTP}
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
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      marginBottom: 40,
      paddingHorizontal: 10,
    },
    otpInput: {
      width: 45,
      height: 55,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.palette.grey300,
      textAlign: "center",
      fontSize: 18,
      fontFamily: theme.typography.fontFamily.montserratSemiBold,
      backgroundColor: theme.colors.background.primary,
      color: theme.colors.text.primary,
    },
    otpInputActive: {
      borderColor: theme.colors.palette.green500,
      borderWidth: 2,
      backgroundColor: theme.colors.palette.green50,
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
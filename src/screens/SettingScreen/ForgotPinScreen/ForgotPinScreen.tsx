import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Pressable,
  Platform,
} from "react-native";
import HeaderTitle from "components/HeaderTitle";
import GenericButton from "components/GenericButton";
import { setPin } from "storage/mmkv";
import { ScreenContainer } from "HOC";
import { globalStyles, useGlobalStyles } from "styles/GlobalStyles";
import { showError, showSuccess } from "utils/toast";
import CommonModal from "tsx-components/modals/CommonModal";
import { useTheme } from "styles";
import { CustomText } from "tsx-components";
import { useAppLock } from "hooks/useAppLock";
import { useNavigation } from "@react-navigation/native";
import { SvgIcons } from "constants/svgs";
import {
  useForgotPinSendOtp,
  useForgotPinVerifyOtp,
  useForgotPinReset,
} from "query/hooks";
import { getModalStyles, getStyles } from "./styles";
import type { IForgotPinScreenProps, VerifyOtpPayload } from "./types";
import { useSelector } from "react-redux";

const ForgotPinScreen: React.FC<IForgotPinScreenProps> = () => {
  const globalStyles = useGlobalStyles();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { refreshPinStatus, lockApp } = useAppLock();
  const modalStyles = getModalStyles(theme);
  const styles = getStyles(theme);

  const { walletData } = useSelector((state: any) => state.authenticationSlice);
  const email = walletData?.account_email;

  /**
   * Masks email for privacy display
   * Example: "john.doe@example.com" -> "jo***@example.com"
   */
  const getMaskedEmail = (emailAddress: string | undefined): string => {
    if (!emailAddress || !emailAddress.includes("@")) {
      return "your registered email";
    }
    
    const [localPart, domain] = emailAddress.split("@");
    const visibleChars = Math.min(2, localPart.length);
    const maskedLocal = localPart.slice(0, visibleChars) + "***";
    
    return `${maskedLocal}@${domain}`;
  };

  const maskedEmail = getMaskedEmail(email);

  const [newPin, setNewPin] = useState<string[]>(["", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState<string[]>(["", "", "", ""]);
  const [showLoader, setShowLoader] = useState<boolean>(false);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const inputs = useRef<(TextInput | null)[]>([]);

  const [showVerifyModal, setShowVerifyModal] = useState<boolean>(false);
  const [isUserVerified, setIsUserVerified] = useState<boolean>(false);
  const [otpError, setOtpError] = useState<string>("");
  const [newPinError, setNewPinError] = useState<string>("");

  const newPinRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];
  const confirmPinRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  // API Hooks - These will be replaced with actual API calls when ready
  const {
    mutate: handleForgotPinSendOtp,
    isPending: isPendingSendOtp,
  } = useForgotPinSendOtp();

  const {
    mutate: handleForgotPinVerifyOtp,
    isPending: isPendingVerifyOtp,
  } = useForgotPinVerifyOtp();

  const {
    mutate: handleForgotPinReset,
    isPending: isPendingResetPin,
  } = useForgotPinReset();

  const isNewPinAndConfirmPinSame = (): boolean => {
    return newPin.join("") === confirmPin.join("") && newPin.join("") !== "";
  };

  const handleSendOtp = () => {
    handleForgotPinSendOtp(
      {},
      {
        onSuccess: (data) => {
          console.log("OTP sent successfully:", data);
          showSuccess("OTP sent to your registered email");
          setShowVerifyModal(true);
        },
        onError: (err: any) => {
          console.log("Send OTP error:", JSON.stringify(err, null, 2));
          showError(
            err?.response?.data?.data?.error ||
              err?.response?.data?.message ||
              "Failed to send OTP. Please try again."
          );
        },
      }
    );
  };

  const handleVerifyOtp = () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length < 6) {
      showError("OTP should be 6 digits");
      setOtpError("OTP should be 6 digits");
      return;
    }

    setOtpError("");
    const payload: VerifyOtpPayload = { otp: enteredOtp };

    handleForgotPinVerifyOtp(payload, {
      onSuccess: (data) => {
        console.log("OTP verified successfully:", data);
        setOtpError("");
        setOtp(["", "", "", "", "", ""]);
        setShowVerifyModal(false);
        setIsUserVerified(true);
        showSuccess("Email verified successfully. You can now reset your PIN.");
      },
      onError: (err: any) => {
        console.log(
          "Verify OTP error:",
          JSON.stringify(err?.response?.data, null, 2)
        );
        const errorMessage =
          err?.response?.data?.data?.message ||
          err?.response?.data?.message ||
          "Invalid OTP. Please try again.";
        showError(errorMessage);
        setOtpError(errorMessage);
      },
    });
  };

  const handleResetPin = () => {
    if (!isUserVerified) {
      showError("Please verify your email first");
      return;
    }

    if (!isNewPinAndConfirmPinSame()) {
      showError("New PIN does not match with confirm PIN");
      return;
    }

    if (newPin.join("").length !== 4) {
      showError("Please enter a valid 4-digit PIN");
      return;
    }

    setShowLoader(true);
    const formData = new FormData();
    formData.append("new_pin", newPin.join(""));

    handleForgotPinReset(formData, {
      onSuccess: (data) => {
        setShowLoader(false);
        setPin(confirmPin.join(""));
        refreshPinStatus();
        console.log("PIN reset successfully:", JSON.stringify(data.data, null, 2));
        showSuccess("PIN reset successfully");
        setConfirmPin(["", "", "", ""]);
        setNewPin(["", "", "", ""]);
        setIsUserVerified(false);
        navigation.goBack();
      },
      onError: (err: any) => {
        setShowLoader(false);
        showError(
          err?.response?.data?.data?.error ||
            err?.response?.data?.message ||
            "Failed to reset PIN. Please try again."
        );
        console.log("Reset PIN error:", JSON.stringify(err, null, 2));
      },
    });
  };

  // Handle pasted text for OTP
  const handlePasteText = (text: string, startIndex: number) => {
    const numbers = text.replace(/[^0-9]/g, "");

    if (numbers.length > 0) {
      const newOtp = [...otp];
      let currentIndex = startIndex;
      for (let i = 0; i < numbers.length && currentIndex < 6; i++) {
        newOtp[currentIndex] = numbers[i];
        currentIndex++;
      }
      setOtp(newOtp);
      const nextIndex = Math.min(currentIndex, 5);
      setTimeout(() => {
        inputs.current[nextIndex]?.focus();
      }, 0);
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    if (otpError) {
      setOtpError("");
    }

    if (text.length > 1) {
      handlePasteText(text, index);
      return;
    }

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

  const handleKeyPress = (key: string, index: number) => {
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

  // Handler for new PIN input
  const handleNewPinChange = (val: string, index: number) => {
    let tempPin = [...newPin];
    tempPin[index] = val;
    setNewPin(tempPin);

    if (newPinError) {
      setNewPinError("");
    }

    if (val && newPinRefs[index + 1]) {
      newPinRefs[index + 1].current?.focus();
    }

    if (!val && index > 0) {
      newPinRefs[index - 1].current?.focus();
    }
  };

  const handleNewPinKeyPress = (key: string, index: number) => {
    if (key === "Backspace") {
      if (newPin[index] === "") {
        if (index > 0) {
          newPinRefs[index - 1].current?.focus();
        }
      } else {
        let tempPin = [...newPin];
        tempPin[index] = "";
        setNewPin(tempPin);
      }
    }
  };

  // Handler for confirm PIN input
  const handleConfirmPinChange = (val: string, index: number) => {
    let tempPin = [...confirmPin];
    tempPin[index] = val;
    setConfirmPin(tempPin);

    if (val && confirmPinRefs[index + 1]) {
      confirmPinRefs[index + 1].current?.focus();
    }

    if (!val && index > 0) {
      confirmPinRefs[index - 1].current?.focus();
    }
  };

  const handleConfirmPinKeyPress = (key: string, index: number) => {
    if (key === "Backspace") {
      if (confirmPin[index] === "") {
        if (index > 0) {
          confirmPinRefs[index - 1].current?.focus();
        }
      } else {
        let tempPin = [...confirmPin];
        tempPin[index] = "";
        setConfirmPin(tempPin);
      }
    }
  };

  return (
    <ScreenContainer scrollable safeArea padding={0}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* OTP Verification Modal */}
        {showVerifyModal && (
          <CommonModal
            onClose={() => {
              setShowVerifyModal(false);
              setOtpError("");
              setOtp(["", "", "", "", "", ""]);
            }}
            isVisible={showVerifyModal}
            containerStyle={{ justifyContent: "center", alignItems: "center" }}
            isOnOutsidePressClose={false}
          >
            <Pressable
              onPress={(e) => e.stopPropagation()}
              style={[
                globalStyles.whiteSheetContainer,
                {
                  maxHeight: otpError ? 420 : 360,
                  width: "90%",
                  borderRadius: theme.spacing.spacing[8],
                  padding: theme.spacing.spacing[6],
                  backgroundColor: theme.colors.palette.white,
                  ...(Platform.OS === "ios"
                    ? {
                        shadowColor: theme.colors.shadow.default,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.15,
                        shadowRadius: 12,
                      }
                    : {
                        elevation: 8,
                      }),
                },
              ]}
            >
              {/* Header Section */}
              <View style={modalStyles.modalHeader}>
                <CustomText
                  variant="h3"
                  fontFamily={theme.typography.fontFamily.montserratSemiBold}
                  style={modalStyles.modalTitle}
                >
                  Verify Your Email
                </CustomText>
                <CustomText variant="caption" style={modalStyles.modalSubtitle}>
                  Enter the 6-digit OTP sent to your registered email address
                  to verify your identity and reset your PIN.
                </CustomText>
              </View>

              {/* OTP Input Fields */}
              <View style={modalStyles.otpContainer}>
                {otp.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      modalStyles.otpInputWrapper,
                      index === 0 && modalStyles.otpInputWrapperFirst,
                      index === otp.length - 1 &&
                        modalStyles.otpInputWrapperLast,
                    ]}
                  >
                    <TextInput
                      style={[
                        modalStyles.otpInput,
                        otp[index] && modalStyles.otpInputActive,
                        otpError && modalStyles.otpInputError,
                      ]}
                      maxLength={6}
                      keyboardType="number-pad"
                      onChangeText={(text) => handleOtpChange(text, index)}
                      onKeyPress={({ nativeEvent }) =>
                        handleKeyPress(nativeEvent.key, index)
                      }
                      ref={(input) => {(inputs.current[index] = input)}}
                      value={otp[index]}
                      selectTextOnFocus
                      editable={!isPendingVerifyOtp}
                      contextMenuHidden={false}
                    />
                  </View>
                ))}
              </View>

              {/* Error Message Display */}
              {otpError ? (
                <View style={modalStyles.errorContainer}>
                  <SvgIcons.ToastCross width={16} height={16} />
                  <CustomText variant="caption" style={modalStyles.errorText}>
                    {otpError}
                  </CustomText>
                </View>
              ) : null}

              {/* Action Buttons */}
              <View style={modalStyles.buttonContainer}>
                <GenericButton
                  onPress={handleVerifyOtp}
                  title="Verify OTP"
                  cStyle={modalStyles.verifyButton}
                  showLoader={true}
                  isLoading={isPendingVerifyOtp}
                  disabled={isPendingVerifyOtp}
                />
                <GenericButton
                  onPress={() => {
                    setShowVerifyModal(false);
                    setOtpError("");
                    setOtp(["", "", "", "", "", ""]);
                  }}
                  title="Cancel"
                  cStyle={modalStyles.cancelButton}
                  disabled={isPendingVerifyOtp}
                />
              </View>
            </Pressable>
          </CommonModal>
        )}

        <HeaderTitle title="Forgot PIN" onPressLeft={() => {
          navigation.goBack();
          lockApp();
        }} leftIcon={"true"} />

        <View style={[globalStyles.whiteSheetContainer]}>
          <View style={{ width: "100%" }}>
            <Text style={styles.title}>Reset Your PIN</Text>
            <Text style={styles.subtitle}>
              Forgot your PIN? No worries! Verify your identity via email, then
              create a new <Text style={styles.bold}>4-digit code</Text> and
              confirm it below to reset your PIN.
            </Text>
            <Text style={styles.emailHint}>
              OTP will be sent to <Text style={styles.bold}>{maskedEmail}</Text>
            </Text>

            {/* Email Verification Section */}
            {!isUserVerified && (
              <View>
                <GenericButton
                  onPress={handleSendOtp}
                  title="Verify with Email"
                  cStyle={{ width: "90%", alignSelf: "center" }}
                  showLoader={true}
                  isLoading={isPendingSendOtp}
                />
              </View>
            )}

            {/* PIN Reset Section - Only shown after email verification */}
            {isUserVerified && (
              <View>
                {/* New PIN Input */}
                <Text style={styles.label}>Enter new PIN</Text>
                <View style={styles.pinContainer}>
                  {newPin.map((digit, index) => (
                    <TextInput
                      key={index}
                      style={[
                        styles.pinInput,
                        newPinError && styles.pinInputError,
                      ]}
                      keyboardType="numeric"
                      maxLength={1}
                      value={digit}
                      onChangeText={(val) => handleNewPinChange(val, index)}
                      onKeyPress={({ nativeEvent }) =>
                        handleNewPinKeyPress(nativeEvent.key, index)
                      }
                      ref={newPinRefs[index]}
                    />
                  ))}
                </View>
                {/* Error message for new PIN */}
                {newPinError ? (
                  <View style={styles.pinErrorContainer}>
                    <SvgIcons.ToastCross width={14} height={14} />
                    <Text style={styles.pinErrorText}>{newPinError}</Text>
                  </View>
                ) : null}

                {/* Confirm New PIN Input */}
                <Text style={styles.label}>Confirm new PIN</Text>
                <View style={styles.pinContainer}>
                  {confirmPin.map((digit, index) => (
                    <TextInput
                      key={index}
                      style={styles.pinInput}
                      keyboardType="numeric"
                      maxLength={1}
                      value={digit}
                      onChangeText={(val) =>
                        handleConfirmPinChange(val, index)
                      }
                      onKeyPress={({ nativeEvent }) =>
                        handleConfirmPinKeyPress(nativeEvent.key, index)
                      }
                      ref={confirmPinRefs[index]}
                    />
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Save PIN Button - Only shown after email verification */}
        {isUserVerified && (
          <GenericButton
            onPress={handleResetPin}
            title="Reset PIN"
            cStyle={{ width: "90%", alignSelf: "center" }}
            showLoader={true}
            isLoading={showLoader || isPendingResetPin}
          />
        )}
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

export default ForgotPinScreen;

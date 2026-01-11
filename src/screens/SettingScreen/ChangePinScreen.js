import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Button,
  Pressable,
} from "react-native";
import Container from "../../HOC/Container";
import HeaderTitle from "../../components/HeaderTitle";
import { SVGLeftArrow } from "../../constants/images";
import Fonts from "../../constants/Fonts";
import GenericButton from "../../components/GenericButton";
import { getPin, setPin } from "storage/mmkv";
import { ScreenContainer } from "HOC";
import { globalStyles, useGlobalStyles } from "styles/GlobalStyles";
import { showError, showSuccess } from "../../utils/toast";
import { useDispatch, useSelector } from "react-redux";
import { patchPin } from "services/Services";
import {
  useChangePin,
  useVerifyUserForChangePin,
  useVerifyUserForChangePinOtp,
} from "query/hooks";
import CommonModal from "tsx-components/modals/CommonModal";
import { themes, useTheme } from "styles";
import { CustomText } from "tsx-components";
import { useAppLock } from "hooks/useAppLock";
import { useNavigation } from "@react-navigation/native";
import { SvgIcons } from "constants/svgs";
import { Platform } from "react-native";

const PinInput = ({ value, setValue, nextRef }) => {
  return (
    <TextInput
      style={styles.pinInput}
      keyboardType="numeric"
      maxLength={1}
      value={value}
      onChangeText={(text) => {
        setValue(text);
        if (text && nextRef) nextRef.current.focus();
      }}
    />
  );
};

const ChangePinScreen = () => {
  const globalStyles = useGlobalStyles();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { refreshPinStatus } = useAppLock();
  const modalStyles = getModalStyles(theme);

  const { tokens } = useSelector((state) => state.authenticationSlice);
  const dispatch = useDispatch();
  const [currentPin, setCurrentPin] = useState(["", "", "", ""]);
  const [newPin, setNewPin] = useState(["", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", ""]);
  const [showLoader, setShowLoader] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]); // OTP array
  const inputs = useRef([]); // Refs for the input fields

  const [isVerifying, setIsVerifying] = useState(false);

  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [isUserVerfied, setIsUserVerfied] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [newPinError, setNewPinError] = useState("");

  const pinRefs = [useRef(), useRef(), useRef(), useRef()];
  const newPinRefs = [useRef(), useRef(), useRef(), useRef()];
  const confirmPinRefs = [useRef(), useRef(), useRef(), useRef()];

  const {
    mutate: handlChangePin,
    isPending: isPendingCreatePin,
    isSuccess: isSuccessCreatePin,
  } = useChangePin();

  // const globalStyles = useGlobalStyles();

  const {
    mutate: handlVerifyUserForChangePin,
    isPending: isPendingVerifyUserForChangePin,
    isSuccess: isSuccessVerifyUserForChangePin,
  } = useVerifyUserForChangePin();

  const {
    mutate: handlVerifyUserForChangePinOtp,
    isPending: isPendingVerifyUserForChangePinOtp,
    isSuccess: isSuccessVerifyUserForChangePinOtp,
  } = useVerifyUserForChangePinOtp();

  const isPinMatched =
    newPin.join("") === confirmPin.join("") && newPin.join("") !== "";

  const isCurrentPinCorrect = () => {
    const currentUserPin = getPin();
    console.log("current pin =>", currentUserPin);
    return currentPin.join("") == currentUserPin;
  };
  const isNewPinAndConfirmPinSame = () => {
    return newPin.join("") === confirmPin.join("") && newPin.join("") !== "";
  };

  const isNewPinSameAsCurrentPin = () => {
    const currentUserPin = getPin();
    const newPinValue = newPin.join("");
    return newPinValue === currentUserPin && newPinValue !== "";
  };

  const handlePinChange = async () => {
    if (!isUserVerfied) {
      showError("Please verify your email first");
      return;
    }
    if (isCurrentPinCorrect()) {
      // Check if new PIN is same as current PIN
      if (isNewPinSameAsCurrentPin()) {
        showError("New PIN cannot be the same as your current PIN. Please choose a different PIN.");
        return;
      }
      if (isNewPinAndConfirmPinSame()) {
        setShowLoader(true);
        const formData = new FormData();
        formData.append("new_pin", newPin.join(""));
        formData.append("old_pin", currentPin.join(""));
        handlChangePin(formData, {
          onSuccess: (data) => {
            setShowLoader(false);
            setPin(confirmPin.join(""));
            refreshPinStatus(); // Update app lock context with new PIN status
            console.log(JSON.stringify(data.data, null, 2));
            showSuccess("Pin change successfully");
            setConfirmPin(["", "", "", ""]);
            setCurrentPin(["", "", "", ""]);
            setNewPin(["", "", "", ""]);
            navigation.goBack();
          },
          onError: (err) => {
            showError(err?.data?.data?.error || "Some error occured!");
            console.log(JSON.stringify(err, null, 2));
          },
          onSettled: () => {
            setShowLoader(false);
          },
        });
      } else {
        showError("New PIN does not match with confirm PIN");
      }
    } else {
      showError("Current PIN is not correct");
    }
  };

  const handleVerfyUserChangePIN = async () => {
    if (isCurrentPinCorrect()) {
      console.log("step 1");
      handlVerifyUserForChangePin(
        {},
        {
          onSuccess: (data) => {
            console.log("step 2", data.data);
            showSuccess("OTP sent successfully");
            setShowVerifyModal(true);
          },
          onError: (err) => {
            console.log("send otp", JSON.stringify(err, null, 2));
            showError(err?.data?.data?.error || "Some error occured!");
          },
          onSettled: () => {},
        }
      );
    } else {
      showError("Current PIN is not correct");
    }
  };
  const handleVerfyUserChangePinOTP = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length < 6) {
      showError("OTP Should Be 6 Digits");
      return;
    }
    // Clear previous error
    setOtpError("");
    console.log("step 3 ->");
    handlVerifyUserForChangePinOtp(
      { otp: enteredOtp },
      {
        onSuccess: (data) => {
          console.log("step 4 ->", data.data);
          setOtpError("");
          setOtp(["", "", "", "", "", ""]); // Clear OTP
          setShowVerifyModal(false);
          setIsUserVerfied(true);
          showSuccess("User verified successfully");
        },
        onError: (err) => {
          console.log(
            "verify otp error =>",
            JSON.stringify(err?.response?.data, null, 2)
          );
          const errorMessage =
            err?.response?.data?.data?.message ||
            err?.response?.data?.message ||
            "Invalid OTP. Please try again.";
          showError(errorMessage);
          setOtpError(errorMessage);
        },
        onSettled: () => {
          // This ensures any cleanup happens regardless of success/error
        },
      }
    );
  };

  // Handle pasted text
  const handlePasteText = (text, startIndex) => {
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

  const handleOtpChange = (text, index) => {
    // Clear error when user starts typing
    if (otpError) {
      setOtpError("");
    }

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

  const handleKeyPress = (key, index) => {
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

  // Handler for current PIN input
  const handleCurrentPinChange = (val, index) => {
    let tempPin = [...currentPin];
    tempPin[index] = val;
    setCurrentPin(tempPin);

    // Move to next input if value is entered
    if (val && pinRefs[index + 1]) {
      pinRefs[index + 1].current.focus();
    }

    // Move to previous input if value is deleted and current is empty
    if (!val && index > 0) {
      pinRefs[index - 1].current.focus();
    }
  };

  const handleCurrentPinKeyPress = (key, index) => {
    if (key === "Backspace") {
      if (currentPin[index] === "") {
        // Move to the previous input if current is empty
        if (index > 0) {
          pinRefs[index - 1].current.focus();
        }
      } else {
        // Clear the current input
        let tempPin = [...currentPin];
        tempPin[index] = "";
        setCurrentPin(tempPin);
      }
    }
  };

  // Handler for new PIN input
  const handleNewPinChange = (val, index) => {
    let tempPin = [...newPin];
    tempPin[index] = val;
    setNewPin(tempPin);

    // Clear error when user starts typing
    if (newPinError) {
      setNewPinError("");
    }

    // Check if new PIN matches current PIN (only when all 4 digits are entered)
    const updatedPin = tempPin.join("");
    if (updatedPin.length === 4) {
      const currentUserPin = getPin();
      if (updatedPin === currentUserPin) {
        setNewPinError("New PIN cannot be the same as your current PIN");
      } else {
        setNewPinError("");
      }
    }

    // Move to next input if value is entered
    if (val && newPinRefs[index + 1]) {
      newPinRefs[index + 1].current.focus();
    }

    // Move to previous input if value is deleted and current is empty
    if (!val && index > 0) {
      newPinRefs[index - 1].current.focus();
    }
  };

  const handleNewPinKeyPress = (key, index) => {
    if (key === "Backspace") {
      if (newPin[index] === "") {
        // Move to the previous input if current is empty
        if (index > 0) {
          newPinRefs[index - 1].current.focus();
        }
      } else {
        // Clear the current input
        let tempPin = [...newPin];
        tempPin[index] = "";
        setNewPin(tempPin);
      }
    }
  };

  // Handler for confirm PIN input
  const handleConfirmPinChange = (val, index) => {
    let tempPin = [...confirmPin];
    tempPin[index] = val;
    setConfirmPin(tempPin);

    // Move to next input if value is entered
    if (val && confirmPinRefs[index + 1]) {
      confirmPinRefs[index + 1].current.focus();
    }

    // Move to previous input if value is deleted and current is empty
    if (!val && index > 0) {
      confirmPinRefs[index - 1].current.focus();
    }
  };

  const handleConfirmPinKeyPress = (key, index) => {
    if (key === "Backspace") {
      if (confirmPin[index] === "") {
        // Move to the previous input if current is empty
        if (index > 0) {
          confirmPinRefs[index - 1].current.focus();
        }
      } else {
        // Clear the current input
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
                <CustomText
                  variant="caption"
                  style={modalStyles.modalSubtitle}
                >
                  Enter the 6-digit OTP sent to your registered email address to verify your identity.
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
                      index === otp.length - 1 && modalStyles.otpInputWrapperLast,
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
                      ref={(input) => (inputs.current[index] = input)}
                      value={otp[index]}
                      selectTextOnFocus
                      editable={!isPendingVerifyUserForChangePinOtp}
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
                  onPress={() => {
                    handleVerfyUserChangePinOTP();
                  }}
                  title={"Verify OTP"}
                  cStyle={modalStyles.verifyButton}
                  showLoader={true}
                  isLoading={isPendingVerifyUserForChangePinOtp}
                  disabled={isPendingVerifyUserForChangePinOtp}
                />
                <GenericButton
                  onPress={() => {
                    setShowVerifyModal(false);
                    setOtpError("");
                    setOtp(["", "", "", "", "", ""]);
                  }}
                  title={"Cancel"}
                  cStyle={modalStyles.cancelButton}
                  disabled={isPendingVerifyUserForChangePinOtp}
                />
              </View>
            </Pressable>
          </CommonModal>
        )}
        <HeaderTitle title={"Set Pin"} leftIcon={SVGLeftArrow} />
        {/* <Button title="click me" onPress={() => setPin("0000")} /> */}
        <View style={[globalStyles.whiteSheetContainer]}>
          <View style={{ width: "100%" }}>
            <Text style={styles.title}>Change Your Pin</Text>
            <Text style={styles.subtitle}>
              To change your <Text style={styles.bold}>PIN</Text>, first verify your identity via email, then create a new <Text style={styles.bold}>4-digit code</Text> and confirm it below to complete the process.
            </Text>

            {/* Current PIN Input */}
            {!isUserVerfied && (
              <View>
                <Text style={styles.label}>Enter current PIN</Text>
                <View style={styles.pinContainer}>
                  {currentPin.map((digit, index) => (
                    <TextInput
                      key={index}
                      style={styles.pinInput}
                      keyboardType="numeric"
                      maxLength={1}
                      value={digit}
                      onChangeText={(val) => handleCurrentPinChange(val, index)}
                      onKeyPress={({ nativeEvent }) =>
                        handleCurrentPinKeyPress(nativeEvent.key, index)
                      }
                      ref={pinRefs[index]}
                    />
                  ))}
                </View>
              </View>
            )}
            {!isUserVerfied && (
              <GenericButton
                onPress={() => {
                  handleVerfyUserChangePIN();
                }}
                title={"Verify with e-mail"}
                cStyle={{ width: "90%", alignSelf: "center" }}
                showLoader={true}
                isLoading={isPendingVerifyUserForChangePin}
              />
            )}
          </View>

          {isUserVerfied && (
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
                    onChangeText={(val) => handleConfirmPinChange(val, index)}
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
        <GenericButton
          onPress={() => handlePinChange()}
          title={"Save PIN"}
          cStyle={{ width: "90%", alignSelf: "center", marginBottom: theme.spacing.spacing[4] }}
          showLoader={true}
          isLoading={showLoader}
        />
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const getModalStyles = (theme) =>
  StyleSheet.create({
    errorContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#FFF5F5",
      paddingVertical: theme.spacing.spacing[3],
      paddingHorizontal: theme.spacing.spacing[4],
      borderRadius: 8,
      marginBottom: theme.spacing.spacing[4],
      marginTop: theme.spacing.spacing[2],
      width: "100%",
      borderWidth: 1,
      borderColor: "#C92A2A",
    },
    errorText: {
      color: "#C92A2A",
      fontSize: 14,
      fontFamily: theme.typography.fontFamily.montserratSemiBold,
      marginLeft: theme.spacing.spacing[2],
      flex: 1,
      textAlign: "center",
    },
    otpContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      marginVertical: theme.spacing.spacing[5],
      paddingHorizontal: theme.spacing.spacing[1],
    },
    otpInputWrapper: {
      flex: 1,
      marginHorizontal: theme.spacing.spacing[1],
    },
    otpInputWrapperFirst: {
      marginLeft: 0,
    },
    otpInputWrapperLast: {
      marginRight: 0,
    },
    otpInput: {
      width: "100%",
      height: 56,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: theme.colors.palette.grey300,
      textAlign: "center",
      fontSize: 20,
      fontFamily: theme.typography.fontFamily.montserratSemiBold,
      backgroundColor: theme.colors.background.primary,
      color: theme.colors.text.primary,
    },
    otpInputActive: {
      borderColor: theme.colors.palette.green500,
      borderWidth: 2,
      backgroundColor: theme.colors.palette.green50,
    },
    otpInputError: {
      borderColor: "#C92A2A",
      borderWidth: 1.5,
    },
    modalHeader: {
      marginBottom: theme.spacing.spacing[6],
      alignItems: "center",
    },
    modalTitle: {
      textAlign: "center",
      marginBottom: theme.spacing.spacing[2],
      color: theme.colors.text.primary,
    },
    modalSubtitle: {
      textAlign: "center",
      color: theme.colors.text.secondary,
      lineHeight: 20,
      paddingHorizontal: theme.spacing.spacing[2],
    },
    buttonContainer: {
      width: "100%",
      marginTop: theme.spacing.spacing[4],
    },
    verifyButton: {
      width: "100%",
      marginBottom: theme.spacing.spacing[3],
    },
    cancelButton: {
      width: "100%",
      backgroundColor: theme.colors.palette.black,
    },
  });

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontFamily: Fonts.semibold,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    fontFamily: Fonts.regular,
    color: "black",
  },
  bold: {
    fontFamily: Fonts.semibold,
  },
  label: {
    fontSize: 14,
    fontFamily: Fonts.semibold,
    marginBottom: 5,
  },
  pinContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  pinInput: {
    width: 70,
    height: 60,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(0, 119, 4, 0.4)",
    textAlign: "center",
    fontSize: 22,
    backgroundColor: "rgba(0, 119, 4, 0.07)",
  },
  pinInputError: {
    borderColor: "#C92A2A",
    borderWidth: 1.5,
    backgroundColor: "#FFF5F5",
  },
  pinErrorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F5",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#C92A2A",
  },
  pinErrorText: {
    color: "#C92A2A",
    fontSize: 13,
    fontFamily: Fonts.semibold,
    marginLeft: 8,
    flex: 1,
  },
  successContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  successText: {
    color: "green",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ChangePinScreen;

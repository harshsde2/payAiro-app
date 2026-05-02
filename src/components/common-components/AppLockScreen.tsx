import Fonts from "constants/Fonts";
import React, { useState, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  AppState,
  type AppStateStatus,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  BackHandler,
} from "react-native";
import { Theme, useTheme } from "styles";
import { SvgIcons } from "constants/svgs";
import {
  getPin,
  removeItem,
  setPin as setLocalPin,
  STORAGE_KEYS,
} from "storage/mmkv";
// import CustomText from "tsx-components/CustomText";
import CustomText from "@new-ui/components/common-components/CustomText";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppLock } from "hooks/useAppLock";
import { useNavigation } from "@react-navigation/native";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import {
  authenticateWithBiometricDetailed,
  type BiometricAuthResult,
} from "services/BiometricService";
import { LOCK_CONFIG } from "types/appLock.types";
import { AppIcon } from "@new-ui/assets/svgs";
import { Button } from "new-ui/components/common-components/layout";
import { useUpsertUserSecurityPinSettings } from "query/hooks";

const AppLockScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = customStyles(theme);
  const navigation = useNavigation<any>();
  const {
    isLocked,
    unlockApp,
    shouldShowLock,
    isBiometricEnabled,
    showPinScreen,
    requestShowPinScreen,
    resetBiometricFailures,
    paymentVerificationRequest,
    clearPaymentVerification,
    refreshPinStatus,
  } = useAppLock();
  const { mutateAsync: upsertUserSecurityPinSettings } =
    useUpsertUserSecurityPinSettings();

  const biometricFailureCount = useRef(0);
  const paymentMode = !!paymentVerificationRequest;
  const requiresPinSetup = paymentVerificationRequest?.requirePinSetup === true;
  const [paymentShowPin, setPaymentShowPin] = useState(false);
  /** True while native biometric dialog is visible; shows full white background instead of PIN UI. */
  const [isBiometricRunning, setIsBiometricRunning] = useState(false);
  /** Incremented when app returns to foreground so biometric effect re-runs and re-shows native modal (e.g. after phone lock). */
  const [biometricRetriggerKey, setBiometricRetriggerKey] = useState(0);

  const [pin, setPin] = useState("");
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [setupPinFirstEntry, setSetupPinFirstEntry] = useState("");
  const [isSavingSetupPin, setIsSavingSetupPin] = useState(false);

  // Verify PIN against stored PIN
  const verifyPin = (enteredPin: string): boolean => {
    const correctPin = getPin();
    return enteredPin === correctPin;
  };

  // Handle PIN digit input
  const handlePinDigit = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setErrorMessage(""); // Clear error on new input

      // Auto-verify when 4 digits are entered
      if (newPin.length === 4) {
        if (requiresPinSetup) {
          handleSetupPinEntry(newPin);
        } else {
          handleVerifyPin(newPin);
        }
      }
    }
  };
  const completePinSetup = async (pinToSave: string) => {
    setIsSavingSetupPin(true);
    setErrorMessage("");
    try {
      await upsertUserSecurityPinSettings({
        pin: pinToSave,
        biometric: isBiometricEnabled,
      });
      setLocalPin(pinToSave);
      refreshPinStatus();
      removeItem(STORAGE_KEYS.APP_LOCK_PIN_SETUP_PROMPT_AT);
      setSetupPinFirstEntry("");
      setPin("");
      if (paymentVerificationRequest) {
        paymentVerificationRequest.onVerified();
      }
      clearPaymentVerification();
    } catch {
      setErrorMessage("Failed to save PIN. Please try again.");
      setPin("");
      setSetupPinFirstEntry("");
    } finally {
      setIsSavingSetupPin(false);
    }
  };

  const handleSetupPinEntry = async (enteredPin: string) => {
    if (!setupPinFirstEntry) {
      setSetupPinFirstEntry(enteredPin);
      setPin("");
      setErrorMessage("");
      return;
    }

    if (enteredPin !== setupPinFirstEntry) {
      setErrorMessage("PINs do not match. Try again.");
      setPin("");
      setSetupPinFirstEntry("");
      return;
    }

    await completePinSetup(enteredPin);
  };


  // Handle backspace
  const handlePinBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMessage(""); // Clear error on backspace
  };

  // Verify PIN and unlock app
  const handleVerifyPin = async (pinToVerify?: string) => {
    const pinToCheck = pinToVerify || pin;
    if (pinToCheck.length < 4) return;

    setIsVerifyingPin(true);
    setErrorMessage("");

    try {
      const isValid = verifyPin(pinToCheck);
      if (isValid) {
        setPin("");
        setErrorMessage("");
        if (paymentMode && paymentVerificationRequest) {
          paymentVerificationRequest.onVerified();
          clearPaymentVerification();
        } else {
          resetBiometricFailures();
          unlockApp();
        }
      } else {
        // PIN is incorrect
        setErrorMessage("Invalid PIN. Please try again.");
        setPin("");
      }
    } catch (error) {
      setErrorMessage("Failed to verify PIN. Please try again.");
      setPin("");
    } finally {
      setIsVerifyingPin(false);
    }
  };

  // Handle show/hide PIN
  const handleShowAndHidePin = () => {
    setShowPin((prev) => !prev);
  };

  // Reset PIN and error when lock screen becomes visible
  useEffect(() => {
    if (isLocked) {
      setPin("");
      setErrorMessage("");
    }
  }, [isLocked]);

  // When overlay is visible and biometric enabled, show native biometric on top; success → unlock or payment callback, fail → after N show PIN
  const shouldRunBiometric =
    !requiresPinSetup &&
    ((shouldShowLock && isLocked && !showPinScreen && isBiometricEnabled) ||
      (paymentMode && isBiometricEnabled && !paymentShowPin));

  // Re-show native biometric modal when app returns to foreground (e.g. after phone lock dismissed the dialog)
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (nextAppState !== "active") return;
        const shouldRun =
          !requiresPinSetup &&
          ((shouldShowLock &&
            isLocked &&
            !showPinScreen &&
            isBiometricEnabled) ||
            (paymentMode && isBiometricEnabled && !paymentShowPin));
        if (shouldRun) setBiometricRetriggerKey((k) => k + 1);
      }
    );
    return () => subscription.remove();
  }, [
    shouldShowLock,
    isLocked,
    showPinScreen,
    isBiometricEnabled,
    paymentMode,
    paymentShowPin,
    requiresPinSetup,
  ]);

  useEffect(() => {
    if (!shouldRunBiometric) return;

    let cancelled = false;

    const runBiometric = async () => {
      setIsBiometricRunning(true);
      try {
        const result: BiometricAuthResult =
          await authenticateWithBiometricDetailed(
            paymentMode ? "Verify to continue" : "Unlock PayAiro",
            { cancelLabel: "Use PIN" }
          );
        if (cancelled) return;
        if (result.success) {
          biometricFailureCount.current = 0;
          if (paymentMode && paymentVerificationRequest) {
            paymentVerificationRequest.onVerified();
            clearPaymentVerification();
          } else {
            unlockApp();
          }
        } else {
          const userChosePin =
            result.errorCode === "USER_CANCELED" ||
            result.errorCode === "ERROR_NEGATIVE_BUTTON";
          const systemCanceled =
            result.errorCode === "SYSTEM_CANCELED" ||
            result.errorCode === "ERROR_CANCELED";
          if (userChosePin) {
            if (paymentMode) setPaymentShowPin(true);
            else requestShowPinScreen();
          } else if (systemCanceled) {
            // Dialog was dismissed by system (e.g. phone locked); don't count as failure. AppState listener will re-trigger when user returns.
          } else {
            biometricFailureCount.current += 1;
            if (
              biometricFailureCount.current >=
              LOCK_CONFIG.MAX_BIOMETRIC_FAILURES_BEFORE_PIN
            ) {
              if (paymentMode) setPaymentShowPin(true);
              else requestShowPinScreen();
            }
          }
        }
      } finally {
        setIsBiometricRunning(false);
      }
    };

    runBiometric();
    return () => {
      cancelled = true;
    };
  }, [
    shouldRunBiometric,
    biometricRetriggerKey,
    paymentMode,
    paymentShowPin,
    paymentVerificationRequest,
    clearPaymentVerification,
    unlockApp,
    requestShowPinScreen,
  ]);

  useEffect(() => {
    if (!isLocked && !paymentMode) biometricFailureCount.current = 0;
  }, [isLocked, paymentMode]);

  useEffect(() => {
    if (paymentMode) {
      setPaymentShowPin(false);
      setPin("");
      setErrorMessage("");
      setSetupPinFirstEntry("");
    }
  }, [paymentMode]);

  // Block Android hardware back button when in app lock mode (allow cancel in payment mode)
  useEffect(() => {
    if (isLocked && shouldShowLock && !paymentMode) {
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        () => true
      );
      return () => backHandler.remove();
    }
  }, [isLocked, shouldShowLock, paymentMode]);

  const showModal = (shouldShowLock && isLocked) || paymentMode;
  if (!showModal) return null;

  return (
    <SafeAreaView edges={[]} style={styles.modalContainer}>
      <Modal
        animationType="fade"
        transparent={false}
        visible={showModal}
        onRequestClose={() => {
          if (paymentMode) clearPaymentVerification();
        }}
        style={{ flex: 1 }}
        presentationStyle="fullScreen"
      >
        {!isBiometricRunning && (
          <View
            style={[
              {
                flexDirection: "row",
                width: "100%",
                // backgroundColor: theme.colors.palette.green700,
                // paddingVertical: 15,
                paddingHorizontal: 5,
                justifyContent: "space-between",
                alignItems: "center",
              },
            ]}
          >
            <View style={styles.header}>
              {paymentMode ? (
                <AppIcon.ArrowLeft
                  width={25}
                  height={25}
                  onPress={() => clearPaymentVerification()}
                />
              ) : null}
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginRight: 40, }}>
                <CustomText variant='h1' fontWeight='bold' size={20}>M-PIN</CustomText>
              </View>
            </View>
          </View>
        )}

        {isBiometricRunning ? (
          <View style={styles.biometricOverlay} />
        ) : (
          <View style={styles.mainContent}>
            <View style={styles.pinEntryContainer}>
              <View style={styles.pinEntryLabelRow}>
                <CustomText variant='caption' fontWeight='light' size={14} style={{ marginRight: 10 }}>
                  {requiresPinSetup
                    ? setupPinFirstEntry
                      ? "Confirm your new M-PIN"
                      : "Create your new M-PIN"
                    : "Confirm your M-PIN"}
                </CustomText>
                {showPin ? (
                  <SvgIcons.EyeOnGreenbg onPress={handleShowAndHidePin} width={22} height={22} />
                ) : (
                  <SvgIcons.EyeOffGreenbg onPress={handleShowAndHidePin} width={22} height={22} />
                )}

              </View>

              <View style={styles.pinDotContainer}>
                {[0, 1, 2, 3].map((index) => (
                  <View key={index} style={styles.pinDotWrapper}>
                    <Text
                      style={[
                        styles.pinDot,
                        { opacity: pin.length > index ? 1 : 0 },
                      ]}
                    >
                      {showPin && pin[index] ? pin[index] : "*"}
                    </Text>
                    <View
                      style={[
                        styles.pinUnderline,
                        {
                          backgroundColor:
                            pin.length > index
                              ? theme.colors.palette.green700
                              : "#CCCCCC",
                        },
                      ]}
                    />
                  </View>
                ))}
              </View>

              {/* Error Message Display */}
              {errorMessage && (
                <View style={styles.errorContainer}>
                  <SvgIcons.ToastCross width={16} height={16} fill="#C92A2A" />
                  <CustomText style={styles.errorText}>{errorMessage}</CustomText>
                </View>
              )}

              {isVerifyingPin || isSavingSetupPin ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.palette.green700}
                  />
                </View>
              ) : null}

              {!paymentMode && !requiresPinSetup && (
                <TouchableOpacity
                  style={styles.forgotPinContainer}
                  onPress={() => {
                    unlockApp();
                    setTimeout(() => {
                      navigation.navigate(NAVIGATION_SCREENS.FORGOT_PIN_SCREEN);
                    }, 100);
                  }}
                  activeOpacity={0.7}
                >
                  <CustomText style={styles.forgotPinText}>Forgot PIN?</CustomText>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.keypadContainer}>
              {[
                ["1", "2", "3"],
                ["4", "5", "6"],
                ["7", "8", "9"],
              ].map((row, i) => (
                <View key={i} style={styles.keypadRow}>
                  {row.map((num) => (
                    <TouchableOpacity
                      key={num}
                      style={styles.keypadButton}
                      onPress={() => handlePinDigit(num)}
                      disabled={isVerifyingPin || isSavingSetupPin}
                    >
                      <Text style={styles.keypadNumber}>{num}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}

              <View style={[styles.keypadRow,]}>
                <TouchableOpacity
                  style={[styles.keypadButton, { marginLeft: 125 }]}
                  onPress={() => handlePinDigit("0")}
                  disabled={isVerifyingPin || isSavingSetupPin}
                >
                  <Text style={styles.keypadNumber}>0</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.keypadButton, { marginRight: 5 }]}
                  onPress={handlePinBackspace}
                  disabled={isVerifyingPin || isSavingSetupPin}
                >
                  <SvgIcons.KeyboardBack width={30} height={30} />
                </TouchableOpacity>

              </View>
              <View style={styles.actionButtonWrapper}>
                {/* <TouchableOpacity
                  style={(styles as any).actionButton(pin.length === 4)}
                  onPress={() => handleVerifyPin()}
                  disabled={pin.length !== 4 || isVerifyingPin}
                >
                  {isVerifyingPin ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <SvgIcons.DoneIcon width={35} height={35} />
                  )}
                </TouchableOpacity> */}
                <Button
                onPress={() =>
                  requiresPinSetup ? handleSetupPinEntry(pin) : handleVerifyPin()
                }
                disabled={pin.length !== 4 || isVerifyingPin || isSavingSetupPin}
                loading={isVerifyingPin || isSavingSetupPin}
                >
                  {requiresPinSetup ? "Save PIN" : "Confirm"}
                </Button>
              </View>
            </View>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
};

export default AppLockScreen;

const customStyles = (theme: Theme) =>
  StyleSheet.create({
    modalContainer: {
      backgroundColor: "#FFFFFF",
    },
    biometricOverlay: {
      flex: 1,
      backgroundColor: "#FFFFFF",
    },
    header: {
      flex: 1,
      // backgroundColor: theme.colors.palette.green700,
      paddingVertical: 5,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginLeft: 10,
      marginTop: 60,
    },
    appTitle: {
      color: "#FFFFFF",
      fontSize: 16,
      fontFamily: theme.typography.fontFamily.montserratBold,
    },
    subtitleText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontFamily: theme.typography.fontFamily.montserrat,
      marginTop: 3,
    },
    mainContent: {
      flex: 1,
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: 20,
    },
    pinEntryContainer: {
      alignItems: "center",
      width: "100%",
      paddingTop: 60,
      paddingHorizontal: 30,
    },
    pinEntryLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 50,
    },
    pinEntryText: {
      fontSize: 16,
      color: theme.colors.palette.green700,
      fontFamily: theme.typography.fontFamily.nexaHeavy,
      marginRight: 10,
    },
    showText: {
      fontSize: 14,
      color: theme.colors.palette.green700,
      fontFamily: theme.typography.fontFamily.nexaHeavy,
      fontWeight: "400",
      marginLeft: 5,
    },
    pinDotContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "80%",
      marginBottom: 20,
    },
    pinDotWrapper: {
      width: "22%",
      height: 35,
      alignItems: "center",
      justifyContent: "flex-end",
    },
    pinDot: {
      fontSize: 40,
      position: "absolute",
      color: theme.colors.palette.green700,
      top: -15,
      fontFamily: Fonts.bold,
    },
    pinUnderline: {
      position: "absolute",
      bottom: 0,
      width: "100%",
      height: 2,
    },
    errorContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#FFEBEB",
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 8,
      marginTop: 0,
      gap: 8,
    },
    errorText: {
      color: "#C92A2A",
      fontSize: 14,
      fontFamily: theme.typography.fontFamily.montserratSemiBold,
    },
    loadingContainer: {
      marginTop: 20,
    },
    forgotPinContainer: {
      marginTop: 20,
      paddingVertical: 10,
    },
    forgotPinText: {
      fontSize: 14,
      color: theme.colors.palette.green700,
      fontFamily: theme.typography.fontFamily.montserratSemiBold,
      textDecorationLine: "underline",
    },
    keypadContainer: {
      width: "90%",
      // backgroundColor: "#F8F8F8",
      borderRadius: 10,
      paddingVertical: 20,
      paddingHorizontal: 20,
    },
    keypadRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    keypadButton: {
      width: 70,
      height: 70,
      justifyContent: "center",
      alignItems: "center",
    },
    keypadNumber: {
      fontSize: 30,
      color: '#6A6A6A',
      fontWeight: '400',
      // fontFamily: Fonts.bold,
    },
    actionButtonWrapper: {
      height: 70,
      borderRadius: 35,
      justifyContent: "center",
      alignItems: "center",
    },
    actionButton: (enabled: any) => ({
      width: 60,
      height: 60,
      backgroundColor: enabled
        ? theme.colors.palette.green700
        : theme.colors.palette.green400,
      borderRadius: 35,
      justifyContent: "center",
      alignItems: "center",
    }),
  } as any);

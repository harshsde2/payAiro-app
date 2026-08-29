import Fonts from "constants/Fonts";
import React, { useState, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  AppState,
  type AppStateStatus,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  BackHandler,
} from "react-native";
import { Theme, useTheme } from "styles";
import { useTheme as useNewUITheme } from "@new-ui/styles/ThemeContext";
import type { ITheme } from "@new-ui/styles/themes/themeTypes";
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
import { afterModalTransition } from "utils/afterModalTransition";
import { AppIcon } from "@new-ui/assets/svgs";
import { Button } from "new-ui/components/common-components/layout";
import { useUpsertUserSecurityPinSettings } from "query/hooks";

const AppLockScreen: React.FC = () => {
  const { theme } = useTheme();
  // Legacy theme is kept only for typography; all colours come from the new-ui theme so the
  // lock screen follows Appearance like the rest of the app.
  const { theme: newUITheme } = useNewUITheme();
  const styles = customStyles(theme, newUITheme);
  const navigation = useNavigation<any>();
  const {
    isLocked,
    unlockApp,
    shouldShowLock,
    isBiometricEnabled,
    isTransactionBiometricEnabled,
    showPinScreen,
    requestShowPinScreen,
    resetBiometricFailures,
    paymentVerificationRequest,
    clearPaymentVerification,
    refreshPinStatus,
    setNativeModalVisible,
  } = useAppLock();
  const { mutateAsync: upsertUserSecurityPinSettings } =
    useUpsertUserSecurityPinSettings();

  const biometricFailureCount = useRef(0);
  const paymentMode = !!paymentVerificationRequest;
  const requiresPinSetup = paymentVerificationRequest?.requirePinSetup === true;

  // The caller's onVerified() usually navigates to TRANSACTION_RESULT, which is a NATIVE modal
  // (presentation: "modal"). On iOS, presenting that while THIS full-screen <Modal> is still
  // on screen races UIKit and leaves a stuck black transition view. So on iOS we dismiss this
  // modal first and run onVerified from the Modal's onDismiss, once it has fully torn down.
  //
  // For onDismiss to fire at all, this component must stay MOUNTED and the modal dismissed via
  // `visible={false}` — see the render below. Returning null here (as this used to) unmounts
  // RCTModalHostView mid-transition, iOS drops the dismissal callback, and the whole thing
  // degrades to a fixed timer that only wins the race on fast devices.
  const pendingVerifiedRef = useRef<(() => void) | null>(null);
  const flushFallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelDeferredFlushRef = useRef<(() => void) | null>(null);
  /**
   * Guards against onVerified() running twice for one payment. Face ID's own dismissal
   * emits inactive→active, which can re-trigger the biometric effect before
   * clearPaymentVerification() has flushed through React state — a second prompt, a second
   * success, and a second transaction for the same tap.
   */
  const verifiedOnceRef = useRef(false);
  /** True while a native biometric dialog is on screen, so we never stack two. */
  const promptInFlightRef = useRef(false);
  /** True while a PIN verification is resolving, so keypad + Confirm can't both fire. */
  const pinVerifyInFlightRef = useRef(false);

  const flushPendingVerified = () => {
    if (flushFallbackRef.current) {
      clearTimeout(flushFallbackRef.current);
      flushFallbackRef.current = null;
    }
    const cb = pendingVerifiedRef.current;
    pendingVerifiedRef.current = null;
    if (!cb) return;
    // Let the dismissal animation drain before presenting the next native modal.
    cancelDeferredFlushRef.current = afterModalTransition(cb);
  };

  const finishPaymentVerified = (onVerified: () => void) => {
    if (verifiedOnceRef.current) return;
    verifiedOnceRef.current = true;

    if (Platform.OS === "ios") {
      pendingVerifiedRef.current = onVerified;
      clearPaymentVerification();
      // Safety net only — onDismiss is the real trigger. Generous, because firing this
      // early is what caused the black screen; firing it late costs nothing.
      flushFallbackRef.current = setTimeout(flushPendingVerified, 1500);
    } else {
      // Android has no onDismiss for RN Modal, and no UIKit presentation conflict.
      onVerified();
      clearPaymentVerification();
    }
  };

  useEffect(
    () => () => {
      if (flushFallbackRef.current) clearTimeout(flushFallbackRef.current);
      cancelDeferredFlushRef.current?.();
    },
    []
  );
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
        finishPaymentVerified(paymentVerificationRequest.onVerified);
      } else {
        clearPaymentVerification();
      }
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
    // The keypad auto-verifies on the 4th digit AND the Confirm button calls this, so a
    // fast tap can enter twice before `isVerifyingPin` has re-rendered the disabled prop.
    if (pinVerifyInFlightRef.current) return;
    pinVerifyInFlightRef.current = true;

    setIsVerifyingPin(true);
    setErrorMessage("");

    try {
      const isValid = verifyPin(pinToCheck);
      if (isValid) {
        setPin("");
        setErrorMessage("");
        if (paymentMode && paymentVerificationRequest) {
          finishPaymentVerified(paymentVerificationRequest.onVerified);
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
      pinVerifyInFlightRef.current = false;
      setIsVerifyingPin(false);
    }
  };

  // Handle show/hide PIN
  const handleShowAndHidePin = () => {
    setShowPin((prev) => !prev);
  };

  /** "Use Biometric" on the payment keypad — go back to the prompt after a failed scan or a
   *  "Use PIN" tap. Clearing `paymentShowPin` flips `shouldRunBiometric` back on, and the
   *  biometric effect (which lists both in its deps) re-fires on its own. */
  const handleRetryBiometric = () => {
    biometricFailureCount.current = 0;
    setPin("");
    setErrorMessage("");
    setPaymentShowPin(false);
  };

  // Reset PIN and error when lock screen becomes visible
  useEffect(() => {
    if (isLocked) {
      // Arm the single-fire guard for this lock, and clear the biometric overlay. The
      // overlay is deliberately left up on a successful unlock (so the keypad doesn't
      // flash during dismissal), so without this reset a later lock with biometrics
      // switched off would render a blank white sheet over the PIN keypad.
      verifiedOnceRef.current = false;
      setIsBiometricRunning(false);
      setPin("");
      setErrorMessage("");
    }
  }, [isLocked]);

  // When overlay is visible and biometric enabled, show native biometric on top; success → unlock or payment callback, fail → after N show PIN.
  // The two rails read DIFFERENT preferences: app unlock uses `isBiometricEnabled`
  // (Biometric App Lock), payments use `isTransactionBiometricEnabled` (Biometric for
  // Transactions). They are independent — one being on says nothing about the other.
  const shouldRunBiometric =
    !requiresPinSetup &&
    ((shouldShowLock && isLocked && !showPinScreen && isBiometricEnabled) ||
      (paymentMode && isTransactionBiometricEnabled && !paymentShowPin));

  // Re-show native biometric modal when app returns to foreground (e.g. after phone lock dismissed the dialog)
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (nextAppState !== "active") return;
        // A successful Face ID dismissal ITSELF emits inactive→active. Re-arming here
        // while this verification is already resolving would present a second prompt on
        // top of a modal that is tearing down, and a second success would fire
        // onVerified again — the same tap booked twice. Only re-arm when nothing is
        // pending: no prompt on screen, nothing verified, nothing waiting to flush.
        if (
          promptInFlightRef.current ||
          verifiedOnceRef.current ||
          pendingVerifiedRef.current
        ) {
          return;
        }
        const shouldRun =
          !requiresPinSetup &&
          ((shouldShowLock &&
            isLocked &&
            !showPinScreen &&
            isBiometricEnabled) ||
            (paymentMode && isTransactionBiometricEnabled && !paymentShowPin));
        if (shouldRun) setBiometricRetriggerKey((k) => k + 1);
      }
    );
    return () => subscription.remove();
  }, [
    shouldShowLock,
    isLocked,
    showPinScreen,
    isBiometricEnabled,
    isTransactionBiometricEnabled,
    paymentMode,
    paymentShowPin,
    requiresPinSetup,
  ]);

  useEffect(() => {
    if (!shouldRunBiometric) return;
    // One LAContext prompt at a time. This effect's deps include state that can change
    // while the prompt is open, and a re-run would stack a second system dialog.
    if (promptInFlightRef.current) return;

    let cancelled = false;

    const runBiometric = async () => {
      promptInFlightRef.current = true;
      setIsBiometricRunning(true);
      // Mark the native biometric dialog as a native modal: on Android the system
      // BiometricPrompt backgrounds the activity, and without this flag that trip
      // would arm the app lock and re-lock right after a successful unlock
      // (an infinite prompt loop with the "Instant" auto-lock timing).
      setNativeModalVisible(true);
      let succeeded = false;
      try {
        const result: BiometricAuthResult =
          await authenticateWithBiometricDetailed(
            paymentMode ? "Verify to continue" : "Unlock PayAiro",
            { cancelLabel: "Use PIN" }
          );
        if (cancelled) return;
        if (result.success) {
          succeeded = true;
          biometricFailureCount.current = 0;
          if (paymentMode && paymentVerificationRequest) {
            finishPaymentVerified(paymentVerificationRequest.onVerified);
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
          // Preference is on but the device can't satisfy it (biometrics removed or never
          // enrolled since). Retrying can't help, so drop to the PIN immediately instead of
          // burning three identical prompts on the user.
          const code = (result.errorCode || "").toLowerCase();
          const message = (result.error || "").toLowerCase();
          const biometricUnusable =
            code.includes("not_enrolled") ||
            code.includes("noneenrolled") ||
            code.includes("biometrynotenrolled") ||
            code.includes("not_available") ||
            code.includes("notavailable") ||
            message.includes("not enrolled") ||
            message.includes("no biometric");
          if (userChosePin || biometricUnusable) {
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
        promptInFlightRef.current = false;
        // On success the modal is already dismissing — dropping the white overlay here
        // would flash the full PIN keypad for a frame on the way out. Keep it until the
        // modal is gone; the reset below handles the next verification.
        if (!succeeded) setIsBiometricRunning(false);
        // Delay reset: dialog dismissal can emit several AppState transitions
        // (active -> inactive -> active); keep suppression up until they settle.
        setTimeout(() => setNativeModalVisible(false), 800);
      }
    };

    runBiometric();
    return () => {
      cancelled = true;
    };
  }, [
    shouldRunBiometric,
    biometricRetriggerKey,
    isTransactionBiometricEnabled,
    paymentMode,
    paymentShowPin,
    paymentVerificationRequest,
    clearPaymentVerification,
    unlockApp,
    requestShowPinScreen,
    setNativeModalVisible,
  ]);

  useEffect(() => {
    if (!isLocked && !paymentMode) biometricFailureCount.current = 0;
  }, [isLocked, paymentMode]);

  useEffect(() => {
    if (paymentMode) {
      // A NEW verification request — arm the single-fire guard for it. (Only ever reset
      // here, so the guard stays closed for the whole lifetime of one request.)
      verifiedOnceRef.current = false;
      setPaymentShowPin(false);
      setIsBiometricRunning(false);
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

  // NOTE: no `if (!showModal) return null` here, and that is load-bearing. The <Modal>
  // must stay mounted and be dismissed by flipping `visible` to false — unmounting
  // RCTModalHostView mid-transition makes iOS drop `onDismiss`, which is the signal we
  // use to know it is safe to present the next native modal. Children are gated on
  // `showModal` so nothing renders while hidden.
  return (
    <Modal
      animationType="fade"
      transparent={false}
      visible={showModal}
      onRequestClose={() => {
        if (paymentMode) clearPaymentVerification();
      }}
      // iOS: fires after the modal has fully dismissed — run the deferred onVerified() here so
      // navigating to the TRANSACTION_RESULT native modal doesn't race this one (black screen).
      onDismiss={flushPendingVerified}
      style={{ flex: 1 }}
      // overFullScreen, NOT fullScreen. With fullScreen, UIKit detaches the presenting
      // view controller's view once this modal is up, so during the fade-out there is
      // nothing behind us but the UIWindow — and Fabric's modal host VC has a
      // transparent view of its own, so animating its alpha exposes that window. That
      // was the black flash after Face ID. overFullScreen keeps the screen underneath
      // attached and already drawn, so the fade reveals it instead of the window.
      presentationStyle="overFullScreen"
    >
      <SafeAreaView edges={[]} style={styles.modalContainer}>
        {showModal && !isBiometricRunning && (
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
            color={newUITheme.colors.text}
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

        {!showModal || isBiometricRunning ? (
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
                              ? newUITheme.colors.primary
                              : newUITheme.colors.greyLight2,
                        },
                      ]}
                    />
                  </View>
                ))}
              </View>

              {/* Error Message Display */}
              {errorMessage && (
                <View style={styles.errorContainer}>
                  <SvgIcons.ToastCross width={16} height={16} fill={newUITheme.colors.error} />
                  <CustomText style={styles.errorText}>{errorMessage}</CustomText>
                </View>
              )}

              {isVerifyingPin || isSavingSetupPin ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator
                    size="small"
                    color={newUITheme.colors.primary}
                  />
                </View>
              ) : null}

              {!paymentMode && !requiresPinSetup && (
                <TouchableOpacity
                  style={styles.forgotPinContainer}
                  onPress={() => {
                    unlockApp();
                    setTimeout(() => {
                      navigation.navigate(NAVIGATION_SCREENS.NEW_FORGOT_PIN_SCREEN);
                    }, 100);
                  }}
                  activeOpacity={0.7}
                >
                  <CustomText style={styles.forgotPinText}>Forgot PIN?</CustomText>
                </TouchableOpacity>
              )}

              {/* Same slot as "Forgot PIN?" (which is hidden in payment mode): a way back to
                  the scan after one bad read, so a single failure doesn't force the keypad.
                  Device-neutral label — Android is a fingerprint, not Face ID. */}
              {paymentMode &&
                !requiresPinSetup &&
                paymentShowPin &&
                isTransactionBiometricEnabled && (
                  <TouchableOpacity
                    style={styles.forgotPinContainer}
                    onPress={handleRetryBiometric}
                    activeOpacity={0.7}
                    disabled={isVerifyingPin}
                  >
                    <CustomText style={styles.forgotPinText}>Use Biometric</CustomText>
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

              <View style={styles.keypadRow}>
                {/* Empty first cell so "0" lands in the same column as 2/5/8 and the
                    backspace under 3/6/9 — at any screen width. This row previously used a
                    hardcoded marginLeft, which only lined up on one device size. */}
                <View style={styles.keypadButton} />
                <TouchableOpacity
                  style={styles.keypadButton}
                  onPress={() => handlePinDigit("0")}
                  disabled={isVerifyingPin || isSavingSetupPin}
                >
                  <Text style={styles.keypadNumber}>0</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.keypadButton}
                  onPress={handlePinBackspace}
                  disabled={isVerifyingPin || isSavingSetupPin}
                >
                  <SvgIcons.KeyboardBack width={30} height={30} color={newUITheme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <View style={styles.actionButtonWrapper}>
                {/* <TouchableOpacity
                  style={(styles as any).actionButton(pin.length === 4)}
                  onPress={() => handleVerifyPin()}
                  disabled={pin.length !== 4 || isVerifyingPin}
                >
                  {isVerifyingPin ? (
                    <ActivityIndicator color={newUITheme.colors.onPrimary} size="small" />
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
      </SafeAreaView>
    </Modal>
  );
};

export default AppLockScreen;

const customStyles = (theme: Theme, ui: ITheme) =>
  StyleSheet.create({
    modalContainer: {
      // Root inside the Modal now, so it must fill it — otherwise the PIN keypad
      // collapses to zero height and the modal renders as a blank sheet.
      flex: 1,
      backgroundColor: ui.colors.background,
    },
    biometricOverlay: {
      flex: 1,
      backgroundColor: ui.colors.background,
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
      color: ui.colors.primary,
      fontFamily: theme.typography.fontFamily.nexaHeavy,
      marginRight: 10,
    },
    showText: {
      fontSize: 14,
      color: ui.colors.primary,
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
      color: ui.colors.primary,
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
      backgroundColor: ui.colors.errorSurface,
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 8,
      marginTop: 0,
      gap: 8,
    },
    errorText: {
      color: ui.colors.error,
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
      color: ui.colors.primary,
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
      color: ui.colors.textSecondary,
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
      // Disabled keeps the muted-green affordance; the light value is the original
      // #69BF82, with a dimmer green standing in for it on dark.
      backgroundColor: enabled
        ? ui.colors.primary
        : ui.isDark
          ? "#2A4A38"
          : "#69BF82",
      borderRadius: 35,
      justifyContent: "center",
      alignItems: "center",
    }),
  } as any);

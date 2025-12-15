import Fonts from "constants/Fonts";
import React, { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  AppState,
  AppStateStatus,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { Theme, useTheme } from "styles";
import { showError } from "utils/toast";
import { SvgIcons } from "constants/svgs";
import {
  getPin,
  getItem,
  setItem,
  removeItem,
  STORAGE_KEYS,
} from "storage/mmkv";
import CustomText from "tsx-components/CustomText";
import { SafeAreaView } from "react-native-safe-area-context";

const AppLockScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = customStyles(theme);
  const isLogin = useSelector(
    (state: any) => state.authenticationSlice?.isLogin
  );

  const [pin, setPin] = useState("");
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [isLockScreenVisible, setIsLockScreenVisible] = useState(false);
  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState
  );
  const lastBackgroundTimeRef = useRef<number | null>(null);
  const appStateSubscriptionRef = useRef<any>(null);
  const pinVerifiedInSessionRef = useRef<boolean>(false);

  // Check if PIN exists
  const hasPin = () => {
    const storedPin = getPin();
    console.log("storedPin =>", storedPin);
    return storedPin && storedPin.length > 0;
  };

  // Verify PIN
  const verifyPin = (enteredPin: string): boolean => {
    const correctPin = getPin();
    return enteredPin === correctPin;
  };

  // Handle PIN digit input
  const handlePinDigit = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);

      // Auto-verify when 4 digits are entered
      if (newPin.length === 4) {
        handleVerifyPin(newPin);
      }
    }
  };

  // Handle backspace
  const handlePinBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  // Verify PIN and unlock app
  const handleVerifyPin = async (pinToVerify?: string) => {
    const pinToCheck = pinToVerify || pin;
    if (pinToCheck.length < 4) return;

    setIsVerifyingPin(true);

    try {
      const isValid = verifyPin(pinToCheck);
      if (isValid) {
        // PIN is correct, unlock the app
        setPin("");
        setIsLockScreenVisible(false);
        lastBackgroundTimeRef.current = null;
        pinVerifiedInSessionRef.current = true;
        // Clear the app background flag since PIN is verified
        removeItem(STORAGE_KEYS.APP_BACKGROUND_FLAG);
      } else {
        // PIN is incorrect
        showError("Invalid PIN. Please try again");
        setPin("");
      }
    } catch (error) {
      showError("Failed to verify PIN. Please try again.");
      setPin("");
    } finally {
      setIsVerifyingPin(false);
    }
  };

  // Handle show/hide PIN
  const handleShowAndHidePin = () => {
    setShowPin((prev) => !prev);
  };

  // Monitor app state changes
  useEffect(() => {
    console.log("appState =>", appState);
    console.log("isLogin =>", isLogin);
    console.log("hasPin =>", hasPin());
    if (!isLogin || !hasPin()) {
      // Clear flag if user logs out or doesn't have PIN
      removeItem(STORAGE_KEYS.APP_BACKGROUND_FLAG);
      return;
    }

    // Check on mount if app was killed and reopened
    // Detection logic:
    // - If APP_BACKGROUND_FLAG doesn't exist: First time or was cleared (show PIN)
    // - If APP_BACKGROUND_FLAG exists BUT lastBackgroundTimeRef is null: App was killed (refs don't persist, MMKV does)
    // - If both exist: App was just backgrounded (normal resume, handled by foreground event)
    // Only show if PIN hasn't been verified in this session yet
    if (!pinVerifiedInSessionRef.current && appState === "active") {
      const appBackgroundFlag = getItem(STORAGE_KEYS.APP_BACKGROUND_FLAG);
      const wasAppKilled = appBackgroundFlag && lastBackgroundTimeRef.current === null;
      const isFirstOpen = !appBackgroundFlag;
      
      if (wasAppKilled || isFirstOpen) {
        // App was killed and reopened or first opened - show PIN lock immediately
        setIsLockScreenVisible(true);
        setPin("");
      }
    }

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      // App is going to background
      if (
        appState.match(/active/) &&
        nextAppState.match(/inactive|background/)
      ) {
        lastBackgroundTimeRef.current = new Date().getTime();
        // Set flag to indicate app was backgrounded (not killed)
        setItem(
          STORAGE_KEYS.APP_BACKGROUND_FLAG,
          new Date().getTime().toString()
        );
      }

      // App is coming to foreground
      if (appState.match(/inactive|background/) && nextAppState === "active") {
        // Show lock screen when app comes to foreground (app was minimized/closed)
        // Only if we have a background time (app was backgrounded, not killed)
        if (lastBackgroundTimeRef.current !== null) {
          setIsLockScreenVisible(true);
          setPin("");
        }
      }

      setAppState(nextAppState);
    };

    // Subscribe to app state changes
    appStateSubscriptionRef.current = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    // Check initial state - if app is already active and we have a background time, show lock
    if (appState === "active" && lastBackgroundTimeRef.current !== null) {
      setIsLockScreenVisible(true);
    }

    return () => {
      if (appStateSubscriptionRef.current) {
        appStateSubscriptionRef.current.remove();
      }
    };
  }, [appState, isLogin]);

  // Don't render if user is not logged in or doesn't have PIN
  if (!isLogin || !hasPin()) {
    return null;
  }

  return (
    <SafeAreaView
      edges={[]}
      style={styles.modalContainer}
    >
      <Modal
        animationType="fade"
        transparent={false}
        visible={isLockScreenVisible}
        onRequestClose={() => {
          // Prevent closing without PIN
        }}
        style={{flex:1}}
        presentationStyle="fullScreen"
      >
        <View
          style={[
            {
              flexDirection: "row",
              width: "100%",
              backgroundColor: theme.colors.palette.green700,
              paddingVertical: 5,
              paddingHorizontal: 10,
              justifyContent: "space-between",
              alignItems: "center",
            },
          ]}
        >
          <View style={styles.header}>
            <View>
              <CustomText style={styles.appTitle}>PayAiro App</CustomText>
              <CustomText style={styles.subtitleText}>
                Enter PIN to continue
              </CustomText>
            </View>
            <SvgIcons.PayairoWhiteLogo width={40} height={40} />
          </View>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.pinEntryContainer}>
            <View style={styles.pinEntryLabelRow}>
              <CustomText style={styles.pinEntryText}>
                ENTER PAYAIRO PIN
              </CustomText>
              {!showPin ? (
                <SvgIcons.EyeOnGreenbg width={22} height={22} />
              ) : (
                <SvgIcons.EyeOffGreenbg width={22} height={22} />
              )}
              <CustomText
                onPress={handleShowAndHidePin}
                style={styles.showText}
              >
                SHOW
              </CustomText>
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
                  >
                    <Text style={styles.keypadNumber}>{num}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}

            <View style={styles.keypadRow}>
              <TouchableOpacity
                style={styles.keypadButton}
                onPress={handlePinBackspace}
              >
                <SvgIcons.KeyboardBack width={35} height={35} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.keypadButton}
                onPress={() => handlePinDigit("0")}
              >
                <Text style={styles.keypadNumber}>0</Text>
              </TouchableOpacity>

              <View style={styles.actionButtonWrapper}>
                <TouchableOpacity
                  style={(styles as any).actionButton(pin.length === 4)}
                  onPress={() => handleVerifyPin()}
                  disabled={pin.length !== 4 || isVerifyingPin}
                >
                  {isVerifyingPin ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <SvgIcons.DoneIcon width={35} height={35} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
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
    header: {
      flex: 1,
      backgroundColor: theme.colors.palette.green700,
      paddingVertical: 5,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginLeft: 10,
      marginTop: 40,
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
    keypadContainer: {
      width: "90%",
      backgroundColor: "#F8F8F8",
      borderRadius: 10,
      paddingVertical: 20,
      paddingHorizontal: 20,
    },
    keypadRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 30,
    },
    keypadButton: {
      width: 70,
      height: 70,
      justifyContent: "center",
      alignItems: "center",
    },
    keypadNumber: {
      fontSize: 30,
      color: theme.colors.palette.green700,
      fontFamily: Fonts.bold,
    },
    actionButtonWrapper: {
      width: 70,
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

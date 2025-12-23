import Fonts from "constants/Fonts";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useApiCall } from "screens/Dashboard/NewDashboard";
import { getBalance } from "services/Services";
import { Theme, useTheme } from "styles";
import { PinScreenProps, PinScreenRef } from "./modal.types";
// import { getPin, setPin } from "services/Auth";
import { showError } from "../../utils/toast";
import { SvgIcons } from "constants/svgs";
import { getPin } from "storage/mmkv";
import CustomText from "tsx-components/CustomText";
import Toast from "../../components/common-components/Toast";

const PIN_SCREEN_TASKS = {
  SHOW_BANK_BALANCE: "show_bank_balance",
  CHECK_PIN: "check_pin",
  SET_USER_PIN: "set_user_pin",
};

const PinScreen = forwardRef<PinScreenRef, PinScreenProps>(
  ({ hiddenBalances, setHiddenBalances, onAction, accountNumber }, ref) => {
    const { theme } = useTheme();
    const styles = customStyles(theme);
    const { tokens } = useSelector(
      (state: any) => state.authenticationSlice
    );

    const bankBalanceApi = useApiCall(getBalance);

    const [currentAccountForPin, setCurrentAccountForPin] = useState<
      string | null
    >(accountNumber || "");

    const [pinForShowBalance, setPinForShowBalance] = useState("");
    const [isVerifyingPin, setIsVerifyingPin] = useState(false);
    const [showPin, setShowPin] = useState(false);

    const [pinScreenTask, setPinScreenTask] = useState<string>(
      PIN_SCREEN_TASKS.SHOW_BANK_BALANCE
    );
    const [isPinModalVisible, setIsPinModalVisible] = useState(false);

    useImperativeHandle(ref, () => ({
      toggleBalanceVisibility: (accountId: string) => {
        setPinScreenTask(PIN_SCREEN_TASKS.SHOW_BANK_BALANCE);

        if (!hiddenBalances[accountId]) {
          setHiddenBalances((prev: any) => ({
            ...prev,
            [accountId]: true,
          }));
          return;
        }

        setCurrentAccountForPin(accountId);
        setPinForShowBalance("");
        setIsPinModalVisible(true);
      },
      checkUserPin: () => {
        setPinScreenTask(PIN_SCREEN_TASKS.CHECK_PIN);
        setPinForShowBalance("");
        setCurrentAccountForPin(accountNumber);
        setIsPinModalVisible(true);
      },
      setUserPin: () => {
        setPinScreenTask(PIN_SCREEN_TASKS.SET_USER_PIN);
        setPinForShowBalance("");
        setIsPinModalVisible(true);
      },
      onClose: () => {
        setIsPinModalVisible(false);
      },
    }));

    const handlePinDigit = (digit: string) => {
      if (pinForShowBalance.length < 4) {
        setPinForShowBalance((prev) => prev + digit);
      }
    };

    const handlePinBackspace = () => {
      setPinForShowBalance((prev) => prev.slice(0, -1));
    };

    const checkPin = (currentPin?: string) => {
      const correctPin = getPin();
      console.log("correctPin =>", correctPin);
      return currentPin == correctPin;
    };

    const verifyPinAndShowBalance = async () => {
      if (!currentAccountForPin || pinForShowBalance.length < 4) return;
      setIsVerifyingPin(true);

      try {
        const isUserEnterCorrectPin = checkPin(pinForShowBalance);
        // console.log(
        //   "isUserEnterCorrectPin =>",
        //   JSON.stringify(isUserEnterCorrectPin, null, 2)
        // );
        if (isUserEnterCorrectPin) {
          await bankBalanceApi.execute(tokens?.access, true);
          setHiddenBalances((prev: any) => ({
            ...prev,
            [currentAccountForPin]: false,
          }));
          setIsPinModalVisible(false);
          setCurrentAccountForPin(null);
          setPinForShowBalance("");
        } else {
          showError("Invalid PIN", "Please try again");
          setPinForShowBalance("");
        }
      } catch (error) {
        showError("Failed to verify PIN", "Please try again");
        setPinForShowBalance("");
      } finally {
        setIsVerifyingPin(false);
      }
    };

    const handleVerifyPin = async () => {
      if (pinForShowBalance.length < 4) return;
      setIsVerifyingPin(true);

      try {
        const isUserEnterCorrectPin = checkPin(pinForShowBalance);
        console.log(
          "isUserEnterCorrectPin =>",
          JSON.stringify(isUserEnterCorrectPin, null, 2)
        );
        if (isUserEnterCorrectPin) {
          setPinForShowBalance("");
          requestAnimationFrame(() => {
            onAction?.(null); // Triggers ResultModal
            setIsPinModalVisible(false);
          });
        } else {
          showError("Invalid PIN", "Please try again");
          setPinForShowBalance("");
        }
      } catch (error) {
        showError("Failed to verify PIN", "Please try again");
        setPinForShowBalance("");
      } finally {
        setIsVerifyingPin(false);
      }
    };

    const handleSetAndCreatePin = (pin: any) => {
      onAction?.(pin);
      setIsPinModalVisible(false);
    };

    const conditionalFunction = async (task: string) => {
      switch (task) {
        case PIN_SCREEN_TASKS.SHOW_BANK_BALANCE:
          return await verifyPinAndShowBalance();
        case PIN_SCREEN_TASKS.CHECK_PIN:
          return await handleVerifyPin();
        case PIN_SCREEN_TASKS.SET_USER_PIN:
          return handleSetAndCreatePin(pinForShowBalance);
      }
    };
    const handleShowAndHidePin = () => {
      setShowPin((prev) => !prev);
    };

    // console.log("errorMsg =>", errorMsg);

    return (
      <Modal
        animationType="fade"
        transparent
        visible={isPinModalVisible}
        onRequestClose={() => setIsPinModalVisible(false)}
      >
        <Toast />
        <SafeAreaView style={styles.modalContainer}>
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
            <SvgIcons.LeftArrow
              width={60}
              height={60}
              onPress={() => setIsPinModalVisible(false)}
            />
            <View style={styles.header}>
              <View>
                <CustomText style={styles.appTitle}>PayAiro App</CustomText>
                {currentAccountForPin && (
                  <CustomText style={styles.accountText}>
                    ****{currentAccountForPin.slice(-4)}
                  </CustomText>
                )}
              </View>
              <SvgIcons.PayairoWhiteLogo width={40} height={40} />
            </View>
          </View>

          <View style={styles.mainContent}>
            <View style={styles.pinEntryContainer}>
              <View style={styles.pinEntryLabelRow}>
                <CustomText style={styles.pinEntryText}>
                  {pinScreenTask === PIN_SCREEN_TASKS.SET_USER_PIN
                    ? "SET PAYAIRO PIN"
                    : "ENTER PAYAIRO PIN"}
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
                        { opacity: pinForShowBalance.length > index ? 1 : 0 },
                      ]}
                    >
                      {showPin && pinForShowBalance[index]
                        ? pinForShowBalance[index]
                        : "*"}
                    </Text>
                    <View
                      style={[
                        styles.pinUnderline,
                        {
                          backgroundColor:
                            pinForShowBalance.length > index
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
                    style={(styles as any).actionButton(
                      pinForShowBalance.length === 4
                    )}
                    onPress={() => conditionalFunction(pinScreenTask)}
                    disabled={pinForShowBalance.length !== 4 || isVerifyingPin}
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
        </SafeAreaView>
      </Modal>
    );
  }
);

export default PinScreen;

const customStyles = (theme: Theme) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: "#FFFFFF",
    },
    header: {
      flex: 1,
      backgroundColor: theme.colors.palette.green700,
      paddingVertical: 5,

      // paddingHorizontal: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginLeft: 10,
    },
    appTitle: {
      color: "#FFFFFF",
      fontSize: 16,
      fontFamily: theme.typography.fontFamily.montserratBold,
    },
    accountText: {
      color: "#FFFFFF",
      fontSize: 14,
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

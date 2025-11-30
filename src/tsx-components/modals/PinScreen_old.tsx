import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import React, { FC, forwardRef, useImperativeHandle, useState } from "react";
import { PinScreenProps, PinScreenRef } from "./modal.types";
import { Theme, useTheme } from "styles";
import { SvgXml } from "react-native-svg";
import {
  SVG_backspace,
  SVG_done,
  SVG_eye_on,
  SVGLoggo,
} from "constants/images";
import Fonts from "constants/Fonts";
import { useDispatch, useSelector } from "react-redux";
import { checkUser, getBalance } from "services/Services";
import { showError } from "../../utils/toast";
import { useApiCall } from "screens/Dashboard/NewDashboard";
import { getPin } from "services/Auth";
import ErrorToast from "components/ErrorToast";
import CustomText from "tsx-components/CustomText";

const PIN_SCREEN_TASKS = {
  SHOW_BANK_BALANCE: "show_bank_balance",
  CHECK_PIN: "check_pin",
};

const PinScreen = forwardRef<PinScreenRef, PinScreenProps>(
  (
    {
      // isPinModalVisible,
      // setIsPinModalVisible,
      hiddenBalances,
      setHiddenBalances,
      onAction,
      accountNumber,
    }: PinScreenProps,
    ref
  ) => {
    const { theme } = useTheme();

    const styles = customStyles(theme);
    // Get data from Redux store
    const { walletData, tokens, errorMsg, successMsg } = useSelector(
      (state: any) => state.authenticationSlice
    );

    // API call
    const bankBalanceApi = useApiCall(getBalance);

    const [currentAccountForPin, setCurrentAccountForPin] = useState<
      string | null
    >(accountNumber || "");
    const [pinForShowBalance, setPinForShowBalance] = useState("");
    const [isVerifyingPin, setIsVerifyingPin] = useState(false);
    const [pinScreenTask, setPinScreenTask] = useState<string>(
      PIN_SCREEN_TASKS.SHOW_BANK_BALANCE
    );
    const [isPinModalVisible, setIsPinModalVisible] = useState(false);

    // const [hiddenBalances, setHiddenBalances] = useState<Record<string, boolean>>({});

    // console.log("account number =>",accountNumber)

    // Expose the toggleCardSize function through the ref
    useImperativeHandle(ref, () => ({
      //For Verifing pin and show bank balance
      toggleBalanceVisibility: (accountId: string) => {
        // If balance is already visible, just hide it without PIN validation
        setPinScreenTask(PIN_SCREEN_TASKS.SHOW_BANK_BALANCE);

        if (!hiddenBalances[accountId]) {
          setHiddenBalances((prev: any) => ({
            ...prev,
            [accountId]: true,
          }));
          return;
        }

        // If balance is hidden, we need PIN verification to show it
        setCurrentAccountForPin(accountId);
        setPinForShowBalance("");
        setIsPinModalVisible(true);
      },
      // for check pin
      checkUserPin: () => {
        setPinScreenTask(PIN_SCREEN_TASKS.CHECK_PIN);
        setPinForShowBalance("");
        setCurrentAccountForPin(accountNumber);
        setIsPinModalVisible(true);
      },
    }));

    // Add these PIN input handlers
    const handlePinDigit = (digit: string) => {
      if (pinForShowBalance.length < 4) {
        setPinForShowBalance((prev) => prev + digit);
      }
    };

    const handlePinBackspace = () => {
      setPinForShowBalance((prev) => prev.slice(0, -1));
    };

    const checkPin = async (currentPin?: string) => {
      const correctPin = await getPin();
      return currentPin == correctPin;
    };

    // Verify PIN and show balance if correct
    const verifyPinAndShowBalance = async () => {
      if (!currentAccountForPin || pinForShowBalance.length < 4) return;
      setIsVerifyingPin(true);

      try {
        // console.log('step 3 pinForShowBalance', JSON.stringify(pinForShowBalance,null,2))

        const isUserEnterCorrectPin = await checkPin(pinForShowBalance);

        // console.log("step 3 pinForShowBalance =>",currentPin ," ",pinForShowBalance)
        if (isUserEnterCorrectPin) {
          // PIN is correct, refresh bank balance data
          await bankBalanceApi.execute(tokens?.access, true);

          // Update the visibility state for this specific account
          setHiddenBalances((prev: any) => ({
            ...prev,
            [currentAccountForPin]: false,
          }));

          // Close the modal
          setIsPinModalVisible(false);
          setCurrentAccountForPin(null);
          setPinForShowBalance("");
        } else {
          // PIN is incorrect
          // console.log("agya")
          showError("Invalid PIN. Please try again");
        }
      } catch (error) {
        // console.error('Error verifying PIN:', error);
        showError("Failed to verify PIN. Please try again.");
      } finally {
        setIsVerifyingPin(false);
      }
    };

    // Verify PIN
    const handleVerifyPin = async () => {
      if (pinForShowBalance.length < 4) return;
      setIsVerifyingPin(true);

      try {
        const isUserEnterCorrectPin = await checkPin(pinForShowBalance);

        // console.log("step 3 pinForShowBalance =>",currentPin ," ",pinForShowBalance)
        if (isUserEnterCorrectPin) {
          // PIN is correct, refresh bank balance data
          onAction?.();
          setIsPinModalVisible(false);
          setPinForShowBalance("");
        } else {
          // PIN is incorrect
          // console.log("agya")
          showError("Invalid PIN. Please try again");
        }
      } catch {
        showError("Failed to verify PIN. Please try again.");
      } finally {
        setIsVerifyingPin(false);
      }
    };

    // console.log('errorMsg =>',errorMsg)
    const conditionalFunction = async (cases: string) => {
      switch (cases) {
        case PIN_SCREEN_TASKS.SHOW_BANK_BALANCE: {
          return await verifyPinAndShowBalance();
        }
        case PIN_SCREEN_TASKS.CHECK_PIN: {
          return await handleVerifyPin();
        }
      }
    };
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={isPinModalVisible}
        onRequestClose={() => setIsPinModalVisible(false)}
      >
        {errorMsg || successMsg ? <ErrorToast /> : null}
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: "#FFFFFF",
          }}
        >
          {/* { errorMsg && <CustomText color={theme.colors.palette.red500}>Error</CustomText>} */}
          {/* Header with bank name and logo */}
          <View
            style={{
              backgroundColor: theme.colors.palette.green700,
              paddingVertical: 5,
              paddingHorizontal: 20,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View>
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 16,
                  fontFamily: theme.typography.fontFamily.montserratBold,
                  // fontWeight:theme.typography.fontWeight.bold
                }}
              >
                PayAiro App
              </Text>
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 14,
                  fontFamily: theme.typography.fontFamily.montserrat,
                  marginTop: 3,
                }}
              >
                {currentAccountForPin
                  ? `****${currentAccountForPin.slice(-4)}`
                  : "Account"}
              </Text>
            </View>
            <SvgXml xml={SVGLoggo} width={55} height={55} />
          </View>

          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "space-between",
              paddingBottom: 20,
            }}
          >
            {/* PIN Entry Area */}
            <View
              style={{
                alignItems: "center",
                width: "100%",
                paddingTop: 60,
                paddingHorizontal: 30,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 50,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: theme.colors.palette.green700,
                    fontFamily: theme.typography.fontFamily.nexaHeavy,
                    marginRight: 10,
                  }}
                >
                  ENTER PAYAIRO PIN
                </Text>
                <SvgXml xml={SVG_eye_on} width={22} height={22} />
                <Text
                  style={{
                    fontSize: 14,
                    color: theme.colors.palette.green700,
                    fontFamily: theme.typography.fontFamily.nexaHeavy,
                    fontWeight: "400",
                    marginLeft: 5,
                  }}
                >
                  SHOW
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "80%",
                }}
              >
                {[0, 1, 2, 3].map((index) => (
                  <View
                    key={index}
                    style={{
                      width: "22%",
                      height: 35,
                      alignItems: "center",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 40,
                        color: theme.colors.palette.green700,
                        position: "absolute",
                        top: -15,
                        opacity: pinForShowBalance.length > index ? 1 : 0,
                        fontFamily: Fonts.bold,
                      }}
                    >
                      *
                    </Text>
                    <View
                      style={{
                        position: "absolute",
                        bottom: 0,
                        width: "100%",
                        height: 2,
                        backgroundColor:
                          pinForShowBalance.length > index
                            ? theme.colors.palette.green700
                            : "#CCCCCC",
                      }}
                    />
                  </View>
                ))}
              </View>
            </View>

            {/* Custom Keypad */}
            <View
              style={{
                width: "90%",
                backgroundColor: "#F8F8F8",
                borderRadius: 10,
                paddingVertical: 20,
                paddingHorizontal: 20,
              }}
            >
              {/* Row 1-3 */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 30,
                }}
              >
                {[1, 2, 3].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={{
                      width: 70,
                      height: 70,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onPress={() => handlePinDigit(num.toString())}
                  >
                    <Text
                      style={{
                        fontSize: 30,
                        color: theme.colors.palette.green700,
                        fontFamily: Fonts.bold,
                      }}
                    >
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Row 4-6 */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 30,
                }}
              >
                {[4, 5, 6].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={{
                      width: 70,
                      height: 70,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onPress={() => handlePinDigit(num.toString())}
                  >
                    <Text
                      style={{
                        fontSize: 30,
                        color: theme.colors.palette.green700,
                        fontFamily: Fonts.bold,
                      }}
                    >
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Row 7-9 */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 30,
                }}
              >
                {[7, 8, 9].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={{
                      width: 70,
                      height: 70,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onPress={() => handlePinDigit(num.toString())}
                  >
                    <Text
                      style={{
                        fontSize: 30,
                        color: theme.colors.palette.green700,
                        fontFamily: Fonts.bold,
                      }}
                    >
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Row X-0-Check */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <TouchableOpacity
                  style={{
                    width: 70,
                    height: 70,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={handlePinBackspace}
                >
                  <SvgXml
                    fill={"#fff"}
                    xml={SVG_backspace}
                    width={35}
                    height={35}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    width: 70,
                    height: 70,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={() => handlePinDigit("0")}
                >
                  <Text
                    style={{
                      fontSize: 30,
                      color: theme.colors.palette.green700,
                      fontFamily: Fonts.bold,
                    }}
                  >
                    0
                  </Text>
                </TouchableOpacity>

                <View
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: 35,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    style={{
                      width: 60,
                      height: 60,
                      backgroundColor:
                        pinForShowBalance.length === 4
                          ? theme.colors.palette.green700
                          : theme.colors.palette.green300,
                      borderRadius: 35,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onPress={async () => conditionalFunction(pinScreenTask)}
                    disabled={pinForShowBalance.length !== 4 || isVerifyingPin}
                  >
                    {isVerifyingPin ? (
                      <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                      <SvgXml
                        fill={"#fff"}
                        xml={SVG_done}
                        width={35}
                        height={35}
                      />
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

const customStyles = (theme: Theme) => StyleSheet.create({});

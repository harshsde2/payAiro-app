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
import useDispatchAction from "hooks/useDispatchAction";
import {
  setErrorMsg,
  setShowLoader,
  setSuccessMsg,
} from "redux/slices/authenticationSlice";
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

  const handlePinChange = async () => {
    if (isCurrentPinCorrect()) {
      if (isNewPinAndConfirmPinSame()) {
        setShowLoader(true);
        const formData = new FormData();
        formData.append("new_pin", newPin.join(""));
        formData.append("old_pin", currentPin.join(""));
        handlChangePin(formData, {
          onSuccess: (data) => {
            setShowLoader(false);
            setPin(confirmPin.join(""));
            console.log(JSON.stringify(data.data, null, 2));
            dispatch(setSuccessMsg("Pin change successfully"));
            setConfirmPin(["", "", "", ""]);
            setCurrentPin(["", "", "", ""]);
            setNewPin(["", "", "", ""]);
          },
          onError: () => {
            dispatch(
              setErrorMsg(err?.data?.data?.error || "Some error occured!")
            );
            console.log(JSON.stringify(err, null, 2));
          },
          onSettled: () => {
            setShowLoader(false);
          },
        });
      } else {
        dispatch(setErrorMsg("New PIN does not match with confirm PIN"));
      }
    } else {
      dispatch(setErrorMsg("Current PIN is not correct"));
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
            dispatch(setSuccessMsg("OTP sent successfully"));
            setShowVerifyModal(true);
          },
          onError: () => {
            console.log("send otp", JSON.stringify(err, null, 2));
            dispatch(
              setErrorMsg(err?.data?.data?.error || "Some error occured!")
            );
          },
          onSettled: () => {},
        }
      );
    } else {
      dispatch(setErrorMsg("Current PIN is not correct"));
    }
  };
  const handleVerfyUserChangePinOTP = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length < 6) {
      useDispatchAction(setErrorMsg("OTP Should Be 6 Digits"));
      return;
    }
    console.log("step 3 ->");
    handlVerifyUserForChangePinOtp(
      { otp: enteredOtp },
      {
        onSuccess: (data) => {
          console.log("step 4 ->", data.data);
          setShowVerifyModal(false);
          setIsUserVerfied(true);
          dispatch(setSuccessMsg("User verified successfully"));
        },
        onError: () => {
          console.log("send otp", JSON.stringify(err, null, 2));
          dispatch(
            setErrorMsg(err?.data?.data?.error || "Some error occured!")
          );
        },
        onSettled: () => {},
      }
    );
  };

  // console.log("zsdasfas =>");
  const handleOtpChange = (text, index) => {
    if (/^[0-9]$/.test(text) || text === "") {
      // Only allow numbers or empty text
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

  return (
    <ScreenContainer padding={0}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {showVerifyModal && (
          <CommonModal
            onClose={() => setShowVerifyModal(false)}
            isVisible={showVerifyModal}
            containerStyle={{ justifyContent: "center", alignItems: "center" }}
            isOnOutsidePressClose={false}
          >
            <Pressable
              onPress={(e) => e.stopPropagation()}
              style={[
                globalStyles.whiteSheetContainer,
                {
                  maxHeight: 270,
                  width: "95%",
                  borderRadius: theme.spacing.spacing[8],
                  padding: 20,
                },
              ]}
            >
              <CustomText
                variant={"subtitle1"}
                style={styles.signHeaderCaptionTextStyles}
              >
                Enter OTP
              </CustomText>
              {/* OTP Input Fields */}
              <View style={styles.otpContainer}>
                {otp.map((_, index) => (
                  <TextInput
                    key={index}
                    style={[
                      styles.otpInput,
                      otp[index] && styles.otpInputActive,
                    ]}
                    maxLength={1}
                    keyboardType="number-pad"
                    onChangeText={(text) => handleOtpChange(text, index)}
                    onKeyPress={({ nativeEvent }) =>
                      handleKeyPress(nativeEvent.key, index)
                    }
                    ref={(input) => (inputs.current[index] = input)} // Assign ref dynamically
                    value={otp[index]}
                  />
                ))}
              </View>
              <GenericButton
                onPress={() => {
                  handleVerfyUserChangePinOTP();
                }}
                title={"Verify OTP"}
                cStyle={{ width: "90%", alignSelf: "center" }}
                showLoader={true}
                isLoading={isPendingVerifyUserForChangePinOtp}
              />
              <GenericButton
                onPress={() => {
                  setShowVerifyModal(false);
                }}
                title={"Cancel"}
                cStyle={{
                  width: "90%",
                  alignSelf: "center",
                  backgroundColor: "black",
                  marginTop: 10,
                }}
              />
            </Pressable>
          </CommonModal>
        )}
        <HeaderTitle title={"Set Pin"} leftIcon={SVGLeftArrow} />
        {/* <Button title="click me" onPress={() => setPin("0000")} /> */}
        <View style={[globalStyles.whiteSheetContainer]}>
          <View style={{ width: "100%" }}>
            <Text style={styles.title}>Change Your Pin</Text>
            <Text style={styles.subtitle}>
              To set up your <Text style={styles.bold}>PIN</Text> create a{" "}
              <Text style={styles.bold}>4 digit code</Text> then confirm it
              below.
            </Text>
            {/* Current PIN Input */}
            <Text style={styles.label}>Enter current PIN</Text>
            <View style={styles.pinContainer}>
              {currentPin.map((digit, index) => (
                <TextInput
                  key={index}
                  style={styles.pinInput}
                  keyboardType="numeric"
                  maxLength={1}
                  value={digit}
                  onChangeText={(val) => {
                    let tempPin = [...currentPin];
                    tempPin[index] = val;
                    setCurrentPin(tempPin);
                    if (val && pinRefs[index + 1])
                      pinRefs[index + 1].current.focus();
                  }}
                  ref={pinRefs[index]}
                />
              ))}
            </View>

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
                    style={styles.pinInput}
                    keyboardType="numeric"
                    maxLength={1}
                    value={digit}
                    onChangeText={(val) => {
                      let tempPin = [...newPin];
                      tempPin[index] = val;
                      setNewPin(tempPin);
                      if (val && newPinRefs[index + 1])
                        newPinRefs[index + 1].current.focus();
                    }}
                    ref={newPinRefs[index]}
                  />
                ))}
              </View>

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
                    onChangeText={(val) => {
                      let tempPin = [...confirmPin];
                      tempPin[index] = val;
                      setConfirmPin(tempPin);
                      if (val && confirmPinRefs[index + 1])
                        confirmPinRefs[index + 1].current.focus();
                    }}
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
          cStyle={{ width: "90%", alignSelf: "center" }}
          showLoader={true}
          isLoading={showLoader}
        />
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

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
  otpInputActive: {
    borderColor: themes.dark.colors.palette.green700,
    borderWidth: 2,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginVertical: 20,
  },
  otpInput: {
    width: 40,
    height: 50,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#ccc",
    textAlign: "center",
    fontSize: 18,
    backgroundColor: "#fff",
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
    borderRadius: 35,
    borderWidth: 1,
    borderColor: "rgba(0, 119, 4, 0.4)",
    textAlign: "center",
    fontSize: 22,
    backgroundColor: "rgba(0, 119, 4, 0.07)",
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

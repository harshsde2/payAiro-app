import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import CommonContainer from "../../HOC/CommonContainer";
import GenericButton from "../../components/GenericButton";
import { useNavigation } from "@react-navigation/native";
import { SCREENS } from "../../constants/SCREENS";
import PincodeKeypad from "../../components/PincodeKeypad";
import Fonts from "../../constants/Fonts";
import { setPin } from "../../services/Auth";
import useDispatchAction from "../../hooks/useDispatchAction";
import {
  setErrorMsg,
  setSuccessMsg,
} from "../../redux/slices/authenticationSlice";
import { createPin, getKYC, getWallet } from "../../services/Services";
import useSelectorAction from "../../hooks/useSelectorAction";
import KYCFailureModal from "../../components/KYCFailureModal";
import { useStepCount } from "query/hooks/useAPIAuth";

export default function Pincode() {
  const stepcount = "8";

  const { tokens } = useSelectorAction();
  const [otp, setOtp] = useState(["", "", "", ""]); // OTP array for 4 digits
  const inputs = useRef([]); // Ref for the input fields
  const [isVisible, setisVisible] = useState(false);

  const { mutate: stepCount } = useStepCount();

  const getCurrentStep = () => {
    stepCount(
      { stepcount: stepcount },
      {
        onSuccess: (data) => {
          console.log(" getCurrentStep on adderss", data);
        },
        onError: (error) => {
          console.log(
            "getCurrentStep on adderss errror",
            JSON.stringify(error, null, 2)
          );
        },
      }
    );
  };

  const navigation = useNavigation();
  useEffect(() => {
    getkycStep();
  }, []);

  const getkycStep = async () => {
    const data = await getWallet(tokens?.access);

    const kycData = await getKYC(tokens?.access);
    // console.log(kycData, 'KYCDatataaatat');
    if (!kycData?.data?.is_varified) {
      setisVisible(true);
      setTimeout(() => {
        navigation.replace("Name", {
          data: { data: { access: tokens?.access } },
          email: data?.data?.account_email,
        });
      }, 10000);
    }
  };
  const handleKeyPress = (key) => {
    // Find the first empty field
    const firstEmptyIndex = otp.findIndex((value) => value === "");

    if (firstEmptyIndex !== -1) {
      const newOtp = [...otp];
      newOtp[firstEmptyIndex] = key;
      setOtp(newOtp);

      // Automatically move to the next input field
      inputs.current[firstEmptyIndex]?.focus();
    }
  };

  const handleBackspace = () => {
    // Find the last filled field
    const lastFilledIndex = otp
      .slice()
      .reverse()
      .findIndex((value) => value !== "");
    const indexToClear = otp.length - 1 - lastFilledIndex;

    if (indexToClear >= 0) {
      const newOtp = [...otp];
      newOtp[indexToClear] = "";
      setOtp(newOtp);

      // Move focus to the cleared field
      inputs.current[indexToClear]?.focus();
    }
  };

  const handleVerify = () => {
    const enteredOtp = otp.join("");
    console.log("Entered OTP:", enteredOtp);
    // Add your OTP verification logic here
  };

  return (
    <CommonContainer style={{ marginVertical: 35 }}>
      {/* <KYCFailureModal
        isVisible={isVisible}
        onClose={async () => {
          const data = await getWallet(tokens?.access);
          navigation.replace('Name', {
            data: {data: {access: tokens?.access}},
            email: data?.data?.account_email,
          });
        }}
      /> */}

      <View
        style={{
          flex: 1,
          backgroundColor: "#fff",
          borderTopEndRadius: 32,
          borderTopStartRadius: 32,
          padding: 20,
        }}
      >
        <View style={{ width: "80%", alignSelf: "center" }}>
          <Text
            style={{
              fontFamily: Fonts.bold,
              textAlign: "center",
              fontSize: 30,
            }}
          >
            Create Pin
          </Text>
        </View>

        {/* OTP Input Fields */}
        <View style={styles.otpContainer}>
          {otp.map((value, index) => (
            <TextInput
              key={index}
              style={styles.otpInput}
              maxLength={1}
              keyboardType="number-pad"
              value={value}
              ref={(input) => (inputs.current[index] = input)} // Assign ref dynamically
              editable={false} // Disable manual editing
            />
          ))}
        </View>
        <GenericButton
          title={"Verify"}
          cStyle={{ width: "100%" }}
          onPress={async () => {
            if (otp.join("").length < 4) {
              useDispatchAction(setErrorMsg("Pin should be 4 digit"));
              return;
            }

            const formData = new FormData();
            formData.append("tpin", otp.join(""));
            const data = await createPin(formData, tokens?.access);
            console.log(data, "pinAddeed");
            if (data && data?.status) {
              setPin(otp.join(""));
              useDispatchAction(
                setSuccessMsg("Transaction Pin created successfully")
              );
              getCurrentStep()
              navigation.navigate("SuccesScreen");
            } else {
              useDispatchAction(setErrorMsg("Something Went Wrong"));
            }
          }}
        />
        <PincodeKeypad
          handleBackspace={handleBackspace}
          handleKeyPress={handleKeyPress}
        />
      </View>
    </CommonContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderTopEndRadius: 32,
    borderTopStartRadius: 32,
    paddingVertical: 20,
  },
  title: {
    fontFamily: Fonts.semibold,
    textAlign: "center",
    fontSize: 32,
  },
  subtitle: {
    fontSize: 14,
    color: "#6c6c6c",
    marginBottom: 30,
    textAlign: "center",
    fontFamily: Fonts.semibold,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
    marginTop: 40,
  },
  otpInput: {
    width: 70,
    height: 50,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#ccc",
    textAlign: "center",
    fontSize: 18,
    backgroundColor: "#fff",
    marginHorizontal: 5,
  },
});

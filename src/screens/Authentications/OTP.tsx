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
import DeviceInfo from "react-native-device-info";
import { useDispatch } from "react-redux";
import { setItem, setPin, STORAGE_KEYS } from "storage/mmkv";
import GenericButton from "../../components/GenericButton";
import Fonts from "../../constants/Fonts";
import { SCREENS } from "../../constants/SCREENS";
import useDispatchAction from "../../hooks/useDispatchAction";
import useSelectorAction from "../../hooks/useSelectorAction";
import {
  setErrorMsg,
  setLogin,
  setShowGuide,
  setShowLoader,
  setShowRedeemReward,
  setSuccessMsg,
  setTokens,
  setWalletData,
} from "../../redux/slices/authenticationSlice";
import { setToken, setWalletDataAuth } from "../../services/Auth";
import {
  addFcm,
  getKYC,
  getWallet,
  sendOTP,
  verify,
} from "../../services/Services";
import AuthHeader from "tsx-components/AuthHeader";
import { CustomText } from "tsx-components";
import { Theme, useTheme } from "styles";
import { useLogin, useStepCount, useVerifyOTP } from "query/hooks/useAPIAuth";
import { useGetReward, useUserPin, useWalletDetails } from "query/hooks";

export default function ConfirmOTP() {
  let deviceId = DeviceInfo.getDeviceId();

  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { fcmToken } = useSelectorAction();
  const route = useRoute();
  const { theme } = useTheme();
  const styles = customStyles(theme);

  const {
    mutate: login,
    isPending: isPendingLogin,
    error: errorLogin,
  } = useLogin();
  const { mutate: verifyOtp, isPending, error } = useVerifyOTP();
  const { mutate: stepCount } = useStepCount();
  const {
    data: getRewardData,
    isError,
    isSuccess: isSuccessGetReward,
    refetch: refetchGetReward,
  } = useGetReward(false);

  const {
    data: data,
    isLoading: isPendingWalletDetails,
    isSuccess: isSuccessWalletDetails,
    isError: isErrorWalletDetails,
    refetch: refetchWalletDetails,
  } = useWalletDetails(false);

  const {
    data: dataUserPin,
    isLoading: isPendingUserPin,
    isSuccess: isSuccessUserPin,
    isError: isErrorUserPin,
    refetch: refetchUserPin,
  } = useUserPin(false);

  // console.log("dataUserPin =>", dataUserPin?.data);

  const { email } = (route as any).params;
  // const email = "";
  const [otp, setOtp] = useState(["", "", "", "", "", ""]); // OTP array
  const inputs = useRef<any>([]); // Refs for the input fields
  const [countdown, setCountdown] = useState(60);
  const [resendEnabled, setResendEnabled] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [step, setStepCount] = useState("");

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendEnabled(true);
    }
  }, [countdown]);

  const handleResend = () => {
    if (resendEnabled) {
      setCountdown(60);
      setResendEnabled(false);
      handleResendOTP();
    }
  };

  const handleGetRewardDetails = async () => {
    await refetchGetReward();
    if (isSuccessGetReward) {
      console.log("refetchGetReward => ✅");
      if (getRewardData?.data?.length > 0) {
        if (getRewardData && getRewardData?.data?.length > 0) {
          setItem(STORAGE_KEYS.REDEEM_REWARD, JSON.stringify(false));
          // dispatch(setShowRedeemReward(true));
        }
      }
    }
  };

  const handleUserGuide = async () => {
    setItem(STORAGE_KEYS.GUIDE, JSON.stringify(false));
    dispatch(setShowGuide(false));
    console.log("setShowGuide => ✅");
  };

  const handleOtpChange = (text: any, index: any) => {
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

  const handleKeyPress = (key: any, index: any) => {
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

  const handleResendOTP = () => {
    login({ email: email.trim().toLowerCase() } as any, {
      onSuccess: (data) => {
        if (data?.status && data) {
          useDispatchAction(setSuccessMsg("OTP has been sent to email"));
        } else {
          useDispatchAction(setErrorMsg("Something went wrong"));
        }
      },
      onError: (error) => {
        console.log(error);
        useDispatchAction(setErrorMsg(error));
      },
    });
  };

  const handleVerifyOTP = () => {
    setButtonDisabled(true);
    setIsVerifying(true);
    const enteredOtp = otp.join("");
    if (enteredOtp.length < 6) {
      setIsVerifying(false);
      useDispatchAction(setErrorMsg("OTP Should Be 6 Digits"));
      return;
    }

    verifyOtp({ email: email.trim().toLowerCase(), otp: enteredOtp } as any, {
      onSuccess: async (data) => {
        if (data?.status) {
          const kycData = await getKYC(data?.data?.data?.access);
          console.log(JSON.stringify(kycData, null, 2), "kycData");

          // console.log(JSON.stringify(kycData, null, 2), "KycData");
          const formData = new FormData();

          formData.append("fcm_token", fcmToken);
          formData.append("device_id", deviceId);

          const fcmData = await addFcm(formData, data?.data?.data?.access);
          useDispatchAction(setTokens(data?.data?.data));
          await setToken(data?.data?.data);
          setItem(STORAGE_KEYS.AUTH_TOKENS, JSON.stringify(data?.data?.data));

          useDispatchAction(setSuccessMsg("OTP Verified Successfully"));
          if (kycData?.data?.is_varified) {
            console.log("chla", kycData?.data?.is_varified);
            getWalletD();
          } else {
            getCurrentStep(data.data);
          }
        } else {
          useDispatchAction(setErrorMsg("Invalid OTP. Please Try Again."));
        }
        setIsVerifying(false);
      },
      onError: (error) => {
        console.log("error :--", error);
        const errorMessage =
          (error as any)?.response?.data?.message ||
          error?.message ||
          "Something went wrong";
        useDispatchAction(setErrorMsg(errorMessage));
        setIsVerifying(false);
      },
      onSettled: () => {
        useDispatchAction(setShowLoader(false));
      },
    });
  };

  const getCurrentStep = (response: any) => {
    stepCount({ stepcount: "" } as any, {
      onSuccess: (data: any) => {
        if (data.data?.stepcount) {
          console.log("data.data?.stepcount =>", data.data?.stepcount);
          if (data.data?.stepcount == "1") {
            (navigation as any).navigate(SCREENS.Name, {
              email,
              data: response,
            });
          } else if (parseInt(data.data?.stepcount) > 1) {
            (navigation as any).navigate(SCREENS.Address);
          }
        }
      },
      onError: (error) => {
        const errorMessage =
          (error as any)?.response?.data?.message ||
          error?.message ||
          "Something went wrong";
        useDispatchAction(setErrorMsg(errorMessage));
      },
    });
  };

  const getWalletD = async () => {
    try {
      const result = await refetchWalletDetails();
      const pinResp = await refetchUserPin();

      const pin = pinResp.data?.data.tpin;

      if (result.isSuccess && result.data?.data) {
        const walletData = result.data.data;

        await handleGetRewardDetails();
        handleUserGuide();

        dispatch(setWalletData(walletData));
        setWalletDataAuth(walletData);
        setItem(STORAGE_KEYS.WALLET_DATA, JSON.stringify(walletData));
        setPin(pin);
        dispatch(setLogin(true));
        dispatch(setSuccessMsg("Logged in Successfully"));
      } else {
        throw new Error("Wallet fetch failed");
      }
    } catch (error) {
      console.log("error =>", JSON.stringify(error, null, 2));
      useDispatchAction(setErrorMsg("Something went wrong!"));
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== "");

  return (
    <ScreenContainer padding={0}>
      {/* <AuthHeader showAuthLogo={true} /> */}
      <View style={{ flex: 1 }}>
        <AuthHeader header={resendEnabled} showAuthLogo={true} />
      </View>
      <View style={styles.content}>
        <CustomText
          variant={"h1"}
          fontFamily={theme.typography.fontFamily.montserratBold}
          style={styles.signHeaderTextStyles}
        >
          Confirm OTP
        </CustomText>
        <CustomText
          variant={"caption"}
          style={styles.signHeaderCaptionTextStyles}
        >
          Enter OTP we just sent to your email address.
        </CustomText>

        {/* OTP Input Fields */}
        <View style={styles.otpContainer}>
          {otp.map((_, index) => (
            <TextInput
              key={index}
              style={[styles.otpInput, otp[index] && styles.otpInputActive]}
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

        {/* Verify Button */}

        <CustomText variant={"caption"}>Didn't receive the code?</CustomText>
        <TouchableOpacity
          style={{ marginTop: 5, marginBottom: 20 }}
          disabled={!resendEnabled}
          onPress={handleResend}
        >
          <CustomText
            variant={"subtitle2"}
            style={{ textDecorationLine: "underline" }}
          >
            {resendEnabled
              ? "Resend OTP"
              : `Resend OTP in ${countdown} seconds`}
          </CustomText>
        </TouchableOpacity>
        <GenericButton
          title={isVerifying ? "Verifying..." : "Verify"}
          onPress={handleVerifyOTP}
          disabled={!isOtpComplete || isVerifying}
        />
      </View>
    </ScreenContainer>
  );
}

const customStyles = (theme: Theme) =>
  StyleSheet.create({
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
      fontFamily: Fonts.bold,
      textAlign: "center",
      fontSize: 32,
    },
    subtitle: {
      fontSize: 14,
      color: "#6c6c6c",
      marginBottom: 30,
      textAlign: "center",
      fontFamily: Fonts.regular,
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
    signHeaderTextStyles: {
      width: "100%",
      textAlign: "center",
    },
    signHeaderCaptionTextStyles: {
      width: "100%",
      textAlign: "center",
      marginTop: 10,
    },
    otpInputActive: {
      borderColor: "#B1FF84",
      borderWidth: 2,
    },
    resendText: {
      color: "#000",
      fontFamily: Fonts.regular,
      textAlign: "center",
      fontSize: 12,
      marginTop: 30,
    },
    resendButton: {
      color: "#000",
      fontFamily: Fonts.bold,
    },
  });

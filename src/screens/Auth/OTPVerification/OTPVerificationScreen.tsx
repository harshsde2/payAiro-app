import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, TextInput } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NAVIGATION_SCREENS } from "@navigations/navigationConstants";
import { useDispatch } from "react-redux";
import { setLogin } from "@redux/slices/authenticationSlice";
import { useTheme } from "@styles/ThemeContext";
import { otpVerificationStyles } from "@styles/screens/auth/otpVerificationStyles";
import CustomText from "@components/common-components/CustomText";
import ScreenWrapper from "@components/common-components/ScreenWrapper";
import {
  OTPVerificationScreenNavigationProp,
  OTPVerificationScreenRouteProp,
} from "@screens/Auth/types";
import { AppIcon } from "@assets/svgs";
import { Button } from "@components/common-components/layout";

const OTPVerificationScreen: React.FC = () => {
  const navigation = useNavigation<OTPVerificationScreenNavigationProp>();
  const route = useRoute<OTPVerificationScreenRouteProp>();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const styles = otpVerificationStyles(theme);
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [timer, setTimer] = useState(60);
  const email = route.params?.email || "email@gmail.com";
  const type = route.params?.type || "signup";

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = () => {
    if (type === "login" || type === "signup") {
      dispatch(setLogin(true));
    } else if (type === "forgot") {
      navigation.navigate(NAVIGATION_SCREENS.FORGOT_PASSWORD_VERIFICATION, {
        email,
      });
    }
  };

  const handleResend = () => {
    setTimer(60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <ScreenWrapper
      safeArea
      padding={16}
      safeAreaEdges={["bottom", "left", "right"]}
      scrollable
      contentStyle={styles.content}
    >
      <View style={styles.titleContainer}>
        <CustomText variant="h2" style={styles.title} fontWeight="semiBold">
          OTP Verification
        </CustomText>
      </View>
      <View style={styles.instructionTextContainer}>
        <CustomText
          variant="body"
          fontFamily="inter"
          color={theme.colors.textSecondary}
          style={styles.instructionText}
        >
          Enter 6-digit verification code, send on {email}
        </CustomText>
      </View>

      <View style={styles.inputContainer}>
        <CustomText variant="label" style={styles.label}>
          Email OTP
        </CustomText>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="••••••"
            placeholderTextColor={theme.colors.textSecondary}
            value={otp}
            onChangeText={setOtp}
            secureTextEntry={!showOtp}
            maxLength={6}
            keyboardType="number-pad"
          />
          <TouchableOpacity
            onPress={() => setShowOtp(!showOtp)}
            style={styles.eyeIcon}
          >
            {showOtp ? <AppIcon.EyeOn /> : <AppIcon.EyeOff />}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.resendContainer}>
        <CustomText variant="bodySmall" color={theme.colors.textSecondary}>
          Resend{" "}
        </CustomText>
        <TouchableOpacity onPress={handleResend} disabled={timer > 0}>
          <CustomText
            variant="bodySmall"
            color={
              timer > 0 ? theme.colors.textSecondary : theme.colors.primary
            }
          >
            {formatTime(timer)}
          </CustomText>
        </TouchableOpacity>
      </View>

      <Button onPress={handleSubmit}>Submit</Button>
    </ScreenWrapper>
  );
};

export default OTPVerificationScreen;

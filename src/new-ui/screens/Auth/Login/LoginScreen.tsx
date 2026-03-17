import React, { useState, useEffect } from "react";
import { View, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { loginStyles } from "@new-ui/styles/screens/auth/loginStyles";
import CustomText from "@new-ui/components/common-components/CustomText";
import { TextInput, Button } from "@new-ui/components/common-components/layout";
import { AppIcon } from "@new-ui/assets/svgs";
import ScreenWrapper from "@new-ui/components/common-components/ScreenWrapper";
import { LoginScreenNavigationProp } from "@new-ui/screens/Auth/types";
import { useLogin } from "query/hooks/useAPIAuth";
import { showError, showSuccess } from "utils/toast";
import { validateEmailOrPhone } from "utils/validation";
import { getSmsHash } from "utils/smsHash";
import { appContent } from "utils/appContent";
import { ILoginPayload } from "screens/Authentications/types";
import { isProduction } from "config/env.config";

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { theme } = useTheme();
  const styles = loginStyles(theme);
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [mpin, setMpin] = useState("");
  const [showMpin, setShowMpin] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [smsHash, setSmsHash] = useState("");

  const isProductionEnv = isProduction();
  const { mutate: login, isPending } = useLogin();

  useEffect(() => {
    const fetchSmsHash = async () => {
      const hash = await getSmsHash();
      if (hash) setSmsHash(hash);
    };
    fetchSmsHash();
  }, []);

  const handleLogin = () => {
    const validationResult = validateEmailOrPhone(emailOrPhone);
    if (!validationResult.isValid) {
      showError(
        validationResult.errorMessage || "Invalid input",
        validationResult.helperText || ""
      );
      return;
    }

    setButtonDisabled(true);

    const payload: ILoginPayload = {
      location: isProductionEnv ? "United States" : "india",
    };
    if (validationResult.inputType === "email") {
      payload.email = validationResult.formattedValue;
    } else if (validationResult.inputType === "phone") {
      payload.phone = validationResult.formattedValue;
      if (smsHash) payload.hash = smsHash;
    }

    const isEmailInput = validationResult.inputType === "email";
    const successMessage = isEmailInput
      ? "OTP has been sent to your email"
      : "OTP has been sent to your phone number";
    const errorMessage = isEmailInput
      ? "Email address not found"
      : "Phone number not found";

    login(payload as any, {
      onSuccess: (data) => {
        setButtonDisabled(false);
        if (data?.status && data) {
          showSuccess(successMessage);
          navigation.navigate(NAVIGATION_SCREENS.NEW_OTP_VERIFICATION, {
            email: isEmailInput ? validationResult.formattedValue : undefined,
            phone: !isEmailInput ? validationResult.formattedValue : undefined,
            inputType: validationResult.inputType,
            isEmail: isEmailInput,
            type: "login",
          } as any);
        } else {
          showError(errorMessage, "Please check and try again");
        }
      },
      onError: (error: any) => {
        const errorMsg =
          error?.response?.data?.message || "Something went wrong";
        showError(errorMsg, "Please try again");
        setButtonDisabled(false);
      },
    });
  };

  return (
    <ScreenWrapper
      safeArea
      padding={16}
      safeAreaEdges={["bottom", "left", "right"]}
      scrollable
      contentStyle={styles.content}
    >
      <View style={styles.header}>
        <CustomText variant="h2" fontWeight="semiBold">
          {appContent.login.title}
        </CustomText>
        <CustomText
          fontFamily="inter"
          size={14}
          color={theme.colors.textSecondary}
          style={styles.instructionText}
        >
          {isProductionEnv
            ? "Enter your email to continue!"
            : "Enter your email or phone number to continue."}
        </CustomText>
      </View>
      <View style={styles.fieldContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            label={
              isProductionEnv
                ? appContent.login.emailLabel
                : "Enter your email or phone number"
            }
            leftIcon={<AppIcon.Mail />}
            placeholder={
              isProductionEnv
                ? appContent.login.emailPlaceholder
                : "e.g. john@email.com or 9876543210"
            }
            value={emailOrPhone}
            onChangeText={setEmailOrPhone}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* <View style={styles.inputContainer}>
          <TextInput
            label="M-PIN (optional)"
            placeholder="••••"
            value={mpin}
            onChangeText={setMpin}
            secureTextEntry={!showMpin}
            maxLength={4}
            keyboardType="number-pad"
            rightIcon={showMpin ? <AppIcon.EyeOn /> : <AppIcon.EyeOff />}
            onRightIconPress={() => setShowMpin(!showMpin)}
          />
        </View> */}

        {/* <TouchableOpacity
          style={styles.forgotPasswordLink}
          onPress={() => navigation.navigate(NAVIGATION_SCREENS.NEW_FORGOT_PASSWORD)}
        >
          <CustomText fontFamily="inter" size={12} color={theme.colors.primary}>
            Forgot Password?
          </CustomText>
        </TouchableOpacity> */}

        <TouchableOpacity
          style={styles.forgotPasswordLink}
          onPress={() => navigation.navigate(NAVIGATION_SCREENS.SUPPORT_SCREEN)}
        >
          <CustomText fontFamily="inter" size={12} color={theme.colors.primary}>
            Having trouble logging in? Recover your account
          </CustomText>
        </TouchableOpacity>
      </View>


      <Button
        onPress={handleLogin}
        loading={isPending}
        disabled={buttonDisabled || !emailOrPhone.trim()}
      >
        {appContent.login.nextButton}
      </Button>

      <TouchableOpacity
        style={styles.createAccountLink}
        onPress={() => navigation.navigate(NAVIGATION_SCREENS.NEW_CREATE_ACCOUNT)}
      >
        <CustomText
          fontFamily="inter"
          variant="label"
          color={theme.colors.text}
        >
          Don't have Account?{" "}
        </CustomText>
        <CustomText
          variant="label"
          color={theme.colors.primary}
          fontWeight="medium"
          fontFamily="inter"
        >
          Create New
        </CustomText>
      </TouchableOpacity>
    </ScreenWrapper>
  );
};

export default LoginScreen;

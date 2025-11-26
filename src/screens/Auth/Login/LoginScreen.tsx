import React, { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NAVIGATION_SCREENS } from "@navigations/navigationConstants";
import { useTheme } from "@styles/ThemeContext";
import { loginStyles } from "@styles/screens/auth/loginStyles";
import CustomText from "@components/common-components/CustomText";
import { TextInput, Button } from "@components/common-components/layout";
import { AppIcon } from "@assets/svgs";
import ScreenWrapper from "@components/common-components/ScreenWrapper";
import { LoginScreenNavigationProp } from "@screens/Auth/types";

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { theme } = useTheme();
  const styles = loginStyles(theme);
  const [email, setEmail] = useState("");
  const [mpin, setMpin] = useState("");
  const [showMpin, setShowMpin] = useState(false);

  const handleProceed = () => {
    navigation.navigate(NAVIGATION_SCREENS.OTP_VERIFICATION, {
      email,
      type: "login",
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
          Welcome Back!
        </CustomText>
      </View>
      <View style={styles.header}>
        <CustomText
          fontFamily="inter"
          size={16}
          color={theme.colors.textSecondary}
          style={styles.instructionText}
        >
          Enter your registered email address and M-PIN to login.
        </CustomText>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          label="Email"
          leftIcon={<AppIcon.Mail />}
          placeholder="e.g. john@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          label="M-PIN"
          placeholder="••••"
          value={mpin}
          onChangeText={setMpin}
          secureTextEntry={!showMpin}
          maxLength={4}
          keyboardType="number-pad"
          rightIcon={showMpin ? <AppIcon.EyeOn /> : <AppIcon.EyeOff />}
          onRightIconPress={() => setShowMpin(!showMpin)}
        />
      </View>

      <TouchableOpacity
        style={styles.forgotPasswordLink}
        onPress={() => navigation.navigate(NAVIGATION_SCREENS.FORGOT_PASSWORD)}
      >
        <CustomText fontFamily="inter" size={12} color={theme.colors.primary}>
          Forgot Password?
        </CustomText>
      </TouchableOpacity>

      <Button
        onPress={handleProceed}
        // style={styles.proceedButton}
      >
        Proceed
      </Button>

      <TouchableOpacity
        style={styles.createAccountLink}
        onPress={() => navigation.navigate(NAVIGATION_SCREENS.CREATE_ACCOUNT)}
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

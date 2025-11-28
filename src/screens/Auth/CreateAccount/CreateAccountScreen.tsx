import React, { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NAVIGATION_SCREENS } from "@navigations/navigationConstants";
import { useTheme } from "@styles/ThemeContext";
import { createAccountStyles } from "@styles/screens/auth/createAccountStyles";
import CustomText from "@components/common-components/CustomText";
import { TextInput, Button } from "@components/common-components/layout";
import { AppIcon } from "@assets/svgs";
import ScreenWrapper from "@components/common-components/ScreenWrapper";
import { CreateAccountScreenNavigationProp } from "@screens/Auth/types";

const CreateAccountScreen: React.FC = () => {
  const navigation = useNavigation<CreateAccountScreenNavigationProp>();
  const { theme } = useTheme();
  const styles = createAccountStyles(theme);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePatriot, setAgreePatriot] = useState(false);

  const handleVerify = () => {
    navigation.navigate(NAVIGATION_SCREENS.OTP_VERIFICATION, {
      email,
      type: "signup",
      fullName,
    });
  };

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={["bottom", "left", "right"]}
      scrollable
      contentStyle={styles.content}
    >
      <CustomText variant="h3" fontWeight="semiBold" style={styles.welcomeText}>
        Welcome
      </CustomText>
      <CustomText
        fontFamily="inter"
        variant="label"
        size={16}
        color={theme.colors.textSecondary}
        style={styles.instructionText}
      >
        Enter your name, email address and referral code(if any) to create
        account.
      </CustomText>

      <View style={styles.inputContainer}>
        <TextInput
          label="Full Name"
          placeholder="e.g. John Carter"
          value={fullName}
          onChangeText={setFullName}
        />
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
          label="Referral Code (If Any)"
          placeholder="ASD435M-XC"
          value={referralCode}
          onChangeText={setReferralCode}
          autoCapitalize="characters"
        />
      </View>

      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setAgreeTerms(!agreeTerms)}
          activeOpacity={0.7}
        >
          <View style={styles.checkboxIcon}>
            {agreeTerms ? (
              <AppIcon.TickCheckedBox />
            ) : (
              <AppIcon.UntickCheckedBox />
            )}
          </View>
          <CustomText
            fontFamily="inter"
            variant="bodySmall"
            style={styles.checkboxText}
          >
            I agree with the{" "}
            <CustomText
              fontFamily="inter"
              variant="bodySmall"
              color={theme.colors.primary}
            >
              terms & conditions
            </CustomText>{" "}
            and{" "}
            <CustomText
              fontFamily="inter"
              variant="bodySmall"
              color={theme.colors.primary}
            >
              privacy policy
            </CustomText>
          </CustomText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setAgreePatriot(!agreePatriot)}
          activeOpacity={0.7}
        >
          <View style={styles.checkboxIcon}>
            {agreePatriot ? (
              <AppIcon.TickCheckedBox />
            ) : (
              <AppIcon.UntickCheckedBox />
            )}
          </View>
          <CustomText
            fontFamily="inter"
            variant="bodySmall"
            style={styles.checkboxText}
          >
            By clicking the button you agree with the{" "}
            <CustomText
              fontFamily="inter"
              variant="bodySmall"
              color={theme.colors.primary}
            >
              Patriot Act
            </CustomText>{" "}
            and{" "}
            <CustomText
              fontFamily="inter"
              variant="bodySmall"
              color={theme.colors.primary}
            >
              e-Sign Disclosure
            </CustomText>
          </CustomText>
        </TouchableOpacity>
      </View>

      <Button
        onPress={handleVerify}
        disabled={!agreeTerms || !agreePatriot}
        style={styles.verifyButton}
      >
        Verify
      </Button>

      <TouchableOpacity
        style={styles.loginLink}
        onPress={() => navigation.navigate(NAVIGATION_SCREENS.LOGIN)}
      >
        <CustomText
          fontFamily="inter"
          variant="label"
          color={theme.colors.text}
        >
          Already have Account?{" "}
        </CustomText>
        <CustomText
           variant="label"
           color={theme.colors.primary}
           fontWeight="medium"
           fontFamily="inter"
        >
          Login
        </CustomText>
      </TouchableOpacity>
    </ScreenWrapper>
  );
};

export default CreateAccountScreen;

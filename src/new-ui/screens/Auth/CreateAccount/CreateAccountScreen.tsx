import React, { useState, useEffect, useRef } from "react";
import { View, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { createAccountStyles } from "@new-ui/styles/screens/auth/createAccountStyles";
import CustomText from "@new-ui/components/common-components/CustomText";
import { TextInput, Button } from "@new-ui/components/common-components/layout";
import { AppIcon } from "@new-ui/assets/svgs";
import ScreenWrapper from "@new-ui/components/common-components/ScreenWrapper";
import { showError, showSuccess } from "utils/toast";
import { validateEmailOrPhone } from "utils/validation";
import { getSmsHash } from "utils/smsHash";
import { useSignUp } from "query/hooks/useAPIAuth";
import { getItem, removeItem, STORAGE_KEYS } from "storage/mmkv";
import { isProduction } from "config/env.config";
import PoliticalModal from "components/PolitaclModal";

const CreateAccountScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const styles = createAccountStyles(theme);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePatriot, setAgreePatriot] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [smsHash, setSmsHash] = useState("");
  const [isPoliticallyExposed, setIsPoliticallyExposed] = useState(false);
  const [isPoliticalModalVisible, setIsPoliticalModalVisible] = useState(false);



  const isProductionEnv = isProduction();
  const { mutate: signUp, isPending } = useSignUp();

  type SignupPayload = {
    email?: string;
    phone?: string;
    location: string;
    ref_code?: string;
    hash?: string;
  };

  useEffect(() => {
    const storedReferralCode = getItem(STORAGE_KEYS.REFERRAL_CODE);
    if (storedReferralCode) {
      setReferralCode(storedReferralCode);
    }
  }, []);

  useEffect(() => {
    const fetchSmsHash = async () => {
      const hash = await getSmsHash();
      if (hash) {
        setSmsHash(hash);
      }
    };

    fetchSmsHash();
  }, []);

  const validateForm = () => {
    if (isPoliticallyExposed) {
      setIsPoliticalModalVisible(true);
      return null;
    }

    const validationResult = validateEmailOrPhone(email);

    if (!validationResult.isValid) {
      showError(
        validationResult.errorMessage || "Invalid input",
        validationResult.helperText || ""
      );
      return null;
    }

    if (!agreeTerms) {
      showError(
        "Terms & conditions are required",
        "Please accept all required terms to continue"
      );
      return null;
    }

    return validationResult;
  };

  const handleVerify = () => {
    const validationResult = validateForm();
    if (!validationResult) {
      return;
    }

    setIsSubmitting(true);

    const payload: SignupPayload = {
      location: isProductionEnv ? "United States" : "india",
    };

    if (validationResult.inputType === "email") {
      payload.email = validationResult.formattedValue;
    } else if (validationResult.inputType === "phone") {
      payload.phone = validationResult.formattedValue;
      if (smsHash) {
        payload.hash = smsHash;
      }
    }

    if (referralCode && referralCode.trim().length > 0) {
      payload.ref_code = referralCode.trim();
    }

    const isEmailInput = validationResult.inputType === "email";
    const successMessage = isEmailInput
      ? "OTP has been sent to your email"
      : "OTP has been sent to your phone number";
    const errorMessage = isEmailInput
      ? "Email address already exists"
      : "Phone number already exists";

    signUp(payload as any, {
      onSuccess: (data: any) => {
        setIsSubmitting(false);
        if (data?.status) {
          showSuccess(successMessage);
          removeItem(STORAGE_KEYS.REFERRAL_CODE);

          const isEmailInput = validationResult.inputType === "email";

          navigation.navigate(
            NAVIGATION_SCREENS.NEW_OTP_VERIFICATION,
            {
              email: isEmailInput ? validationResult.formattedValue : undefined,
              phone: !isEmailInput ? validationResult.formattedValue : undefined,
              inputType: validationResult.inputType,
              isEmail: isEmailInput,
              type: "signup",
              fullName,
            } as any
          );
        } else {
          showError(errorMessage, "Please try again");
        }
      },
      onError: () => {
        setIsSubmitting(false);
        showError(
          "Failed to send OTP. Please try again",
          "Please try again"
        );
      },
    });
  };

  const handleTermsAcceptance = () => {
    navigation.navigate(NAVIGATION_SCREENS.PDF_VIEWER, {
      url: require("../../../../assets/pdf/Terms_and_Conditions.pdf"),
      isFileFromLocal: true,
      fileName: "Terms_and_Conditions.pdf",
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
        size={14}
        color={theme.colors.textSecondary}
        style={styles.instructionText}
      >
        Enter your name, email address and referral code(if any) to create
        account.
      </CustomText>

      {/* <View style={styles.inputContainer}>
        <TextInput
          label="Full Name"
          placeholder="e.g. John Carter"
          value={fullName}
          onChangeText={setFullName}
        />
      </View> */}

      <View style={styles.inputContainer}>
        <TextInput
          label={
            isProductionEnv
              ? "Enter your email"
              : "Enter your email or phone number"
          }
          leftIcon={<AppIcon.Mail />}
          placeholder={
            isProductionEnv
              ? "joe@gmail.com"
              : "joe@gmail.com or 9876543210"
          }
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
            By adding your number above, you accept the{" "}
            <CustomText
              fontFamily="inter"
              variant="bodySmall"
              color={theme.colors.primary}
              onPress={handleTermsAcceptance}
            >
              Terms of Service & Privacy Policy
            </CustomText>
            {" "}and agree to receive transactional/informational SMS from PayAiro Inc. Message frequency may vary. Message and data rates may apply. Reply HELP for help or STOP to opt-out.
          </CustomText>
        </TouchableOpacity>

        {/* <TouchableOpacity
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
        </TouchableOpacity> */}

        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => {
            const newValue = !isPoliticallyExposed;
            setIsPoliticallyExposed(newValue);
            if (newValue) {
              setIsPoliticalModalVisible(true);
            }
          }}
          activeOpacity={0.7}
        >
          <View style={styles.checkboxIcon}>
            {isPoliticallyExposed ? (
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
            Are you a politically exposed person (PEP)?
          </CustomText>
        </TouchableOpacity>
      </View>

      <Button
        onPress={handleVerify}
        disabled={!agreeTerms || isSubmitting}
        loading={isPending || isSubmitting}
        style={styles.verifyButton}
      >
        Verify
      </Button>

      <TouchableOpacity
        style={styles.loginLink}
        onPress={() => navigation.navigate(NAVIGATION_SCREENS.NEW_LOGIN)}
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

      <PoliticalModal
        isVisible={isPoliticalModalVisible}
        onClose={() => setIsPoliticalModalVisible(false)}
        onConfirm={() => { }}
      />
    </ScreenWrapper>
  );
};

export default CreateAccountScreen;

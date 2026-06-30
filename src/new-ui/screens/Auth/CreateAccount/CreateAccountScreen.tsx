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
import { useUserOtpRequest } from "query/hooks/useAPIAuth";
import { getItem, STORAGE_KEYS } from "storage/mmkv";
import { isProduction } from "config/env.config";
import PoliticalModal from "components/PolitaclModal";
import TermAndConditionModal from "tsx-components/modals/TermAndConditionModal";
import type { TermAndConditionModalRef } from "tsx-components/modals/modal.types";

const COINME_TERMS_URL =
  "https://help.coinme.com/en/articles/9039676-terms-of-service";
const COINME_PRIVACY_URL =
  "https://help.coinme.com/en/articles/9039704-privacy-policy";
const COINME_DISCLOSURES_URL =
  "https://help.coinme.com/en/articles/10535881-disclosures";
const PAYAIRO_TERMS_URL = "https://official.payairo.com/terms-of-service";
const PAYAIRO_PRIVACY_URL = "https://official.payairo.com/privacy-policy";

const CreateAccountScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const styles = createAccountStyles(theme);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [agreePayAiro, setAgreePayAiro] = useState(false);
  const [agreeCoinme, setAgreeCoinme] = useState(false);
  const webDocRef = useRef<TermAndConditionModalRef>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [smsHash, setSmsHash] = useState("");
  const [isPoliticallyExposed, setIsPoliticallyExposed] = useState(false);
  const [isPoliticalModalVisible, setIsPoliticalModalVisible] = useState(false);



  const isProductionEnv = isProduction();
  const { mutate: otpRequest, isPending } = useUserOtpRequest();

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

    if (!agreePayAiro || !agreeCoinme) {
      showError(
        "Agreements required",
        "Please accept both PayAiro and Coinme agreements to continue"
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

    otpRequest(payload as any, {
      onSuccess: (data: any) => {
        setIsSubmitting(false);
        if (data?.status) {
          console.log("data =>", JSON.stringify(data, null, 2));
          showSuccess(successMessage);
          // NOTE: keep REFERRAL_CODE / REFERRAL_CLICK_ID in storage until OTP
          // verify, where they're attached to the new-signup attribution and
          // then cleared. (Previously removed here, before verify could use it.)

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
      onError: (error: any) => {
        setIsSubmitting(false);
        const errorMsg =
          error?.response?.data?.message ||
          "Failed to send OTP. Please try again";
        showError(errorMsg, "Please try again");
      },
    });
  };

  const openPayAiroTermsPdf = () => {
    webDocRef.current?.showWebDocument?.("Terms of Service", PAYAIRO_TERMS_URL);
  };

  const openPayAiroPrivacyPolicy = () => {
    webDocRef.current?.showWebDocument?.("Privacy Policy", PAYAIRO_PRIVACY_URL);
  };

  const openCoinmeTerms = () => {
    webDocRef.current?.showWebDocument?.(
      "Terms of Service",
      COINME_TERMS_URL
    );
  };

  const openCoinmeDisclosures = () => {
    webDocRef.current?.showWebDocument?.("Disclosures", COINME_DISCLOSURES_URL);
  };

  const openCoinmePrivacy = () => {
    webDocRef.current?.showWebDocument?.("Privacy Policy", COINME_PRIVACY_URL);
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
              : "Enter phone number"
          }
          leftIcon={<View style={{ flexDirection: "row", alignItems: "center", gap: 1 }}>
            <CustomText>+</CustomText>
            <CustomText>1</CustomText>
          </View>}
          placeholder={
            isProductionEnv
              ? "joe@gmail.com"
              : "9876543210"
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
        <View style={styles.checkbox}>
          <TouchableOpacity
            onPress={() => setAgreePayAiro(!agreePayAiro)}
            activeOpacity={0.7}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: agreePayAiro }}
          >
            <View style={styles.checkboxIcon}>
              {agreePayAiro ? (
                <AppIcon.TickCheckedBox />
              ) : (
                <AppIcon.UntickCheckedBox />
              )}
            </View>
          </TouchableOpacity>
          <CustomText
            fontFamily="inter"
            variant="bodySmall"
            style={styles.checkboxText}
          >
            {
              "By adding your number above, you accept the PayAiro "
            }
            <CustomText
              fontFamily="inter"
              variant="bodySmall"
              color={theme.colors.primary}
              onPress={openPayAiroTermsPdf}
            >
              Terms of Service
            </CustomText>
            {" & "}
            <CustomText
              fontFamily="inter"
              variant="bodySmall"
              color={theme.colors.primary}
              onPress={openPayAiroPrivacyPolicy}
            >
              Privacy Policy
            </CustomText>
            {
              " and agree to receive transactional/informational SMS from PayAiro Inc. Message frequency may vary, Message and data rates may apply. Reply HELP for help or STOP to opt-out."
            }
          </CustomText>
        </View>

        <View style={styles.checkbox}>
          <TouchableOpacity
            onPress={() => setAgreeCoinme(!agreeCoinme)}
            activeOpacity={0.7}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: agreeCoinme }}
          >
            <View style={styles.checkboxIcon}>
              {agreeCoinme ? (
                <AppIcon.TickCheckedBox />
              ) : (
                <AppIcon.UntickCheckedBox />
              )}
            </View>
          </TouchableOpacity>
          <CustomText
            fontFamily="inter"
            variant="bodySmall"
            style={styles.checkboxText}
          >
            {"I agree to Coinme's "}
            <CustomText
              fontFamily="inter"
              variant="bodySmall"
              color={theme.colors.primary}
              onPress={openCoinmeTerms}
            >
              Terms of Service
            </CustomText>
            ,{" "}
            <CustomText
              fontFamily="inter"
              variant="bodySmall"
              color={theme.colors.primary}
              onPress={openCoinmeDisclosures}
            >
              Disclosures
            </CustomText>
            , and{" "}
            <CustomText
              fontFamily="inter"
              variant="bodySmall"
              color={theme.colors.primary}
              onPress={openCoinmePrivacy}
            >
              Privacy Policy
            </CustomText>
            .
          </CustomText>
        </View>

        {/* <TouchableOpacity
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
        </TouchableOpacity> */}
      </View>

      <Button
        onPress={handleVerify}
        disabled={!agreePayAiro || !agreeCoinme || isSubmitting}
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
      <TermAndConditionModal isAgree={false} ref={webDocRef} />
    </ScreenWrapper>
  );
};

export default CreateAccountScreen;

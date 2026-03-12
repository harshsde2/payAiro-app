import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ScreenContainer } from "HOC";
import { Theme, useTheme } from "styles";
import { CustomText } from "tsx-components";
import AuthHeader from "tsx-components/AuthHeader";
import TermAndConditionModal from "tsx-components/modals/TermAndConditionModal";
import GenericButton from "components/GenericButton";
import HeaderTitle from "components/HeaderTitle";
import PoliticalModal from "components/PolitaclModal";
import EmailOrPhoneInput from "components/EmailOrPhoneInput";
import TextInputField from "components/TextInputField";
import Fonts from "constants/Fonts";
import { SvgIcons } from "constants/svgs";
import { SCREENS } from "constants/SCREENS";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { showError, showSuccess } from "utils/toast";
import { validateEmailOrPhone } from "utils/validation";
import { getSmsHash } from "utils/smsHash";
import { useSignUp } from "query/hooks/useAPIAuth";
import { getItem, removeItem, STORAGE_KEYS } from "storage/mmkv";
import { isProduction } from "config/env.config";
import { ISignupPayload } from "./types";

export default function Signup() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const styles = customStyles(theme);
  const termsAndConditionRef = useRef<any>(null);

  const [email, setEmail] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [isPoliticallyExposed, setIsPoliticallyExposed] = useState(false);
  const [isPoliticalModalVisible, setIsPoliticalModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [smsHash, setSmsHash] = useState("");

 const isProductionEnv = isProduction();
console.log("isProductionEnv =>", isProductionEnv);

  const { mutate: signUp, isPending } = useSignUp();

  // Check for stored referral code from deep link on mount
  useEffect(() => {
    const storedReferralCode = getItem(STORAGE_KEYS.REFERRAL_CODE);
    if (storedReferralCode) {
      console.log("Auto-filling referral code:", storedReferralCode);
      setReferralCode(storedReferralCode);
    }
  }, []);

  // Get SMS hash for Android OTP auto-read
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
    // Check for politically exposed person first
    if (isPoliticallyExposed) {
      setIsPoliticalModalVisible(true);
      return null;
    }

    // Validate email or phone using common utility
    const validationResult = validateEmailOrPhone(email);
    
    if (!validationResult.isValid) {
      showError(validationResult.errorMessage || "Invalid input", validationResult.helperText || "");
      return null;
    }

    // Check terms acceptance
    if (!isTermsAccepted) {
      showError("Terms & Conditions are required", "Please accept the terms and conditions");
      return null;
    }

    return validationResult;
  };

  const handleSubmit = () => {
    const validationResult = validateForm();
    if (!validationResult) return;

    setIsSubmitting(true);

    // Build payload based on input type (email or phone)
    const payload: ISignupPayload = {
      location: isProductionEnv ? "United States" : "india",
    };

    // Add email or phone to payload based on input type
    if (validationResult.inputType === "email") {
      payload.email = validationResult.formattedValue;
    } else if (validationResult.inputType === "phone") {
      payload.phone = validationResult.formattedValue;
      // Include SMS hash for Android OTP auto-read
      if (smsHash) {
        payload.hash = smsHash;
      }
    }

    // Include referral code if present
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


    console.log("payload =>", JSON.stringify(payload, null, 2));

    signUp(payload as any, {
      onSuccess: (data: any) => {
        setIsSubmitting(false);
        if (data?.status) {
          console.log("data =>", JSON.stringify(data, null, 2));
          showSuccess(successMessage);
          
          // Clear referral code from storage after successful submission
          removeItem(STORAGE_KEYS.REFERRAL_CODE);
          
          // Navigate with email or phone based on input type
          navigation.navigate(SCREENS.OTP, {
            email: isEmailInput ? validationResult.formattedValue : undefined,
            phone: !isEmailInput ? validationResult.formattedValue : undefined,
            inputType: validationResult.inputType,
            isEmail: isEmailInput,
          });
        } else {
          showError(errorMessage, "Please try again");
        }
      },
      onError: (error: any) => {
        setIsSubmitting(false);
        console.log("error =>", JSON.stringify(error.response, null, 2));
        showError("Failed to send OTP. Please try again", "Please try again");
      },
    });
  };

  const handleStateSelection = (state: string) => {
    setSelectedState(state);
  };

  const handleTermsAcceptance = () => {
    setIsTermsAccepted(true);
  };

  const handlePoliticalStatusConfirm = (status: boolean) => {
    setIsPoliticallyExposed(status);
    setIsPoliticalModalVisible(false);
  };

  const renderCheckbox = (checked: boolean) => {
    const CheckboxIcon = checked
      ? SvgIcons.OutLineCheckedBox
      : SvgIcons.OutLineUncheckedBox;
    return <CheckboxIcon width={15} height={15} />;
  };

  return (
    <ScreenContainer avoidKeyboard scrollable={true} padding={0}>
      <HeaderTitle title="Create an Account" leftIcon="true" />
      <View style={styles.headerContainer}>
        <AuthHeader showAuthLogo={true} />
      </View>

      <TermAndConditionModal
        onAgree={handleTermsAcceptance}
        ref={termsAndConditionRef}
      />
      <PoliticalModal
        isVisible={isPoliticalModalVisible}
        onConfirm={handlePoliticalStatusConfirm}
        onClose={() => setIsPoliticalModalVisible(false)}
      />
      <View style={styles.contentContainer}>
        <View style={styles.signinHeaderContainer}>
          <CustomText
            variant={"h3"}
            fontFamily={theme.typography.fontFamily.montserratBold}
            style={styles.signHeaderTextStyles}
          >
            Create an Account
          </CustomText>
          <CustomText
            variant={"caption"}
            style={styles.signHeaderCaptionTextStyles}
          >
            Securely access your crypto portfolio with ease. Simplify sign up
            now!
          </CustomText>
        </View>

        <View style={styles.fieldAndCheckboxContainer}>
          {/* <View style={styles.locationContainer}>
            <CustomText variant={"body2"} style={styles.locationLabel}>
              Select Your Location
            </CustomText>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate(NAVIGATION_SCREENS.SELECT_STATES, {
                  selectedState: selectedState,
                  onSelectState: handleStateSelection,
                })
              }
              style={styles.locationSelector}
            >
              <CustomText
                color={
                  selectedState
                    ? theme.colors.palette.grey900
                    : theme.colors.palette.grey500
                }
                variant={"body2"}
                style={styles.locationText}
              >
                {selectedState || "Select Your Location"}
              </CustomText>
              <SvgIcons.ChevronDown width={15} height={15} />
            </TouchableOpacity>
          </View> */}

          <EmailOrPhoneInput
            placeholder={isProductionEnv ? "joe@gmail.com" : "joe@gmail.com or 9876543210"}
            value={email}
            onChange={setEmail}
            label={isProductionEnv ? "Enter your email" : "Enter your email or phone number"}
            required={true}
          />
          <TextInputField
            placeholder="Enter referral code"
            value={referralCode}
            onChange={setReferralCode}
            label="Referral Code (Optional)"
          />
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsTermsAccepted((prev) => !prev)}
              style={styles.termsAndConditionContainer}
            >
              {renderCheckbox(isTermsAccepted)}
              <CustomText>
                <CustomText variant={"caption"}>
                  By clicking the button you agree with the
                </CustomText>
                <Text
                  onPress={() =>
                    termsAndConditionRef.current.showTermsAndConditions()
                  }
                  style={styles.termsLink}
                >
                  {" "}
                  Terms & Conditions
                </Text>
              </CustomText>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                const newValue = !isPoliticallyExposed;
                setIsPoliticallyExposed(newValue);
                if (newValue) {
                  setIsPoliticalModalVisible(true);
                }
              }}
              style={styles.termsAndConditionContainer}
            >
              {renderCheckbox(isPoliticallyExposed)}
              <CustomText variant={"caption"}>
                Are you a politically exposed person?
              </CustomText>
            </TouchableOpacity>
          </View>
        </View>
        <GenericButton
          title="Next"
          cStyle={styles.submitButton}
          onPress={handleSubmit}
          isLoading={isPending}
          showLoader={true}
          disabled={isSubmitting}
        />
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.accountRecoveryLinkContainer}
          onPress={() => {
            navigation.navigate(NAVIGATION_SCREENS.SUPPORT_SCREEN);
          }}
        >
          <CustomText
            variant={"caption"}
            style={styles.accountRecoveryLinkText}
            color={theme.colors.palette.green500}
          >
            Already signed up but can’t access your account? Recover it
          </CustomText>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const customStyles = (theme: Theme) =>
  StyleSheet.create({
    headerContainer: {
      flex: 1,
    },
    contentContainer: {
      width: "100%",
      minHeight: 450,
      backgroundColor: theme.colors.palette.white,
      borderTopEndRadius: theme.spacing.spacing[8],
      borderTopStartRadius: theme.spacing.spacing[8],
      padding: theme.spacing.spacing[5],
      paddingVertical: theme.spacing.spacing[10],
      paddingBottom: theme.spacing.spacing[8],
    },
    signinHeaderContainer: {
      width: "80%",
      alignSelf: "center",
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
    fieldAndCheckboxContainer: {
      // marginVertical: 30,
      flex: 1,
    },
    locationContainer: {
      width: "100%",
    },
    locationLabel: {
      fontFamily: Fonts.semibold,
      padding: 10,
    },
    locationSelector: {
      width: "100%",
      borderRadius: 30,
      borderColor: theme.colors.palette.grey300,
      borderWidth: 1,
      paddingVertical: 15,
      paddingHorizontal: 15,
      lineHeight: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    locationText: {
      fontFamily: Fonts.semibold,
      textTransform: "capitalize",
    },
    checkboxContainer: {
      paddingHorizontal: 10,
      marginVertical: 10,
    },
    termsAndConditionContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      marginTop: theme.spacing.spacing[4],
      width: "100%",
      gap: theme.spacing.spacing[3],
    },
    termsLink: {
      fontWeight: "700",
    },
    submitButton: {
      marginTop: 20,
    },
    accountRecoveryLinkContainer: {
      marginTop: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    accountRecoveryLinkText: {
      textAlign: "center",
    },
  });

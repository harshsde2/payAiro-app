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
import TextInputField from "components/TextInputField";
import Fonts from "constants/Fonts";
import { SvgIcons } from "constants/svgs";
import { SCREENS } from "constants/SCREENS";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { showError, showSuccess } from "utils/toast";
import { useSignUp } from "query/hooks/useAPIAuth";
import { getItem, removeItem, STORAGE_KEYS } from "storage/mmkv";

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

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

  const { mutate: signUp, isPending } = useSignUp();

  // Check for stored referral code from deep link on mount
  useEffect(() => {
    const storedReferralCode = getItem(STORAGE_KEYS.REFERRAL_CODE);
    if (storedReferralCode) {
      console.log("Auto-filling referral code:", storedReferralCode);
      setReferralCode(storedReferralCode);
    }
  }, []);

  const validateForm = (): boolean => {
    const trimmedEmail = email.trim();
    const trimmedState = selectedState.trim();

    if (!trimmedEmail) {
      showError("Email field cannot be empty");
      return false;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      showError("Please enter a valid email address");
      return false;
    }

    if (!trimmedState) {
      showError("Location field cannot be empty");
      return false;
    }

    if (!isTermsAccepted) {
      showError("Terms & Conditions are required");
      return false;
    }

    if (isPoliticallyExposed) {
      showError("Politically exposed persons cannot create an account");
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    const payload: any = {
      email: email.trim().toLowerCase(),
      location: selectedState,
    };

    // Include referral code if present
    if (referralCode && referralCode.trim().length > 0) {
      payload.ref_code = referralCode.trim();
    }

    signUp(payload, {
      onSuccess: (data: any) => {
        setIsSubmitting(false);
        if (data?.status) {
          console.log("data =>", JSON.stringify(data, null, 2));
          showSuccess("OTP has been sent to your email");
          
          // Clear referral code from storage after successful submission
          removeItem(STORAGE_KEYS.REFERRAL_CODE);
          
          navigation.navigate(SCREENS.OTP, { email });
        } else {
          showError("Email address already exists");
        }
      },
      onError: () => {
        setIsSubmitting(false);
        showError("Failed to send OTP. Please try again");
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
          <View style={styles.locationContainer}>
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
          </View>

          <TextInputField
            placeholder="joe@gmail.com"
            value={email}
            onChange={setEmail}
            label="Enter your email"
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
      // marginTop: 20,
    },
  });

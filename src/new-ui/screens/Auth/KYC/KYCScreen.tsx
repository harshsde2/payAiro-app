import React, { useState, useRef } from "react";
import { View, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { useDispatch } from "react-redux";
import { setProfileCompleted, setStepCount } from "redux/slices/newOnboardingSlice";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { kycStyles } from "@new-ui/styles/screens/auth/kycStyles";
import CustomText from "@new-ui/components/common-components/CustomText";
import { TextInput, Button } from "@new-ui/components/common-components/layout";
import ScreenWrapper from "@new-ui/components/common-components/ScreenWrapper";
import {
  KYCScreenNavigationProp,
  KYCScreenRouteProp,
} from "@new-ui/screens/Auth/types";
import { AppIcon } from "@new-ui/assets/svgs";
import TermAndConditionModal from "tsx-components/modals/TermAndConditionModal";
import { useUserKycComplete } from "query/hooks/useAPIAuth";
import { validateEmail } from "utils/validation";
import {
  saveKycVerifyDraft,
  setOnboardingStep,
  type KycVerifyDetails,
} from "auth/authSession";
import { showError, showSuccess, getApiErrorMessage } from "utils/toast";
import { useRestartSignup } from "@new-ui/screens/Auth/useRestartSignup";

const KYCScreen: React.FC = () => {
  const navigation = useNavigation<KYCScreenNavigationProp>();
  const route = useRoute<KYCScreenRouteProp>();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const styles = kycStyles(theme);
  const termsAndConditionRef = useRef<any>(null);

  const params = (route.params || {}) as {
    firstName?: string;
    lastName?: string;
    email?: string;
    username?: string;
    data?: any;
  };

  const [firstName, setFirstName] = useState(params.firstName || "");
  const [lastName, setLastName] = useState(params.lastName || "");
  // PayAiro Tag is user-chosen — start empty rather than prefilling from onboarding.
  const [payairoName, setPayairoName] = useState("");
  const [userEmail, setUserEmail] = useState((params.email || "").toLowerCase());
  const [ssnLastFour, setSsnLastFour] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [checked, setChecked] = useState(false);
  const [checkedCybridUserAgreement, setCheckedCybridUserAgreement] =
    useState(false);

  const { mutate: submitKycComplete } = useUserKycComplete();
  const handleStartOver = useRestartSignup();

  const handlePDFViewAMLPolicy = () => {
    (navigation as any).navigate(NAVIGATION_SCREENS.PDF_VIEWER, {
      url: require("../../../../assets/pdf/AML_Policy_PayAiro.pdf"),
      isFileFromLocal: true,
      fileName: "AML_Policy_PayAiro.pdf",
    });
  };

  const handleForm = () => {
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedPayairoName = payairoName.trim();
    const trimmedEmail = userEmail.trim().toLowerCase();
    const trimmedSsnLastFour = ssnLastFour.trim();

    if (
      !trimmedFirstName ||
      !trimmedLastName ||
      !trimmedPayairoName ||
      !trimmedEmail ||
      !trimmedSsnLastFour
    ) {
      showError("Fields cannot be empty", "Please fill all required fields");
      return;
    }

    const emailValidation = validateEmail(trimmedEmail);
    if (!emailValidation.isValid) {
      showError(
        emailValidation.errorMessage || "Invalid email",
        emailValidation.helperText || "Please check and try again"
      );
      return;
    }

    if (!/^\d{4}$/.test(trimmedSsnLastFour)) {
      showError("Invalid SSN", "Please enter the last 4 digits of your SSN");
      return;
    }

    if (!checked) {
      showError(
        "Terms of Service are required",
        "Please accept the terms of service"
      );
      return;
    }

    if (!checkedCybridUserAgreement) {
      showError(
        "Cybrid User Agreement is required",
        "Please accept the Cybrid User Agreement"
      );
      return;
    }

    const payload = {
      first_name: trimmedFirstName,
      last_name: trimmedLastName,
      payairo_name: trimmedPayairoName,
      email: trimmedEmail,
      ssn_last_four: trimmedSsnLastFour,
    };

    setIsPending(true);

    submitKycComplete(payload, {
      onSuccess: (resp) => {
        setIsPending(false);

        if (!resp?.status) {
          showError("Couldn't submit details", resp?.message || "Please try again.");
          return;
        }

        showSuccess("Details submitted", resp?.message || "Please verify your details.");
        dispatch(setProfileCompleted(true));
        dispatch(setStepCount(1));

        // Step 1 only fetches the identity — nothing is verified yet, so the user goes to
        // step 2 rather than into the app. Persist so a restart resumes there too.
        setOnboardingStep(1);
        const details = (resp?.data || {}) as KycVerifyDetails;
        saveKycVerifyDraft(details);

        (navigation as any).navigate(NAVIGATION_SCREENS.NEW_KYC_VERIFY, { details });
      },
      onError: (error: any) => {
        setIsPending(false);
        showError(
          "Couldn't submit details",
          getApiErrorMessage(error, "Please try again.")
        );
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
      <TermAndConditionModal ref={termsAndConditionRef} />
      <View style={styles.subtitleContainer}>
        <CustomText variant="h2" style={styles.subtitle} fontWeight="semiBold">
          Details
        </CustomText>
      </View>
      <View style={styles.instructionTextContainer}>
        <CustomText
          variant="body"
          fontFamily="inter"
          color={theme.colors.textSecondary}
          style={styles.instructionText}
        >
          Complete your KYC for seamless payment or explore our app without KYC!
        </CustomText>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          label="First Name"
          placeholder="e.g. Jane"
          value={firstName}
          onChangeText={setFirstName}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          label="Last Name"
          placeholder="e.g. Doe"
          value={lastName}
          onChangeText={setLastName}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          label="PayAiro Tag"
          placeholder="e.g. rahuldev"
          value={payairoName}
          onChangeText={setPayairoName}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          label="Email Address"
          placeholder="jane.doe@example.com"
          value={userEmail}
          onChangeText={setUserEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          label="Last 4 digits of SSN"
          placeholder="1234"
          value={ssnLastFour}
          onChangeText={(text) => setSsnLastFour(text.replace(/\D/g, "").slice(0, 4))}
          autoCapitalize="none"
          keyboardType="number-pad"
          maxLength={4}
        />
      </View>

      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            setChecked((state) => !state);
          }}
          style={styles.checkbox}
        >
          <View style={styles.checkboxIcon}>
            {checked ? (
              <AppIcon.TickCheckedBox />
            ) : (
              <AppIcon.UntickCheckedBox />
            )}
          </View>
          <CustomText
            style={styles.checkboxText}
          >
            <CustomText variant="caption">
              By clicking the button you agree with the
            </CustomText>
            {" "}
            <CustomText
              fontFamily="inter"
              variant="bodySmall"
              color={theme.colors.primary}
              onPress={() => termsAndConditionRef.current?.showPatriotAct()}
            >
              Patriot Act
            </CustomText>{" "}
            and{" "}
            <CustomText
              fontFamily="inter"
              variant="bodySmall"
              color={theme.colors.primary}
              onPress={() => termsAndConditionRef.current?.showESignDisclosure()}
            >
              e-Sign Disclosure
            </CustomText>
          </CustomText>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            setCheckedCybridUserAgreement(!checkedCybridUserAgreement);
          }}
          style={styles.checkbox}
        >
          <View style={styles.checkboxIcon}>
            {checkedCybridUserAgreement ? (
              <AppIcon.TickCheckedBox />
            ) : (
              <AppIcon.UntickCheckedBox />
            )}
          </View>
          <CustomText
            style={styles.checkboxText}
          >
            <CustomText variant="caption">
              By clicking the button you agree with the
            </CustomText>
            <CustomText
              onPress={handlePDFViewAMLPolicy}
              fontFamily="inter"
              variant="bodySmall"
              color={theme.colors.primary}
            >
              {" "}
              AML Policy{" "}
            </CustomText>
          </CustomText>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonContainer}>
        <Button
          onPress={handleForm}
          style={styles.proceedButton}
          loading={isPending}
          disabled={isPending}
        >
          Proceed
        </Button>

        <TouchableOpacity
          onPress={handleStartOver}
          disabled={isPending}
          activeOpacity={0.7}
          style={styles.startOverButton}
        >
          <CustomText
            variant="bodySmall"
            fontFamily="inter"
            color={theme.colors.primary}
            style={styles.startOverText}
          >
            Sign in with a different number
          </CustomText>
        </TouchableOpacity>
      </View>

      <View style={styles.disclaimerContainer}>
        <CustomText
          variant="bodySmall"
          fontFamily="inter"
          size={12}
          color={theme.colors.textSecondary}
          style={styles.disclaimerText}
        >
          If you skip the KYC process, you will get Non-KYC mode (limited functions). Update KYC later in Settings to enjoy seamlessly.
        </CustomText>
      </View>
    </ScreenWrapper>
  );
};

export default KYCScreen;

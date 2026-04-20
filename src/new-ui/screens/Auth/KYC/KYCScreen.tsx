import React, { useState, useCallback, useRef } from "react";
import { View, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { useDispatch } from "react-redux";
import {
  setUserData,
} from "redux/slices/newBackendAuthSlice";
import { setProfileCompleted } from "redux/slices/newOnboardingSlice";
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
import { useUserProfileUpdate } from "query/hooks/useAPIAuth";
import { validateEmail } from "utils/validation";
import { showError, showSuccess } from "utils/toast";

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
    data?: any;
  };

  const [firstName, setFirstName] = useState(params.firstName || "");
  const [lastName, setLastName] = useState(params.lastName || "");
  const [userEmail, setUserEmail] = useState((params.email || "").toLowerCase());
  const [dob, setDob] = useState("");
  const [ssn, setSsn] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [checked, setChecked] = useState(false);
  const [checkedCybridUserAgreement, setCheckedCybridUserAgreement] =
    useState(false);

  const { mutate: patchUser } = useUserProfileUpdate();

  const handleProceed = () => {
    handleForm();
  };

  const handleSkipKYC = () => {
    // dispatch(setLogin(true));
    return;
  };

  const handlePDFViewCybridUserAgreement = () => {
    (navigation as any).navigate(NAVIGATION_SCREENS.PDF_VIEWER, {
      url: require("../../../../assets/pdf/Cybrid_User_Agreement.pdf"),
      isFileFromLocal: true,
      fileName: "Cybrid_User_Agreement.pdf",
    });
  };
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
    const trimmedEmail = userEmail.trim().toLowerCase();
    const trimmedDob = dob.trim();
    const trimmedSsn = ssn.trim();

    if (
      !trimmedFirstName ||
      !trimmedLastName ||
      !trimmedEmail ||
      !trimmedDob ||
      !trimmedSsn
    ) {
      showError("Fields cannot be empty", "Please fill all required fields");
      return;
    }

    const emailValidation = validateEmail(trimmedEmail);
    if (!emailValidation.isValid) {
      showError(
        emailValidation.errorMessage || "Invalid email",
        emailValidation.helperText || ""
      );
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmedDob)) {
      showError("Invalid DOB format", "Please use YYYY-MM-DD format");
      return;
    }

    // if (!/^\d{3}-\d{2}-\d{4}$/.test(trimmedSsn)) {
    //   showError("Invalid SSN format", "Please use XXX-XX-XXXX format");
    //   return;
    // }

    if (!checked) {
      showError(
        "Terms & Conditions are required",
        "Please accept the terms and conditions"
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

    const payload: any = {
      first_name: trimmedFirstName,
      last_name: trimmedLastName,
      email: trimmedEmail,
      dob: trimmedDob,
      ssn: trimmedSsn,
    };

    setIsPending(true);

    patchUser(payload as any, {
      onSuccess: async (datas: any) => {
        setIsPending(false);
        dispatch(setUserData(datas?.data));

        if (datas && datas?.status) {
          showSuccess("Profile updated successfully");
          dispatch(setProfileCompleted(true));
          navigation.navigate(NAVIGATION_SCREENS.NEW_ADDRESS);
        } else {
          showError("Failed to update profile");
        }
      },
      onError: (error: any) => {
        setIsPending(false);
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to submit details";
        showError(errorMessage);
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
          label="Date of Birth"
          placeholder="YYYY-MM-DD"
          value={dob}
          onChangeText={setDob}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          label="SSN"
          placeholder="123-45-6789"
          value={ssn}
          onChangeText={setSsn}
          autoCapitalize="none"
          keyboardType="number-pad"
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
            {" "}
            <CustomText
              onPress={handlePDFViewCybridUserAgreement}
              fontFamily="inter"
              variant="bodySmall"
              color={theme.colors.primary}
            >
              {" "}
              Cybrid User Agreement{" "}
            </CustomText>
            {"and"}
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

        {/* <TouchableOpacity
          style={styles.skipKYCContainer}
          onPress={handleSkipKYC}
          activeOpacity={0.7}
        >
          <CustomText
            variant="body"
            fontFamily="inter"
            fontWeight="medium"
            color={theme.colors.text}
            style={styles.skipKYCText}
          >
            Skip KYC
          </CustomText>
          <AppIcon.ArrowRight width={16} height={16} />
        </TouchableOpacity> */}

        <Button
          onPress={handleProceed}
          style={styles.proceedButton}
          loading={isPending}
          disabled={isPending}
        >
          Proceed
        </Button>
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


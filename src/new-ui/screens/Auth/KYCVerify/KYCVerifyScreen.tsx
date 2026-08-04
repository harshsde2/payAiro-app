import React, { useMemo, useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { setShowLoader } from "redux/slices/newBackendAuthSlice";
import { setStepCount } from "redux/slices/newOnboardingSlice";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { kycVerifyStyles } from "@new-ui/styles/screens/auth/kycVerifyStyles";
import CustomText from "@new-ui/components/common-components/CustomText";
import { TextInput, Button } from "@new-ui/components/common-components/layout";
import StatePicker from "@new-ui/components/common-components/StatePicker";
import ScreenWrapper from "@new-ui/components/common-components/ScreenWrapper";
import { KYCVerifyScreenRouteProp } from "@new-ui/screens/Auth/types";
import { useUserKycVerify } from "query/hooks/useAPIAuth";
import { isValidStateCode } from "@new-ui/constants/usStates";
import {
  clearKycVerifyDraft,
  getKycVerifyDraft,
  type KycVerifyDetails,
} from "auth/authSession";
import { bootstrapMainAppSession } from "auth/bootstrapMainAppSession";
import { showError, showSuccess, getApiErrorMessage } from "utils/toast";
import { detailsFromUsersMe, resolveKycVerifyDetails } from "./kycVerifyPrefill";
import { useRestartSignup } from "@new-ui/screens/Auth/useRestartSignup";

/** Step 2 of onboarding: the user confirms (and corrects) the identity Coinme returned. */
const KYCVerifyScreen: React.FC = () => {
  const route = useRoute<KYCVerifyScreenRouteProp>();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const styles = kycVerifyStyles(theme);

  const usersMe = useSelector((state: any) => state.authenticationSlice?.usersMe);
  const userData = useSelector((state: any) => state.authenticationSlice?.userData);

  // Route params win; then the draft persisted at step 1; then /users/me (the resume case).
  const details: KycVerifyDetails = useMemo(
    () =>
      resolveKycVerifyDetails(
        route.params?.details,
        getKycVerifyDraft(),
        detailsFromUsersMe(usersMe, userData)
      ),
    [route.params?.details, usersMe, userData]
  );

  const [firstName, setFirstName] = useState(details.first_name || "");
  const [lastName, setLastName] = useState(details.last_name || "");
  const [addressLine1, setAddressLine1] = useState(details.address_line1 || "");
  const [addressLine2, setAddressLine2] = useState(details.address_line2 || "");
  const [city, setCity] = useState(details.city || "");
  const [stateCode, setStateCode] = useState(details.state || "");
  const [postalCode, setPostalCode] = useState(details.postal_code || "");
  const [isPending, setIsPending] = useState(false);

  const { mutate: submitKycVerify } = useUserKycVerify();
  const handleStartOver = useRestartSignup();

  const handleConfirm = () => {
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedAddressLine1 = addressLine1.trim();
    const trimmedAddressLine2 = addressLine2.trim();
    const trimmedCity = city.trim();
    const trimmedPostalCode = postalCode.trim();

    if (!trimmedFirstName || !trimmedLastName) {
      showError("Name is required", "Please enter your first and last name");
      return;
    }

    if (!trimmedAddressLine1 || !trimmedCity) {
      showError("Address is incomplete", "Please enter your street address and city");
      return;
    }

    if (!isValidStateCode(stateCode)) {
      showError("State is required", "Please select your state");
      return;
    }

    if (!/^\d{5}$/.test(trimmedPostalCode)) {
      showError("Invalid ZIP code", "Please enter a 5-digit ZIP code");
      return;
    }

    const payload = {
      first_name: trimmedFirstName,
      last_name: trimmedLastName,
      address_line1: trimmedAddressLine1,
      ...(trimmedAddressLine2 ? { address_line2: trimmedAddressLine2 } : {}),
      city: trimmedCity,
      state: stateCode,
      postal_code: trimmedPostalCode,
      ...(details.date_of_birth ? { date_of_birth: details.date_of_birth } : {}),
    };

    setIsPending(true);

    submitKycVerify(payload, {
      onSuccess: async (resp) => {
        // Anything short of step 2 means Coinme did not verify — keep the user here
        // with their edits so they can correct the address and retry.
        if (!resp?.status || resp?.step !== 2) {
          setIsPending(false);
          showError(
            "Couldn't verify your details",
            resp?.message || "Please check your details and try again."
          );
          return;
        }

        clearKycVerifyDraft();
        dispatch(setStepCount(2));

        dispatch(setShowLoader(true));
        try {
          const result = await bootstrapMainAppSession(dispatch);
          if (result.ok) {
            showSuccess("You're all set", "Welcome to PayAiro.");
          } else {
            showError(
              "Couldn't load your details",
              result.message || "Please try again."
            );
          }
        } finally {
          dispatch(setShowLoader(false));
          setIsPending(false);
        }
      },
      onError: (error: any) => {
        setIsPending(false);
        showError(
          "Couldn't verify your details",
          getApiErrorMessage(error, "Please try again.")
        );
      },
    });
  };

  const readOnlyProps = {
    editable: false,
    inputStyle: styles.readOnlyInput,
    borderColor: theme.colors.greyLight,
  };

  return (
    <ScreenWrapper
      safeArea
      padding={16}
      safeAreaEdges={["bottom", "left", "right"]}
      scrollable
      contentStyle={styles.content}
    >
      <View style={styles.subtitleContainer}>
        <CustomText variant="h2" style={styles.subtitle} fontWeight="semiBold">
          Verify your details
        </CustomText>
      </View>
      <View style={styles.instructionTextContainer}>
        <CustomText
          variant="body"
          fontFamily="inter"
          color={theme.colors.textSecondary}
          style={styles.instructionText}
        >
          These are the details we found for you. Check them carefully and correct
          anything that's wrong before confirming.
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

      <View style={styles.sectionHeader}>
        <CustomText variant="h4" fontWeight="semiBold">
          Address
        </CustomText>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          label="Address Line 1"
          placeholder="e.g. 123 Main St"
          value={addressLine1}
          onChangeText={setAddressLine1}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          label="Address Line 2 (optional)"
          placeholder="e.g. Apt 4B"
          value={addressLine2}
          onChangeText={setAddressLine2}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          label="City"
          placeholder="e.g. Seattle"
          value={city}
          onChangeText={setCity}
        />
      </View>

      <View style={styles.inputContainer}>
        <StatePicker label="State" value={stateCode} onSelect={setStateCode} />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          label="ZIP Code"
          placeholder="98101"
          value={postalCode}
          onChangeText={(text) => setPostalCode(text.replace(/\D/g, "").slice(0, 5))}
          keyboardType="number-pad"
          maxLength={5}
        />
      </View>

      {/* <View style={styles.sectionHeader}>
        <CustomText variant="h4" fontWeight="semiBold">
          Locked details
        </CustomText>
      </View> */}

      <View style={styles.inputContainer}>
        <TextInput
          label="Date of Birth"
          value={details.date_of_birth || "—"}
          {...readOnlyProps}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          label="Last 4 digits of SSN"
          value={details.ssn_last_four || "—"}
          {...readOnlyProps}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          label="Email Address"
          value={details.email || "—"}
          {...readOnlyProps}
        />
      </View>

      {!!details.phone && (
        <View style={styles.inputContainer}>
          <TextInput label="Phone Number" value={details.phone} {...readOnlyProps} />
        </View>
      )}

      <CustomText
        variant="bodySmall"
        fontFamily="inter"
        size={12}
        color={theme.colors.textSecondary}
        style={styles.lockedNote}
      >
        Your date of birth, SSN, email and phone number can't be changed here. Contact
        support if any of these are incorrect.
      </CustomText>

      <View style={styles.buttonContainer}>
        <Button
          onPress={handleConfirm}
          style={styles.proceedButton}
          loading={isPending}
          disabled={isPending}
        >
          Confirm & Continue
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
    </ScreenWrapper>
  );
};

export default KYCVerifyScreen;

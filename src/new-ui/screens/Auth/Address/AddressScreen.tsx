import React, { useState } from "react";
import { View } from "react-native";
import { useDispatch } from "react-redux";
import ScreenWrapper from "@new-ui/components/common-components/ScreenWrapper";
import CustomText from "@new-ui/components/common-components/CustomText";
import { TextInput, Button } from "@new-ui/components/common-components/layout";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { kycStyles } from "@new-ui/styles/screens/auth/kycStyles";
import { useUserAddressUpdate } from "query/hooks/useAPIAuth";
import { showError, showSuccess, getApiErrorMessage } from "utils/toast";
import { abandonIncompleteSignup } from "auth/authSession";
import { bootstrapMainAppSession } from "auth/bootstrapMainAppSession";
import { resetState, setShowLoader } from "redux/slices/newBackendAuthSlice";
import {
  resetOnboardingState,
  setAddressCompleted,
  setStepCount,
} from "redux/slices/newOnboardingSlice";
import { useNavigation } from "@react-navigation/native";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";

const AddressScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = kycStyles(theme);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("USA");

  const { mutate: updateAddress, isPending: isAddressPending } =
    useUserAddressUpdate();
  const isPending = isAddressPending;

  const handleSubmit = () => {
    const payload = {
      address_line1: addressLine1.trim(),
      address_line2: addressLine2.trim(),
      city: city.trim(),
      state: state.trim(),
      postal_code: postalCode.trim(),
      country: country.trim().toUpperCase(),
    };

    if (
      !payload.address_line1 ||
      !payload.city ||
      !payload.state ||
      !payload.postal_code ||
      !payload.country
    ) {
      showError("Missing required fields", "Please fill all required fields");
      return;
    }

    updateAddress(payload, {
      onSuccess: async (resp: any) => {
        if (!resp?.status) {
          showError("Couldn't update address", resp?.message || "Please try again.");
          return;
        }

        showSuccess("Address updated", resp?.message || "Your address has been saved.");
        dispatch(setAddressCompleted(true));

        dispatch(setShowLoader(true));
        try {
          const result = await bootstrapMainAppSession(dispatch);
          if (result.ok) {
            dispatch(setStepCount(2));
            showSuccess("You're all set", "Welcome to PayAiro.");
          } else {
            showError("Couldn't load your details", result.message || "Please try again.");
          }
        } finally {
          dispatch(setShowLoader(false));
        }
      },
      onError: (error: any) => {
        showError(
          "Couldn't update address",
          getApiErrorMessage(error, "Please try again.")
        );
      },
    });
  };

  const handleCancel = async () => {
    await abandonIncompleteSignup();
    dispatch(resetState());
    dispatch(resetOnboardingState());
    (navigation as any).reset({
      index: 0,
      routes: [{ name: NAVIGATION_SCREENS.NEW_ONBOARDING }],
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
      <View style={styles.subtitleContainer}>
        <CustomText variant="h2" style={styles.subtitle} fontWeight="semiBold">
          Address Details
        </CustomText>
      </View>
      <View style={styles.instructionTextContainer}>
        <CustomText
          variant="body"
          fontFamily="inter"
          color={theme.colors.textSecondary}
          style={styles.instructionText}
        >
          Add your address to complete onboarding.
        </CustomText>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          label="Address Line 1"
          placeholder="742 Evergreen Terrace"
          value={addressLine1}
          onChangeText={setAddressLine1}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          label="Address Line 2 (Optional)"
          placeholder="Apartment, suite, etc."
          value={addressLine2}
          onChangeText={setAddressLine2}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          label="City"
          placeholder="Springfield"
          value={city}
          onChangeText={setCity}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          label="State"
          placeholder="IL"
          value={state}
          onChangeText={setState}
          autoCapitalize="characters"
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          label="Postal Code"
          placeholder="62704"
          value={postalCode}
          onChangeText={setPostalCode}
          keyboardType="number-pad"
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          label="Country"
          placeholder="USA"
          value={country}
          onChangeText={setCountry}
          autoCapitalize="characters"
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          onPress={handleSubmit}
          style={styles.proceedButton}
          loading={isPending}
          disabled={isPending}
        >
          Continue
        </Button>
        <Button
          onPress={handleCancel}
          
          style={styles.proceedButton}
          // loading={isPending}
          // disabled={isPending}
        >
          Cancel
        </Button>
      </View>
    </ScreenWrapper>
  );
};

export default AddressScreen;

import { useCallback } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { abandonIncompleteSignup } from "auth/authSession";
import { resetState } from "redux/slices/newBackendAuthSlice";
import { resetOnboardingState } from "redux/slices/newOnboardingSlice";

/**
 * Escape hatch for the mid-signup screens (KYC step 1 / step 2).
 *
 * Those screens are reached via a stack reset, so there is no back button, and the
 * persisted onboarding step sends the user straight back to them on relaunch — a
 * restart alone can't get them out. This clears the half-finished session so they can
 * start again with a different phone number or email.
 */
export const useRestartSignup = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const restart = useCallback(async () => {
    await abandonIncompleteSignup();
    dispatch(resetState());
    dispatch(resetOnboardingState());
    (navigation as any).reset({
      index: 0,
      routes: [{ name: NAVIGATION_SCREENS.NEW_ONBOARDING }],
    });
  }, [dispatch, navigation]);

  /** Confirms first — starting over means redoing OTP and phone verification. */
  return useCallback(() => {
    Alert.alert(
      "Start over?",
      "This clears the details you've entered so you can sign in with a different number or email. You'll need to verify again.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Start over", style: "destructive", onPress: () => { void restart(); } },
      ]
    );
  }, [restart]);
};

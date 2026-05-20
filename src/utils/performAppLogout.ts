import { resetAnimationState } from "redux/slices/animationSlice";
import { resetOnboardingState } from "redux/slices/newOnboardingSlice";
import { store } from "redux/store";
import {
  setKYCAcceopted,
  setPin,
  setWalletDataAuth,
} from "services/Auth";
import { onUserLoggedOut as onCoinmeUserLoggedOut } from "services/coinmeRiskLifecycle";
import { clearAuthSession } from "auth/authSession";
import { resetAppState } from "utils/configs";

export async function performAppLogout(): Promise<void> {
  await onCoinmeUserLoggedOut();

  clearAuthSession();
  resetAppState();
  store.dispatch(resetOnboardingState());
  store.dispatch(resetAnimationState());
  setWalletDataAuth(null);
  setPin(null);
  setKYCAcceopted(null);
}

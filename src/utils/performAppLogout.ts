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
import { unregisterFcmDevice } from "query/hooks/useNotificationDevices";

export async function performAppLogout(): Promise<void> {
  await onCoinmeUserLoggedOut();

  // Unregister this device's FCM token from the backend BEFORE clearing the
  // session — userApiClient still has the valid Bearer token to authorize it.
  // Best-effort: never throws, so it can't block logout.
  await unregisterFcmDevice();

  clearAuthSession();
  resetAppState();
  store.dispatch(resetOnboardingState());
  store.dispatch(resetAnimationState());
  setWalletDataAuth(null);
  setPin(null);
  setKYCAcceopted(null);
}

import { resetAnimationState } from "redux/slices/animationSlice";
import { setLogin } from "redux/slices/newBackendAuthSlice";
import { resetOnboardingState } from "redux/slices/newOnboardingSlice";
import { store } from "redux/store";
import {
  setKYCAcceopted,
  setPin,
  setWalletDataAuth,
} from "services/Auth";
import { onUserLoggedOut as onCoinmeUserLoggedOut } from "services/coinmeRiskLifecycle";
import { clearAll } from "storage/mmkv";
import { resetAppState } from "utils/configs";

export async function performAppLogout(): Promise<void> {
  await onCoinmeUserLoggedOut();

  resetAppState();
  store.dispatch(resetOnboardingState());
  store.dispatch(resetAnimationState());
  setWalletDataAuth(null);
  setPin(null);
  setKYCAcceopted(null);
  clearAll();

  setTimeout(() => {
    store.dispatch(setLogin(false));
  }, 100);
}

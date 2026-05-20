import { Dispatch } from "@reduxjs/toolkit";
import { USER_AUTH } from "api/endpoints";
import { userApiClient } from "api/userApiClient";
import {
  hydrateUserFromMe,
  setAppAccessGranted,
} from "redux/slices/newBackendAuthSlice";
import { setBiometric } from "services/Auth";
import { scheduleOnUserLoggedIn } from "services/coinmeRiskLifecycle";
import { markOnboardingComplete } from "auth/authSession";
import { setItem, setPin, STORAGE_KEYS } from "storage/mmkv";

export async function syncSecurityPinFromBackend(): Promise<void> {
  const response = await userApiClient.get<{
    ok?: boolean;
    data?: { pin?: string | null; biometric?: boolean };
  }>(USER_AUTH.SECURITY_PIN_SETTINGS);

  const data = response?.data ?? {};
  const backendPin = typeof data?.pin === "string" ? data.pin : null;
  const hasBackendPin = !!backendPin && backendPin.length > 0;
  const biometric = data?.biometric === true;

  if (hasBackendPin && !backendPin.includes("*")) {
    setPin(backendPin);
  }
  await setBiometric(biometric);
}

export async function bootstrapMainAppSession(
  dispatch: Dispatch
): Promise<{ ok: boolean; message?: string }> {
  try {
    const me = await userApiClient.get<{
      ok?: boolean;
      data?: Record<string, unknown>;
    }>(USER_AUTH.USERS_ME);

    if (!me?.ok || !me?.data) {
      return { ok: false, message: "Failed to load profile" };
    }

    setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(me.data?.user || {}));
    dispatch(hydrateUserFromMe(me.data as any));

    const coinmeAccountId = (me.data as any)?.caas_onboarding?.caas_customer_id;
    if (coinmeAccountId != null) {
      scheduleOnUserLoggedIn(String(coinmeAccountId));
    }

    await syncSecurityPinFromBackend();

    markOnboardingComplete();
    dispatch(setAppAccessGranted(true));

    return { ok: true };
  } catch (e: any) {
    const message =
      e?.response?.data?.message || e?.message || "Failed to load session";
    return { ok: false, message: String(message) };
  }
}

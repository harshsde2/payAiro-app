import { useMutation } from "@tanstack/react-query";
import { Platform } from "react-native";
import DeviceInfo from "react-native-device-info";
import { USER_AUTH } from "api/endpoints";
import { userApiClient } from "api/userApiClient";
import { getDeviceFingerprint } from "utils/getDeviceFingerprint";

export type DevicePlatform = "android" | "ios";

export interface RegisterDeviceTokenPayload {
  fcm_token: string;
  platform: DevicePlatform;
  app_version: string;
  device_label: string;
  device_fingerprint: string;
}

export interface RegisterDeviceTokenResponse {
  ok?: boolean;
  status?: boolean;
  message?: string;
  data?: unknown;
}

/** Platform string the notifications service expects. */
const getPlatform = (): DevicePlatform =>
  Platform.OS === "ios" ? "ios" : "android";

/** Human-readable device label, e.g. "Pixel 7" / "iPhone15,2". */
const getDeviceLabel = (): string => {
  try {
    const model = DeviceInfo.getModel();
    return model && model.trim().length ? model : `${Platform.OS} device`;
  } catch {
    return `${Platform.OS} device`;
  }
};

/** Current app version (e.g. "1.0.0"), with a safe fallback. */
const getAppVersion = (): string => {
  try {
    const version = DeviceInfo.getVersion();
    return version && version.trim().length ? version : "0.0.0";
  } catch {
    return "0.0.0";
  }
};

/** Assemble the registration payload for the current device + given FCM token. */
export const buildDeviceRegistrationPayload = async (
  fcmToken: string
): Promise<RegisterDeviceTokenPayload> => ({
  fcm_token: fcmToken,
  platform: getPlatform(),
  app_version: getAppVersion(),
  device_label: getDeviceLabel(),
  device_fingerprint: await getDeviceFingerprint(),
});

/** Exponential backoff with a 30s ceiling: ~1s, 2s, 4s, 8s, ... */
const backoffDelay = (attemptIndex: number): number =>
  Math.min(1000 * 2 ** attemptIndex, 30_000);

/**
 * Register (or refresh) this device's FCM token with the FastAPI notifications
 * service. Works for both Android and iOS — platform is detected automatically.
 *
 * Transient failures are retried up to 3 times with exponential backoff; 4xx
 * client errors (bad/auth-rejected payload) are not retried.
 *
 * @example
 * const { mutate: registerDevice } = useRegisterDeviceToken();
 * registerDevice(fcmToken);
 */
export const useRegisterDeviceToken = () => {
  return useMutation<RegisterDeviceTokenResponse, Error, string>({
    mutationFn: async (fcmToken: string) => {
      const payload = await buildDeviceRegistrationPayload(fcmToken);
      return userApiClient.post<RegisterDeviceTokenResponse>(
        USER_AUTH.NOTIFICATIONS_DEVICES,
        payload,
        false
      );
    },
    retry: (failureCount, error) => {
      // Don't retry client errors (4xx) — payload/auth won't fix itself.
      const status = (error as any)?.response?.status;
      if (typeof status === "number" && status >= 400 && status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: backoffDelay,
  });
};

/**
 * Unregister this device from the notifications service (call on logout).
 *
 * IMPORTANT: invoke this BEFORE clearing the auth session — `userApiClient`
 * needs the still-valid Bearer token to authorize the delete. Best-effort with
 * a few quick backoff retries; never throws, so it can't block logout.
 */
export const unregisterFcmDevice = async (): Promise<void> => {
  let fingerprint: string;
  try {
    fingerprint = await getDeviceFingerprint();
  } catch {
    return;
  }
  if (!fingerprint || fingerprint.trim().length === 0) return;

  const maxAttempts = 3;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      await userApiClient.delete(USER_AUTH.NOTIFICATIONS_DEVICE(fingerprint));
      return;
    } catch (error) {
      const status = (error as any)?.response?.status;
      // Already gone / not authorized / bad request — nothing to retry.
      if (typeof status === "number" && status >= 400 && status < 500) return;
      if (attempt < maxAttempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, backoffDelay(attempt)));
      }
    }
  }
};

export default useRegisterDeviceToken;

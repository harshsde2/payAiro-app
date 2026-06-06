/**
 * useRegisterFcmDeviceOnLogin Hook
 *
 * Optimistically registers this device's FCM token with the FastAPI
 * notifications service (`/api/v1/notifications/devices/`) once the user is
 * authenticated. Works for both Android and iOS.
 *
 * Auth signal: `state.authenticationSlice.isLogin` (mounted from
 * newBackendAuthSlice). Every new-ui login path converges on this — app launch
 * while logged in, returning OTP login, and new-account KYC completion all end
 * in `setAppAccessGranted(true)` / `setLogin(true)`.
 *
 * Token source: `FCMService` — NOT Redux. The legacy `setFcmToken` action is a
 * no-op against the mounted reducer (it has no `fcmToken` field), so Redux never
 * holds the token. FCMService is the single source of truth for it.
 *
 * Dedupe: each unique token is sent once; a refreshed token re-registers.
 * Must be mounted inside the React Query provider (see FCMTokenManager).
 */

import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import messaging from "@react-native-firebase/messaging";
import { useRegisterDeviceToken } from "query/hooks/useNotificationDevices";
import FCMService from "services/FCMService";

export const useRegisterFcmDeviceOnLogin = () => {
  const { isLogin, tokens } = useSelector(
    (state: any) => state.authenticationSlice
  );

  const { mutate, isPending } = useRegisterDeviceToken();
  const lastSentTokenRef = useRef<string | null>(null);

  /** Register `token` with the backend, deduped + optimistic with rollback. */
  const sendToken = (token: string | null | undefined) => {
    if (!token || token.trim().length === 0) return;
    if (lastSentTokenRef.current === token) return;

    // Optimistically mark as sent so re-renders don't double-fire; roll back on
    // failure so a later run (or refresh) can retry this token.
    const previous = lastSentTokenRef.current;
    lastSentTokenRef.current = token;

    mutate(token, {
      onError: () => {
        if (lastSentTokenRef.current === token) {
          lastSentTokenRef.current = previous;
        }
      },
    });
  };

  // Register once the user is authenticated. By the time login completes the
  // token is almost always cached; fall back to a fresh fetch otherwise.
  useEffect(() => {
    if (!isLogin || !tokens?.access) return;

    let cancelled = false;
    (async () => {
      const fcm = FCMService.getInstance();
      const token = fcm.getCachedToken() || (await fcm.getToken());
      if (cancelled) return;
      sendToken(token);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLogin, tokens?.access, mutate]);

  // Re-register when FCM rotates the token (only while authenticated).
  useEffect(() => {
    const unsubscribe = messaging().onTokenRefresh((newToken) => {
      if (!isLogin || !tokens?.access) return;
      sendToken(newToken);
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLogin, tokens?.access, mutate]);

  // Reset dedupe on logout so the next login re-registers the device.
  useEffect(() => {
    if (!isLogin) {
      lastSentTokenRef.current = null;
    }
  }, [isLogin]);

  return { isRegistering: isPending };
};

export default useRegisterFcmDeviceOnLogin;

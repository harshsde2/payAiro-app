/**
 * useStoreFCMTokenOnLogin Hook
 * Automatically stores FCM token to backend when user is logged in
 * 
 * This hook handles all scenarios:
 * 1. User already logged in and app opens
 * 2. User logs in (OTP verification)
 * 3. New user registration (Name.tsx)
 * 4. FCM token refresh
 * 5. App comes to foreground
 * 6. User logs out (reset tracking)
 */

import { useEffect, useRef, useCallback } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useSelector } from "react-redux";
import { useStoreFCMToken } from "query/hooks/useAPIAuth";
import FCMService from "services/FCMService";
import { IStoreFCMTokenOptions } from "types/fcm.types";

/**
 * Hook that automatically stores FCM token to backend when user is logged in
 * Best Practice: Use this hook once in App.js, it handles all scenarios
 * 
 * @param options - Configuration options for retry logic and error handling
 * @returns Object containing storage state and manual trigger function
 */
export const useStoreFCMTokenOnLogin = (options: IStoreFCMTokenOptions = {}) => {
  const {
    retryOnFailure = true,
    maxRetries = 3,
    retryDelay = 5000,
    showErrorToast = true,
  } = options;

  // Get state from Redux
  const { isLogin, fcmToken, tokens } = useSelector(
    (state: any) => state.authenticationSlice
  );

  // API hook for storing token
  const { mutate: storeFCMToken, isPending } = useStoreFCMToken();

  // Track storage state with refs (persists across renders)
  const hasStoredTokenRef = useRef(false);
  const lastStoredTokenRef = useRef<string | null>(null);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isStoringRef = useRef(false);

  /**
   * Clear retry timeout on unmount
   */
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, []);

  /**
   * Store token to backend
   */
  const storeTokenToBackend = useCallback(
    async (token: string, isRetry = false) => {
      // Prevent duplicate/concurrent calls
      if (isStoringRef.current) {
        console.log("[useStoreFCMTokenOnLogin] Already storing, skipping...");
        return;
      }

      // Check if we've already stored this exact token
      if (hasStoredTokenRef.current && lastStoredTokenRef.current === token) {
        console.log("[useStoreFCMTokenOnLogin] Token already stored, skipping...");
        return;
      }

      // Validate prerequisites
      if (!isLogin || !tokens?.access) {
        console.log("[useStoreFCMTokenOnLogin] User not logged in, skipping...");
        return;
      }

      if (!token || token.trim() === "") {
        console.log("[useStoreFCMTokenOnLogin] No token available, skipping...");
        return;
      }

      try {
        isStoringRef.current = true;

        // Get device ID
        const fcmService = FCMService.getInstance();
        const deviceId = await fcmService.getDeviceId();

        // Validate device ID
        if (!deviceId || deviceId.trim() === "") {
          console.error("[useStoreFCMTokenOnLogin] Invalid device ID, skipping...");
          isStoringRef.current = false;
          return;
        }

        // Validate token format (FCM tokens are usually long strings)
        if (token.length < 10) {
          console.error("[useStoreFCMTokenOnLogin] Token seems invalid (too short), skipping...");
          isStoringRef.current = false;
          return;
        }

        console.log("[useStoreFCMTokenOnLogin] Storing token to backend...");
        console.log("[useStoreFCMTokenOnLogin] Token (first 20 chars):", token?.substring(0, 20) + "...");
        console.log("[useStoreFCMTokenOnLogin] Token length:", token.length);
        console.log("[useStoreFCMTokenOnLogin] Device ID:", deviceId);
        console.log("[useStoreFCMTokenOnLogin] Full payload:", JSON.stringify({ fcm_token: token, device_id: deviceId }, null, 2));

        // Call API to store token
        storeFCMToken(
          { fcm_token: token, device_id: deviceId },
          {
            onSuccess: () => {
              console.log("[useStoreFCMTokenOnLogin] Token stored successfully!");
              hasStoredTokenRef.current = true;
              lastStoredTokenRef.current = token;
              retryCountRef.current = 0; // Reset retry count on success
              isStoringRef.current = false;
            },
            onError: (error: any) => {
              console.error("[useStoreFCMTokenOnLogin] Error storing token:", error);
              isStoringRef.current = false;

              // Retry logic
              if (retryOnFailure && retryCountRef.current < maxRetries) {
                retryCountRef.current += 1;
                console.log(
                  `[useStoreFCMTokenOnLogin] Retrying (${retryCountRef.current}/${maxRetries})...`
                );

                retryTimeoutRef.current = setTimeout(() => {
                  storeTokenToBackend(token, true);
                }, retryDelay);
              } else {
                // Max retries reached
                hasStoredTokenRef.current = false;
                lastStoredTokenRef.current = null;
                console.log("[useStoreFCMTokenOnLogin] Max retries reached, giving up.");
              }
            },
          }
        );
      } catch (error) {
        console.error("[useStoreFCMTokenOnLogin] Exception:", error);
        isStoringRef.current = false;
      }
    },
    [isLogin, tokens?.access, storeFCMToken, retryOnFailure, maxRetries, retryDelay]
  );

  /**
   * SCENARIO 1 & 2: Store token when conditions are met (iOS + Android)
   * - User already logged in and app opens
   * - User logs in or registers
   */
  useEffect(() => {
    if (isLogin && fcmToken && tokens?.access) {
      // Only store if token changed or not stored yet
      if (!hasStoredTokenRef.current || lastStoredTokenRef.current !== fcmToken) {
        console.log("[useStoreFCMTokenOnLogin] Conditions met, storing token...");
        storeTokenToBackend(fcmToken);
      }
    }
  }, [isLogin, fcmToken, tokens?.access, storeTokenToBackend]);

  /**
   * SCENARIO 5: Reset on logout
   */
  useEffect(() => {
    if (!isLogin) {
      console.log("[useStoreFCMTokenOnLogin] User logged out, resetting state...");
      hasStoredTokenRef.current = false;
      lastStoredTokenRef.current = null;
      retryCountRef.current = 0;
      isStoringRef.current = false;

      // Clear any pending retry
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }

      // Clear FCM service cache
      FCMService.getInstance().clearCache();
    }
  }, [isLogin]);

  /**
   * SCENARIO 6: App foreground - refresh and store token (iOS + Android)
   */
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === "active" && isLogin && tokens?.access) {
        console.log("[useStoreFCMTokenOnLogin] App came to foreground...");
        
        // Refresh FCM token
        const fcmService = FCMService.getInstance();
        const freshToken = await fcmService.getToken();

        if (freshToken) {
          // Only store if token changed or we haven't stored yet
          if (!hasStoredTokenRef.current || lastStoredTokenRef.current !== freshToken) {
            console.log("[useStoreFCMTokenOnLogin] Token changed or not stored, updating...");
            storeTokenToBackend(freshToken);
          }
        }
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [isLogin, tokens?.access, storeTokenToBackend]);

  /**
   * Manual trigger for storing token (iOS + Android)
   * Use this in OTP.tsx and Name.tsx after login/registration
   */
  const triggerStore = useCallback(async () => {
    const fcmService = FCMService.getInstance();
    const token = fcmService.getCachedToken() || (await fcmService.getToken());

    if (token) {
      // Reset stored flag to force a new store
      hasStoredTokenRef.current = false;
      lastStoredTokenRef.current = null;
      await storeTokenToBackend(token);
    } else {
      console.log("[useStoreFCMTokenOnLogin] No FCM token available for manual trigger");
    }
  }, [storeTokenToBackend]);

  return {
    isStoring: isPending || isStoringRef.current,
    hasStored: hasStoredTokenRef.current,
    triggerStore,
  };
};

export default useStoreFCMTokenOnLogin;

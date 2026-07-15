import React, { createContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useSelector } from 'react-redux';
import { getPin, setPin, getNumber, setNumber, removeItem, getAppLockTimeoutMs, STORAGE_KEYS } from 'storage/mmkv';
import { readAuthSession } from 'auth/authSession';
import { getBiometric } from 'services/Auth';
import { userApiClient } from 'api/userApiClient';
import { USER_AUTH } from 'api/endpoints';
import { showError } from 'utils/toast';
import { AppLockContextType } from 'types/appLock.types';

// Create the context
export const AppLockContext = createContext<AppLockContextType | undefined>(undefined);

const PIN_SETUP_REMINDER_MS = 10 * 60 * 1000;

// Provider props
interface AppLockProviderProps {
  children: ReactNode;
}

// Provider component
export const AppLockProvider: React.FC<AppLockProviderProps> = ({ children }) => {
  const [isLocked, setIsLocked] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [showPinScreen, setShowPinScreen] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [paymentVerificationRequest, setPaymentVerificationRequest] = useState<{
    onVerified: () => void;
    requirePinSetup?: boolean;
  } | null>(null);
  const [isLockCheckComplete, setIsLockCheckComplete] = useState(false);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  
  // Track if user was already logged in when app started (cold start)
  const wasLoggedInOnMount = useRef<boolean | null>(null);
  const hasCheckedColdStart = useRef(false);
  
  // Track if a native modal/permission dialog is currently showing
  const isNativeModalVisibleRef = useRef<boolean>(false);

  // True only when the app ACTUALLY hit the 'background' state (home, app switcher,
  // phone lock) — distinguishes real departures from momentary 'inactive' blips
  // (Face ID dialog, Control Center, permission prompts) which must never lock.
  const wentToBackgroundRef = useRef<boolean>(false);
  
  // Get authentication state and token from Redux
  const isLogin = useSelector((state: any) => state.authenticationSlice?.isLogin);
  const accessToken = useSelector((state: any) => state.authenticationSlice?.tokens?.access);
  
  // Capture whether this is a cold start of an already-logged-in user, on first render.
  // Read SYNCHRONOUSLY from storage — the Redux `isLogin` flag hydrates asynchronously
  // (App.js fetches /users/me then dispatches setAppAccessGranted), so reading it here
  // misclassifies a returning user as logged-out and skips the cold-start lock. A persisted,
  // fully-onboarded session means the app launched already logged in (i.e. a real cold start);
  // a fresh login starts with no tokens, so this stays false and won't lock right after sign-in.
  if (wasLoggedInOnMount.current === null) {
    const session = readAuthSession();
    wasLoggedInOnMount.current = !!session.tokens && session.onboardingComplete;
  }

  const refreshPinStatus = useCallback(() => {
    const storedPin = getPin();
    const pinExists = storedPin !== undefined && storedPin.length > 0;
    setHasPin(pinExists);
  }, []);

  const syncSecuritySettingsFromBackend = useCallback(async () => {
    if (!isLogin || !accessToken) return { hasBackendPin: false, biometric: false };

    const response = await userApiClient.get<any>(USER_AUTH.SECURITY_PIN_SETTINGS);
    const data = response?.data || {};

    const backendPin = typeof data?.pin === "string" ? data.pin : null;
    const hasBackendPin = !!backendPin && backendPin.length > 0;
    const biometric = data?.biometric === true;

    if (hasBackendPin) {
      const localPin = getPin();
      // Don't overwrite local PIN with masked values from backend.
      if (!backendPin.includes("*") && backendPin !== localPin) {
        setPin(backendPin);
      }
    }

    // Biometric is a DEVICE-LOCAL preference (Face ID / fingerprint enrollment is
    // per-device) — never overwrite it from the backend. The backend value also lags
    // reality while the Settings-screen upsert is disabled, so applying it here wiped
    // the user's local choice on every launch. Re-read the local preference instead.
    const localBiometric = await getBiometric();
    setIsBiometricEnabled(localBiometric === true);
    refreshPinStatus();

    return { hasBackendPin, biometric };
  }, [isLogin, accessToken, refreshPinStatus]);

  // On login (or app open while logged in), sync PIN + biometric preference from backend.
  useEffect(() => {
    if (!isLogin || !accessToken) return;
    let cancelled = false;
    (async () => {
      try {
        const result = await syncSecuritySettingsFromBackend();
        if (cancelled) return;
        if (!result?.hasBackendPin) {
          refreshPinStatus();
        }
      } catch {
        // Keep local values on error.
      }
    })();
    return () => { cancelled = true; };
  }, [isLogin, accessToken, syncSecuritySettingsFromBackend, refreshPinStatus]);
  
  // Load user's biometric preference (same source as Settings)
  const refreshBiometricStatus = useCallback(async () => {
    if (!isLogin) {
      setIsBiometricEnabled(false);
      return;
    }
    try {
      const data = await getBiometric();
      setIsBiometricEnabled(data === true);
    } catch {
      setIsBiometricEnabled(false);
    }
  }, [isLogin]);

  useEffect(() => {
    refreshBiometricStatus();
  }, [refreshBiometricStatus]);

  // Check PIN status on mount and when isLogin changes
  useEffect(() => {
    const pinExists = getPin() !== undefined && (getPin()?.length ?? 0) > 0;

    // console.log('pinExists', pinExists);
    setHasPin(pinExists);

    // Set isLockCheckComplete only when we're SURE we don't need lock (use sync getPin, not state)
    const needLock = isLogin && pinExists;
    if (!needLock) {
      setIsLockCheckComplete(true);
    }
  }, [isLogin, refreshPinStatus]);

  // Computed value: should we even consider locking?
  const shouldShowLock = isLogin && hasPin;

  // Monitor auth state changes - auto-dismiss lock if user logs out or removes PIN
  useEffect(() => {
    if (!isLogin || !hasPin) {
      setIsLocked(false);
      setShowPinScreen(false);
      setIsLockCheckComplete(true);
      removeItem(STORAGE_KEYS.APP_LOCK_LAST_ACTIVE_TIME);
    }
  }, [isLogin, hasPin]);

  // Lock check complete when user just logged in (no cold start)
  useEffect(() => {
    if (shouldShowLock && wasLoggedInOnMount.current === false) {
      setIsLockCheckComplete(true);
    }
  }, [shouldShowLock]);

  // Monitor app state changes
  useEffect(() => {
    if (!shouldShowLock) {
      // Don't set up listeners if user doesn't have account + PIN
      return;
    }

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      // Keep the last-active timestamp fresh whenever we leave 'active' — it's what the
      // cold-start check compares against if the app is killed from here.
      if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        setNumber(STORAGE_KEYS.APP_LOCK_LAST_ACTIVE_TIME, Date.now());
      }

      // Only a REAL background transition arms the lock. Momentary 'inactive' blips —
      // Face ID / biometric dialogs, Control Center, permission prompts, share sheets —
      // must never re-lock (with an "Instant" timeout they'd loop the biometric prompt
      // forever: each dialog dismissal would immediately lock again).
      if (nextAppState === 'background') {
        wentToBackgroundRef.current = true;
      }

      // Coming to foreground - check grace period before locking
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        const cameFromBackground = wentToBackgroundRef.current;
        wentToBackgroundRef.current = false;

        // Don't lock if a native modal was showing (permission dialog, share sheet, etc.)
        // The flag will be reset by the component that set it (with a delay)
        if (!isNativeModalVisibleRef.current && cameFromBackground) {
          // Check if we're within the user-selected grace period (read fresh so a
          // Settings change takes effect on the very next foreground).
          const gracePeriodMs = getAppLockTimeoutMs();
          const lastActiveTime = getNumber(STORAGE_KEYS.APP_LOCK_LAST_ACTIVE_TIME);
          const currentTime = Date.now();
          if (lastActiveTime !== undefined) {
            const timeSinceLastActive = currentTime - lastActiveTime;
            if (timeSinceLastActive >= gracePeriodMs) {
              setIsLocked(true);
            } else {
              setNumber(STORAGE_KEYS.APP_LOCK_LAST_ACTIVE_TIME, currentTime);
            }
          } else {
            setIsLocked(true);
          }
        } else {
          // Trusted return (native dialog blip / pure inactive) — refresh the timestamp
          // so this pause doesn't count toward the next lock decision.
          setNumber(STORAGE_KEYS.APP_LOCK_LAST_ACTIVE_TIME, Date.now());
        }
        // Note: We don't reset the native-modal flag here because the share sheet may cause
        // multiple state transitions (active -> inactive -> active -> inactive -> active)
        // The component will reset the flag after the modal is fully dismissed
      }

      appState.current = nextAppState;
    };
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
    };
  }, [shouldShowLock]);

  // Check on cold start (app killed and reopened) - check grace period before locking
  // Only lock if user was already logged in when app started (not after fresh login)
  useEffect(() => {
    if (shouldShowLock && !hasCheckedColdStart.current && wasLoggedInOnMount.current) {
      hasCheckedColdStart.current = true;

      // Cold start (app was killed and reopened): ALWAYS lock, regardless of the
      // user-selected auto-lock timing. The timing only governs background→foreground
      // while the app is still alive; a fresh process must re-authenticate immediately.
      setIsLocked(true);
      setIsLockCheckComplete(true);
    }
  }, [shouldShowLock]);

  // Reset flags when user logs out (so next session works correctly).
  // IMPORTANT: only on a REAL logged-in → logged-out transition. At mount isLogin is
  // still false (Redux hydrates asynchronously), and resetting there would wipe the
  // synchronously-captured wasLoggedInOnMount flag before the cold-start lock check
  // runs — silently disabling the lock on every app kill + reopen.
  const prevIsLoginRef = useRef<boolean | null>(null);
  useEffect(() => {
    const prev = prevIsLoginRef.current;
    prevIsLoginRef.current = isLogin === true;
    if (prev === true && isLogin !== true) {
      hasCheckedColdStart.current = false;
      wasLoggedInOnMount.current = false;
    }
  }, [isLogin]);
  
  const lockApp = useCallback(() => {
    if (shouldShowLock) setIsLocked(true);
  }, [shouldShowLock]);

  const unlockApp = useCallback(() => {
    setIsLocked(false);
    setShowPinScreen(false);
    setNumber(STORAGE_KEYS.APP_LOCK_LAST_ACTIVE_TIME, Date.now());
  }, []);

  const updateLastActive = useCallback(() => {
    if (shouldShowLock) setNumber(STORAGE_KEYS.APP_LOCK_LAST_ACTIVE_TIME, Date.now());
  }, [shouldShowLock]);

  const requestShowPinScreen = useCallback(() => setShowPinScreen(true), []);
  const resetBiometricFailures = useCallback(() => setShowPinScreen(false), []);

  const requestPaymentVerification = useCallback(async (onVerified: () => void) => {
    const localPin = getPin();
    if (localPin && localPin.length > 0) {
      setPaymentVerificationRequest({ onVerified });
      return;
    }

    let hasPinAfterSync = false;
    try {
      const security = await syncSecuritySettingsFromBackend();
      hasPinAfterSync = security?.hasBackendPin === true;
    } catch {
      hasPinAfterSync = false;
    }

    const syncedPin = getPin();
    if (hasPinAfterSync || (syncedPin && syncedPin.length > 0)) {
      setPaymentVerificationRequest({ onVerified });
      return;
    }

    const lastPromptAt = getNumber(STORAGE_KEYS.APP_LOCK_PIN_SETUP_PROMPT_AT);
    const now = Date.now();
    if (lastPromptAt !== undefined && now - lastPromptAt < PIN_SETUP_REMINDER_MS) {
      showError("PIN required", "Please set your PIN to continue transactions.");
      return;
    }

    setNumber(STORAGE_KEYS.APP_LOCK_PIN_SETUP_PROMPT_AT, now);
    setPaymentVerificationRequest({ onVerified, requirePinSetup: true });
  }, [syncSecuritySettingsFromBackend]);

  const clearPaymentVerification = useCallback(() => {
    setPaymentVerificationRequest(null);
  }, []);

  // Function to set/unset native modal visibility flag
  const setNativeModalVisible = useCallback((visible: boolean) => {
    isNativeModalVisibleRef.current = visible;
  }, []);
  
  return (
    <AppLockContext.Provider
      value={{
        isLocked,
        lockApp,
        unlockApp,
        updateLastActive,
        shouldShowLock,
        refreshPinStatus,
        setNativeModalVisible,
        isBiometricEnabled,
        refreshBiometricStatus,
        showPinScreen,
        requestShowPinScreen,
        resetBiometricFailures,
        requestPaymentVerification,
        clearPaymentVerification,
        paymentVerificationRequest,
        isLockCheckComplete,
      }}
    >
      {children}
    </AppLockContext.Provider>
  );
};

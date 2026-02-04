import React, { createContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useSelector } from 'react-redux';
import { getPin, getNumber, setNumber, removeItem, STORAGE_KEYS } from 'storage/mmkv';
import { getBiometric } from 'services/Auth';
import { AppLockContextType } from 'types/appLock.types';
import { LOCK_CONFIG } from 'types/appLock.types';

// Create the context
export const AppLockContext = createContext<AppLockContextType | undefined>(undefined);

const GRACE_PERIOD_MS = LOCK_CONFIG.GRACE_PERIOD_MS;

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
  const appState = useRef<AppStateStatus>(AppState.currentState);
  
  // Track if user was already logged in when app started (cold start)
  const wasLoggedInOnMount = useRef<boolean | null>(null);
  const hasCheckedColdStart = useRef(false);
  
  // Track if a native modal/permission dialog is currently showing
  const isNativeModalVisibleRef = useRef<boolean>(false);
  
  // Get authentication state from Redux
  const isLogin = useSelector((state: any) => state.authenticationSlice?.isLogin);
  
  // Capture the initial login state on first render
  if (wasLoggedInOnMount.current === null) {
    wasLoggedInOnMount.current = isLogin === true;
  }
  
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

  const refreshPinStatus = useCallback(() => {
    const storedPin = getPin();
    const pinExists = storedPin !== undefined && storedPin.length > 0;
    setHasPin(pinExists);
  }, []);

  // Check PIN status on mount and when isLogin changes
  useEffect(() => {
    refreshPinStatus();
  }, [isLogin, refreshPinStatus]);
  
  // Computed value: should we even consider locking?
  const shouldShowLock = isLogin && hasPin;

  // Monitor auth state changes - auto-dismiss lock if user logs out or removes PIN
  useEffect(() => {
    if (!isLogin || !hasPin) {
      setIsLocked(false);
      setShowPinScreen(false);
      removeItem(STORAGE_KEYS.APP_LOCK_LAST_ACTIVE_TIME);
    }
  }, [isLogin, hasPin]);

  // Monitor app state changes
  useEffect(() => {
    if (!shouldShowLock) {
      // Don't set up listeners if user doesn't have account + PIN
      return;
    }

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      // Going to background
      if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        // Only save timestamp if user has account + PIN
        const timestamp = Date.now();
        setNumber(STORAGE_KEYS.APP_LOCK_LAST_ACTIVE_TIME, timestamp);
      }
      
      // Coming to foreground - check grace period before locking
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // Don't lock if a native modal was showing (permission dialog, share sheet, etc.)
        // The flag will be reset by the component that set it (with a delay)
        if (!isNativeModalVisibleRef.current) {
          // Check if we're within the grace period (60 seconds)
          const lastActiveTime = getNumber(STORAGE_KEYS.APP_LOCK_LAST_ACTIVE_TIME);
          const currentTime = Date.now();
          if (lastActiveTime !== undefined) {
            const timeSinceLastActive = currentTime - lastActiveTime;
            if (timeSinceLastActive >= GRACE_PERIOD_MS) {
              setIsLocked(true);
            } else {
              setNumber(STORAGE_KEYS.APP_LOCK_LAST_ACTIVE_TIME, currentTime);
            }
          } else {
            setIsLocked(true);
          }
        }
        // Note: We don't reset the flag here because the share sheet may cause multiple
        // state transitions (active -> inactive -> active -> inactive -> active)
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
      
      // Check if we're within the grace period (60 seconds)
      const lastActiveTime = getNumber(STORAGE_KEYS.APP_LOCK_LAST_ACTIVE_TIME);
      const currentTime = Date.now();
      if (lastActiveTime !== undefined) {
        const timeSinceLastActive = currentTime - lastActiveTime;
        if (timeSinceLastActive >= GRACE_PERIOD_MS) {
          setIsLocked(true);
        } else {
          setNumber(STORAGE_KEYS.APP_LOCK_LAST_ACTIVE_TIME, currentTime);
        }
      } else {
        setIsLocked(true);
      }
    }
  }, [shouldShowLock]);

  // Reset flags when user logs out (so next session works correctly)
  useEffect(() => {
    if (!isLogin) {
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
      }}
    >
      {children}
    </AppLockContext.Provider>
  );
};

import React, { createContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useSelector } from 'react-redux';
import { storage, removeItem, STORAGE_KEYS, getPin } from 'storage/mmkv';
import { AppLockContextType } from 'types/appLock.types';

// Create the context
export const AppLockContext = createContext<AppLockContextType | undefined>(undefined);

// Provider props
interface AppLockProviderProps {
  children: ReactNode;
}

// Provider component
export const AppLockProvider: React.FC<AppLockProviderProps> = ({ children }) => {
  const [isLocked, setIsLocked] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  
  // Track if user was already logged in when app started (cold start)
  const wasLoggedInOnMount = useRef<boolean | null>(null);
  const hasCheckedColdStart = useRef(false);
  
  // Get authentication state from Redux
  const isLogin = useSelector((state: any) => state.authenticationSlice?.isLogin);
  
  // Capture the initial login state on first render
  if (wasLoggedInOnMount.current === null) {
    wasLoggedInOnMount.current = isLogin === true;
  }
  
  // Function to check and update PIN status - call this after setting PIN
  const refreshPinStatus = useCallback(() => {
    const storedPin = getPin();
    console.log("refreshPinStatus - storedPin =>", storedPin);
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
      // User logged out or removed PIN - dismiss lock immediately
      setIsLocked(false);
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
        storage.set(STORAGE_KEYS.APP_LOCK_LAST_ACTIVE_TIME, timestamp);
      }
      
      // Coming to foreground - lock immediately
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // Lock immediately when returning from background (no timeout delay)
        setIsLocked(true);
      }
      
      appState.current = nextAppState;
    };
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
    };
  }, [shouldShowLock]);

  // Check on cold start (app killed and reopened) - lock immediately if user has PIN
  // Only lock if user was already logged in when app started (not after fresh login)
  useEffect(() => {
    if (shouldShowLock && !hasCheckedColdStart.current && wasLoggedInOnMount.current) {
      hasCheckedColdStart.current = true;
      // Lock immediately when user was already logged in with PIN on cold start
      console.log("AppLock: Cold start detected, locking app");
      setIsLocked(true);
    }
  }, [shouldShowLock]);

  // Reset flags when user logs out (so next session works correctly)
  useEffect(() => {
    if (!isLogin) {
      hasCheckedColdStart.current = false;
      wasLoggedInOnMount.current = false;
    }
  }, [isLogin]);
  
  const lockApp = () => {
    if (shouldShowLock) {
      setIsLocked(true);
    }
  };
  
  const unlockApp = () => {
    setIsLocked(false);
    // Update last active time on successful unlock
    storage.set(STORAGE_KEYS.APP_LOCK_LAST_ACTIVE_TIME, Date.now());
  };
  
  const updateLastActive = () => {
    if (shouldShowLock) {
      storage.set(STORAGE_KEYS.APP_LOCK_LAST_ACTIVE_TIME, Date.now());
    }
  };
  
  return (
    <AppLockContext.Provider 
      value={{ 
        isLocked, 
        lockApp, 
        unlockApp, 
        updateLastActive,
        shouldShowLock,
        refreshPinStatus
      }}
    >
      {children}
    </AppLockContext.Provider>
  );
};

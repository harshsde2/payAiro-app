import React, { createContext, useState, useEffect, useRef, ReactNode, useMemo } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useSelector } from 'react-redux';
import { storage, getItem, setItem, removeItem, STORAGE_KEYS, getPin } from 'storage/mmkv';
import { AppLockContextType } from 'types/appLock.types';
import { LOCK_CONFIG } from 'types/appLock.types';

// Create the context
export const AppLockContext = createContext<AppLockContextType | undefined>(undefined);

// Provider props
interface AppLockProviderProps {
  children: ReactNode;
}

// Provider component
export const AppLockProvider: React.FC<AppLockProviderProps> = ({ children }) => {
  const [isLocked, setIsLocked] = useState(false);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  
  // Get authentication state from Redux
  const isLogin = useSelector((state: any) => state.authenticationSlice?.isLogin);
  
  // Check if user has PIN set - memoized to avoid unnecessary recalculations
  // We need to check PIN on every render since it can change externally
  const hasPin = useMemo(() => {
    const storedPin = getPin();
    console.log("storedPin =>", storedPin);
    return storedPin !== undefined && storedPin.length > 0;
  }, []); // Only compute once per render, but getPin() reads from storage each time
  
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
      
      // Coming to foreground
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // Only check lock if user has account + PIN
        const lastActive = storage.getNumber(STORAGE_KEYS.APP_LOCK_LAST_ACTIVE_TIME);
        const timeout = storage.getNumber(STORAGE_KEYS.APP_LOCK_TIMEOUT) || LOCK_CONFIG.DEFAULT_TIMEOUT;
        
        if (lastActive && (Date.now() - lastActive) >= timeout) {
          setIsLocked(true);
        }
      }
      
      appState.current = nextAppState;
    };
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
    };
  }, [shouldShowLock]);

  // Check on mount (app killed scenario)
  useEffect(() => {
    if (shouldShowLock) {
      const lastActive = storage.getNumber(STORAGE_KEYS.APP_LOCK_LAST_ACTIVE_TIME);
      const timeout = storage.getNumber(STORAGE_KEYS.APP_LOCK_TIMEOUT) || LOCK_CONFIG.DEFAULT_TIMEOUT;
      
      if (lastActive && (Date.now() - lastActive) >= timeout) {
        setIsLocked(true);
      }
    }
  }, [shouldShowLock]);
  
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
        shouldShowLock 
      }}
    >
      {children}
    </AppLockContext.Provider>
  );
};

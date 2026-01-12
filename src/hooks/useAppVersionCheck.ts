import { useEffect, useState } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import AppVersionService, { IVersionCheckResult } from '../services/AppVersionService';

interface IUseAppVersionCheckOptions {
  checkOnMount?: boolean;
  checkOnForeground?: boolean;
  checkInterval?: number; // in milliseconds
  autoUpdate?: boolean; // Auto-start update if available (flexible updates only)
}

export const useAppVersionCheck = (
  options: IUseAppVersionCheckOptions = {}
) => {
  const {
    checkOnMount = true,
    checkOnForeground = true,
    checkInterval,
    autoUpdate = false,
  } = options;

  const [versionCheck, setVersionCheck] = useState<IVersionCheckResult>({
    shouldUpdate: false,
  });
  const [isChecking, setIsChecking] = useState(false);

  const performCheck = async () => {
    if (isChecking) return;

    setIsChecking(true);
    try {
      // Log current version for debugging
      const currentVersion = await AppVersionService.getCurrentVersion();
      if (__DEV__) {
        // console.log('[useAppVersionCheck] Current app version:', currentVersion, 'Platform:', Platform.OS);
      }

      const result = await AppVersionService.checkNeedsUpdate();
      
      if (__DEV__) {
        // console.log('[useAppVersionCheck] Check result:', JSON.stringify(result, null, 2));
        // console.log('[useAppVersionCheck] Setting shouldUpdate to:', result.shouldUpdate);
        // console.log('[useAppVersionCheck] Setting needsForceUpdate to:', result.needsForceUpdate);
      }
      
      // Force state update
      setVersionCheck(result);
      
      // Verify state was set
      if (__DEV__) {
        console.log('[useAppVersionCheck] State updated - shouldUpdate:', result.shouldUpdate, 'needsForceUpdate:', result.needsForceUpdate);
      }

      // Auto-start flexible update if enabled (only for optional updates)
      if (
        autoUpdate &&
        result.shouldUpdate &&
        !result.needsForceUpdate &&
        __DEV__
      ) {
        // Only auto-update in dev mode for safety
        try {
          await AppVersionService.startUpdate(false);
        } catch (error) {
          console.error('[useAppVersionCheck] Auto-update failed:', error);
        }
      }
    } catch (error) {
      console.error('[useAppVersionCheck] Error checking version:', error);
    } finally {
      setIsChecking(false);
    }
  };

  // Check on mount
  useEffect(() => {
    if (checkOnMount) {
      performCheck();
    }
  }, [checkOnMount]);

  // Check on app foreground
  useEffect(() => {
    if (!checkOnForeground) return;

    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
          performCheck();
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, [checkOnForeground]);

  // Periodic check (optional)
  useEffect(() => {
    if (!checkInterval) return;

    const interval = setInterval(() => {
      performCheck();
    }, checkInterval);

    return () => {
      clearInterval(interval);
    };
  }, [checkInterval]);

  const startUpdate = async (forceUpdate: boolean = false) => {
    try {
      await AppVersionService.startUpdate(forceUpdate);
    } catch (error) {
      console.error('[useAppVersionCheck] Error starting update:', error);
      throw error;
    }
  };

  return {
    ...versionCheck,
    isChecking,
    checkVersion: performCheck,
    startUpdate,
  };
};

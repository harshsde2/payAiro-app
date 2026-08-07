import SpInAppUpdates from 'sp-react-native-in-app-updates';
import DeviceInfo from 'react-native-device-info';
import { Platform, Linking, Alert } from 'react-native';
import { EnvConfig } from '../config/env.config';

export interface IVersionCheckResult {
  shouldUpdate: boolean;
  storeVersion?: string;
  needsForceUpdate?: boolean;
}

/**
 * Service for checking app version and handling updates
 * Supports both real store checks and test mode for development
 */
class AppVersionService {
  private inAppUpdates: SpInAppUpdates;

  constructor() {
    // Constructor needs a boolean parameter (false = don't show default UI, true = show default UI)
    this.inAppUpdates = new SpInAppUpdates(false);
  }

  /**
   * Get current app version
   */
  async getCurrentVersion(): Promise<string> {
    try {
      const version = await DeviceInfo.getVersion();
      if (!version || version.trim().length === 0) {
        throw new Error('Invalid version string');
      }
      return version;
    } catch (error) {
      console.error('[AppVersionService] Error getting current version:', error);
      // Return a default version to prevent crashes
      return '1.0.0';
    }
  }

  /**
   * Compare two version strings
   * Returns: -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
   */
  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    const maxLength = Math.max(parts1.length, parts2.length);

    for (let i = 0; i < maxLength; i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;

      if (part1 < part2) return -1;
      if (part1 > part2) return 1;
    }

    return 0;
  }

  /**
   * Simulate version check for testing (development only)
   */
  private async simulateUpdateCheck(): Promise<IVersionCheckResult> {
    try {
      const currentVersion = await this.getCurrentVersion();
      const testVersion = EnvConfig.TEST_VERSION_OVERRIDE;

      if (!testVersion) {
        if (__DEV__) {
          console.log('[AppVersionService] Test mode enabled but no TEST_VERSION_OVERRIDE set');
        }
        return {
          shouldUpdate: false,
        };
      }

      const comparison = this.compareVersions(currentVersion, testVersion);
      
      // In test mode, ALWAYS force shouldUpdate to true if testVersion is set
      // This ensures the modal shows up for testing purposes regardless of version comparison
      const shouldUpdate = __DEV__ && EnvConfig.ENABLE_VERSION_TEST_MODE && testVersion 
        ? true 
        : comparison < 0;

      // needsForceUpdate should be based on TEST_FORCE_UPDATE flag
      const needsForceUpdate = shouldUpdate && EnvConfig.TEST_FORCE_UPDATE === true;

      if (__DEV__) {
        console.log('[AppVersionService] Test mode check:', {
          currentVersion,
          testVersion,
          comparison,
          shouldUpdate,
          needsForceUpdate,
          testForceUpdate: EnvConfig.TEST_FORCE_UPDATE,
          platform: Platform.OS,
          testModeForced: __DEV__ && EnvConfig.ENABLE_VERSION_TEST_MODE && testVersion,
        });
        
        if (shouldUpdate && __DEV__ && EnvConfig.ENABLE_VERSION_TEST_MODE) {
          console.log('[AppVersionService] ✅ TEST MODE: shouldUpdate=true (forced for testing)');
          console.log('[AppVersionService] ✅ TEST MODE: needsForceUpdate=', needsForceUpdate);
        }
      }

      return {
        shouldUpdate: true, // Always true in test mode when testVersion is set
        storeVersion: testVersion,
        needsForceUpdate: needsForceUpdate,
      };
    } catch (error) {
      console.error('[AppVersionService] Error in simulateUpdateCheck:', error);
      // Even on error, return true in test mode if testVersion is set
      if (__DEV__ && EnvConfig.ENABLE_VERSION_TEST_MODE && EnvConfig.TEST_VERSION_OVERRIDE) {
        console.log('[AppVersionService] Error occurred but returning shouldUpdate=true for test mode');
        return {
          shouldUpdate: true,
          storeVersion: EnvConfig.TEST_VERSION_OVERRIDE,
          needsForceUpdate: EnvConfig.TEST_FORCE_UPDATE === true,
        };
      }
      return {
        shouldUpdate: false,
      };
    }
  }

  /**
   * Check if app needs update by comparing with store version
   */
  async checkNeedsUpdate(): Promise<IVersionCheckResult> {
    try {
      // Debug: Log all version test settings
      if (__DEV__) {
        // console.log('[AppVersionService] ====== VERSION CHECK START ======');
        // console.log('[AppVersionService] Platform:', Platform.OS);
        // console.log('[AppVersionService] ENABLE_VERSION_TEST_MODE:', EnvConfig.ENABLE_VERSION_TEST_MODE);
        // console.log('[AppVersionService] TEST_VERSION_OVERRIDE:', EnvConfig.TEST_VERSION_OVERRIDE);
        // console.log('[AppVersionService] TEST_FORCE_UPDATE:', EnvConfig.TEST_FORCE_UPDATE);
        // console.log('[AppVersionService] __DEV__:', __DEV__);
      }

      // Use test mode if enabled (development only)
      if (__DEV__ && EnvConfig.ENABLE_VERSION_TEST_MODE) {
        // console.log('[AppVersionService] ✅ Entering test mode...');
        const testResult = await this.simulateUpdateCheck();
        if (__DEV__) {
          // console.log('[AppVersionService] Test mode result:', JSON.stringify(testResult, null, 2));
        }
        return testResult;
      } else {
        // console.log('[AppVersionService] ❌ NOT in test mode - checking store');
      }

      // Real store check (only in production or when test mode is disabled)
      const currentVersion = await this.getCurrentVersion();

      if (!currentVersion) {
        // console.error('[AppVersionService] Cannot check update: invalid current version');
        return {
          shouldUpdate: false,
        };
      }

      const result = await this.inAppUpdates.checkNeedsUpdate({
        curVersion: currentVersion,
      });

      if (__DEV__) {
        // console.log('[AppVersionService] Store check result:', result);
      }

      // Validate result
      const shouldUpdate = result?.shouldUpdate === true;
      const storeVersion = result?.storeVersion || undefined;

      // Determine if update should be forced based on env config
      // FORCE_UPDATE_ENABLED works in both dev and production
      const forceUpdateEnabled = EnvConfig.FORCE_UPDATE_ENABLED !== false; // Default to true
      const needsForceUpdate = shouldUpdate && forceUpdateEnabled;

      return {
        shouldUpdate,
        storeVersion: storeVersion || undefined,
        needsForceUpdate,
      };
    } catch (error) {
      // console.error('[AppVersionService] Error checking update:', error);
      
      // In test mode, if there's an error, still return shouldUpdate=true for testing
      if (__DEV__ && EnvConfig.ENABLE_VERSION_TEST_MODE && EnvConfig.TEST_VERSION_OVERRIDE) {
        console.log('[AppVersionService] Test mode: Error occurred but returning shouldUpdate=true for testing');
        return {
          shouldUpdate: true,
          storeVersion: EnvConfig.TEST_VERSION_OVERRIDE,
          needsForceUpdate: EnvConfig.TEST_FORCE_UPDATE === true,
        };
      }
      
      // In production, silently fail - don't block the app if version check fails
      // This handles cases like: offline, store API down, network errors, etc.
      if (__DEV__) {
        // console.warn('[AppVersionService] Version check failed - app will continue normally');
      }
      
      return {
        shouldUpdate: false,
      };
    }
  }

  /**
   * Get store URL for the app
   */
  private getStoreUrl(): string {
    if (Platform.OS === 'ios') {
      // Numeric App Store ID comes from env (IOS_APP_STORE_ID). TODO: set this in
      // .env.production / .env.staging once the app is live on the App Store.
      const appStoreId = EnvConfig.IOS_APP_STORE_ID;
      return appStoreId
        ? `https://apps.apple.com/app/id${appStoreId}`
        : 'https://apps.apple.com';
    } else {
      const packageName = EnvConfig.ANDROID_PACKAGE_NAME || 'com.payairo';
      return `https://play.google.com/store/apps/details?id=${packageName}`;
    }
  }

  /**
   * Open store URL manually as fallback when in-app update fails
   */
  private async openStoreUrlManually(): Promise<void> {
    try {
      const storeUrl = this.getStoreUrl();
      // console.log('[AppVersionService] Opening store URL manually:', storeUrl);
      
      const canOpen = await Linking.canOpenURL(storeUrl);
      if (canOpen) {
        await Linking.openURL(storeUrl);
        // console.log('[AppVersionService] ✅ Store URL opened successfully');
      } else {
        // console.warn('[AppVersionService] ⚠️ Cannot open store URL:', storeUrl);
        throw new Error('Cannot open store URL');
      }
    } catch (error) {
      // console.error('[AppVersionService] Error opening store URL:', error);
      throw error;
    }
  }

  /**
   * Start the update process
   * @param forceUpdate - If true, uses IMMEDIATE update (Android only)
   */
  async startUpdate(forceUpdate: boolean = false): Promise<void> {
    console.log('[AppVersionService] startUpdate called - forceUpdate:', forceUpdate, 'Platform:', Platform.OS);
    
    // In test mode, open store URL directly for testing
    if (__DEV__ && EnvConfig.ENABLE_VERSION_TEST_MODE) {
      // console.log('[AppVersionService] TEST MODE: Opening store URL for testing');
      
      try {
        const storeUrl = this.getStoreUrl();
        // console.log('[AppVersionService] Attempting to open:', storeUrl);
        
        const canOpen = await Linking.canOpenURL(storeUrl);
        if (canOpen) {
          await Linking.openURL(storeUrl);
          // console.log('[AppVersionService] ✅ Store URL opened successfully');
        } else {
          // console.warn('[AppVersionService] ⚠️ Cannot open store URL:', storeUrl);
          Alert.alert(
            'Test Mode',
            `In test mode, this would open the store.\n\nStore URL: ${storeUrl}\n\nIn production, this would ${Platform.OS === 'android' ? (forceUpdate ? 'show immediate update screen' : 'start flexible background update') : 'redirect to App Store'}`,
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        // console.error('[AppVersionService] Error opening store URL:', error);
        Alert.alert(
          'Test Mode',
          `In production, this would redirect to the ${Platform.OS === 'ios' ? 'App Store' : 'Play Store'}.`,
          [{ text: 'OK' }]
        );
      }
      return;
    }

    try {
      if (Platform.OS === 'android') {
        // Android: Use numeric constants (0 = IMMEDIATE, 1 = FLEXIBLE)
        // The package uses numeric values instead of enum
        const updateType = forceUpdate ? 0 : 1; // 0 = IMMEDIATE, 1 = FLEXIBLE

        if (__DEV__) {
          console.log('[AppVersionService] Starting Android update:', {
            updateType,
            type: forceUpdate ? 'IMMEDIATE' : 'FLEXIBLE',
          });
        }

        try {
          await this.inAppUpdates.startUpdate({
            updateType: updateType,
          });
        } catch (androidError: any) {
          // Handle Android-specific errors
          const errorCode = androidError?.code || androidError?.message || '';
          
          // Check if user cancelled or update not available
          if (
            errorCode.includes('USER_CANCELED') ||
            errorCode.includes('UPDATE_NOT_AVAILABLE') ||
            errorCode.includes('UPDATE_CANCELED')
          ) {
            console.log('[AppVersionService] Android update cancelled or not available');
            // Fallback to manual store URL
            await this.openStoreUrlManually();
            return;
          }
          
          // For other errors, try fallback
          console.warn('[AppVersionService] Android in-app update failed, trying fallback:', androidError);
          await this.openStoreUrlManually();
        }
      } else {
        // iOS: Will redirect to App Store
        if (__DEV__) {
          console.log('[AppVersionService] Starting iOS update - redirecting to App Store');
        }

        try {
          // iOS: startUpdate needs an options object, but updateType is not used
          await this.inAppUpdates.startUpdate({});
        } catch (iosError: any) {
          // Handle iOS-specific errors
          const errorCode = iosError?.code || iosError?.message || '';
          
          console.warn('[AppVersionService] iOS in-app update failed, trying fallback:', iosError);
          // Fallback to manual App Store URL
          await this.openStoreUrlManually();
        }
      }
    } catch (error) {
      console.error('[AppVersionService] Error starting update:', error);
      // Final fallback: try to open store URL manually
      try {
        await this.openStoreUrlManually();
      } catch (fallbackError) {
        console.error('[AppVersionService] Fallback to store URL also failed:', fallbackError);
        throw new Error('Unable to start update. Please update manually from the app store.');
      }
    }
  }

  /**
   * Check and prompt for update if needed
   */
  async checkAndUpdate(forceUpdate: boolean = false): Promise<boolean> {
    const result = await this.checkNeedsUpdate();

    if (result.shouldUpdate) {
      await this.startUpdate(forceUpdate);
      return true;
    }

    return false;
  }
}

export default new AppVersionService();

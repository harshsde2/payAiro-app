import { useState, useEffect, useCallback, useRef } from "react";
import { AppState, AppStateStatus, Platform, Linking, Alert } from "react-native";
import { Camera, CameraPermissionStatus } from "react-native-vision-camera";

interface ICameraPermissionHook {
  hasPermission: boolean;
  isLoading: boolean;
  permissionStatus: CameraPermissionStatus;
  canAskAgain: boolean;
  requestPermission: () => Promise<boolean>;
  openSettings: () => Promise<void>;
  checkPermission: () => Promise<void>;
  showPermissionDeniedAlert: () => void;
}

/**
 * Custom hook for managing camera permissions with comprehensive edge case handling
 * Handles permission states, re-checking on app focus, and providing user-friendly prompts
 */
export const useCameraPermission = (): ICameraPermissionHook => {
  const [permissionStatus, setPermissionStatus] = useState<CameraPermissionStatus>("not-determined");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [canAskAgain, setCanAskAgain] = useState<boolean>(true);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const hasRequestedOnce = useRef<boolean>(false);

  const hasPermission = permissionStatus === "granted";

  /**
   * Check current camera permission status
   */
  const checkPermission = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      const status = await Camera.getCameraPermissionStatus();
      setPermissionStatus(status);
      
      // On iOS, if denied once, we can't ask again via requestPermission
      // User must go to settings
      if (status === "denied" && Platform.OS === "ios") {
        setCanAskAgain(false);
      } else if (status === "denied" && Platform.OS === "android" && hasRequestedOnce.current) {
        // On Android, after first denial with "Don't ask again", we can't ask again
        setCanAskAgain(false);
      }
    } catch (error) {
      console.error("Error checking camera permission:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Request camera permission from the user
   * Returns true if permission was granted
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      hasRequestedOnce.current = true;
      
      const newStatus = await Camera.requestCameraPermission();
      setPermissionStatus(newStatus);
      
      if (newStatus === "denied") {
        // Check if we can ask again
        if (Platform.OS === "ios") {
          setCanAskAgain(false);
        } else {
          // On Android, check if "Don't ask again" was selected
          // by trying to request again - if status doesn't change to a dialog, 
          // user selected "Don't ask again"
          const recheckStatus = await Camera.getCameraPermissionStatus();
          if (recheckStatus === "denied") {
            setCanAskAgain(false);
          }
        }
      }
      
      return newStatus === "granted";
    } catch (error) {
      console.error("Error requesting camera permission:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Open device settings for the app
   */
  const openSettings = useCallback(async (): Promise<void> => {
    try {
      await Linking.openSettings();
    } catch (error) {
      console.error("Error opening settings:", error);
      Alert.alert(
        "Unable to Open Settings",
        "Please go to your device settings and enable camera access for PayAiro.",
        [{ text: "OK" }]
      );
    }
  }, []);

  /**
   * Show alert dialog for denied permission with option to go to settings
   */
  const showPermissionDeniedAlert = useCallback((): void => {
    Alert.alert(
      "Camera Permission Required",
      "To scan QR codes, PayAiro needs access to your camera. Please enable camera access in your device settings.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Open Settings",
          onPress: openSettings,
        },
      ],
      { cancelable: true }
    );
  }, [openSettings]);

  // Initial permission check
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  // Re-check permission when app comes to foreground
  // This handles the case where user goes to settings and grants permission
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus): Promise<void> => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // App has come to the foreground, re-check permissions
        await checkPermission();
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [checkPermission]);

  return {
    hasPermission,
    isLoading,
    permissionStatus,
    canAskAgain,
    requestPermission,
    openSettings,
    checkPermission,
    showPermissionDeniedAlert,
  };
};

export default useCameraPermission;

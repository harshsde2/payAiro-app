import { Linking } from "react-native";
import { setItem, getItem, STORAGE_KEYS } from "storage/mmkv";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";

// Navigation ref to handle navigation from deep links
let navigationRef: any = null;

/**
 * Set navigation ref for deep link navigation
 * Call this from App.js after NavigationContainer is created
 */
export const setNavigationRef = (ref: any) => {
  navigationRef = ref;
};

/**
 * Initialize deep linking for the app.
 * Handles both cold start (app not running) and warm start (app in background).
 */
export const initializeDeepLinking = (): (() => void) => {
  // Handle deep link when app is already open (warm start)
  const subscription = Linking.addEventListener("url", handleDeepLink);

  // Handle deep link when app opens from closed state (cold start)
  Linking.getInitialURL().then((url) => {
    if (url) {
      handleDeepLink({ url });
    }
  });

  // Return cleanup function
  return () => {
    subscription.remove();
  };
};

/**
 * Handle incoming deep link URL
 */
const handleDeepLink = ({ url }: { url: string }): void => {
  if (!url) return;

  console.log("Deep link received:", url);

  // Parse referral code from URL
  const referralCode = extractReferralCode(url);

    if (referralCode) {
      console.log("Referral code found:", referralCode);
      setItem(STORAGE_KEYS.REFERRAL_CODE, referralCode);
      
      // Navigate to Signup screen if user is not logged in
      // Check if user has auth tokens (logged in)
      const authTokens = getItem(STORAGE_KEYS.AUTH_TOKENS);
      const isLoggedIn = authTokens !== null && authTokens !== undefined;
      
      if (!isLoggedIn) {
        // User is not logged in, navigate to Signup screen
        // The referral code is already stored and will be auto-filled
        // Add small delay to ensure navigation is ready
        setTimeout(() => {
          if (navigationRef?.isReady()) {
            console.log("User not logged in, navigating to Create Account screen");
            navigationRef.navigate(NAVIGATION_SCREENS.NEW_CREATE_ACCOUNT);
          } else {
            console.log("Navigation not ready yet, will retry...");
            // Retry after a bit more time
            setTimeout(() => {
              if (navigationRef?.isReady()) {
                navigationRef.navigate(NAVIGATION_SCREENS.NEW_CREATE_ACCOUNT);
              }
            }, 500);
          }
        }, 100);
      } else {
        console.log("User is logged in, staying on current screen. Referral code stored for future use.");
      }
    }
};

/**
 * Extract referral code from deep link URL
 * Supports multiple formats:
 * 1. payairo://ref/ABC123
 * 2. https://payairo.com/ref/ABC123
 */
const extractReferralCode = (url: string): string | null => {
  // Match /ref/ followed by alphanumeric code
  const regex = /\/ref\/([A-Za-z0-9]+)/;
  const match = url.match(regex);

  return match ? match[1] : null;
};

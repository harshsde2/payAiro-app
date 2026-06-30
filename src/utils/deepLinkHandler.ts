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

  // Parse referral code (+ optional partner click id) from URL
  const referralCode = extractReferralCode(url);
  const clickId = extractQueryParam(url, "click_id");

    if (referralCode) {
      console.log("Referral code found:", referralCode);
      setItem(STORAGE_KEYS.REFERRAL_CODE, referralCode);
      if (clickId) {
        setItem(STORAGE_KEYS.REFERRAL_CLICK_ID, clickId);
      }

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
 * Read a query parameter value from a URL (handles custom schemes too).
 */
const extractQueryParam = (url: string, key: string): string | null => {
  const regex = new RegExp(`[?&]${key}=([^&#]+)`, "i");
  const match = url.match(regex);
  return match ? decodeURIComponent(match[1]) : null;
};

/**
 * Extract referral code from a deep link URL. Supports:
 * 1. Path form:  payairo://ref/ABC123, https://payairo.com/ref/ABC123
 * 2. Query form: https://payairo.com/signup?ref=ABC123 (also referral_code, code, invite)
 *    — matches the backend share_url built off `signup_share_base_url`.
 */
const extractReferralCode = (url: string): string | null => {
  // Path form: /ref/CODE
  const pathMatch = url.match(/\/ref\/([A-Za-z0-9_]+)/);
  if (pathMatch) return pathMatch[1];

  // Query form: ?ref= / ?referral_code= / ?code= / ?invite=
  for (const key of ["ref", "referral_code", "code", "invite"]) {
    const value = extractQueryParam(url, key);
    if (value) return value;
  }

  return null;
};

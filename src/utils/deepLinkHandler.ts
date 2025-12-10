import { Linking } from "react-native";
import { setItem, STORAGE_KEYS } from "storage/mmkv";

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
  }
};

/**
 * Extract referral code from deep link URL
 * Supports multiple formats:
 * 1. payairo://ref/ABC123
 * 2. https://payairo.app/ref/ABC123
 * 3. https://payairo.com/ref/ABC123
 */
const extractReferralCode = (url: string): string | null => {
  // Match /ref/ followed by alphanumeric code
  const regex = /\/ref\/([A-Za-z0-9]+)/;
  const match = url.match(regex);

  return match ? match[1] : null;
};

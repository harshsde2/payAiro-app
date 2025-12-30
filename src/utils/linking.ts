/**
 * Deep Linking & Universal Links Configuration
 * 
 * This configuration handles:
 * 1. Custom URL Scheme: payairo://
 * 2. Universal Links (iOS): https://payairo.app/* and https://payairo.com/*
 * 3. App Links (Android): https://payairo.app/* and https://payairo.com/*
 * 
 * Server Requirements:
 * - iOS: Host apple-app-site-association at /.well-known/apple-app-site-association
 * - Android: Host assetlinks.json at /.well-known/assetlinks.json
 */

import { LinkingOptions } from "@react-navigation/native";
import { Linking } from "react-native";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";

// Define the param list type for type safety
type RootStackParamList = {
  [key: string]: object | undefined;
};

export const LinkingPath: LinkingOptions<RootStackParamList> = {
  prefixes: [
    // Custom URL scheme
    "payairo://",
    // Universal Links / App Links
    "https://payairo.app",
    "https://www.payairo.app",
    "https://payairo.com",
    "https://www.payairo.com",
  ],
  
  // Custom function to get the initial URL (handles both deep links and universal links)
  async getInitialURL() {
    // Check if app was opened from a deep link
    const url = await Linking.getInitialURL();
    if (url != null) {
      return url;
    }
    return null;
  },

  // Subscribe to incoming links
  subscribe(listener) {
    // Listen to incoming links from deep linking
    const linkingSubscription = Linking.addEventListener("url", ({ url }) => {
      listener(url);
    });

    return () => {
      linkingSubscription.remove();
    };
  },
  
  config: {
    // Initial route name when no matching route is found
    initialRouteName: NAVIGATION_SCREENS.NEW_DASHBOARD,
    
    screens: {
      // ============================================
      // REFERRAL LINKS (Primary use case)
      // Handles: payairo://ref/CODE, https://payairo.app/ref/CODE
      // ============================================
      // Note: Referral codes are handled by deepLinkHandler.ts
      // which extracts the code and stores it in MMKV storage.
      // The app then navigates to the appropriate screen.
      
      // ============================================
      // DASHBOARD & MAIN SCREENS
      // ============================================
      [NAVIGATION_SCREENS.NEW_DASHBOARD]: {
        path: "dashboard",
      },
      
      // ============================================
      // TRANSACTIONS
      // ============================================
      [NAVIGATION_SCREENS.TRANSACTION]: "transaction",
      [NAVIGATION_SCREENS.TRANSACTION_SUCCESS]: "transaction/success",
      [NAVIGATION_SCREENS.TRANSACTION_DETAILS]: {
        path: "transaction/:id",
        parse: {
          id: (id: string) => id,
        },
      },
      [NAVIGATION_SCREENS.TRANSACTION_SUCCESS_SCREEN]: "transaction/final",

      // ============================================
      // SEND & RECEIVE
      // ============================================
      [NAVIGATION_SCREENS.SEND]: "send",
      [NAVIGATION_SCREENS.RECEIVE]: "receive",

      // ============================================
      // SETTINGS
      // ============================================
      [NAVIGATION_SCREENS.SETTING_SCREEN]: "settings",
      [NAVIGATION_SCREENS.NOTIFICATION]: "settings/notification",
      [NAVIGATION_SCREENS.PERSONAL]: "settings/personal",
      [NAVIGATION_SCREENS.REFERRAL_SCREEN]: "settings/referral",

      // ============================================
      // REWARDS
      // ============================================
      [NAVIGATION_SCREENS.REWARDS]: "rewards",
      [NAVIGATION_SCREENS.SCRATCH]: "rewards/scratch",
      [NAVIGATION_SCREENS.SCRATCH_DETAILS]: "rewards/scratch/details",

      // ============================================
      // CONTACTS
      // ============================================
      [NAVIGATION_SCREENS.ADD_CONTACT]: "contacts/add",
      [NAVIGATION_SCREENS.CONTACT_SCREEN]: "contacts",
      [NAVIGATION_SCREENS.CONTACT_TX]: "contacts/tx",

      // ============================================
      // CRYPTO
      // ============================================
      [NAVIGATION_SCREENS.CRYPTO_DASHBOARD]: "crypto",
      [NAVIGATION_SCREENS.CRYPTO_SCREEN]: "crypto/details",
      [NAVIGATION_SCREENS.HOLDINGS_SCREEN]: "crypto/holdings",
      [NAVIGATION_SCREENS.SELL]: "crypto/sell",
      [NAVIGATION_SCREENS.BUY]: "crypto/buy",
      [NAVIGATION_SCREENS.DETAILS_CRYPTO_SCREEN]: {
        path: "crypto/:assetId",
        parse: {
          assetId: (assetId: string) => assetId,
        },
      },

      // ============================================
      // EXTERNAL ACCOUNTS
      // ============================================
      [NAVIGATION_SCREENS.MX_CONNECT_WIDGET_SCREEN]: "external-account",

      // ============================================
      // RWA (Real World Assets)
      // ============================================
      [NAVIGATION_SCREENS.TRUSTED_CIRCLE]: "trusted-circle",
      [NAVIGATION_SCREENS.RWA]: "rwa",
      [NAVIGATION_SCREENS.MY_RWA_ASSETS]: "rwa/assets",
      [NAVIGATION_SCREENS.REAL_STATE]: "rwa/realstate",
      [NAVIGATION_SCREENS.REAL_STATE_PROFILE]: {
        path: "rwa/realstate/:id",
        parse: {
          id: (id: string) => id,
        },
      },
      [NAVIGATION_SCREENS.STOCKS]: "rwa/stocks",
      [NAVIGATION_SCREENS.STOCK_PROFILE]: {
        path: "rwa/stocks/:id",
        parse: {
          id: (id: string) => id,
        },
      },
      [NAVIGATION_SCREENS.COMMON_ASSETS_SCREEN]: "rwa/common-assets",

      // ============================================
      // INVITE / REFERRAL (Alternative paths)
      // ============================================
      // These paths also trigger referral flow
      "Invite": {
        path: "invite/:code?",
        parse: {
          code: (code: string) => code,
        },
      },

      // ============================================
      // CATCH-ALL (404)
      // ============================================
      NotFound: "*",
    },
  },
};

/**
 * Helper function to generate a referral link
 * @param referralCode - The user's referral code
 * @returns The referral URL
 */
export const generateReferralLink = (referralCode: string): string => {
  return `https://payairo.app/ref/${referralCode}`;
};

/**
 * Helper function to generate a deep link
 * @param path - The path to link to
 * @returns The deep link URL
 */
export const generateDeepLink = (path: string): string => {
  return `payairo://${path}`;
};

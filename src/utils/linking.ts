/**
 * Deep Linking & Universal Links Configuration
 * 
 * This configuration handles:
 * 1. Custom URL Scheme: payairo://
 * 2. Universal Links (iOS): https://payairo.com/*
 * 3. App Links (Android): https://payairo.com/*
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
    "https://payairo.com",
    "https://www.payairo.com",
  ],
  
  // Return null so React Navigation does not process initial URL at mount.
  // Initial URL (from notification tap or direct deep link) is handled in App.js
  // via onReady + stored URL to avoid "navigation not initialized" on cold start.
  async getInitialURL() {
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
    // Initial route when no matching path; must match root Stack
    initialRouteName: "MainTabs",
    screens: {
      // ============================================
      // MAIN TABS (nested: dashboard, settings, etc. are tabs)
      // payairo://settings -> MainTabs -> SettingScreen tab
      // ============================================
      MainTabs: {
        path: "",
        initialRouteName: NAVIGATION_SCREENS.NEW_DASHBOARD,
        screens: {
          [NAVIGATION_SCREENS.NEW_DASHBOARD]: "dashboard",
          CryptoTab: "crypto-tab",
          [NAVIGATION_SCREENS.SCANS]: "scans",
          [NAVIGATION_SCREENS.UNIFIED_TRANSACTION]: "transactions",
          [NAVIGATION_SCREENS.SETTING_SCREEN]: "settings",
        },
      },

      // ============================================
      // REFERRAL LINKS – handled by deepLinkHandler.ts
      // payairo://ref/CODE, https://payairo.com/ref/CODE
      // ============================================

      // ============================================
      // AUTH SCREENS (root stack)
      // ============================================
      [NAVIGATION_SCREENS.SIGNUP]: {
        path: "signup",
      },

      // ============================================
      // TRANSACTIONS (root stack)
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
      // SEND & RECEIVE (root stack)
      // ============================================
      [NAVIGATION_SCREENS.SEND]: "send",
      [NAVIGATION_SCREENS.RECEIVE]: "receive",

      // ============================================
      // SETTINGS SUB-SCREENS (root stack)
      // ============================================
      [NAVIGATION_SCREENS.NOTIFICATION]: "settings/notification",
      [NAVIGATION_SCREENS.NEW_PERSONAL]: "settings/personal",
      [NAVIGATION_SCREENS.REFERRAL_SCREEN]: "settings/referral",

      // ============================================
      // REWARDS (root stack)
      // ============================================
      [NAVIGATION_SCREENS.REWARDS]: "rewards",
      [NAVIGATION_SCREENS.SCRATCH]: "rewards/scratch",
      [NAVIGATION_SCREENS.SCRATCH_DETAILS]: "rewards/scratch/details",

      // ============================================
      // CONTACTS (root stack)
      // ============================================
      [NAVIGATION_SCREENS.ADD_CONTACT]: "contacts/add",
      [NAVIGATION_SCREENS.CONTACT_SCREEN]: "contacts",
      [NAVIGATION_SCREENS.CONTACT_TX]: "contacts/tx",

      // ============================================
      // CRYPTO (root stack)
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
      // EXTERNAL ACCOUNTS (root stack)
      // ============================================
      [NAVIGATION_SCREENS.MX_CONNECT_WIDGET_SCREEN]: "external-account",

      // ============================================
      // RWA (root stack)
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
      // INVITE / REFERRAL (root stack)
      // ============================================
      Invite: {
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
  return `https://payairo.com/ref/${referralCode}`;
};

/**
 * Helper function to generate a deep link
 * @param path - The path to link to
 * @returns The deep link URL
 */
export const generateDeepLink = (path: string): string => {
  return `payairo://${path}`;
};

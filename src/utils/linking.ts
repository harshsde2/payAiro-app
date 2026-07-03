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
      // MAIN TABS (nested: dashboard, crypto, scans, activity, profile)
      // payairo://settings -> MainTabs -> SettingScreen tab
      // ============================================
      MainTabs: {
        path: "",
        initialRouteName: NAVIGATION_SCREENS.NEW_DASHBOARD,
        screens: {
          [NAVIGATION_SCREENS.NEW_DASHBOARD]: "dashboard",
          CryptoTab: "crypto-tab",
          [NAVIGATION_SCREENS.SCANS]: "scans",
          [NAVIGATION_SCREENS.NEW_ACTIVITY_SCREEN]: "transactions",
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
      [NAVIGATION_SCREENS.NEW_CREATE_ACCOUNT]: {
        path: "signup",
      },

      // ============================================
      // SEND & RECEIVE (root stack)
      // ============================================
      [NAVIGATION_SCREENS.NEW_SEND]: "send",
      [NAVIGATION_SCREENS.RECEIVE]: "receive",

      // ============================================
      // CRYPTO REQUEST (P2P) (root stack)
      // payairo://requests -> list, payairo://requests/42 -> detail
      // ============================================
      [NAVIGATION_SCREENS.NEW_CRYPTO_REQUESTS]: "requests",
      [NAVIGATION_SCREENS.NEW_CRYPTO_REQUEST_DETAIL]: "requests/:id",

      // ============================================
      // SETTINGS SUB-SCREENS (root stack)
      // ============================================
      [NAVIGATION_SCREENS.NEW_PERSONAL]: "settings/personal",

      // ============================================
      // CONTACTS (root stack)
      // ============================================
      [NAVIGATION_SCREENS.ADD_CONTACT]: "contacts/add",

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

// src/navigation/linking.ts

import { LinkingOptions } from "@react-navigation/native";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";

// Optional: Define the param list type if using TS strongly
// type RootStackParamList = { ... };

export const LinkingPath: LinkingOptions<any> = {
  prefixes: ["payairo://", "https://payairo.com", "https://payairo.app"],
  config: {
    screens: {
      [NAVIGATION_SCREENS.NEW_DASHBOARD]: "dashboard",
      [NAVIGATION_SCREENS.TRANSACTION]: "transaction",
      [NAVIGATION_SCREENS.TRANSACTION_SUCCESS]: "transaction/success",
      [NAVIGATION_SCREENS.TRANSACTION_DETAILS]: "transaction/:id", // dynamic id

      [NAVIGATION_SCREENS.SEND]: "send",
      [NAVIGATION_SCREENS.RECEIVE]: "receive",

      [NAVIGATION_SCREENS.SETTING_SCREEN]: "settings",
      [NAVIGATION_SCREENS.NOTIFICATION]: "settings/notification",
      [NAVIGATION_SCREENS.PERSONAL]: "settings/personal",

      [NAVIGATION_SCREENS.REWARDS]: "rewards",
      [NAVIGATION_SCREENS.SCRATCH]: "rewards/scratch",
      [NAVIGATION_SCREENS.SCRATCH_DETAILS]: "rewards/scratch/details",

      [NAVIGATION_SCREENS.ADD_CONTACT]: "contacts/add",
      [NAVIGATION_SCREENS.CONTACT_SCREEN]: "contacts",
      [NAVIGATION_SCREENS.CONTACT_TX]: "contacts/tx",

      [NAVIGATION_SCREENS.CRYPTO_DASHBOARD]: "crypto",
      [NAVIGATION_SCREENS.CRYPTO_SCREEN]: "crypto/details",
      [NAVIGATION_SCREENS.HOLDINGS_SCREEN]: "crypto/holdings",
      [NAVIGATION_SCREENS.SELL]: "crypto/sell",
      [NAVIGATION_SCREENS.BUY]: "crypto/buy",
      [NAVIGATION_SCREENS.DETAILS_CRYPTO_SCREEN]: "crypto/:assetId",

      [NAVIGATION_SCREENS.MX_CONNECT_WIDGET_SCREEN]: "external-account",

      [NAVIGATION_SCREENS.TRUSTED_CIRCLE]: "trusted-circle",
      [NAVIGATION_SCREENS.RWA]: "rwa",
      [NAVIGATION_SCREENS.MY_RWA_ASSETS]: "rwa/assets",
      [NAVIGATION_SCREENS.REAL_STATE]: "rwa/realstate",
      [NAVIGATION_SCREENS.REAL_STATE_PROFILE]: "rwa/realstate/:id",
      [NAVIGATION_SCREENS.STOCKS]: "rwa/stocks",
      [NAVIGATION_SCREENS.STOCK_PROFILE]: "rwa/stocks/:id",

      [NAVIGATION_SCREENS.TRANSACTION_SUCCESS_SCREEN]: "transaction/final",
      [NAVIGATION_SCREENS.COMMON_ASSETS_SCREEN]: "rwa/common-assets",

      NotFound: "*",
    },
  },
};

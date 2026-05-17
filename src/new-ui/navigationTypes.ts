import { NavigatorScreenParams } from "@react-navigation/native";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";

export type CommonErrorScreenParams = {
  title: string;
  description: string;
  /** Defaults to "Close". Use "I Understand" for geofence / soft errors. */
  primaryButtonLabel?: string;
  /**
   * Defaults to reset to create-account (auth flows).
   * Use "goBack" from dashboard / cash-ramp flows.
   */
  dismissAction?: "resetToCreateAccount" | "goBack";
};

export type NewUIAuthStackParamList = {
  [NAVIGATION_SCREENS.NEW_ONBOARDING]: undefined;
  [NAVIGATION_SCREENS.NEW_LOGIN]: undefined;
  [NAVIGATION_SCREENS.NEW_CREATE_ACCOUNT]: undefined;
  [NAVIGATION_SCREENS.NEW_OTP_VERIFICATION]: {
    email?: string;
    phone?: string;
    type?: "login" | "signup" | "forgot";
    fullName?: string;
    inputType?: "email" | "phone" | "invalid";
    isEmail?: boolean;
  };
  [NAVIGATION_SCREENS.NEW_COINME_MOBILE_AUTH]: {
    email?: string;
    phone?: string;
    username?: string;
    inputType?: "email" | "phone" | "invalid";
    isEmail?: boolean;
    data?: any;
  };
  [NAVIGATION_SCREENS.NEW_COMMON_ERROR]: CommonErrorScreenParams;
  [NAVIGATION_SCREENS.NEW_KYC]: {
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
    phone?: string;
    inputType?: "email" | "phone" | "invalid";
    isEmail?: boolean;
    data?: any;
  };
  [NAVIGATION_SCREENS.NEW_ADDRESS]: undefined;
  [NAVIGATION_SCREENS.NEW_FORGOT_PASSWORD]: undefined;
  [NAVIGATION_SCREENS.NEW_FORGOT_PASSWORD_VERIFICATION]: { email?: string };
};

export type NewUIDashboardStackParamList = {
  [NAVIGATION_SCREENS.NEW_DASHBOARD]: undefined;
  [NAVIGATION_SCREENS.NEW_ADD_BALANCE]: undefined;
  [NAVIGATION_SCREENS.NEW_CASH_RAMP_LOCATION_FINDER]: {
    amount: number;
    fiatCurrencyCode: string;
    cryptoCurrencyCode: string;
    chain: string;
    sourceWalletAddress?: string;
  };
  [NAVIGATION_SCREENS.NEW_CASH_RAMP_SELL_LOCATION_FINDER]: {
    amount: number;
    fiatCurrencyCode: string;
    cryptoCurrencyCode: string;
    chain: string;
    sourceWalletAddress?: string;
  };
  [NAVIGATION_SCREENS.NEW_COMMON_ERROR]: CommonErrorScreenParams;
  [NAVIGATION_SCREENS.NEW_CASH_RAMP_BARCODE]: {
    amount: number;
    fiatCurrencyCode: string;
    cryptoCurrencyCode: string;
    cashRampFlow?: "buy" | "sell";
    chain?: string;
    sourceWalletAddress?: string;
    location: {
      id: string;
      provider?: string | null;
      description?: string | null;
      address?: string | null;
      city?: string | null;
      state?: string | null;
      zipCode?: string | null;
      lineOfSightDistance?: number | null;
      lineOfSightMetric?: string | null;
      locationReference?: string | null;
      imageUrl?: string | null;
    };
  };
  [NAVIGATION_SCREENS.CRYPTO_WITHDRAW]: undefined;
  [NAVIGATION_SCREENS.NEW_CONTACTS_SCREEN]: undefined;
  [NAVIGATION_SCREENS.NEW_ADD_CONTACT_SCREEN]: undefined;
  [NAVIGATION_SCREENS.NEW_BANK_STATEMENT_SCREEN]: undefined;
  [NAVIGATION_SCREENS.NEW_VIEW_STATEMENT_SCREEN]: undefined;
  [NAVIGATION_SCREENS.NEW_REWARDS_AND_REFERRALS_SCREEN]: undefined;
  [NAVIGATION_SCREENS.NEW_SCRATCH_CARD_SCREEN]: { points: number; voucherId: string };
};

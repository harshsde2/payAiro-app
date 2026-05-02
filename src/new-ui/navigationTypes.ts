import { NavigatorScreenParams } from "@react-navigation/native";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";

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
  [NAVIGATION_SCREENS.CRYPTO_WITHDRAW]: undefined;
  [NAVIGATION_SCREENS.NEW_CONTACTS_SCREEN]: undefined;
  [NAVIGATION_SCREENS.NEW_ADD_CONTACT_SCREEN]: undefined;
  [NAVIGATION_SCREENS.NEW_BANK_STATEMENT_SCREEN]: undefined;
  [NAVIGATION_SCREENS.NEW_VIEW_STATEMENT_SCREEN]: undefined;
  [NAVIGATION_SCREENS.NEW_REWARDS_AND_REFERRALS_SCREEN]: undefined;
  [NAVIGATION_SCREENS.NEW_SCRATCH_CARD_SCREEN]: { points: number; voucherId: string };
};

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
    fullName?: string;
    email?: string;
    phone?: string;
    inputType?: "email" | "phone" | "invalid";
    isEmail?: boolean;
    data?: any;
  };
  [NAVIGATION_SCREENS.NEW_FORGOT_PASSWORD]: undefined;
  [NAVIGATION_SCREENS.NEW_FORGOT_PASSWORD_VERIFICATION]: { email?: string };
};

export type NewUIDashboardStackParamList = {
  [NAVIGATION_SCREENS.NEW_DASHBOARD]: undefined;
};

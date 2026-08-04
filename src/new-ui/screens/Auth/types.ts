import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { NewUIAuthStackParamList } from "@new-ui/navigationTypes";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";

export type AuthScreenNavigationProp<T extends keyof NewUIAuthStackParamList> =
  NativeStackNavigationProp<NewUIAuthStackParamList, T>;

export type AuthScreenRouteProp<T extends keyof NewUIAuthStackParamList> =
  RouteProp<NewUIAuthStackParamList, T>;

export type CreateAccountScreenNavigationProp = AuthScreenNavigationProp<
  typeof NAVIGATION_SCREENS.NEW_CREATE_ACCOUNT
>;
export type LoginScreenNavigationProp = AuthScreenNavigationProp<
  typeof NAVIGATION_SCREENS.NEW_LOGIN
>;
export type OTPVerificationScreenNavigationProp = AuthScreenNavigationProp<
  typeof NAVIGATION_SCREENS.NEW_OTP_VERIFICATION
>;
export type OTPVerificationScreenRouteProp = AuthScreenRouteProp<
  typeof NAVIGATION_SCREENS.NEW_OTP_VERIFICATION
>;
export type ForgotPasswordScreenNavigationProp = AuthScreenNavigationProp<
  typeof NAVIGATION_SCREENS.NEW_FORGOT_PASSWORD
>;
export type ForgotPasswordVerificationScreenNavigationProp =
  AuthScreenNavigationProp<
    typeof NAVIGATION_SCREENS.NEW_FORGOT_PASSWORD_VERIFICATION
  >;
export type ForgotPasswordVerificationScreenRouteProp = AuthScreenRouteProp<
  typeof NAVIGATION_SCREENS.NEW_FORGOT_PASSWORD_VERIFICATION
>;
export type OnboardingScreenNavigationProp = AuthScreenNavigationProp<
  typeof NAVIGATION_SCREENS.NEW_ONBOARDING
>;
export type KYCScreenNavigationProp = AuthScreenNavigationProp<
  typeof NAVIGATION_SCREENS.NEW_KYC
>;
export type KYCScreenRouteProp = AuthScreenRouteProp<
  typeof NAVIGATION_SCREENS.NEW_KYC
>;
export type KYCVerifyScreenNavigationProp = AuthScreenNavigationProp<
  typeof NAVIGATION_SCREENS.NEW_KYC_VERIFY
>;
export type KYCVerifyScreenRouteProp = AuthScreenRouteProp<
  typeof NAVIGATION_SCREENS.NEW_KYC_VERIFY
>;
export type AddressScreenNavigationProp = AuthScreenNavigationProp<
  typeof NAVIGATION_SCREENS.NEW_ADDRESS
>;
export type AddressScreenRouteProp = AuthScreenRouteProp<
  typeof NAVIGATION_SCREENS.NEW_ADDRESS
>;
export type CoinmeMobileAuthScreenNavigationProp = AuthScreenNavigationProp<
  typeof NAVIGATION_SCREENS.NEW_COINME_MOBILE_AUTH
>;
export type CoinmeMobileAuthScreenRouteProp = AuthScreenRouteProp<
  typeof NAVIGATION_SCREENS.NEW_COINME_MOBILE_AUTH
>;
export type CommonErrorScreenNavigationProp = AuthScreenNavigationProp<
  typeof NAVIGATION_SCREENS.NEW_COMMON_ERROR
>;
export type CommonErrorScreenRouteProp = AuthScreenRouteProp<
  typeof NAVIGATION_SCREENS.NEW_COMMON_ERROR
>;

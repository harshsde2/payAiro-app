import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '@navigations/types';
import { NAVIGATION_SCREENS } from '@navigations/navigationConstants';

export type AuthScreenNavigationProp<T extends keyof AuthStackParamList> = NativeStackNavigationProp<
  AuthStackParamList,
  T
>;

export type AuthScreenRouteProp<T extends keyof AuthStackParamList> = RouteProp<
  AuthStackParamList,
  T
>;

export type CreateAccountScreenNavigationProp = AuthScreenNavigationProp<typeof NAVIGATION_SCREENS.CREATE_ACCOUNT>;
export type LoginScreenNavigationProp = AuthScreenNavigationProp<typeof NAVIGATION_SCREENS.LOGIN>;
export type OTPVerificationScreenNavigationProp = AuthScreenNavigationProp<typeof NAVIGATION_SCREENS.OTP_VERIFICATION>;
export type OTPVerificationScreenRouteProp = AuthScreenRouteProp<typeof NAVIGATION_SCREENS.OTP_VERIFICATION>;
export type ForgotPasswordScreenNavigationProp = AuthScreenNavigationProp<typeof NAVIGATION_SCREENS.FORGOT_PASSWORD>;
export type ForgotPasswordVerificationScreenNavigationProp = AuthScreenNavigationProp<typeof NAVIGATION_SCREENS.FORGOT_PASSWORD_VERIFICATION>;
export type ForgotPasswordVerificationScreenRouteProp = AuthScreenRouteProp<typeof NAVIGATION_SCREENS.FORGOT_PASSWORD_VERIFICATION>;
export type OnboardingScreenNavigationProp = AuthScreenNavigationProp<typeof NAVIGATION_SCREENS.ONBOARDING>;


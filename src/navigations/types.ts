import { NavigatorScreenParams } from '@react-navigation/native';
import { NAVIGATION_SCREENS } from './navigationConstants';

export type AuthStackParamList = {
  [NAVIGATION_SCREENS.ONBOARDING]: undefined;
  [NAVIGATION_SCREENS.LOGIN]: undefined;
  [NAVIGATION_SCREENS.CREATE_ACCOUNT]: undefined;
  [NAVIGATION_SCREENS.OTP_VERIFICATION]: { email?: string; type?: 'login' | 'signup' | 'forgot'; fullName?: string };
  [NAVIGATION_SCREENS.KYC]: { fullName?: string; email?: string };
  [NAVIGATION_SCREENS.FORGOT_PASSWORD]: undefined;
  [NAVIGATION_SCREENS.FORGOT_PASSWORD_VERIFICATION]: { email?: string };
};

export type DashboardStackParamList = {
  [NAVIGATION_SCREENS.DASHBOARD]: undefined;
  [NAVIGATION_SCREENS.PROFILE]: undefined;
};

export type CryptoStackParamList = {
  [NAVIGATION_SCREENS.CRYPTO_LIST]: undefined;
  [NAVIGATION_SCREENS.CRYPTO_DETAILS]: { cryptoId: string };
  [NAVIGATION_SCREENS.BUY_CRYPTO]: { cryptoId?: string };
  [NAVIGATION_SCREENS.SELL_CRYPTO]: { cryptoId?: string };
};

export type TransactionStackParamList = {
  [NAVIGATION_SCREENS.TRANSACTION_HISTORY]: undefined;
  [NAVIGATION_SCREENS.TRANSACTION_DETAILS]: { transactionId: string };
};

export type WalletStackParamList = {
  [NAVIGATION_SCREENS.WALLET]: undefined;
  [NAVIGATION_SCREENS.ADD_FUNDS]: undefined;
  [NAVIGATION_SCREENS.WITHDRAW_FUNDS]: undefined;
};

export type SettingsStackParamList = {
  [NAVIGATION_SCREENS.SETTINGS]: undefined;
  [NAVIGATION_SCREENS.SECURITY]: undefined;
  [NAVIGATION_SCREENS.NOTIFICATIONS]: undefined;
};

export type BottomTabParamList = {
  [NAVIGATION_SCREENS.DASHBOARD_TAB]: NavigatorScreenParams<DashboardStackParamList>;
  [NAVIGATION_SCREENS.CRYPTO_TAB]: NavigatorScreenParams<CryptoStackParamList>;
  [NAVIGATION_SCREENS.TRANSACTIONS_TAB]: NavigatorScreenParams<TransactionStackParamList>;
  [NAVIGATION_SCREENS.WALLET_TAB]: NavigatorScreenParams<WalletStackParamList>;
  [NAVIGATION_SCREENS.SETTINGS_TAB]: NavigatorScreenParams<SettingsStackParamList>;
};

export type AppStackParamList = {
  [NAVIGATION_SCREENS.APP_STACK]: NavigatorScreenParams<BottomTabParamList>;
};

export type RootStackParamList = {
  [NAVIGATION_SCREENS.AUTH_STACK]: NavigatorScreenParams<AuthStackParamList>;
  [NAVIGATION_SCREENS.APP_STACK]: NavigatorScreenParams<BottomTabParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}


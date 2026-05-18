import { MMKV } from "react-native-mmkv";

// Create the storage instance
export const storage = new MMKV({
  id: "payAiro-app-storage",
  encryptionKey: "payAiro-secure-storage-key",
});

// Helper functions
export const getItem = (key: string): string | undefined => {
  return storage.getString(key);
};

export const setItem = (key: string, value: string): void => {
  storage.set(key, value);
};

export const setPin = (value: string): void => {
  storage.set(STORAGE_KEYS.PIN, value);
};

export const getPin = () => {
  return storage.getString(STORAGE_KEYS.PIN);
};

export const setNumber = (key: string, value: number): void => {
  storage.set(key, value);
};

export const getNumber = (key: string): number | undefined => {
  return storage.getNumber(key);
};

export const removeItem = (key: string): void => {
  storage.delete(key);
};

export const clearAll = (): void => {
  storage.clearAll();
};

// Key constants for the app
export const STORAGE_KEYS = {
  AUTH_TOKENS: "auth_tokens",
  USER_DATA: "user_data",
  WALLET_DATA: "wallet_data",
  BIOMETRIC_AVAILABLE: "biometric_available",
  THEME_PREFERENCE: "theme_preference",
  CONTACTS: "contacts_data", // Add the key for contacts
  RECENT_CONTACTS: "recent_contacts_data",
  GUIDE: "guide",
  REDEEM_REWARD: "redeem_reward",
  PIN: "pin",
  SELECTED_CURRENCY: "selected_currency",
  TOTAL_DISBURSABLE: "total_disbursable",
  CRYPTO_DATA: "crypto_data",
  ALL_CRYPTO_BALANCES: "all_crypto_balances",
  OTP_RESEND_TIMESTAMP: "otp_resend_timestamp",
  REFERRAL_CODE: "referral_code",
  APP_BACKGROUND_FLAG: "app_background_flag",
  APP_LOCK_LAST_ACTIVE_TIME: "app.lock.last_active_time",
  APP_LOCK_TIMEOUT: "app.lock.timeout",
  APP_LOCK_PIN_SETUP_PROMPT_AT: "app.lock.pin_setup_prompt_at",
  KYC_CONGRATULATIONS_SHOWN: "kyc_congratulations_shown",
  SMS_HASH: "sms_hash",
  /** Debug: last time a push notification was received (ISO string). For TestFlight debugging. */
  DEBUG_LAST_NOTIFICATION_AT: "debug_last_notification_at",
  /** Cash buy: user acknowledged wallet load instructions + consent API (suffix with user id when set). */
  CASH_BUY_LOAD_INSTRUCTIONS_ACK: "cash_buy_load_instructions_ack",
  SELL_READY_CODE_WAIT_ACK: "sell_ready_code_wait_ack",
  /** First-time "Find your ReadyCode in transaction history" on waiting screen. */
  SELL_READY_CODE_HISTORY_ACK: "sell_ready_code_history_ack",
  /** @deprecated Use SELL_READY_CODE_HISTORY_ACK */
  SELL_READY_CODE_CLOSE_ACK: "sell_ready_code_close_ack",
};

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
};

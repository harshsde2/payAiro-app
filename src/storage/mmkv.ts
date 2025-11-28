import { MMKV } from "react-native-mmkv";

const storage = new MMKV();

export const STORAGE_KEYS = {
  AUTH_TOKENS: "auth_tokens",
  USER_DATA: "user_data",
  PIN: "pin",
  KYC_STATUS: "kyc_status",
} as const;

export const getItem = (key: string): string | null => {
  try {
    const value = storage.getString(key);
    return value ?? null;
  } catch (error) {
    console.error(`Error getting item from storage: ${key}`, error);
    return null;
  }
};

export const setItem = (key: string, value: string): void => {
  try {
    storage.set(key, value);
  } catch (error) {
    console.error(`Error setting item in storage: ${key}`, error);
  }
};

export const removeItem = (key: string): void => {
  try {
    storage.delete(key);
  } catch (error) {
    console.error(`Error removing item from storage: ${key}`, error);
  }
};

export const clear = (): void => {
  try {
    storage.clearAll();
  } catch (error) {
    console.error("Error clearing storage", error);
  }
};


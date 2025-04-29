import { MMKV } from 'react-native-mmkv';

// Create the storage instance
export const storage = new MMKV({
  id: 'payAiro-app-storage',
  encryptionKey: 'payAiro-secure-storage-key'
});

// Helper functions
export const getItem = (key: string): string | undefined => {
  return storage.getString(key);
};

export const setItem = (key: string, value: string): void => {
  storage.set(key, value);
};

export const removeItem = (key: string): void => {
  storage.delete(key);
};

export const clearAll = (): void => {
  storage.clearAll();
};

// Key constants for the app
export const STORAGE_KEYS = {
  AUTH_TOKENS: 'auth_tokens',
  USER_DATA: 'user_data',
  WALLET_DATA: 'wallet_data',
  BIOMETRIC_AVAILABLE: 'biometric_available',
  THEME_PREFERENCE: 'theme_preference',
  CONTACTS: 'contacts_data', // Add the key for contacts
  RECENT_CONTACTS:'recent_contacts_data'
}; 
import { useMMKVString } from 'react-native-mmkv';
import { storage, STORAGE_KEYS } from 'storage/mmkv';

/**
 * Frontend-only "default payment card": persists the user's chosen debit card
 * (`payment_method_id`) locally so it can be pre-selected on Add Balance / Buy /
 * Sell / Withdraw. There is no backend field for this — it's a UX convenience.
 */

export const getDefaultPaymentMethodId = (): string | null =>
  storage.getString(STORAGE_KEYS.DEFAULT_PAYMENT_METHOD_ID) ?? null;

export const setDefaultPaymentMethodId = (id: string): void =>
  storage.set(STORAGE_KEYS.DEFAULT_PAYMENT_METHOD_ID, id);

export const clearDefaultPaymentMethodId = (): void =>
  storage.delete(STORAGE_KEYS.DEFAULT_PAYMENT_METHOD_ID);

/** Reactive access to the default card id — re-renders when it changes anywhere. */
export function useDefaultPaymentMethodId(): {
  defaultId: string | null;
  setDefault: (id: string) => void;
  clearDefault: () => void;
} {
  const [value, setValue] = useMMKVString(
    STORAGE_KEYS.DEFAULT_PAYMENT_METHOD_ID,
    storage
  );
  return {
    defaultId: value ?? null,
    setDefault: (id: string) => setValue(id),
    clearDefault: () => setValue(undefined),
  };
}

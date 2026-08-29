import { MMKV } from "react-native-mmkv";
import { APP_LOCK_TIMEOUT_OPTIONS, DEFAULT_APP_LOCK_TIMEOUT_MS } from "types/appLock.types";

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
  /** Set once the user swipes/skips through the pre-onboarding intro slider. Never cleared on logout. */
  APP_INTRO_SEEN: "app_intro_seen",
  ONBOARDING_COMPLETE: "onboarding_complete",
  AUTH_ONBOARDING_STEP: "auth_onboarding_step",
  AUTH_RESUME_PARAMS: "auth_resume_params",
  /** Identity returned by KYC step 1, so step 2 can prefill after an app restart. */
  KYC_VERIFY_DRAFT: "kyc_verify_draft",
  USER_DATA: "user_data",
  WALLET_DATA: "wallet_data",
  BIOMETRIC_AVAILABLE: "biometric_available",
  /** @deprecated Legacy styles/ThemeContext only. new-ui uses APPEARANCE_PREFERENCE. */
  THEME_PREFERENCE: "theme_preference",
  /** new-ui appearance choice. JSON { preference: "light" | "dark" | "system" }.
   *  Deliberately separate from THEME_PREFERENCE, which the legacy provider still
   *  writes on init and would otherwise clobber. */
  APPEARANCE_PREFERENCE: "appearance_preference",
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
  /** Partner click id captured from a referral deep link, sent on signup OTP verify. */
  REFERRAL_CLICK_ID: "referral_click_id",
  APP_BACKGROUND_FLAG: "app_background_flag",
  APP_LOCK_LAST_ACTIVE_TIME: "app.lock.last_active_time",
  APP_LOCK_TIMEOUT: "app.lock.timeout",
  APP_LOCK_PIN_SETUP_PROMPT_AT: "app.lock.pin_setup_prompt_at",
  /** Boolean: approve transactions with biometrics instead of the PIN. Separate from the
   *  app-unlock biometric preference (which lives in EncryptedStorage under "biometric"). */
  APP_LOCK_TXN_BIOMETRIC: "app.lock.txn_biometric",
  KYC_CONGRATULATIONS_SHOWN: "kyc_congratulations_shown",
  SMS_HASH: "sms_hash",
  /** Debug: last time a push notification was received (ISO string). For TestFlight debugging. */
  DEBUG_LAST_NOTIFICATION_AT: "debug_last_notification_at",
  /**
   * JSON { at, eventType } stamped by the background FCM handler (headless JS).
   * Consumed on next foreground to refresh queries the background context can't touch.
   */
  PENDING_PUSH_REFRESH: "pending_push_refresh",
  /** Cash buy: user acknowledged wallet load instructions + consent API (suffix with user id when set). */
  CASH_BUY_LOAD_INSTRUCTIONS_ACK: "cash_buy_load_instructions_ack",
  SELL_READY_CODE_WAIT_ACK: "sell_ready_code_wait_ack",
  /** First-time "Find your ReadyCode in transaction history" on waiting screen. */
  SELL_READY_CODE_HISTORY_ACK: "sell_ready_code_history_ack",
  /** @deprecated Use SELL_READY_CODE_HISTORY_ACK */
  SELL_READY_CODE_CLOSE_ACK: "sell_ready_code_close_ack",
  /** JSON object: { CT: "1.0", MN: "1.0" } — acked disclosure version per state for fast local check. */
  STATE_COMPLIANCE_ACKS: "state_compliance_acks",
  /** JSON: last ComplianceStatus from GET state-compliance/status/ — lets the launch gate work offline. */
  STATE_COMPLIANCE_STATUS: "state_compliance_status",
  /** Frontend-only: the user's chosen default debit card (payment_method_id). Pre-selects it
   *  on Add Balance / Buy / Sell / Withdraw. Not a backend field. */
  DEFAULT_PAYMENT_METHOD_ID: "default_payment_method_id",
};

export function getComplianceAckedVersion(stateCode: string): string | null {
  const raw = getItem(STORAGE_KEYS.STATE_COMPLIANCE_ACKS);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed[stateCode] ?? null;
  } catch {
    return null;
  }
}

export function setComplianceAckedVersion(stateCode: string, version: string): void {
  const raw = getItem(STORAGE_KEYS.STATE_COMPLIANCE_ACKS);
  const existing: Record<string, string> = raw ? JSON.parse(raw) : {};
  setItem(STORAGE_KEYS.STATE_COMPLIANCE_ACKS, JSON.stringify({ ...existing, [stateCode]: version }));
}

export function getCachedComplianceStatus<T = unknown>(): T | null {
  const raw = getItem(STORAGE_KEYS.STATE_COMPLIANCE_STATUS);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setCachedComplianceStatus(status: unknown): void {
  setItem(STORAGE_KEYS.STATE_COMPLIANCE_STATUS, JSON.stringify(status));
}

export function clearCachedComplianceStatus(): void {
  removeItem(STORAGE_KEYS.STATE_COMPLIANCE_STATUS);
}

/**
 * Auto-lock grace period (ms) chosen by the user in Privacy & Security.
 * Falls back to the default when unset, and rejects any stored value that isn't
 * one of the known options (guards against stale/garbage data).
 */
export function getAppLockTimeoutMs(): number {
  const stored = getNumber(STORAGE_KEYS.APP_LOCK_TIMEOUT);
  if (stored === undefined) return DEFAULT_APP_LOCK_TIMEOUT_MS;
  const isKnown = APP_LOCK_TIMEOUT_OPTIONS.some((o) => o.valueMs === stored);
  return isKnown ? stored : DEFAULT_APP_LOCK_TIMEOUT_MS;
}

export function setAppLockTimeoutMs(ms: number): void {
  setNumber(STORAGE_KEYS.APP_LOCK_TIMEOUT, ms);
}

/**
 * Whether transactions are approved with biometrics instead of the PIN — the
 * "Biometric for Transactions" switch in Privacy & Security. Independent of the
 * app-unlock biometric preference, and off unless the user explicitly enabled it.
 *
 * Kept in MMKV (not EncryptedStorage) because the lock screen reads it synchronously
 * while deciding whether to prompt; `clearAll()` on logout resets it per user.
 */
export function getTransactionBiometricEnabled(): boolean {
  return storage.getBoolean(STORAGE_KEYS.APP_LOCK_TXN_BIOMETRIC) === true;
}

export function setTransactionBiometricEnabled(enabled: boolean): void {
  storage.set(STORAGE_KEYS.APP_LOCK_TXN_BIOMETRIC, enabled);
}

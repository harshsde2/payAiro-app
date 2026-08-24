export interface AppLockState {
  isLocked: boolean;
  lastActiveTime: number | null;
  timeout: number;
}

/** When true, show PIN screen instead of triggering biometric (e.g. after 2–3 biometric failures). */
export type ShowPinScreen = boolean;

export interface AppLockContextType {
  isLocked: boolean;
  lockApp: () => void;
  unlockApp: () => void;
  updateLastActive: () => void;
  shouldShowLock: boolean;
  refreshPinStatus: () => void;
  setNativeModalVisible: (visible: boolean) => void;
  /** User has enabled biometric login in app settings. */
  isBiometricEnabled: boolean;
  /** Re-read biometric preference from secure storage (Settings can toggle it). */
  refreshBiometricStatus: () => Promise<void>;
  /** User has enabled biometric approval for transactions — separate from app unlock, so
   *  the app can open with a PIN while payments use Face ID / Touch ID / Fingerprint. */
  isTransactionBiometricEnabled: boolean;
  /** Re-read the transaction-biometric preference (Settings can toggle it). */
  refreshTransactionBiometricStatus: () => void;
  /** Show PIN entry (e.g. after biometric failures or when biometric disabled). */
  showPinScreen: ShowPinScreen;
  /** Call when user should see PIN screen (e.g. after max biometric failures). */
  requestShowPinScreen: () => void;
  /** Reset biometric failure count on successful PIN unlock. */
  resetBiometricFailures: () => void;
  /** Request PIN/biometric verification for payment or other action. Shows AppLockScreen; on success calls callback and closes. */
  requestPaymentVerification: (onVerified: () => void) => void;
  /** Clear any active payment verification request (e.g. user cancelled). */
  clearPaymentVerification: () => void;
  /** Non-null when payment verification modal is active; onVerified is the callback to run on success. */
  paymentVerificationRequest: {
    onVerified: () => void;
    requirePinSetup?: boolean;
  } | null;
  /** True once we've determined whether to show lock on cold start; used to avoid flashing dashboard before AppLock. */
  isLockCheckComplete: boolean;
}

export const LOCK_CONFIG = {
  /** Grace period before locking when app returns to foreground (ms). */
  GRACE_PERIOD_MS: 60000,
  /** After this many biometric failures, show PIN screen. */
  MAX_BIOMETRIC_FAILURES_BEFORE_PIN: 3,
  MAX_PIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 300000, // 5 minutes after max PIN attempts
} as const;

/** User-selectable auto-lock timings (Privacy & Security). `valueMs` is the grace period. */
export const APP_LOCK_TIMEOUT_OPTIONS: ReadonlyArray<{ label: string; valueMs: number }> = [
  { label: 'Instant', valueMs: 0 },
  { label: '30s', valueMs: 30000 },
  { label: '1 min', valueMs: 60000 },
  { label: '5 min', valueMs: 300000 },
  { label: '10 min', valueMs: 600000 },
];

/** Default auto-lock timing — matches the app's original hardcoded grace period. */
export const DEFAULT_APP_LOCK_TIMEOUT_MS: number = LOCK_CONFIG.GRACE_PERIOD_MS;


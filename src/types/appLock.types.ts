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
  paymentVerificationRequest: { onVerified: () => void } | null;
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


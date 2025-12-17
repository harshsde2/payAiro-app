export interface AppLockState {
  isLocked: boolean;
  lastActiveTime: number | null;
  timeout: number;
}

export interface AppLockContextType {
  isLocked: boolean;
  lockApp: () => void;
  unlockApp: () => void;
  updateLastActive: () => void;
  shouldShowLock: boolean;
}

export const LOCK_CONFIG = {
  DEFAULT_TIMEOUT: 10000, // 10 seconds
  MAX_PIN_ATTEMPTS: 3,
  LOCKOUT_DURATION: 300000, // 5 minutes after max attempts
} as const;


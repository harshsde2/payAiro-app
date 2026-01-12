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
  refreshPinStatus: () => void;
  setNativeModalVisible: (visible: boolean) => void;
}

export const LOCK_CONFIG = {
  DEFAULT_TIMEOUT: 0, // Lock immediately when returning from background
  MAX_PIN_ATTEMPTS: 3,
  LOCKOUT_DURATION: 300000, // 5 minutes after max attempts
} as const;


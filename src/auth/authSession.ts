import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import EncryptedStorage from "react-native-encrypted-storage";
import {
  getItem,
  removeItem,
  setItem,
  STORAGE_KEYS,
} from "storage/mmkv";

export type AuthResumeParams = {
  email?: string;
  phone?: string;
  username?: string;
  inputType?: string;
  isEmail?: boolean;
};

export type AuthSession = {
  tokens: Record<string, unknown> | null;
  onboardingComplete: boolean;
  onboardingStep: number;
  resumeParams: AuthResumeParams | null;
};

const parseTokens = (raw: string | undefined): Record<string, unknown> | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return parsed?.access || parsed?.refresh ? parsed : null;
  } catch {
    return null;
  }
};

export const readAuthSession = (): AuthSession => {
  const tokens = parseTokens(getItem(STORAGE_KEYS.AUTH_TOKENS));
  const onboardingComplete = getItem(STORAGE_KEYS.ONBOARDING_COMPLETE) === "true";
  const stepRaw = getItem(STORAGE_KEYS.AUTH_ONBOARDING_STEP);
  const parsedStep = stepRaw != null ? Number(stepRaw) : NaN;
  const onboardingStep = Number.isFinite(parsedStep) ? parsedStep : 0;

  let resumeParams: AuthResumeParams | null = null;
  const resumeRaw = getItem(STORAGE_KEYS.AUTH_RESUME_PARAMS);
  if (resumeRaw) {
    try {
      resumeParams = JSON.parse(resumeRaw) as AuthResumeParams;
    } catch {
      resumeParams = null;
    }
  }

  return {
    tokens,
    onboardingComplete,
    onboardingStep,
    resumeParams,
  };
};

export const isOnboardingComplete = (): boolean =>
  getItem(STORAGE_KEYS.ONBOARDING_COMPLETE) === "true";

export const persistTokens = (tokens: Record<string, unknown>): void => {
  const existingRaw = getItem(STORAGE_KEYS.AUTH_TOKENS);
  let merged = tokens;
  if (existingRaw) {
    try {
      merged = { ...JSON.parse(existingRaw), ...tokens };
    } catch {
      merged = tokens;
    }
  }
  setItem(STORAGE_KEYS.AUTH_TOKENS, JSON.stringify(merged));
};

export const setOnboardingStep = (step: number): void => {
  setItem(STORAGE_KEYS.AUTH_ONBOARDING_STEP, String(step));
};

export const markOnboardingComplete = (): void => {
  setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, "true");
  setOnboardingStep(2);
};

export const saveAuthResumeParams = (params: AuthResumeParams): void => {
  setItem(STORAGE_KEYS.AUTH_RESUME_PARAMS, JSON.stringify(params));
};

export const getAuthResumeParams = (): AuthResumeParams | null =>
  readAuthSession().resumeParams;

export const clearAuthSession = (): void => {
  removeItem(STORAGE_KEYS.AUTH_TOKENS);
  removeItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
  removeItem(STORAGE_KEYS.AUTH_ONBOARDING_STEP);
  removeItem(STORAGE_KEYS.AUTH_RESUME_PARAMS);
};

/**
 * User left signup mid-flow (e.g. Cancel on Address). Clears resume state so the next
 * app open starts at onboarding — not Address/Coinme.
 */
export const abandonIncompleteSignup = async (): Promise<void> => {
  clearAuthSession();
  removeItem(STORAGE_KEYS.USER_DATA);
  try {
    await EncryptedStorage.removeItem("guruPanda_token");
  } catch {
    // ignore
  }
};

export const resolveAuthInitialRoute = (
  step: number
): keyof typeof NAVIGATION_SCREENS | string => {
  if (step === 0) {
    return NAVIGATION_SCREENS.NEW_COINME_MOBILE_AUTH;
  }
  if (step === 1) {
    return NAVIGATION_SCREENS.NEW_ADDRESS;
  }
  return NAVIGATION_SCREENS.NEW_ONBOARDING;
};

/** Read MMKV each time — do not cache in React state (stale after logout / onboarding complete). */
export const getAuthStackInitialRoute = (): string => {
  const session = readAuthSession();
  if (session.tokens && !session.onboardingComplete) {
    return resolveAuthInitialRoute(session.onboardingStep);
  }
  return NAVIGATION_SCREENS.NEW_ONBOARDING;
};

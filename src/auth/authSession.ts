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

/** The identity block returned by KYC step 1 and echoed by step 2. */
export type KycVerifyDetails = {
  username?: string;
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  ssn_last_four?: string;
  address_line1?: string;
  address_line2?: string | null;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
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

/**
 * Identity returned by KYC step 1 (`kyc-complete`). Persisted so the step 2 verify
 * screen can prefill even when the user kills the app between the two steps.
 */
export const saveKycVerifyDraft = (details: KycVerifyDetails): void => {
  setItem(STORAGE_KEYS.KYC_VERIFY_DRAFT, JSON.stringify(details));
};

export const getKycVerifyDraft = (): KycVerifyDetails | null => {
  const raw = getItem(STORAGE_KEYS.KYC_VERIFY_DRAFT);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as KycVerifyDetails;
  } catch {
    return null;
  }
};

export const clearKycVerifyDraft = (): void => {
  removeItem(STORAGE_KEYS.KYC_VERIFY_DRAFT);
};

export const clearAuthSession = (): void => {
  removeItem(STORAGE_KEYS.AUTH_TOKENS);
  removeItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
  removeItem(STORAGE_KEYS.AUTH_ONBOARDING_STEP);
  removeItem(STORAGE_KEYS.AUTH_RESUME_PARAMS);
  removeItem(STORAGE_KEYS.KYC_VERIFY_DRAFT);
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
  // Step 1 = KYC identity fetched but not yet verified. Resume at step 2 rather than
  // sending the user back through Coinme 2FA.
  if (step === 1) {
    return NAVIGATION_SCREENS.NEW_KYC_VERIFY;
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

/**
 * Synchronous "fully logged in" check from MMKV: tokens present AND onboarding complete.
 * A mid-onboarding user (tokens but !onboardingComplete) is NOT complete — they still belong
 * on the Auth stack (resumed via getAuthStackInitialRoute). Used by the root render gate to
 * show a loader (never the Auth stack) while Redux `isLogin` hydrates on a logged-in cold launch.
 */
export const hasCompletedSession = (): boolean => {
  const session = readAuthSession();
  return !!session.tokens && session.onboardingComplete;
};

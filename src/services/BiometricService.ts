/**
 * BiometricService – Banking-grade biometric authentication
 * Uses native system UI only (Face ID / Touch ID / Fingerprint). No custom biometric UI.
 * Does not use or request device PIN/password/pattern as primary auth.
 */

/// <reference path="../types/vendor/sbaiahmed1-react-native-biometrics.d.ts" />

import {
  isSensorAvailable,
  type SensorInfo,
  type BiometricAuthResult,
  authenticateWithOptions,
} from '@sbaiahmed1/react-native-biometrics';

export type { BiometricAuthResult } from '@sbaiahmed1/react-native-biometrics';

const DEFAULT_PROMPT_MESSAGE = 'Unlock PayAiro';

export type BiometricAvailability = {
  available: boolean;
  biometryType?: string;
  error?: string;
  errorCode?: string;
};

/**
 * Check if the device has a biometric sensor and it is available for use.
 * Safe to call on every platform; returns availability without triggering any UI.
 */
export async function checkBiometricAvailability(): Promise<BiometricAvailability> {
  try {
    const sensorInfo: SensorInfo = await isSensorAvailable();
    return {
      available: sensorInfo.available === true,
      biometryType: sensorInfo.biometryType,
      error: sensorInfo.error,
      // Some platforms provide a structured error code (e.g. BIOMETRY_NOT_ENROLLED / BIOMETRIC_ERROR_NONE_ENROLLED).
      // We surface it so UI can guide users to enroll biometrics.
      errorCode: (sensorInfo as any)?.errorCode,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { available: false, error: message };
  }
}

/**
 * Trigger the native biometric prompt (Face ID / Touch ID / Fingerprint).
 * Returns true only on success; false on cancel or failure. Never throws for user cancellation.
 * Security: We do not use allowDeviceCredentials so we never show device PIN/password.
 */
export async function authenticateWithBiometric(
  promptMessage: string = DEFAULT_PROMPT_MESSAGE
): Promise<boolean> {
  try {
    const result: BiometricAuthResult = await authenticateWithOptions({
      title: 'PayAiro',
      subtitle: promptMessage,
      cancelLabel: 'Cancel',
      // Security: biometric-only; never request device credentials fallback.
      allowDeviceCredentials: false,
      disableDeviceFallback: true,
    });

    return result?.success === true;
  } catch {
    return false;
  }
}

export type BiometricAuthOptions = {
  /** Custom label for the negative button (e.g. "Use PIN" on Android). */
  cancelLabel?: string;
};

/**
 * Same as authenticateWithBiometric but returns full result including errorCode.
 * Use when you need a custom cancel button label (e.g. "Use PIN") or to distinguish cancel vs other errors.
 */
export async function authenticateWithBiometricDetailed(
  promptMessage: string = DEFAULT_PROMPT_MESSAGE,
  options?: BiometricAuthOptions
): Promise<BiometricAuthResult> {
  try {
    return await authenticateWithOptions({
      title: 'PayAiro',
      subtitle: promptMessage,
      cancelLabel: options?.cancelLabel ?? 'Cancel',
      allowDeviceCredentials: false,
      disableDeviceFallback: true,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const errorCode = (e as { code?: string })?.code;
    return { success: false, error: message, errorCode };
  }
}

declare module '@sbaiahmed1/react-native-biometrics' {
  export type SensorInfo = {
    available: boolean;
    biometryType?: string;
    error?: string;
    errorCode?: string;
  };

  export type BiometricAuthResult = {
    success: boolean;
    error?: string;
    errorCode?: string;
  };

  export function isSensorAvailable(
    options?: Record<string, unknown>
  ): Promise<SensorInfo>;

  // Returns a result object with success + error info (v0.12+).
  export function simplePrompt(
    reason: string,
    options?: Record<string, unknown>
  ): Promise<BiometricAuthResult>;

  export function authenticateWithOptions(
    options: Record<string, unknown>
  ): Promise<BiometricAuthResult>;
}


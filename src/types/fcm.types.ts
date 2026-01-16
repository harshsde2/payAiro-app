/**
 * FCM (Firebase Cloud Messaging) Types
 * Type definitions for push notification token management
 */

/**
 * Payload sent to backend when storing FCM token
 */
export interface IFCMTokenPayload {
  fcm_token: string;
  device_id: string;
}

/**
 * Response from backend after storing FCM token
 */
export interface IFCMTokenResponse {
  status: boolean;
  message: string;
  data?: {
    token_id?: string;
    device_id?: string;
  };
}

/**
 * FCM Service initialization options
 */
export interface IFCMServiceOptions {
  onTokenReceived?: (token: string) => void;
  onTokenRefresh?: (token: string) => void;
  onError?: (error: Error) => void;
}

/**
 * FCM Token storage hook options
 */
export interface IStoreFCMTokenOptions {
  retryOnFailure?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  showErrorToast?: boolean;
}

/**
 * FCM Token storage state
 */
export interface IFCMTokenState {
  token: string | null;
  isLoading: boolean;
  error: Error | null;
  hasStoredToBackend: boolean;
}

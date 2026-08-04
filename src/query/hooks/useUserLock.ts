import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "api";
import { AUTH } from "api/endpoints";
import { ApiResponse } from "api/types";
import { userApiClient } from "api/userApiClient";
import { USER_AUTH } from "api/endpoints";
import { queryStaleTime } from "query/queryConfigs";

export interface UserLockData {
  status?: boolean;
  is_locked: boolean;
  message?: string;
}

export interface UserLockResponse {
  status: boolean;
  message: string;
  data: UserLockData;
}

const USER_LOCK_QUERY_KEY = ["userLock"] as const;
const USER_SECURITY_PIN_QUERY_KEY = ["userSecurityPinSettings"] as const;

export interface UserSecurityPinSettingsData {
  pin: string | null;
  biometric: boolean;
}

interface FastApiSecurityPinResponse {
  ok: boolean;
  message: string;
  data: UserSecurityPinSettingsData;
}

const mapFastApiResponse = (
  response: FastApiSecurityPinResponse
): ApiResponse<UserSecurityPinSettingsData> => ({
  status: !!response?.ok,
  message: response?.message || "",
  toast_message: response?.message || "",
  data: response?.data || { pin: null, biometric: false },
});

/**
 * Fetches the user's app-lock (biometric) preference from the backend.
 * Use when you need to sync is_locked after login or on app open.
 */
export const useUserLock = (enabled = true) => {
  return useQuery<ApiResponse<UserLockData>>({
    queryKey: USER_LOCK_QUERY_KEY,
    queryFn: async () => {
      return await apiClient.get<ApiResponse<UserLockData>>(AUTH.USER_LOCK);
    },
    staleTime: queryStaleTime.INSTANT_STALE_TIME,
    enabled,
  });
};

/**
 * Updates the user's app-lock (biometric) preference on the backend.
 * Payload: { is_locked: true } when biometric is enabled, { is_locked: false } when disabled.
 */
export const usePatchUserLock = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<UserLockData>, Error, { is_locked: boolean }>({
    mutationFn: async (payload) => {
      return await apiClient.patch<ApiResponse<UserLockData>>(
        AUTH.USER_LOCK,
        payload,
        false
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_LOCK_QUERY_KEY });
    },
  });
};

export const useUserSecurityPinSettings = (enabled = true) => {
  return useQuery<ApiResponse<UserSecurityPinSettingsData>>({
    queryKey: USER_SECURITY_PIN_QUERY_KEY,
    queryFn: async () => {
      const response = await userApiClient.get<FastApiSecurityPinResponse>(
        USER_AUTH.SECURITY_PIN_SETTINGS
      );
      return mapFastApiResponse(response);
    },
    staleTime: queryStaleTime.INSTANT_STALE_TIME,
    enabled,
  });
};

export const useUpsertUserSecurityPinSettings = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<UserSecurityPinSettingsData>,
    Error,
    { pin: string | null; biometric: boolean }
  >({
    mutationFn: async (payload) => {
      const response = await userApiClient.post<FastApiSecurityPinResponse>(
        USER_AUTH.SECURITY_PIN_SETTINGS,
        payload,
        false
      );
      return mapFastApiResponse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_SECURITY_PIN_QUERY_KEY });
    },
  });
};

/** The only privileged action the OTP endpoints are used for today. */
export type ActionOtpAction = "transaction_pin_change";
export type ActionOtpChannel = "phone" | "email";

export interface ActionOtpVerifyData {
  /** Short-lived ticket (900s) that authorises SECURITY_PIN_RESET. Single-use. */
  action_token: string;
  expires_in_seconds: number;
}

interface FastApiActionOtpRequestResponse {
  ok: boolean;
  message: string;
}

interface FastApiActionOtpVerifyResponse {
  ok: boolean;
  message: string;
  data: ActionOtpVerifyData;
}

/** Sends an OTP to the logged-in user's registered phone/email for a privileged action. */
export const useActionOtpRequest = () => {
  return useMutation<
    FastApiActionOtpRequestResponse,
    Error,
    { channel: ActionOtpChannel; action: ActionOtpAction }
  >({
    mutationFn: async (payload) => {
      return await userApiClient.post<FastApiActionOtpRequestResponse>(
        USER_AUTH.ACTION_OTP_REQUEST,
        payload,
        false
      );
    },
  });
};

/** Verifies an action OTP and returns the action_token needed to reset the PIN. */
export const useActionOtpVerify = () => {
  return useMutation<
    FastApiActionOtpVerifyResponse,
    Error,
    { channel: ActionOtpChannel; action: ActionOtpAction; otp_code: string }
  >({
    mutationFn: async (payload) => {
      return await userApiClient.post<FastApiActionOtpVerifyResponse>(
        USER_AUTH.ACTION_OTP_VERIFY,
        payload,
        false
      );
    },
  });
};

/**
 * Changes the PIN when the user knows the current one. The backend re-validates
 * `old_pin` and answers 401 INVALID_CREDENTIALS if it's wrong.
 */
export const useSecurityPinChange = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<UserSecurityPinSettingsData>,
    Error,
    { old_pin: string; new_pin: string }
  >({
    mutationFn: async (payload) => {
      const response = await userApiClient.post<FastApiSecurityPinResponse>(
        USER_AUTH.SECURITY_PIN_CHANGE,
        payload,
        false
      );
      return mapFastApiResponse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_SECURITY_PIN_QUERY_KEY });
    },
  });
};

/** Resets the PIN for a user who forgot it, authorised by an action_token. */
export const useSecurityPinReset = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<UserSecurityPinSettingsData>,
    Error,
    { action_token: string; new_pin: string }
  >({
    mutationFn: async (payload) => {
      const response = await userApiClient.post<FastApiSecurityPinResponse>(
        USER_AUTH.SECURITY_PIN_RESET,
        payload,
        false
      );
      return mapFastApiResponse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_SECURITY_PIN_QUERY_KEY });
    },
  });
};

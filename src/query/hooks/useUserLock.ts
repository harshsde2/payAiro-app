import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "api";
import { AUTH } from "api/endpoints";
import { ApiResponse } from "api/types";
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

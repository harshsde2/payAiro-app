import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { apiClient } from "../../api";
import { AUTH } from "../../api/endpoints";
import { ApiResponse, User } from "../../api/types";
import { queryStaleTime } from "query/queryConfigs";
import useSelectorAction from "hooks/useSelectorAction";
import { INotificationsResponse } from "./types";
import { kycKeys } from "./useKyc";

// Query keys
export const userKeys = {
  all: ["user"] as const,
  contacts: () => [...userKeys.all, "contacts"] as const,
  profile: () => [...userKeys.all, "profile"] as const,
  notifications: () => [...userKeys.all, "notifications"] as const,
  unreadNotificationsCount: () =>
    [...userKeys.all, "unread_notifications_count"] as const,
  notificationsPaginated: (pageSize: number) =>
    [...userKeys.all, "notifications_paginated", pageSize] as const,
  pin: () => [...userKeys.all, "pin"] as const,
  fiatDashboard: () => [...userKeys.all, "fiat_dashboard"] as const,
  WallerDashboard: () => [...userKeys.all, "wallet_dashboard"] as const,
};

/**
 * Hook to get user contacts
 */
export const useContacts = () => {
  return useQuery<ApiResponse<User[]>>({
    queryKey: userKeys.contacts(),
    queryFn: async () => {
      return await apiClient.get<ApiResponse<User[]>>(AUTH.CONTACT_GET);
    },
  });
};

// Interface for user verification payload
interface VerifyUserPayload {
  identifier_type: "username" | "email" | "phone";
  identifier_value: string;
}

/**
 * Hook to verify a user exists
 */
export const useVerifyUser = () => {
  return useMutation<ApiResponse<User>, Error, VerifyUserPayload>({
    mutationFn: async (payload) => {
      return await apiClient.post<ApiResponse<User>>(
        AUTH.VERIFY_USER,
        payload,
        true
      );
    },
    onSuccess: (data) => {
      console.log("data ->", data);
    },
    onError: (error) => {
    },
  });
};

// Identifier verification payload for /auth/verify-user/
interface VerifyUserByIdentifierPayload {
  identifier: string;
}

/**
 * Hook to verify a user by identifier (username/email/phone etc)
 */
export const useVerifyUserByIdentifier = () => {
  return useMutation<ApiResponse<User>, Error, VerifyUserByIdentifierPayload>({
    mutationFn: async (payload) => {
      try {
        return await apiClient.post<ApiResponse<User>>(AUTH.VERIFY_USER, payload, true);
      } catch (error: any) {
        // Add custom error handling here if needed
        throw error;
      }
    },
    onSuccess: (data) => {
      // Success handling can be added here
      // e.g. show toast, update UI, etc
    },
    onError: (error) => {
      // Centralized error handling for UI feedback, logging, etc
      // console.error("VerifyUserByIdentifier error:", error);
    },
  });
};

// Interface for adding contact payload
interface AddContactPayload {
  identifier_type: "username" | "email" | "phone";
  identifier_value: string;
  nickname?: string;
}

/**
 * Hook to add a contact
 */
export const useAddContact = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<any>, Error, AddContactPayload>({
    mutationFn: async (payload) => {
      return await apiClient.post<ApiResponse<any>>(
        AUTH.CONTACT_ADDING,
        payload,
        false
      );
    },
    onSuccess: () => {
      // Invalidate contacts query to trigger refetch
      queryClient.invalidateQueries({ queryKey: userKeys.contacts() });
    },
  });
};

/**
 * Hook to add a contact
 */
export const useChangePin = () => {
  return useMutation<ApiResponse<any>, Error, AddContactPayload>({
    mutationFn: async (payload) => {
      return await apiClient.patch<ApiResponse<any>>(
        AUTH.CHANGE_PIN,
        payload,
        true
      );
    },
    onSuccess: () => {},
  });
};

/**
 * Hook to add a contact
 */
export const useVerifyUserForChangePin = () => {
  return useMutation<ApiResponse<any>, Error, AddContactPayload>({
    mutationFn: async () => {
      return await apiClient.post<ApiResponse<any>>(
        AUTH.VERIFY_OTP_WITH_MAIL,
        {},
        false
      );
    },
    onSuccess: () => {},
  });
};

/**
 * Hook to add a contact
 */
export const useVerifyUserForChangePinOtp = () => {
  return useMutation<ApiResponse<any>, Error, AddContactPayload>({
    mutationFn: async (payload) => {
      return await apiClient.post<ApiResponse<any>>(
        AUTH.VERIFY_SEND_OTP,
        payload,
        true
      );
    },
    onSuccess: () => {},
  });
};

/**
 * Hook to send OTP for forgot PIN
 * Sends OTP to user's registered email for PIN reset verification
 */
export const useForgotPinSendOtp = () => {
  return useMutation<ApiResponse<any>, Error, Record<string, never>>({
    mutationFn: async () => {
      return await apiClient.post<ApiResponse<any>>(
        AUTH.FORGOT_PIN_SEND_OTP,
        {},
        false
      );
    },
  });
};

/**
 * Hook to verify OTP for forgot PIN
 * Verifies the OTP sent to user's email during PIN reset flow
 */
export const useForgotPinVerifyOtp = () => {
  return useMutation<ApiResponse<any>, Error, { otp: string }>({
    mutationFn: async (payload) => {
      return await apiClient.post<ApiResponse<any>>(
        AUTH.VERIFY_SEND_OTP,
        payload,
        true
      );
    },
  });
};

// Interface for forgot PIN reset payload
interface ForgotPinResetPayload {
  new_pin: string;
}

/**
 * Hook to reset PIN after forgot PIN flow
 * Resets the user's PIN after successful OTP verification
 */
export const useForgotPinReset = () => {
  return useMutation<ApiResponse<any>, Error, ForgotPinResetPayload>({
    mutationFn: async (payload) => {
      return await apiClient.post<ApiResponse<any>>(
        AUTH.FORGOT_PIN_RESET,
        payload,
        true
      );
    },
  });
};

/**
 * Hook to Intra Account Transfer
 */
export const useIntraAccountTransfer = () => {
  return useMutation<ApiResponse<any>>({
    mutationFn: async (payload) => {
      return await apiClient.post<ApiResponse<any>>(
        AUTH.SELF_TRANSFER,
        payload,
        true
      );
    },
    onSuccess: () => {},
  });
};
/**
 * Hook to Intra Account Transfer
 */
export const useUserToUserTransfer = () => {
  const { walletData } = useSelectorAction() as any;
  const isFortress = walletData?.fortress;

  const url = isFortress
    ? AUTH.USER_TO_USER_FORTRESS_TRANSFER
    : AUTH.USER_TO_USER_CYBRID_TRANSFER;

  // console.log("url =>", url);
  return useMutation<ApiResponse<any>>({
    mutationFn: async (payload) => {
      return await apiClient.post<ApiResponse<any>>(url, payload, true);
    },
    onSuccess: (data) => {
      // console.log("data =>", JSON.stringify(data, null, 2));
    },
    onError: (error) => {
      // console.log("error =>", JSON.stringify(error, null, 2));
    },
  });
};
/**
 * Hook to add a contact
 */
export const useSupport = () => {
  return useMutation<ApiResponse<any>>({
    mutationFn: async (payload) => {
      return await apiClient.post<ApiResponse<any>>(
        AUTH.USER_SUPPORT,
        payload,
        true
      );
    },
    onSuccess: () => {},
  });
};

/**
 * Hook to get user notifications
 */
export const useNotifications = (enabled: boolean = true) => {
  return useQuery<ApiResponse<any[]>>({
    queryKey: userKeys.notifications(),
    queryFn: async () => {
      return await apiClient.get<ApiResponse<any[]>>(AUTH.NOTIFICATIONS);
    },
    staleTime: queryStaleTime.VERY_FAST_STALE_TIME,
    enabled,
  });
};

export const useNotificationsPaginated = (
  pageSize: number = 12,
  enabled: boolean = true
) => {
  return useInfiniteQuery<INotificationsResponse, Error>({
    queryKey: userKeys.notificationsPaginated(pageSize),
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const query = `?page=${pageParam}&page_size=${pageSize}`;
      const response = await apiClient.get<INotificationsResponse>(
        `${AUTH.NOTIFICATIONS}${query}`
      );
      return response;
    },
    getNextPageParam: (lastPage) => {
      // Use pagination.has_next to determine if there's more data
      if (lastPage?.pagination?.has_next) {
        return lastPage.pagination.current_page + 1;
      }
      return undefined;
    },
    staleTime: queryStaleTime.VERY_FAST_STALE_TIME,
    enabled,
  });
};

export const useUnreadNotificationsCount = (enabled: boolean = true) => {
  return useQuery<ApiResponse<{ unread_count: number }>>({
    queryKey: userKeys.unreadNotificationsCount(),
    queryFn: async () => {
      return await apiClient.get<ApiResponse<{ unread_count: number }>>(
        AUTH.UNREAD_NOTIFICATIONS_COUNT
      );
    },
    staleTime:0,
    enabled,
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<{ status: boolean; message: string; updated_count: number }>>({
    mutationFn: async () => {
      return await apiClient.post<ApiResponse<{ status: boolean; message: string; updated_count: number }>>(
        AUTH.MARK_ALL_NOTIFICATIONS_READ,
        {},
        false
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.unreadNotificationsCount() });
      queryClient.invalidateQueries({ queryKey: userKeys.notifications() });
    },
  });
};

/**
 * Hook to upload profile photo (FormData) to server.
 * Works on both iOS and Android.
 * After successful upload, invalidates relevant queries to trigger refetch.
 */
export const useUploadProfilePhoto = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<any>, Error, FormData>({
    mutationFn: async (formData) => {
      return await apiClient.post<ApiResponse<any>>(
        AUTH.UPLOAD_PROFILE_PHOTO,
        formData,
        true // isFormData flag to set correct Content-Type header
      );
    },
    onSuccess: () => {
      // Invalidate all queries that might contain profile photo data
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
      queryClient.invalidateQueries({ queryKey: userKeys.fiatDashboard() });
      queryClient.invalidateQueries({ queryKey: userKeys.WallerDashboard() });
      queryClient.invalidateQueries({ queryKey: kycKeys.submission() });
      // Invalidate wallet details to refetch updated profile_photo
      queryClient.invalidateQueries({ queryKey: ["wallet", "details"] });
    },
  });
};

export const useUserPin = (enabled = true) => {
  return useQuery<ApiResponse<any>>({
    queryKey: userKeys.pin(),
    queryFn: async () => {
      return await apiClient.get<ApiResponse<any>>(AUTH.GET_PIN);
    },
    staleTime: queryStaleTime.INSTANT_STALE_TIME,
    enabled,
  });
};

export const useDashBoardFiatData = (enabled = true) => {
  return useQuery<ApiResponse<any>>({
    queryKey: userKeys.fiatDashboard(),
    queryFn: async () => {
      return await apiClient.get<ApiResponse<any>>(
        AUTH.GET_FIAT_DASHBOARD_DATA
      );
    },
    staleTime: queryStaleTime.INSTANT_STALE_TIME,
    enabled,
  });
};

export const useWalletDashboardData = (enabled = true) => {
  return useQuery<ApiResponse<any>>({
    queryKey: userKeys.WallerDashboard(),
    queryFn: async () => {
      return await apiClient.get<ApiResponse<any>>(
        AUTH.GET_WALLET_DASHBOARD_DATA
      );
    },
    staleTime: queryStaleTime.INSTANT_STALE_TIME,
    enabled,
  });
};

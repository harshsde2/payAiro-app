import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../api";
import { AUTH } from "../../api/endpoints";
import { ApiResponse, User } from "../../api/types";
import { queryStaleTime } from "query/queryConfigs";

// Query keys
export const userKeys = {
  all: ["user"] as const,
  contacts: () => [...userKeys.all, "contacts"] as const,
  profile: () => [...userKeys.all, "profile"] as const,
  notifications: () => [...userKeys.all, "notifications"] as const,
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
        false
      );
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
export const useNotifications = () => {
  return useQuery<ApiResponse<any>>({
    queryKey: userKeys.notifications(),
    queryFn: async () => {
      return await apiClient.get<ApiResponse<any>>(AUTH.NOTIFICATIONS);
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

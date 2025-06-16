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

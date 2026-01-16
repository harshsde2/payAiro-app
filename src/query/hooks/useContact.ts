import { useQuery } from "@tanstack/react-query";
import Contacts from "react-native-contacts";
import { ApiResponse, RecentContact, User } from "../../api/types";
import { userContactKeys } from "query/queryKeys";
import { apiClient } from "api";
import { AUTH } from "api/endpoints";
import { Platform } from "react-native";
import { queryStaleTime } from "query/queryConfigs";
import { useAppLock } from "hooks/useAppLock";

export const useDeviceContacts = () => {
  const { setNativeModalVisible } = useAppLock();
  
  return useQuery<ApiResponse<User[]>>({
    queryKey: userContactKeys.contacts(),
    queryFn: async () => {
      // Step 1: Request permission
      if (Platform.OS === "android") {
        let permission = await Contacts.checkPermission();

        if (permission === "denied") {
          // Set flag before showing native permission dialog
          setNativeModalVisible(true);
          try {
            permission = await Contacts.requestPermission();
          } finally {
            // Reset flag after permission dialog closes (with delay)
            setTimeout(() => {
              setNativeModalVisible(false);
            }, 1000);
          }
        }

        if (permission !== "authorized") {
          throw new Error("Permission to access contacts was denied.");
        }
      }

      // Step 2: Get and format contacts
      const deviceContacts = await Contacts.getAll();
      //   console.log("deviceContacts =>", JSON.stringify(deviceContacts, null, 2));
      const mappedContacts: User[] = deviceContacts.map((contact) => ({
        id: contact.recordID,
        name: `${contact.givenName} ${contact.familyName}`.trim(),
        phoneNumber: contact.phoneNumbers[0]?.number ?? "",
        email: contact.emailAddresses[0]?.email ?? "",
      }));

      return {
        status: true,
        data: mappedContacts,
      } as any;
    },

    staleTime: queryStaleTime.VERY_VERY_SLOW_STALE_TIME, // 1 minute
    retry: 1,
    retryDelay: 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

export const useRecentContacts = () => {
  return useQuery({
    queryKey: userContactKeys.recentContacts(),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<RecentContact[]>>(
        AUTH.CONTACT_GET
      );
      const recentContacts = response.data.slice(0, 10);

      return {
        recentContacts,
        allContacts: response.data,
        message: response.message,
        status: response.status,
      };
    },
    staleTime: Infinity,
  });
};

// Types for user search API response
interface IUserSearchItem {
  email: string;
  mobile_number: string;
  name: string;
  lastname: string;
  profile_photo: string | null;
  usernames: string;
  plaid_accountid: string | null;
  plaid_connected: boolean;
}

interface IUserSearchPagination {
  current_page: number;
  page_size: number;
  total_pages: number;
  total_count: number;
  has_next: boolean;
  has_previous: boolean;
  next_page: number | null;
  previous_page: number | null;
}

interface IUserSearchData {
  status: boolean;
  message: string;
  data: IUserSearchItem[];
  pagination: IUserSearchPagination;
}

interface IUserSearchResponse {
  status: boolean;
  message: string;
  data: IUserSearchData;
}

/**
 * Hook to search for users using the user-search API
 * @param query - Search query string
 * @param minCharacters - Minimum characters required to trigger search (default: 1)
 * @param page - Page number (default: 1)
 * @param pageSize - Number of results per page (default: 20)
 */
export const useUserSearch = (
  query: string,
  minCharacters: number = 1,
  page: number = 1,
  pageSize: number = 20
) => {
  return useQuery<IUserSearchResponse>({
    queryKey: userContactKeys.userSearch(query),
    queryFn: async () => {
      if (!query || query.length < minCharacters) {
        return {
          status: true,
          message: "OK",
          data: {
            status: true,
            message: "No query provided",
            data: [],
            pagination: {
              current_page: 1,
              page_size: pageSize,
              total_pages: 0,
              total_count: 0,
              has_next: false,
              has_previous: false,
              next_page: null,
              previous_page: null,
            },
          },
        };
      }

      const response = await apiClient.get<IUserSearchResponse>(
        `auth/user-search/?q=${encodeURIComponent(query)}&page=${page}&page_size=${pageSize}`
      );

      return response;
    },
    enabled: !!query && query.length >= minCharacters,
    staleTime: 30000, // 30 seconds
  });
};

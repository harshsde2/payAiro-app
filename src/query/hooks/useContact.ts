import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Contacts from "react-native-contacts";
import { ApiResponse, RecentContact, User } from "../../api/types";
import { userContactKeys } from "query/queryKeys";
import { apiClient } from "api";
import { AUTH, USER_AUTH } from "api/endpoints";
import { userApiClient } from "api/userApiClient";
import { Platform } from "react-native";
import { queryStaleTime } from "query/queryConfigs";
import { useAppLock } from "hooks/useAppLock";

export interface IAddUserContactPayload {
  username: string;
  payairo_id: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  contact_phone: string;
}

export interface IUserContact {
  id?: number | string;
  username?: string;
  payairo_id?: string;
  email?: string;
  phone?: string;
  contact_phone?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string | null;
  profile_photo?: string | null;
}

export interface IUserContactsResponse {
  ok: boolean;
  message: string;
  contacts: IUserContact[];
}

export interface IAddUserContactResponse {
  ok?: boolean;
  message?: string;
  data?: unknown;
}

const requestContactsPermission = async (
  setNativeModalVisible: (visible: boolean) => void
): Promise<void> => {
  let permission = await Contacts.checkPermission();

  if (permission === "denied") {
    setNativeModalVisible(true);
    try {
      permission = await Contacts.requestPermission();
    } finally {
      setTimeout(() => {
        setNativeModalVisible(false);
      }, 1000);
    }
  }

  if (permission !== "authorized") {
    throw new Error("Permission to access contacts was denied.");
  }
};

const normalizeUserContacts = (data: unknown): IUserContact[] => {
  if (Array.isArray(data)) {
    return data as IUserContact[];
  }
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (Array.isArray(record.contacts)) {
      return record.contacts as IUserContact[];
    }
    if (Array.isArray(record.items)) {
      return record.items as IUserContact[];
    }
  }
  return [];
};

export const getUserContactDisplayName = (contact: IUserContact): string => {
  const fullName = `${contact.first_name ?? ""} ${contact.last_name ?? ""}`.trim();
  if (fullName) return fullName;
  return contact.username?.trim() || "Unknown";
};

export const getUserContactAvatar = (contact: IUserContact): string | null => {
  const uri = contact.avatar_url ?? contact.profile_photo ?? null;
  if (!uri) return null;
  return uri.replace(/^http:\/\//i, "https://");
};

export const getUserContactSubtitle = (contact: IUserContact): string => {
  return (
    contact.username?.trim() ||
    contact.contact_phone?.trim() ||
    contact.phone?.trim() ||
    contact.email?.trim() ||
    ""
  );
};

export const getUserContactSendIdentifier = (contact: IUserContact): string => {
  return (
    contact.username?.trim() ||
    contact.contact_phone?.trim() ||
    contact.phone?.trim() ||
    contact.email?.trim() ||
    ""
  );
};

export const splitFullName = (
  fullName: string
): { first_name: string; last_name: string } => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { first_name: "", last_name: "" };
  }
  if (parts.length === 1) {
    return { first_name: parts[0], last_name: "" };
  }
  return {
    first_name: parts[0],
    last_name: parts.slice(1).join(" "),
  };
};

export const normalizePayAiroTag = (tag: string): string => {
  return tag
    .trim()
    .replace(/^@+/, "")
    .replace(/@payairo$/i, "")
    .trim();
};

export const buildContactPhone = (dialCode: string, mobile: string): string => {
  const digits = mobile.replace(/\D/g, "");
  const code = dialCode.startsWith("+") ? dialCode : `+${dialCode}`;
  return `${code}${digits}`;
};

export const useDeviceContacts = () => {
  const { setNativeModalVisible } = useAppLock();

  return useQuery<ApiResponse<User[]>>({
    queryKey: userContactKeys.contacts(),
    queryFn: async () => {
      await requestContactsPermission(setNativeModalVisible);

      const deviceContacts = await Contacts.getAll();
      const mappedContacts: User[] = deviceContacts
        .map((contact) => ({
          id: contact.recordID,
          name: `${contact.givenName} ${contact.familyName}`.trim(),
          phoneNumber: contact.phoneNumbers[0]?.number ?? "",
          email: contact.emailAddresses[0]?.email ?? "",
        }))
        .filter(
          (contact) =>
            !!contact.name &&
            (!!contact.phoneNumber?.trim() || !!contact.email?.trim())
        )
        .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));

      return {
        status: true,
        data: mappedContacts,
      } as ApiResponse<User[]>;
    },

    staleTime: queryStaleTime.VERY_VERY_SLOW_STALE_TIME,
    retry: 1,
    retryDelay: 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

export const useUserContacts = () => {
  return useQuery<IUserContactsResponse>({
    queryKey: userContactKeys.userContacts(),
    queryFn: async () => {
      const response = await userApiClient.get<IAddUserContactResponse & { data?: unknown }>(
        USER_AUTH.USER_CONTACTS
      );
      const contacts = normalizeUserContacts(response?.data);

      return {
        ok: !!response?.ok,
        message: response?.message ?? "",
        contacts,
      };
    },
    staleTime: 30_000,
    refetchOnMount: true,
  });
};

export const useAddUserContact = () => {
  const queryClient = useQueryClient();

  return useMutation<IAddUserContactResponse, Error, IAddUserContactPayload>({
    mutationFn: async (payload) => {
      return userApiClient.post<IAddUserContactResponse>(
        USER_AUTH.USER_CONTACTS,
        payload
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: userContactKeys.userContacts(),
      });
    },
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
    staleTime: 30000,
  });
};

/** FastAPI `GET /api/v1/users/search/` (relative to USER_API_BASE_URL). */
export interface IFastApiUserSearchUser {
  id: number;
  username: string;
  payairo_tag: string | null;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
}

export interface IFastApiUserSearchData {
  query: string;
  count: number;
  users: IFastApiUserSearchUser[];
}

export interface IFastApiUserSearchResponse {
  ok: boolean;
  message: string;
  data: IFastApiUserSearchData;
}

const emptyFastApiUserSearch: IFastApiUserSearchResponse = {
  ok: true,
  message: "",
  data: { query: "", count: 0, users: [] },
};

/**
 * Search users on FastAPI (`userApiClient`, Bearer token).
 * @param limit — capped at 25 to match typical API max.
 */
export const useFastApiUsersSearch = (
  query: string,
  limit: number,
  minCharacters: number = 1
) => {
  const apiLimit = Math.min(Math.max(limit, 1), 25);

  return useQuery<IFastApiUserSearchResponse>({
    queryKey: userContactKeys.fastApiUsersSearch(query, apiLimit),
    queryFn: async () => {
      if (!query || query.length < minCharacters) {
        return emptyFastApiUserSearch;
      }

      const qs = `?q=${encodeURIComponent(query)}&limit=${apiLimit}`;
      return userApiClient.get<IFastApiUserSearchResponse>(
        `${USER_AUTH.USERS_SEARCH}${qs}`
      );
    },
    enabled: !!query && query.length >= minCharacters,
    staleTime: 30000,
  });
};

/**
 * Verify a PayAiro user exists by exact identifier (payairo tag / username), via the
 * working FastAPI search endpoint (Bearer token). Resolves to the matched user or `null`.
 * Replaces the legacy `useVerifyUserByIdentifier` (Django, stale-token 401 → "session expired").
 */
export const useVerifyPayairoUser = () => {
  return useMutation<IFastApiUserSearchUser | null, Error, string>({
    mutationFn: async (identifier: string) => {
      const q = identifier.trim();
      if (!q) return null;
      const res = await userApiClient.get<IFastApiUserSearchResponse>(
        `${USER_AUTH.USERS_SEARCH}?q=${encodeURIComponent(q)}&limit=10`
      );
      const users = res?.data?.users ?? [];
      const lc = q.toLowerCase();
      return (
        users.find(
          (u) =>
            (u.username ?? "").trim().toLowerCase() === lc ||
            (u.payairo_tag ?? "").trim().toLowerCase() === lc
        ) ?? null
      );
    },
  });
};

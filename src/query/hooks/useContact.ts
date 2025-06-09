import { useQuery } from "@tanstack/react-query";
import Contacts from "react-native-contacts";
import { ApiResponse, RecentContact, User } from "../../api/types";
import { userContactKeys } from "query/queryKeys";
import { apiClient } from "api";
import { AUTH } from "api/endpoints";
import { Alert, Linking, Platform } from "react-native";
import { queryStaleTime } from "query/queryConfigs";

export const useDeviceContacts = () => {
  return useQuery<ApiResponse<User[]>>({
    queryKey: userContactKeys.contacts(),
    queryFn: async () => {
      // Step 1: Request permission
      if (Platform.OS === "android") {
        let permission = await Contacts.checkPermission();

        if (permission === "denied") {
          permission = await Contacts.requestPermission();
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

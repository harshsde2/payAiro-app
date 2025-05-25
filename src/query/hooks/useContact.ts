import { useQuery } from '@tanstack/react-query';
import Contacts from 'react-native-contacts';
import { ApiResponse, RecentContact, User } from '../../api/types';
import { userContactKeys } from 'query/queryKeys';
import { apiClient } from 'api';
import { AUTH } from 'api/endpoints';

export const useDeviceContacts = () => {
    return useQuery<ApiResponse<User[]>>({
        queryKey: userContactKeys.contacts(),

        queryFn: async () => {
            // Step 1: Request permission
            let permission = await Contacts.checkPermission();
            if (permission === 'undefined') {
                permission = await Contacts.requestPermission();
            }

            if (permission !== 'authorized') {
                throw new Error('Permission to access contacts was denied.');
            }

            // Step 2: Get and format contacts
            const deviceContacts = await Contacts.getAll();
            const mappedContacts: User[] = deviceContacts.map((contact) => ({
                id: contact.recordID,
                name: `${contact.givenName} ${contact.familyName}`.trim(),
                phoneNumber: contact.phoneNumbers[0]?.number ?? '',
                email: contact.emailAddresses[0]?.email ?? '',
            }));

            return {
                status: true,
                data: mappedContacts,
            };
        },

        staleTime: 1000 * 60, // 1 minute
        retry: 1,
        retryDelay: 1000,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
    });
};

export const useRecentContacts = () => {
    return useQuery({
      queryKey: userContactKeys.recentContacts(),
      queryFn: async () => {
        const response = await apiClient.get<ApiResponse<RecentContact[]>>(AUTH.CONTACT_GET);
        const recentContacts = response.data.slice(0, 10);
  
        return {
          recentContacts,
          allContacts: response.data,
          message: response.message,
          status: response.status
        };
      }
    });
  };
  
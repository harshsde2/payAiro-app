import { useQuery } from '@tanstack/react-query';
import Contacts from 'react-native-contacts';
import { getItem, setItem, STORAGE_KEYS } from '../../storage/mmkv';
import { ApiResponse, User } from '../../api/types';
import { userContactKeys } from 'query/queryKeys';

export const useDeviceContacts = () => {
  // First, try to get contacts from local cache (MMKV)
  const cachedContacts = getItem(STORAGE_KEYS.CONTACTS);

  return useQuery<ApiResponse<User[]>>({
    queryKey: userContactKeys.contacts(),
    queryFn: async () => {
      if (cachedContacts) {
        // Return cached contacts if available
        // console.log('cache contact')
        return JSON.parse(cachedContacts) as ApiResponse<User[]>;
      } else {
        // console.log('fetch again cache contact')

        // Fetch contacts from the device using react-native-contacts
        return new Promise<ApiResponse<User[]>>((resolve, reject) => {
          Contacts.getAll()
            .then((deviceContacts) => {
              // Map the device contacts to match your expected User[] format
              const mappedContacts = deviceContacts.map((contact) => ({
                id: contact.recordID,
                name: contact.givenName + ' ' + contact.familyName,
                phoneNumber: contact.phoneNumbers[0]?.number ?? '', // Assuming the first phone number
                email: contact.emailAddresses[0]?.email ?? '',
              }));

              // Cache the response in MMKV for future use
              setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(mappedContacts));

              // Return the mapped contacts as API response with boolean status
              resolve({
                status: true, // Changed to boolean
                data: mappedContacts,
              });
            })
            .catch((error) => {
              reject(error);
            });
        });
      }
    },
    staleTime: 1000 * 60, // 1 minute, adjust if necessary
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
};

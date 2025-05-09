import { useQuery } from '@tanstack/react-query';
import Contacts from 'react-native-contacts';
import { getItem, setItem, STORAGE_KEYS } from '../../storage/mmkv';
import { ApiResponse, User } from '../../api/types';
import { userContactKeys } from 'query/queryKeys';

export const useDeviceContacts = () => {
  // First, try to get contacts from local cache (MMKV)
  // const cachedContacts = getItem(STORAGE_KEYS.CONTACTS);

  return useQuery<ApiResponse<User[]>>({
    queryKey: userContactKeys.contacts(),
    queryFn: async () => {
       // Step 1: Try local cache first
       const cached = getItem(STORAGE_KEYS.CONTACTS);
       if (cached) {
         return {
           status: true,
           data: JSON.parse(cached) as User[],
         };
       }
 
       // Step 2: Check and request permission
       let permission = await Contacts.checkPermission();
       if (permission === 'undefined') {
         permission = await Contacts.requestPermission();
       }
 
       if (permission !== 'authorized') {
         throw new Error('Permission to access contacts was denied.');
       }
 
       // Step 3: Get and format contacts
       const deviceContacts = await Contacts.getAll();
       const mappedContacts: User[] = deviceContacts.map((contact) => ({
         id: contact.recordID,
         name: `${contact.givenName} ${contact.familyName}`.trim(),
         phoneNumber: contact.phoneNumbers[0]?.number ?? '',
         email: contact.emailAddresses[0]?.email ?? '',
       }));
 
       // Step 4: Save to cache
       setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(mappedContacts));
 
       return {
         status: true,
         data: mappedContacts,
       };
     },
     staleTime: 1000 * 60,
     retry: 1,
     retryDelay: 1000,
     refetchOnMount: true,
     refetchOnWindowFocus: false,
     refetchOnReconnect: true,
   });
};

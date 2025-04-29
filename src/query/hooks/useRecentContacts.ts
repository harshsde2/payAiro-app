import { useQuery } from '@tanstack/react-query';
import { ApiResponse, RecentContact, User } from '../../api/types';
import useSelectorAction from 'hooks/useSelectorAction';
import { getContacts } from 'services/Services';
import { userContactKeys } from 'query/queryKeys';
import { getItem, setItem, STORAGE_KEYS } from 'storage/mmkv';

export const useRecentContacts = () => {
    // Get the access token using the custom hook
    const { tokens } = useSelectorAction() as { tokens: { access: string } | null };

    const isEnabled = !!tokens?.access;

    // console.log("tokens:", tokens);
    // console.log("isEnabled:", isEnabled);
    // Try to get the recent contacts from the local cache (MMKV)
    const cachedContacts = getItem(STORAGE_KEYS.RECENT_CONTACTS);
    // console.log('cachedContacts =>', cachedContacts)
    return useQuery<ApiResponse<RecentContact[]>>({
        queryKey: userContactKeys.recentContacts(),
        queryFn: async () => {
            // If cached contacts are available, return them
            if (cachedContacts) {
                console.log("enter in cache");
                const parsed = JSON.parse(cachedContacts) as RecentContact[];
                return {
                    status: true,
                    data: parsed,
                } satisfies ApiResponse<RecentContact[]>;
            } else {
                console.log("fetch again")
                // If no cached contacts, fetch from the API
                if (!tokens?.access) {
                    throw new Error('No access token available'); // Handle missing token
                }
                const response = await getContacts(tokens.access);

                // Optionally filter for recent contacts, e.g., top 10
                const recentContacts = response.data.slice(0, 10);

                // Save the new contacts in MMKV for future use
                setItem(STORAGE_KEYS.RECENT_CONTACTS, JSON.stringify(recentContacts));

                return {
                    status: true,
                    data: recentContacts,
                };
            }
        },
        enabled: !!tokens?.access, // Ensure the query runs only if access token is available
        staleTime: 1000 * 60 * 5, // 5 minutes cache time
        retry: 1, // Retry once on failure
        retryDelay: 1000, // Retry after 1 second
        refetchOnMount: true, // Refetch when the component mounts
        refetchOnReconnect: true, // Refetch on reconnect
        refetchOnWindowFocus: false, // Don't refetch on window focus
    });
};

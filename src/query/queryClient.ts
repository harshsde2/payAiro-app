import { QueryClient } from '@tanstack/react-query';
import { persister } from '../storage/persistConfig';
import { persistQueryClient } from '@tanstack/react-query-persist-client';

// Create a client with more conservative settings
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      gcTime: 1000 * 60 * 10, // 10 minutes (was cacheTime in v4)
      retry: 1,
      retryDelay: 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});


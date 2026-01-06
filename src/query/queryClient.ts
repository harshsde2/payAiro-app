import { QueryClient } from "@tanstack/react-query";
import { persister } from "../storage/persistConfig";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { queryGCInterval, queryRetry, queryStaleTime } from "./queryConfigs";

// Create a client with more conservative settings
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // 1 minute
      gcTime: 0, // 10 minutes (was cacheTime in v4)
      retry: queryRetry.RETRY_COUNT,
      retryDelay: queryRetry.RETRY_DELAY,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: queryRetry.RETRY_COUNT,
      retryDelay: queryRetry.RETRY_DELAY,
    },
  },
});

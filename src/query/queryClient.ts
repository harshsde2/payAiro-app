import { QueryClient, onlineManager } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";
import { PERSIST_GC_TIME, queryRetry, queryStaleTime } from "./queryConfigs";

// Create a client tuned for a stale-while-revalidate UX: cached data renders
// instantly and refreshes silently in the background.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 30s default freshness window. Note: balance queries override this with
      // staleTime 0 (see useCrypto/useBank/useWallet) so money is never stale.
      staleTime: queryStaleTime.FAST_STALE_TIME,
      // Keep data in cache for 24h so it renders instantly and can be restored
      // from MMKV on cold start. Must be >= the persister maxAge (24h).
      gcTime: PERSIST_GC_TIME,
      retry: queryRetry.RETRY_COUNT,
      retryDelay: queryRetry.RETRY_DELAY,
      refetchOnWindowFocus: true, // now means "refetch if stale" on foreground
      refetchOnMount: true, // refetch on mount only when stale
      refetchOnReconnect: true,
    },
    mutations: {
      retry: queryRetry.RETRY_COUNT,
      retryDelay: queryRetry.RETRY_DELAY,
    },
  },
});

// Wire React Query's online state to real device connectivity so
// refetchOnReconnect fires on network recovery and retries pause while offline.
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => setOnline(!!state.isConnected))
);

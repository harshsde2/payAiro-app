/** Cache duration for crypto list (combined balance) – 2 hours */
export const CRYPTO_LIST_STALE_TIME_MS = 2 * 60 * 60 * 1000;
export const CRYPTO_LIST_GC_TIME_MS = 2 * 60 * 60 * 1000;

/**
 * gcTime for the global default. Must be >= the persister's maxAge (24h) so that
 * queries restored from MMKV on cold start are not immediately discarded.
 */
export const PERSIST_GC_TIME = 24 * 60 * 60 * 1000; // 24 hours

/**
 * staleTime tiers (how long data is considered fresh before a background refetch).
 *
 * IMPORTANT (fintech rule): money-authoritative data — balances — must ALWAYS
 * revalidate, so those queries use INSTANT_STALE_TIME (0). Everything below is for
 * non-authoritative data (prices, history, catalogs) that is safe to show briefly
 * stale while it refreshes in the background.
 */
export const queryStaleTime = {
  INSTANT_STALE_TIME: 0, // always stale → refetch on every mount/focus (use for balances)
  VERY_FAST_STALE_TIME: 15 * 1000, // 15 seconds (prices/market)
  FAST_STALE_TIME: 30 * 1000, // 30 seconds (transaction history, global default)
  NORMAL_STALE_TIME: 2 * 60 * 1000, // 2 minutes
  SLOW_STALE_TIME: 5 * 60 * 1000, // 5 minutes
  VERY_SLOW_STALE_TIME: 15 * 60 * 1000, // 15 minutes
  VERY_VERY_SLOW_STALE_TIME: 60 * 60 * 1000, // 1 hour
  VERY_VERY_VERY_SLOW_STALE_TIME: 6 * 60 * 60 * 1000, // 6 hours
  VERY_VERY_VERY_VERY_SLOW_STALE_TIME: 24 * 60 * 60 * 1000, // 24 hours (static catalogs)
};

export const queryCacheTime = {
  VERY_FAST_CACHE_TIME: 5 * 60 * 1000, // 5 minutes
  FAST_CACHE_TIME: 10 * 60 * 1000, // 10 minutes
  NORMAL_CACHE_TIME: 30 * 60 * 1000, // 30 minutes
  SLOW_CACHE_TIME: 60 * 60 * 1000, // 1 hour
  VERY_SLOW_CACHE_TIME: 6 * 60 * 60 * 1000, // 6 hours
  VERY_VERY_SLOW_CACHE_TIME: 24 * 60 * 60 * 1000, // 24 hours
};

export const queryGCInterval = {
  PERSIST_GC_INTERVAL: PERSIST_GC_TIME, // 24h — for queries that should survive restart
  VERY_FAST_GC_INTERVAL: 5 * 60 * 1000, // 5 minutes (floor)
  FAST_GC_INTERVAL: 10 * 60 * 1000, // 10 minutes
  NORMAL_GC_INTERVAL: 30 * 60 * 1000, // 30 minutes
  SLOW_GC_INTERVAL: 60 * 60 * 1000, // 1 hour
  VERY_SLOW_GC_INTERVAL: 6 * 60 * 60 * 1000, // 6 hours
  VERY_VERY_SLOW_GC_INTERVAL: 12 * 60 * 60 * 1000, // 12 hours
  VERY_VERY_VERY_SLOW_GC_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
  VERY_VERY_VERY_VERY_SLOW_GC_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
};

export const queryRetry = {
  RETRY_COUNT: 1, // Number of retries for failed queries
  RETRY_DELAY: 1000, // Delay between retries in milliseconds
};

/** Cache duration for crypto list (combined balance) – 2 hours */
export const CRYPTO_LIST_STALE_TIME_MS = 2 * 60 * 60 * 1000;
export const CRYPTO_LIST_GC_TIME_MS = 2 * 60 * 60 * 1000;

export const queryStaleTime = {
  INSTANT_STALE_TIME: 0,
  VERY_FAST_STALE_TIME: 0, // 0 seconds
  FAST_STALE_TIME: 0, // 0 seconds
  NORMAL_STALE_TIME: 0, // 0 seconds
  SLOW_STALE_TIME: 0, // 0 minute
  VERY_SLOW_STALE_TIME: 0, // 0 minutes
  VERY_VERY_SLOW_STALE_TIME: 0, // 0 minutes
  VERY_VERY_VERY_SLOW_STALE_TIME: 0, // 0 hours
  VERY_VERY_VERY_VERY_SLOW_STALE_TIME: 0, // 0 days
};

export const queryCacheTime = {
  VERY_FAST_CACHE_TIME: 0, // 0 seconds
  FAST_CACHE_TIME: 0, // 0 seconds
  NORMAL_CACHE_TIME: 0, // 0 seconds
  SLOW_CACHE_TIME: 0, // 0 minutes
  VERY_SLOW_CACHE_TIME: 0, // 0 minutes
  VERY_VERY_SLOW_CACHE_TIME: 0, // 0 minutes
};

export const queryGCInterval = {
  VERY_FAST_GC_INTERVAL: 0, // 0 seconds
  FAST_GC_INTERVAL: 0, // 0 seconds
  NORMAL_GC_INTERVAL: 0, // 0 seconds
  SLOW_GC_INTERVAL: 0, // 0 minutes
  VERY_SLOW_GC_INTERVAL: 0, // 0 minutes
  VERY_VERY_SLOW_GC_INTERVAL: 0, // 0 minutes
  VERY_VERY_VERY_SLOW_GC_INTERVAL: 0, // 0 hours
  VERY_VERY_VERY_VERY_SLOW_GC_INTERVAL: 0, // 0 days
};

export const queryRetry = {
  RETRY_COUNT: 1, // Number of retries for failed queries
  RETRY_DELAY: 1000, // Delay between retries in milliseconds
};

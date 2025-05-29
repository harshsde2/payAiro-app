export const queryStaleTime = {
  INSTANT_STALE_TIME: 1000,
  VERY_FAST_STALE_TIME: 1000 * 5, // 5 seconds
  FAST_STALE_TIME: 1000 * 10, // 10 seconds
  NORMAL_STALE_TIME: 1000 * 30, // 30 seconds
  SLOW_STALE_TIME: 1000 * 60, // 1 minute
  VERY_SLOW_STALE_TIME: 1000 * 60 * 5, // 5 minutes
  VERY_VERY_SLOW_STALE_TIME: 1000 * 60 * 10, // 10 minutes
  VERY_VERY_VERY_SLOW_STALE_TIME: 1000 * 60 * 60, // 1 hour
  VERY_VERY_VERY_VERY_SLOW_STALE_TIME: 1000 * 60 * 60 * 24, // 1 day
};

export const queryCacheTime = {
  VERY_FAST_CACHE_TIME: 1000 * 5, // 5 seconds
  FAST_CACHE_TIME: 1000 * 10, // 10 seconds
  NORMAL_CACHE_TIME: 1000 * 30, // 30 seconds
  SLOW_CACHE_TIME: 1000 * 60, // 1 minute
  VERY_SLOW_CACHE_TIME: 1000 * 60 * 5, // 5 minutes
  VERY_VERY_SLOW_CACHE_TIME: 1000 * 60 * 10, // 10 minutes
};

export const queryGCInterval = {
  VERY_FAST_GC_INTERVAL: 1000 * 5, // 5 seconds
  FAST_GC_INTERVAL: 1000 * 10, // 10 seconds
  NORMAL_GC_INTERVAL: 1000 * 30, // 30 seconds
  SLOW_GC_INTERVAL: 1000 * 60, // 1 minute
  VERY_SLOW_GC_INTERVAL: 1000 * 60 * 5, // 5 minutes
  VERY_VERY_SLOW_GC_INTERVAL: 1000 * 60 * 10, // 10 minutes
  VERY_VERY_VERY_SLOW_GC_INTERVAL: 1000 * 60 * 60, // 1 hour
  VERY_VERY_VERY_VERY_SLOW_GC_INTERVAL: 1000 * 60 * 60 * 24, // 1 day
};

export const queryRetry = {
  RETRY_COUNT: 1, // Number of retries for failed queries
  RETRY_DELAY: 1000, // Delay between retries in milliseconds
};

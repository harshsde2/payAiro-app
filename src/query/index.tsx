import React from 'react';
import { QueryClientProvider, defaultShouldDehydrateQuery } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient } from './queryClient';
import { persister } from '../storage/persistConfig';

interface QueryProviderProps {
  children: React.ReactNode;
}

/** How long a persisted cache entry may be restored from MMKV. Matches gcTime. */
const PERSIST_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Money-authoritative data that must never be shown from disk on cold start. It
 * stays in the in-memory cache (instant render mid-session) but is excluded from
 * MMKV persistence so a fresh launch always fetches it.
 *
 * - `balance`: showing a stale balance misrepresents the user's funds.
 * - `transactionLimits`: carries live daily/monthly `usage`, and a restored stale
 *   copy would both display a wrong "left today" and drive amount enforcement.
 * - `userCryptoMarket`: the supported-assets catalog + prices that gate Add
 *   Balance / Send. The backend intermittently serves a degraded "fallback" list
 *   (missing USDC); restoring such a copy from disk froze those flows on launch.
 */
const NEVER_PERSISTED_KEY_SEGMENTS = ['balance', 'transactionlimits', 'usercryptomarket'];

const isNeverPersistedQuery = (queryKey: unknown): boolean =>
  Array.isArray(queryKey) &&
  queryKey.some((segment) => {
    if (typeof segment !== 'string') return false;
    const lower = segment.toLowerCase();
    return NEVER_PERSISTED_KEY_SEGMENTS.some((needle) => lower.includes(needle));
  });

// Use regular provider by default to avoid persistence issues
export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

// Persist provider with MMKV storage
export const PersistQueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: PERSIST_MAX_AGE,
        // Bump when cache shape changes to invalidate old persisted caches.
        buster: 'v1',
        dehydrateOptions: {
          shouldDehydrateQuery: (query) =>
            !isNeverPersistedQuery(query.queryKey) &&
            defaultShouldDehydrateQuery(query),
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}; 
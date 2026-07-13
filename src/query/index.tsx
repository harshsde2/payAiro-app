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
 * Balances are money-authoritative and must never be shown from disk on cold
 * start. We keep them in the in-memory cache (instant render mid-session) but
 * exclude them from MMKV persistence so a fresh launch always fetches them.
 */
const isBalanceQuery = (queryKey: unknown): boolean =>
  Array.isArray(queryKey) &&
  queryKey.some(
    (segment) =>
      typeof segment === 'string' && segment.toLowerCase().includes('balance')
  );

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
            !isBalanceQuery(query.queryKey) &&
            defaultShouldDehydrateQuery(query),
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}; 
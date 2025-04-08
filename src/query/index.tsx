import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient } from './queryClient';
import { persister } from '../storage/persistConfig';

interface QueryProviderProps {
  children: React.ReactNode;
}

// Use regular provider by default to avoid persistence issues
export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

// Persist provider with MMKV storage - temporarily disabled due to errors
export const PersistQueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}; 
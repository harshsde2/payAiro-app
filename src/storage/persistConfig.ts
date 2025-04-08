import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { getItem, setItem } from './mmkv';

// Custom storage interface to work with MMKV
const mmkvStorage = {
  getItem: (key: string): string | null => {
    const value = getItem(key);
    return value === undefined ? null : value;
  },
  setItem,
  removeItem: (key: string) => {
    // This is required by the persister interface but not used
  }
};

// Create the persister with MMKV
export const persister = createSyncStoragePersister({
  storage: mmkvStorage,
  key: 'REACT_QUERY_OFFLINE_CACHE',
  throttleTime: 1000, // Save to storage at most once per second
  serialize: (data: unknown) => JSON.stringify(data),
  deserialize: (data: string | null) => data ? JSON.parse(data) : null
}); 
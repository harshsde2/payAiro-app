import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { getItem, setItem } from "./mmkv";

const mmkvStorage = {
  getItem: (key: string) => {
    return getItem(key);
  },
  setItem: (key: string, value: string) => {
    setItem(key, value);
  },
  removeItem: (key: string) => {
    // MMKV doesn't have removeItem in the same way, but we can set to empty
    setItem(key, "");
  },
};

export const persister = createSyncStoragePersister({
  storage: mmkvStorage as any,
});


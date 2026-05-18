import { getItem, setItem, STORAGE_KEYS } from "storage/mmkv";

const TRUE = "1";

function storageKey(base: string, userId: string | number | null | undefined): string {
  if (userId != null && String(userId).trim() !== "") {
    return `${base}:${String(userId)}`;
  }
  return base;
}

export function hasSellReadyCodeWaitAck(userId: string | number | null | undefined): boolean {
  return getItem(storageKey(STORAGE_KEYS.SELL_READY_CODE_WAIT_ACK, userId)) === TRUE;
}

export function setSellReadyCodeWaitAck(userId: string | number | null | undefined): void {
  setItem(storageKey(STORAGE_KEYS.SELL_READY_CODE_WAIT_ACK, userId), TRUE);
}

/** First-time "Find your ReadyCode in transaction history" education. */
function readHistoryAck(userId: string | number | null | undefined): boolean {
  const historyKey = storageKey(STORAGE_KEYS.SELL_READY_CODE_HISTORY_ACK, userId);
  if (getItem(historyKey) === TRUE) return true;
  return getItem(storageKey(STORAGE_KEYS.SELL_READY_CODE_CLOSE_ACK, userId)) === TRUE;
}

function writeHistoryAck(userId: string | number | null | undefined): void {
  setItem(storageKey(STORAGE_KEYS.SELL_READY_CODE_HISTORY_ACK, userId), TRUE);
  setItem(storageKey(STORAGE_KEYS.SELL_READY_CODE_CLOSE_ACK, userId), TRUE);
}

export const hasSellReadyCodeHistoryAck = readHistoryAck;
export const setSellReadyCodeHistoryAck = writeHistoryAck;

/** Same storage as history ack — kept for older imports / Metro cache compatibility. */
export const hasSellReadyCodeCloseAck = readHistoryAck;
export const setSellReadyCodeCloseAck = writeHistoryAck;

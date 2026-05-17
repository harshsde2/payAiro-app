import { getItem, setItem, STORAGE_KEYS } from "storage/mmkv";

const TRUE = "1";

export function cashBuyLoadInstructionsAckStorageKey(userId: string | number | null | undefined): string {
  if (userId != null && String(userId).trim() !== "") {
    return `${STORAGE_KEYS.CASH_BUY_LOAD_INSTRUCTIONS_ACK}:${String(userId)}`;
  }
  return STORAGE_KEYS.CASH_BUY_LOAD_INSTRUCTIONS_ACK;
}

export function hasCashBuyLoadInstructionsAck(userId: string | number | null | undefined): boolean {
  return getItem(cashBuyLoadInstructionsAckStorageKey(userId)) === TRUE;
}

export function setCashBuyLoadInstructionsAck(userId: string | number | null | undefined): void {
  setItem(cashBuyLoadInstructionsAckStorageKey(userId), TRUE);
}

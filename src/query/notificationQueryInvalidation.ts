import { queryClient } from "./queryClient";
import { cryptoRequestKeys } from "./hooks/useCryptoRequest";
import { notificationKeys } from "./hooks/useNotificationsFeed";
import { invalidateTransactionData } from "./invalidateTransactionData";

/**
 * Event types / categories that imply money moved and the dashboard should
 * refresh (balances + history). Matched loosely against the FCM `eventType`.
 */
const TRANSACTION_EVENT_RE =
  /TRADE|BUY|SELL|PURCHASE|PAYMENT|TRANSACTION|TRANSFER|SEND|RECEIVE|WITHDRAW|DEPOSIT|CASH/i;

type NotificationData = Record<string, unknown> | null | undefined;

const asString = (v: unknown): string => (v == null ? "" : String(v));

/**
 * Maps an incoming FCM `data` payload to the right query invalidations so the
 * UI refreshes silently when a push arrives. Safe to call with any/empty data.
 */
export function invalidateQueriesForNotification(data: NotificationData = {}): void {
  const d = data ?? {};
  const eventType = asString((d as any).eventType || (d as any).event_type);
  const category = asString((d as any).category).toLowerCase();

  // Preserve existing crypto-request behavior (was maybeInvalidateCryptoRequests).
  if (eventType.startsWith("CRYPTO_REQUEST") || (d as any).request_id) {
    queryClient.invalidateQueries({ queryKey: cryptoRequestKeys.all });
  }

  // Money-moving events → refresh balances + transaction history.
  if (
    TRANSACTION_EVENT_RE.test(eventType) ||
    category === "transaction" ||
    category === "payment"
  ) {
    void invalidateTransactionData();
  }

  // Almost every push creates an in-app notification row → refresh feed + badge.
  queryClient.invalidateQueries({ queryKey: notificationKeys.all });
}

import { queryClient } from "./queryClient";
import { cryptoKeys } from "./hooks/useCrypto";
import { bankKeys } from "./hooks/useBank";
import { walletKeys } from "./hooks/useWallet";
import { notificationKeys } from "./hooks/useNotificationsFeed";
import { unifiedTransactionKeys } from "./hooks/useUnifiedTransactions";

/**
 * Marks every money-affecting query stale and background-refetches the active ones.
 *
 * Default `refetchType: 'active'` is intentional: the dashboard stays mounted under the
 * root stack (tabs use `detachInactiveScreens={false}`), so it refetches silently while
 * the user is still on a transaction result screen. Unmounted screens are marked stale
 * and refetch on their next mount. No visible loaders — data is already cached.
 */
export function invalidateTransactionData(): Promise<unknown> {
  return Promise.allSettled([
    // Partial-prefix match → every scope/limit variant of the history list.
    queryClient.invalidateQueries({
      queryKey: [...cryptoKeys.all, "paymentTransactionHistory"],
    }),
    queryClient.invalidateQueries({
      queryKey: [...cryptoKeys.all, "cryptoBalanceByAsset"],
    }),
    queryClient.invalidateQueries({ queryKey: cryptoKeys.allCryptoBalances() }),
    queryClient.invalidateQueries({ queryKey: cryptoKeys.userCryptoBalance() }),
    queryClient.invalidateQueries({ queryKey: cryptoKeys.cryptoBalance() }),
    queryClient.invalidateQueries({ queryKey: bankKeys.balance() }),
    queryClient.invalidateQueries({ queryKey: walletKeys.balance() }),
    queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
    queryClient.invalidateQueries({ queryKey: unifiedTransactionKeys.all }),
  ]);
}

/**
 * Invalidates immediately, then once more after `delayMs` to absorb backend
 * eventual consistency (a transaction may still be settling when the user lands
 * on the success screen). Fire-and-forget.
 */
export function invalidateTransactionDataWithSettle(delayMs = 6000): void {
  void invalidateTransactionData();
  setTimeout(() => {
    void invalidateTransactionData();
  }, delayMs);
}

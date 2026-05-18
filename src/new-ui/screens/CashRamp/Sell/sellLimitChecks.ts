/**
 * Sale limit gates — UI is built; wire API responses here when available.
 */

export type SellLimitCheckResult = "ok" | "daily" | "monthly";

/**
 * Call backend daily/monthly sale limit check before opening the map.
 * @returns `'ok'` to proceed; `'daily'` | `'monthly'` to show limit screens.
 */
export async function checkSellSaleLimits(): Promise<SellLimitCheckResult> {
  // TODO: GET/POST sale limits endpoint when backend provides it.
  // Return "daily" | "monthly" to verify limit screens in UI.
  void 0;
  return "ok";
}

/**
 * @returns `true` if user must wait (show Transaction Limit Notice).
 */
export async function checkDuplicateSellAmount(_amountUsd: number): Promise<boolean> {
  // TODO: call duplicate-amount API when backend provides it.
  // Return true to verify Transaction Limit Notice modal on Enter Amount.
  void 0;
  return false;
}

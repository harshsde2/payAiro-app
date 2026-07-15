/**
 * US-state-based stablecoin + access rules (registered-address driven).
 *
 * Regulatory requirement:
 *  - NY / VT residents: the app is unavailable (blocked at the dashboard).
 *  - TX residents: use DAI for Add Balance (buy), Withdraw (sell) and Send.
 *  - All other states (and unresolvable state): use USDC.
 *
 * State comes from the user's REGISTERED address (see useUserStateCode), NOT GPS.
 * The backend derives the chain from the asset symbol and ignores any chain the
 * frontend sends, so only the asset symbol matters here.
 */

export type StateStablecoin = 'DAI' | 'USDC';

/** States where the app is not available at all. */
export const BLOCKED_STATES = ['NY', 'VT'] as const;

/**
 * Resolve which stablecoin to transact in for a given registered-state code.
 * TX → DAI; everything else (including an unknown/null state) → USDC.
 */
export function getStablecoinForState(stateCode: string | null): StateStablecoin {
  return stateCode === 'TX' ? 'DAI' : 'USDC';
}

/**
 * Whether a registered-state code is a blocked state. A null/unknown state is
 * never treated as blocked (fail open — the user simply defaults to USDC).
 */
export function isBlockedState(stateCode: string | null): boolean {
  return stateCode != null && (BLOCKED_STATES as readonly string[]).includes(stateCode);
}

import { useUserStateCode } from 'hooks/useUserStateCode';
import {
  getStablecoinForState,
  isBlockedState,
  type StateStablecoin,
} from 'new-ui/constants/stateStablecoin';

/**
 * The stablecoin to transact in for the signed-in user's registered state.
 * TX → 'DAI', everything else (incl. unknown state) → 'USDC'.
 */
export function useStateStablecoin(): StateStablecoin {
  // useUserStateCode returns a normalized 2-letter code (typed as the CT/MN/CA
  // union but at runtime any state, e.g. 'TX'/'NY'), or null when unresolvable.
  const stateCode = useUserStateCode() as string | null;
  return getStablecoinForState(stateCode);
}

/** Whether the user's registered state blocks all app access (NY / VT). */
export function useIsBlockedState(): boolean {
  const stateCode = useUserStateCode() as string | null;
  return isBlockedState(stateCode);
}

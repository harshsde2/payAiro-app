import { useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants';
import { useUserStateCode } from 'hooks/useUserStateCode';
import { isBlockedState } from 'new-ui/constants/stateStablecoin';

// Dev-test switch: set to a blocked state code (e.g. 'NY') to force the block
// screen for any user regardless of their registered address.
// MUST stay `null` in committed/shipped code.
const TEST_FORCE_STATE: string | null = null;

/**
 * App-launch access gate (state regulatory requirement).
 *
 * Call once from the first authenticated screen tree (BottomTabNavigator). When the
 * user's REGISTERED state is a blocked state (NY / VT), present the non-dismissible
 * block screen — the app is unavailable there and logout is the only way out.
 *
 * Mirrors useComplianceGate's present-once + deferred-navigate pattern.
 */
export function useBlockedStateGate() {
  const navigation = useNavigation<any>();
  const stateCode = useUserStateCode() as string | null;
  const presentedRef = useRef(false);

  useEffect(() => {
    if (presentedRef.current) return;

    const forced = TEST_FORCE_STATE;
    const effectiveState = forced ?? stateCode;
    if (!isBlockedState(effectiveState)) return;

    presentedRef.current = true;
    // Defer: navigating to a modal during the navigator's initial mount can be
    // silently dropped — let the first transition settle before presenting.
    setTimeout(() => {
      if (__DEV__) console.log('[BlockedStateGate] presenting block for', effectiveState);
      navigation.navigate(NAVIGATION_SCREENS.STATE_RESTRICTED_BLOCK, {
        stateCode: effectiveState as string,
      });
    }, 500);
  }, [navigation, stateCode]);
}

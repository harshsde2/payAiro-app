import { useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants';
import { useComplianceStatus } from 'query/hooks/useComplianceDisclosure';
import type { StateCode } from 'new-ui/constants/compliance';

// Dev-test switch: set to a state code (e.g. 'CT') to force the one-time
// disclosure gate for any user regardless of backend status — re-presents on
// every launch so the flow can be tested without a resident test account.
// MUST stay `null` in committed/shipped code.
const TEST_FORCE_STATE: StateCode | null = null;

/**
 * App-launch compliance gate (state regulatory requirement).
 *
 * Call once from the first authenticated screen tree (BottomTabNavigator). Fetches
 * `GET state-compliance/status/` (MMKV-cached, so offline relaunches behave) and, when
 * the backend says a one-time disclosure is required and unacknowledged, presents the
 * blocking acknowledgment screen. The screen refuses dismissal until acknowledged.
 *
 * States with an implemented one-time disclosure screen variant.
 */
const IMPLEMENTED_ONE_TIME_STATES: readonly StateCode[] = ['CT', 'MN'];

export function useComplianceGate() {
  const navigation = useNavigation<any>();
  const { data: status } = useComplianceStatus();
  const presentedRef = useRef(false);

  useEffect(() => {
    if (presentedRef.current) return;

    const present = (stateCode: StateCode) => {
      presentedRef.current = true;
      // Defer: navigating to a modal during the navigator's initial mount can be
      // silently dropped — let the first transition settle before presenting.
      setTimeout(() => {
        if (__DEV__) console.log('[ComplianceGate] presenting one-time disclosure for', stateCode);
        navigation.navigate(NAVIGATION_SCREENS.STATE_COMPLIANCE_ACKNOWLEDGMENT, {
          stateCode,
          blocking: true,
        });
      }, 500);
    };

    // TEMP TEST OVERRIDE path — see banner above. Re-gates on EVERY launch/reload
    // (no local-ack suppression) so the flow can be tested repeatedly.
    if (TEST_FORCE_STATE) {
      if (__DEV__) console.log('[ComplianceGate] TEST_FORCE_STATE active:', TEST_FORCE_STATE);
      presentedRef.current = true;
      setTimeout(() => {
        navigation.navigate(NAVIGATION_SCREENS.STATE_COMPLIANCE_ACKNOWLEDGMENT, {
          stateCode: TEST_FORCE_STATE,
          blocking: true,
          // Test-only: keep the screen up even when the backend says already acknowledged.
          testForceShow: true,
        });
      }, 500);
      return;
    }

    if (!status) return;
    if (__DEV__) console.log('[ComplianceGate] backend status:', status);
    const stateCode = status.stateCode as StateCode | null;
    if (
      status.requiresOnetimeDisclosure &&
      !status.onetimeDisclosureAcknowledged &&
      stateCode &&
      IMPLEMENTED_ONE_TIME_STATES.includes(stateCode)
    ) {
      present(stateCode);
    }
  }, [navigation, status]);
}

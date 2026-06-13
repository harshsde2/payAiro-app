import { useSelector } from 'react-redux';
import { getProfileResidentialStateCode } from 'new-ui/screens/CashRamp/LocationFinder/cashRampProfileState';
import type { StateCode } from 'new-ui/constants/compliance';

export function useUserStateCode(): StateCode | null {
  const userData = useSelector(
    (s: { authenticationSlice?: { userData?: Record<string, unknown> | null } }) =>
      s.authenticationSlice?.userData ?? null
  );
  const usersMe = useSelector(
    (s: { authenticationSlice?: { usersMe?: Record<string, unknown> | null } }) =>
      s.authenticationSlice?.usersMe ?? null
  );
  const code = getProfileResidentialStateCode(userData, usersMe);
  return (code as StateCode) || null;
}

export function useIsStateResident(stateCode: StateCode): boolean {
  return useUserStateCode() === stateCode;
}

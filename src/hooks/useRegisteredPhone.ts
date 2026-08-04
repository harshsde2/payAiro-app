import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { UsersMePayload } from 'redux/slices/newBackendAuthSlice';

export interface RegisteredPhone {
  /** Digits only, no country code. `null` when the account has no phone on file. */
  national: string | null;
  /** Digits only, defaults to "1" (US) when the backend didn't send one. */
  countryCode: string;
  /** Last 4 digits only — enough to recognise the number without revealing it. */
  masked: string;
  hasPhone: boolean;
}

/**
 * Resolves the user's registered phone from the FastAPI `/me` payload hydrated into
 * Redux at session bootstrap (`hydrateUserFromMe`).
 *
 * The phone lives on `legal_identity`; the legacy `walletData.mobile_number` is only a
 * last-resort fallback because the Django wallet blob is no longer populated on the new
 * backend — reading it alone makes every account look like it has no phone.
 */
export const useRegisteredPhone = (): RegisteredPhone => {
  const usersMe = useSelector(
    (state: { authenticationSlice?: { usersMe?: UsersMePayload | null } }) =>
      state.authenticationSlice?.usersMe
  );
  const userData = useSelector(
    (state: { authenticationSlice?: { userData?: Record<string, any> | null } }) =>
      state.authenticationSlice?.userData
  );
  const walletData = useSelector(
    (state: { authenticationSlice?: { walletData?: Record<string, any> | null } }) =>
      state.authenticationSlice?.walletData
  );

  return useMemo(() => {
    const user = { ...(usersMe?.user || {}), ...(userData || {}) };
    const legal = usersMe?.legal_identity || {};
    const wallet = walletData || {};

    // Same precedence as the profile screen's formatProfilePhone, which is the one
    // place in the app that reliably renders this number today.
    const national = String(
      legal.phone_national_number ??
        user.phone_national_number ??
        user.phone ??
        legal.phone ??
        user.mobile ??
        legal.mobile ??
        wallet.mobile_number ??
        wallet.phone_national_number ??
        ''
    ).replace(/\D/g, '');

    const countryCode =
      String(legal.phone_country_code ?? user.phone_country_code ?? '1').replace(/\D/g, '') ||
      '1';

    return {
      national: national || null,
      countryCode,
      masked: national ? `******${national.slice(-4)}` : '',
      hasPhone: !!national,
    };
  }, [usersMe, userData, walletData]);
};

export default useRegisteredPhone;

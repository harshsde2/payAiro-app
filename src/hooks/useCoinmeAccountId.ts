import { useSelector } from "react-redux";

interface AuthSliceShape {
  authenticationSlice?: {
    usersMe?: {
      caas_onboarding?: {
        caas_customer_id?: string | number;
      };
    };
  };
}

/**
 * Resolves the **Coinme/CAAS customer id** for the signed-in user.
 *
 * This is the id Coinme expects in `getPartnerSessionTag.accountId` and in the
 * Risk Engine's `customerId` (via `update`). It is **not** the same as the
 * host-app's Django user PK (`userData.id` / `usersMe.user.id`).
 *
 * Returns `null` until `/users/me/` has resolved and `caas_onboarding` is
 * populated (i.e. the user has been provisioned on CAAS).
 */
export function useCoinmeAccountId(): string | null {
  return useSelector((state: AuthSliceShape) => {
    const raw = state.authenticationSlice?.usersMe?.caas_onboarding?.caas_customer_id;
    if (raw == null) return null;
    const s = String(raw).trim();
    return s.length > 0 ? s : null;
  });
}

/**
 * Plain selector form, for non-component callers.
 */
export function selectCoinmeAccountId(state: AuthSliceShape): string | null {
  const raw = state.authenticationSlice?.usersMe?.caas_onboarding?.caas_customer_id;
  if (raw == null) return null;
  const s = String(raw).trim();
  return s.length > 0 ? s : null;
}

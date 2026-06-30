import { useSelector } from 'react-redux';

type UsersMeShape = {
  email_verified?: boolean;
  user?: { email?: string | null; email_verified?: boolean };
  profile?: { email_verified?: boolean };
} | null;

/**
 * Email verification status from the hydrated `/me` payload (Redux).
 * Backend is the source of truth — `email_verified` sits at the top level of `/me`
 * (and is mirrored under `profile`). Returns the user's email for display.
 */
export function useIsEmailVerified(): { isEmailVerified: boolean; email: string | null } {
  const usersMe = useSelector(
    (s: { authenticationSlice?: { usersMe?: UsersMeShape } }) =>
      s.authenticationSlice?.usersMe ?? null
  );

  const isEmailVerified =
    usersMe?.email_verified ?? usersMe?.profile?.email_verified ?? false;
  const email = usersMe?.user?.email ?? null;

  return { isEmailVerified: !!isEmailVerified, email };
}

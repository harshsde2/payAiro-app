import { useHydrateUsersMe } from "query/hooks/useUsersMe";

/**
 * Renders nothing — runs the `/users/me` React-Query hydration side effect so the signed-in
 * user's profile refreshes on reconnect / foreground / manual retry. Must be mounted inside
 * the React Query provider (alongside FCMTokenManager in App.js).
 */
const UsersMeHydrator = (): null => {
  useHydrateUsersMe();
  return null;
};

export default UsersMeHydrator;

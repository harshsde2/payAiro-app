import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { userApiClient } from "api/userApiClient";
import { USER_AUTH } from "api/endpoints";
import useDispatchAction from "hooks/useDispatchAction";
import {
  hydrateUserFromMe,
  setAppAccessGranted,
} from "redux/slices/newBackendAuthSlice";
import { setTokens } from "redux/slices/authenticationSlice";
import { clearAuthSession } from "auth/authSession";
import { setItem, STORAGE_KEYS } from "storage/mmkv";
import { scheduleOnUserLoggedIn } from "services/coinmeRiskLifecycle";

export const usersMeKeys = {
  me: ["usersMe"] as const,
};

type UsersMeResponse = { ok?: boolean; data?: any } | undefined;

/**
 * React-Query-driven `/users/me` hydration. Mounted once in the authed tree
 * (`UsersMeHydrator`). Because it's a real query it inherits the app's proven recovery:
 * `refetchOnReconnect`, `refetchOnWindowFocus` (focusManager), and manual
 * `queryClient.invalidateQueries()` (e.g. the "Try again" button in UseNet). On success it
 * hydrates Redux `userData`/`usersMe` so the dashboard header populates; a 401 clears the
 * session. This replaces the fragile one-shot raw fetch that stranded the header offline.
 */
export function useHydrateUsersMe() {
  const isLogin = useSelector(
    (s: any) => s.authenticationSlice?.isLogin === true
  );

  const query = useQuery<UsersMeResponse>({
    queryKey: usersMeKeys.me,
    queryFn: () => userApiClient.get(USER_AUTH.USERS_ME),
    enabled: isLogin,
    staleTime: 0,
    gcTime: 0,
    retry: 1,
  });

  const { data, error } = query;

  useEffect(() => {
    if (data?.ok && data?.data) {
      setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.data?.user || {}));
      useDispatchAction(hydrateUserFromMe(data.data));
      const coinmeAccountId = data.data?.caas_onboarding?.caas_customer_id;
      if (coinmeAccountId != null) {
        scheduleOnUserLoggedIn(String(coinmeAccountId));
      }
    }
  }, [data]);

  useEffect(() => {
    const status = (error as any)?.response?.status;
    if (status === 401) {
      clearAuthSession();
      useDispatchAction(setTokens(null));
      useDispatchAction(setAppAccessGranted(false));
    }
  }, [error]);

  return query;
}

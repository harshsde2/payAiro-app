import { useQuery } from "@tanstack/react-query";
import { USER_AUTH } from "../../api/endpoints";
import { userApiClient } from "../../api/userApiClient";
import { UserProfileTransactionsResponse } from "../../screens/TSX-Screens/UserProfile/types";

export const useUserProfileTransactions = (
  targetUserId?: number | string,
  limit: number = 50
) => {
  return useQuery<UserProfileTransactionsResponse>({
    queryKey: ["user-profile-transactions", String(targetUserId || ""), limit],
    queryFn: async () => {
      return await userApiClient.get<UserProfileTransactionsResponse>(
        USER_AUTH.USER_PROFILE_TRANSACTIONS(targetUserId as number | string, limit)
      );
    },
    enabled: !!targetUserId,
  });
};

export const useUserDetails = (targetUserId?: number | string, limit: number = 50) =>
  useUserProfileTransactions(targetUserId, limit);

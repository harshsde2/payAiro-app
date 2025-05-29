import {
  useMutation,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { apiClient } from "api";
import { AUTH } from "api/endpoints";
import { ApiResponse } from "api/types";

// Query keys
export const AuthQueryKeys = {
  all: () => ["getMyReward"] as const,
  getMyReward: () => AuthQueryKeys.all(),
};

export const useGetReward = (enabled = true) => {
  return useQuery<ApiResponse<any>>({
    queryKey: AuthQueryKeys.getMyReward(),
    queryFn: async () => {
      return await apiClient.get<ApiResponse<any>>(AUTH.GET_MY_REWARD);
    },
    staleTime: 1000,
    enabled,
  });
};
type RedeemPayload = {
  payload: any;
  value: any;
};

export const useRedeemReward = () => {
  return useMutation<ApiResponse<any>, Error, RedeemPayload>({
    mutationFn: async ({ payload, value }) => {
      console.log(
        "payload =>",
        payload,
        "value =>",
        value,
        "url =>",
        `${AUTH.REDEEM_REWARD}${value}/`
      );
      const response = await apiClient.patch<ApiResponse<any>>(
        `${AUTH.REDEEM_REWARD}${value}/`,
        { redeem: true },
        true // If this is an options or config param for form data
      );
      return response.data; // Important: return the data!
    },
  });
};

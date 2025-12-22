import {
  useMutation,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
  useQueryClient,
} from "@tanstack/react-query";
import { apiClient } from "api";
import { AUTH } from "api/endpoints";
import { ApiResponse } from "api/types";
import { IScratchCardsResponse } from "../../screens/Rewards/types";
import { showError, showSuccess } from "../../utils/toast";

// Query keys
export const AuthQueryKeys = {
  all: () => ["getMyReward"] as const,
  getMyReward: () => AuthQueryKeys.all(),
  scratchCards: () => ["scratchCards"] as const,
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

export const useScratchCards = (enabled = true) => {
  return useQuery<ApiResponse<IScratchCardsResponse>>({
    queryKey: AuthQueryKeys.scratchCards(),
    queryFn: async () => {
      try {
        return await apiClient.get<ApiResponse<IScratchCardsResponse>>(
          AUTH.SCRATCH_CARDS
        );
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch scratch cards";
        showError(errorMessage);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled,
    retry: 2,
    retryDelay: 1000,
  });
};

interface ScratchCardPayload {
  card_id: number;
}

export const useScratchCard = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<any>, Error, ScratchCardPayload>({
    mutationFn: async (payload) => {
      return await apiClient.post<ApiResponse<any>>(
        AUTH.SCRATCH_CARD,
        payload,
        false
      );
    },
    onSuccess: (data) => {
      // Show success toast with message from API
      const toastMessage =
        data?.toast_message ||
        data?.message ||
        data?.data?.toast_message ||
        data?.data?.message ||
        "Card scratched successfully!";
      showSuccess(toastMessage);

      // Invalidate and refetch scratch cards to update the UI
      queryClient.invalidateQueries({ queryKey: AuthQueryKeys.scratchCards() });
    },
    onError: (error: any) => {
      // Show error toast with message from API
      const errorMessage =
        error?.response?.data?.toast_message ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to scratch card. Please try again.";
      showError(errorMessage);
    },
  });
};

export const useClaimScratchReward = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<any>, Error>({
    mutationFn: async () => {
      return await apiClient.post<ApiResponse<any>>(
        AUTH.CLAIM_SCRATCH_REWARD,
        {},
        false
      );
    },
    onSuccess: (data) => {
      // Show success toast with message from API
      const toastMessage =
        data?.toast_message ||
        data?.message ||
        data?.data?.message ||
        "Rewards claimed successfully!";
      showSuccess(toastMessage);

      // Invalidate and refetch scratch cards to update the UI
      queryClient.invalidateQueries({ queryKey: AuthQueryKeys.scratchCards() });
    },
    onError: (error: any) => {
      // Show error toast with message from API
      const errorMessage =
        error?.response?.data?.toast_message ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to claim rewards. Please try again.";
      showError(errorMessage);
    },
  });
};

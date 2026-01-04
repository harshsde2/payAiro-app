import { useQuery } from "@tanstack/react-query";
import { apiClient } from "api";
import { AUTH } from "api/endpoints";
import { ApiResponse } from "api/types";
import { IReferralData } from "screens/TSX-Screens/Settings/types";
import { queryStaleTime } from "query/queryConfigs";

// Query keys
export const referralKeys = {
  all: ["referral"] as const,
  data: () => [...referralKeys.all, "data"] as const,
};

/**
 * Hook to get referral data including statistics and referred users list
 */
export const useReferralData = () => {
  return useQuery<ApiResponse<IReferralData>>({
    queryKey: referralKeys.data(),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<IReferralData>>(
        AUTH.GET_REFERRAL_DATA
      );
      return response;
    },
    staleTime: queryStaleTime.NORMAL_STALE_TIME,
  });
};


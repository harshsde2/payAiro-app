import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../api";
import { KYC } from "../../api/endpoints";
import { ApiResponse } from "../../api/types";
import { queryStaleTime } from "query/queryConfigs";

// Query keys
export const kycKeys = {
  all: ["kyc"] as const,
  submission: () => [...kycKeys.all, "submission"] as const,
};

/**
 * Hook to get KYC submission data
 */
export const useKyc = (enabled = true) => {
  return useQuery<ApiResponse<any>>({
    queryKey: kycKeys.submission(),
    queryFn: async () => {
      return await apiClient.get<ApiResponse<any>>(KYC.SUBMISSION);
    },
    staleTime: queryStaleTime.NORMAL_STALE_TIME,
    enabled,
  });
};


import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../api";
import { WALLET } from "../../api/endpoints";
import { ApiResponse, Balance, Wallet } from "../../api/types";
import { queryStaleTime } from "query/queryConfigs";

// Query keys
export const walletKeys = {
  all: ["wallet"] as const,
  details: () => [...walletKeys.all, "details"] as const,
  balance: () => [...walletKeys.all, "balance"] as const,
};

/**
 * Hook to get wallet details
 */
export const useWalletDetails = (enabled = true) => {
  return useQuery<ApiResponse<Wallet>>({
    queryKey: walletKeys.details(),
    queryFn: async () => {
      return await apiClient.get<ApiResponse<Wallet>>(WALLET.DETAILS);
    },
    staleTime: queryStaleTime.INSTANT_STALE_TIME,
    enabled, // <- this controls auto-fetching
  });
};

/**
 * Hook to get wallet balance
 */
export const useWalletBalance = () => {
  return useQuery<ApiResponse<Balance>>({
    queryKey: walletKeys.balance(),
    queryFn: async () => {
      return await apiClient.get<ApiResponse<Balance>>(WALLET.BALANCE);
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

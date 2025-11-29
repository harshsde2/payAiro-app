import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../api";
import { AUTH } from "../../api/endpoints";
import { ApiResponse } from "../../api/types";
import { IUnifiedTransaction } from "../../screens/TSX-Screens/UnifiedTransactions/types";
import { queryStaleTime } from "query/queryConfigs";

export const formattedTradesHistoryKeys = {
  all: ["formattedTradesHistory"] as const,
  list: () => [...formattedTradesHistoryKeys.all, "list"] as const,
};

/**
 * Hook to get formatted crypto trades history
 * Returns transactions already in IUnifiedTransaction format
 */
export const useFormattedTradesHistory = () => {
  return useQuery<ApiResponse<IUnifiedTransaction[]>>({
    queryKey: formattedTradesHistoryKeys.list(),
    queryFn: async () => {
      return await apiClient.get<ApiResponse<IUnifiedTransaction[]>>(
        AUTH.FORMATTED_TRADES_HISTORY
      );
    },
    staleTime: queryStaleTime.VERY_FAST_STALE_TIME,
  });
};


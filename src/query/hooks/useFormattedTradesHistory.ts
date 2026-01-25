import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { apiClient } from "../../api";
import { AUTH } from "../../api/endpoints";
import { ApiResponse } from "../../api/types";
import { IUnifiedTransaction } from "../../screens/TSX-Screens/UnifiedTransactions/types";
import { queryStaleTime } from "query/queryConfigs";

export const formattedTradesHistoryKeys = {
  all: ["formattedTradesHistory"] as const,
  list: () => [...formattedTradesHistoryKeys.all, "list"] as const,
  paginated: (pageSize: number) =>
    [...formattedTradesHistoryKeys.all, "paginated", pageSize] as const,
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

/**
 * Hook to get formatted crypto trades history with pagination support
 * @param pageSize - Number of items per page (default: 5)
 * @param enabled - Whether the query is enabled (default: true)
 */
export const useFormattedTradesHistoryPaginated = (
  pageSize: number = 5,
  enabled: boolean = true
) => {
  return useInfiniteQuery<ApiResponse<IUnifiedTransaction[]>, Error>({
    queryKey: formattedTradesHistoryKeys.paginated(pageSize),
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const query = `?page=${pageParam}&page_size=${pageSize}`;
      return await apiClient.get<ApiResponse<IUnifiedTransaction[]>>(
        `${AUTH.FORMATTED_TRADES_HISTORY}${query}`
      );
    },
    getNextPageParam: (lastPage, allPages) => {
      const lastPageCount = lastPage?.data?.length ?? 0;
      if (lastPageCount < pageSize) {
        return undefined;
      }
      return allPages.length + 1;
    },
    staleTime: queryStaleTime.VERY_FAST_STALE_TIME,
    enabled,
  });
};


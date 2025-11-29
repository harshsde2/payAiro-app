import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../api";
import { WALLET } from "../../api/endpoints";
import { ApiResponse } from "../../api/types";
import { queryStaleTime } from "query/queryConfigs";
import { IUnifiedTransactionsResponse } from "screens/TSX-Screens/UnifiedTransactions/types";

// Query keys for unified transactions
export const unifiedTransactionKeys = {
  all: ["unified-transactions"] as const,
  list: () => [...unifiedTransactionKeys.all, "list"] as const,
  filtered: (filters: string) =>
    [...unifiedTransactionKeys.all, "filtered", filters] as const,
};

// Filter parameters interface
export interface IUnifiedTransactionFilters {
  categories?: string;
  time_range?: string;
  filter_type?: string;
  start_date?: string;
  end_date?: string;
}

/**
 * Build query string from filter parameters
 */
const buildFilterQueryString = (filters?: IUnifiedTransactionFilters): string => {
  if (!filters) return "";

  const params: string[] = [];

  if (filters.categories) {
    params.push(`categories=${filters.categories}`);
  }
  if (filters.time_range) {
    params.push(`time_range=${filters.time_range}`);
  }
  if (filters.filter_type) {
    params.push(`filter_type=${filters.filter_type}`);
  }
  if (filters.start_date) {
    params.push(`start_date=${filters.start_date}`);
  }
  if (filters.end_date) {
    params.push(`end_date=${filters.end_date}`);
  }

  return params.length > 0 ? `?${params.join("&")}` : "";
};

/**
 * Hook to get unified fiat transactions
 * @param filterQueryString - Optional filter query string (e.g., "?categories=family_friends&time_range=1month")
 */
export const useUnifiedTransactions = (filterQueryString: string = "") => {
  return useQuery<ApiResponse<IUnifiedTransactionsResponse>>({
    queryKey: unifiedTransactionKeys.filtered(filterQueryString),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<IUnifiedTransactionsResponse>>(
        `${WALLET.UNIFIED_TRANSACTIONS}${filterQueryString}`
      );
      return response;
    },
    staleTime: queryStaleTime.VERY_FAST_STALE_TIME,
  });
};

/**
 * Hook to get unified transactions with filter object
 * @param filters - Filter object
 */
export const useUnifiedTransactionsWithFilters = (
  filters?: IUnifiedTransactionFilters
) => {
  const queryString = buildFilterQueryString(filters);

  return useQuery<ApiResponse<IUnifiedTransactionsResponse>>({
    queryKey: unifiedTransactionKeys.filtered(queryString),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<IUnifiedTransactionsResponse>>(
        `${WALLET.UNIFIED_TRANSACTIONS}${queryString}`
      );
      return response;
    },
    staleTime: queryStaleTime.VERY_FAST_STALE_TIME,
  });
};


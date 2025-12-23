import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../api";
import { WALLET } from "../../api/endpoints";
import { ApiResponse } from "../../api/types";
import { queryStaleTime } from "query/queryConfigs";
import { IStatementAPIResponse } from "screens/Dashboard/types";

// Query keys for statement transactions
export const statementKeys = {
  all: ["statement"] as const,
  filtered: (filters: string) =>
    [...statementKeys.all, "filtered", filters] as const,
};

// Filter parameters interface
export interface IStatementFilters {
  period?: "week" | "month";
  type?: "debit" | "credit";
  limit?: number;
  start_date?: string;
  end_date?: string;
}

/**
 * Build query string from filter parameters
 */
const buildStatementFilterQuery = (filters?: IStatementFilters): string => {
  if (!filters) return "";

  const params: string[] = [];

  if (filters.period) {
    params.push(`period=${filters.period}`);
  }

  if (filters.type) {
    params.push(`type=${filters.type}`);
  }

  if (filters.limit) {
    params.push(`limit=${filters.limit}`);
  }

  if (filters.start_date) {
    params.push(`start_date=${filters.start_date}`);
  }

  if (filters.end_date) {
    params.push(`end_date=${filters.end_date}`);
  }

  return params.length > 0 ? params.join("&") : "";
};

/**
 * Hook to get statement transactions with filters
 * @param filters - Filter object (period, type, limit, start_date, end_date)
 * @param enabled - Whether the query should run (default: false, set to true to trigger fetch)
 */
export const useStatementTransactions = (
  filters?: IStatementFilters,
  enabled: boolean = false
) => {
  const filterQuery = buildStatementFilterQuery(filters);
  const queryString = filterQuery ? `?${filterQuery}` : "";

  return useQuery<ApiResponse<IStatementAPIResponse>>({
    queryKey: statementKeys.filtered(queryString),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<IStatementAPIResponse>>(
        `${WALLET.FILTERED_TRANSACTIONS}${queryString}`
      );
      return response;
    },
    enabled: enabled && !!filters && (filters.period !== undefined || filters.start_date !== undefined || filters.limit !== undefined),
    staleTime: queryStaleTime.VERY_FAST_STALE_TIME,
  });
};


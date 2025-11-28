import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { apiClient } from "../client";
import { StandardApiResponse } from "../types";
import { UseApiQueryOptions } from "./types";
import { useEffect } from "react";
import { store } from "@redux/store";

export function useGet<TData = any, TError = any>(
  options: UseApiQueryOptions<TData, TError>
): UseQueryResult<StandardApiResponse<TData>, TError> {
  const { endpoint, queryKey, syncToRedux, enabled = true, ...queryOptions } = options;

  const queryResult = useQuery<StandardApiResponse<TData>, TError>({
    queryKey,
    queryFn: async () => {
      return await apiClient.get<TData>(endpoint);
    },
    enabled,
    ...queryOptions,
  });

  useEffect(() => {
    if (syncToRedux && queryResult.data?.success && queryResult.data.data) {
      const dataToSync = syncToRedux.selector
        ? syncToRedux.selector(queryResult.data.data)
        : queryResult.data.data;
      store.dispatch({
        ...syncToRedux.action,
        payload: dataToSync,
      });
    }
  }, [queryResult.data, syncToRedux]);

  return queryResult;
}


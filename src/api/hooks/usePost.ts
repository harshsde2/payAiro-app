import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { apiClient } from "../client";
import { StandardApiResponse } from "../types";
import { UseApiMutationOptions } from "./types";
import { store } from "@redux/store";

export function usePost<TData = any, TVariables = any, TError = any>(
  options: UseApiMutationOptions<TData, TVariables, TError>
): UseMutationResult<StandardApiResponse<TData>, TError, TVariables> {
  const {
    endpoint,
    method = "post",
    isFormData = false,
    syncToRedux,
    onSuccess,
    onError,
    ...mutationOptions
  } = options;

  const mutationResult = useMutation<StandardApiResponse<TData>, TError, TVariables>({
    mutationFn: async (variables: TVariables) => {
      if (method === "post") {
        return await apiClient.post<TData>(endpoint, variables, isFormData);
      } else if (method === "patch") {
        return await apiClient.patch<TData>(endpoint, variables, isFormData);
      } else {
        return await apiClient.delete<TData>(endpoint);
      }
    },
    onSuccess: (data, variables) => {
      if (syncToRedux && data.success && data.data) {
        const dataToSync = syncToRedux.selector
          ? syncToRedux.selector(data.data)
          : data.data;
        store.dispatch({
          ...syncToRedux.action,
          payload: dataToSync,
        });
      }
      onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      onError?.(error, variables);
    },
    ...mutationOptions,
  });

  return mutationResult;
}


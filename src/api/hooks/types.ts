import { UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";
import { StandardApiResponse } from "../types";
import { Action } from "@reduxjs/toolkit";

export interface UseApiQueryOptions<TData = any, TError = any> extends Omit<UseQueryOptions<StandardApiResponse<TData>, TError>, "queryFn" | "queryKey"> {
  queryKey: readonly unknown[];
  endpoint: string;
  enabled?: boolean;
  syncToRedux?: {
    action: Action;
    selector?: (data: TData) => any;
  };
}

export interface UseApiMutationOptions<TData = any, TVariables = any, TError = any>
  extends Omit<UseMutationOptions<StandardApiResponse<TData>, TError, TVariables>, "mutationFn" | "onSuccess" | "onError"> {
  endpoint: string;
  method?: "post" | "patch" | "delete";
  isFormData?: boolean;
  syncToRedux?: {
    action: Action;
    selector?: (data: TData) => any;
  };
  onSuccess?: (data: StandardApiResponse<TData>, variables: TVariables) => void;
  onError?: (error: TError, variables: TVariables) => void;
}


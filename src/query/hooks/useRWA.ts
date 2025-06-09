import { ApiResponse, BankAccount } from "api/types";
import { apiClient } from "api";
import { AUTH, MERCHANT } from "api/endpoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryStaleTime } from "query/queryConfigs";

export const RWAKeys = {
  all: ["RWA"] as const,
  rwaIcon: () => [...RWAKeys.all, "rwaIcon"] as const,
  rwaList: () => [...RWAKeys.all, "rwaList"] as const,
  rwaAllList: () => [...RWAKeys.all, "rwaAllList"] as const,
  rwaHoldings: () => [...RWAKeys.all, "rwarwaHoldings"] as const,
} as any;

export const useGetRWACategory = () => {
  return useQuery<ApiResponse<any>>({
    queryKey: RWAKeys.rwaIcon(),
    queryFn: async () => {
      return await apiClient.get<ApiResponse<any>>(MERCHANT.RWA_ICON);
    },
    staleTime: queryStaleTime.INSTANT_STALE_TIME,
  });
};

export const useGetRWAList = (value: string) => {
  return useQuery<ApiResponse<any>>({
    queryKey: RWAKeys.rwaList(),
    queryFn: async () => {
      return await apiClient.get<ApiResponse<any>>(`${AUTH.RWA_LIST}${value}`);
    },
    staleTime: queryStaleTime.INSTANT_STALE_TIME,
  });
};

export const useGetAllRWA = () => {
  return useQuery<ApiResponse<any>>({
    queryKey: RWAKeys.rwaAllList(),
    queryFn: async () => {
      return await apiClient.get<ApiResponse<any>>(AUTH.RWA_ALL_LIST);
    },
    staleTime: queryStaleTime.INSTANT_STALE_TIME,
  });
};

export const useGetUserHoldings = () => {
  return useQuery<ApiResponse<any>>({
    queryKey: RWAKeys.rwaHoldings(),
    queryFn: async () => {
      return await apiClient.get<ApiResponse<any>>(AUTH.RWA_USER_HOLDINGS);
    },
    staleTime: queryStaleTime.INSTANT_STALE_TIME,
  });
};

export const useBuyRWA = () => {
  return useMutation<ApiResponse<any>, Error>({
    mutationFn: async (payload) => {
      console.log("payload =>", payload);
      const data = apiClient.post<ApiResponse<any>>(
        AUTH.BUY_RWA,
        payload,
        true
      );
      return data;
    },
  });
};

export const useSellRWA = () => {
  return useMutation<ApiResponse<any>, Error>({
    mutationFn: async (payload) => {
      console.log("payload =>", payload);
      const data = apiClient.post<ApiResponse<any>>(
        AUTH.SELL_RWA,
        payload,
        true
      );
      return data;
    },
  });
};

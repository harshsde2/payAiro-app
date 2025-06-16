import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../api";
import { WALLET, MERCHANT } from "../../api/endpoints";
import { ApiResponse, Transaction } from "../../api/types";
import { queryStaleTime } from "query/queryConfigs";

// Query keys
export const transactionKeys = {
  all: ["transactions"] as const,
  list: () => [...transactionKeys.all, "list"] as const,
  detail: (id: string) => [...transactionKeys.all, "detail", id] as const,
  pending: () => [...transactionKeys.all, "pending"] as const,
  payment: () => [...transactionKeys.all, "payment"] as const,
  merchant: () => [...transactionKeys.all, "merchant"] as const,
};

// Interface for transaction list response
interface TransactionListResponse {
  merchantTransactions: Transaction[];
  userToUserTransactions: Transaction[];
}

/**
 * Hook to get all transactions
 */
export const useTransactions = () => {
  return useQuery<ApiResponse<TransactionListResponse>>({
    queryKey: transactionKeys.list(),
    queryFn: async () => {
      return await apiClient.get<ApiResponse<TransactionListResponse>>(
        WALLET.ALL_TRANSACTION
      );
    },
    staleTime: queryStaleTime.VERY_FAST_STALE_TIME, // 10 minutes
  });
};

/**
 * Hook to get pending payment requests
 */
export const usePendingRequests = () => {
  return useQuery<ApiResponse<Transaction[]>>({
    queryKey: transactionKeys.pending(),
    queryFn: async () => {
      return await apiClient.get<ApiResponse<Transaction[]>>(
        WALLET.PENDING_REQUESTS
      );
    },
    staleTime: queryStaleTime.INSTANT_STALE_TIME, // 5 minutes
  });
};

export const useUserPaymentRequests = () => {
  return useQuery<ApiResponse<Transaction[]>>({
    queryKey: transactionKeys.pending(),
    queryFn: async () => {
      return await apiClient.get<ApiResponse<Transaction[]>>(
        WALLET.USER_REQUESTS
      );
    },
    staleTime: queryStaleTime.INSTANT_STALE_TIME, // 5 minutes
  });
};

/**
 * Hook to get merchant transactions
 */
export const useMerchantTransactions = () => {
  return useQuery<ApiResponse<Transaction[]>>({
    queryKey: transactionKeys.merchant(),
    queryFn: async () => {
      return await apiClient.get<ApiResponse<Transaction[]>>(
        MERCHANT.TRANSACTIONS
      );
    },
  });
};

// Interface for payment request payload
interface PaymentRequestPayload {
  amount: number;
  identifier_type: "username" | "email" | "phone";
  identifier_value: string;
  remarks?: string;
}

/**
 * Hook to send payment request
 */
export const useSendPaymentRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<any>, Error, PaymentRequestPayload>({
    mutationFn: async (payload) => {
      return await apiClient.post<ApiResponse<any>>(
        WALLET.PAYMENT_REQUEST,
        payload,
        false
      );
    },
    onSuccess: () => {
      // Invalidate relevant queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: transactionKeys.list() });
      queryClient.invalidateQueries({ queryKey: transactionKeys.pending() });
    },
  });
};

/**
 * Hook to pay a pending request
 */
export const usePayRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<any>,
    Error,
    string // request ID
  >({
    mutationFn: async (requestId) => {
      return await apiClient.post<ApiResponse<any>>(
        WALLET.PAYMENT_REQUEST_PAY(requestId),
        {},
        false
      );
    },
    onSuccess: () => {
      // Invalidate relevant queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: transactionKeys.list() });
      queryClient.invalidateQueries({ queryKey: transactionKeys.pending() });
    },
  });
};

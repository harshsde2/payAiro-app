import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../api";
import { WALLET } from "../../api/endpoints";
import { ApiResponse } from "../../api/types";
import { queryStaleTime } from "query/queryConfigs";
import { walletKeys } from "./useWallet";
import { IPaymentRequestPayload, IPaymentRequestResponse, IPendingPaymentRequestsResponse } from "./types";

// Query keys
export const paymentRequestKeys = {
  all: ["paymentRequest"] as const,
  pending: () => [...paymentRequestKeys.all, "pending"] as const,
  userRequests: () => [...paymentRequestKeys.all, "userRequests"] as const,
};

/**
 * Hook to create a payment request
 * This sends a payment request to another user by their email or wallet public key
 */
export const useCreatePaymentRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<IPaymentRequestResponse>,
    Error,
    IPaymentRequestPayload
  >({
    mutationFn: async (payload) => {
      const formData = new FormData();
      formData.append("amount", payload.amount);
      formData.append(
        "recipient_email_or_wallet_public_key",
        payload.recipient_email_or_wallet_public_key
      );

      return await apiClient.post<ApiResponse<IPaymentRequestResponse>>(
        WALLET.PAYMENT_REQUEST,
        formData,
        true
      );
    },
    onSuccess: () => {
      // Invalidate related queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: paymentRequestKeys.pending() });
      queryClient.invalidateQueries({
        queryKey: paymentRequestKeys.userRequests(),
      });
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
};

/**
 * Hook to get pending payment requests
 * Fetches all pending payment requests for the current user
 */
export const usePendingPaymentRequests = (enabled = true) => {
  return useQuery<ApiResponse<IPendingPaymentRequestsResponse>>({
    queryKey: paymentRequestKeys.pending(),
    queryFn: async () => {
      return await apiClient.get<ApiResponse<IPendingPaymentRequestsResponse>>(
        WALLET.PENDING_REQUESTS
      );
    },
    staleTime: queryStaleTime.FAST_STALE_TIME, // 30 seconds - avoid constant refetches
    refetchOnMount: false, // Use cached data when switching tabs
    refetchOnWindowFocus: false, // Avoid refetch when app comes to foreground
    enabled,
  });
};

/**
 * Hook to cancel a payment request
 * Cancels a pending payment request by its ID
 */
export const useCancelPaymentRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<any>, Error, string>({
    mutationFn: async (requestId: string) => {
      return await apiClient.post<ApiResponse<any>>(
        WALLET.CANCEL_PAYMENT_REQUEST(requestId),
        {},
        false
      );
    },
    onSuccess: () => {
      // Invalidate pending requests to refresh the list
      queryClient.invalidateQueries({ queryKey: paymentRequestKeys.pending() });
      queryClient.invalidateQueries({
        queryKey: paymentRequestKeys.userRequests(),
      });
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
};

/**
 * Hook to pay a payment request
 * Pays a pending payment request by its ID
 */
export const usePayPaymentRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<any>, Error, string>({
    mutationFn: async (requestId: string) => {
      return await apiClient.post<ApiResponse<any>>(
        WALLET.PAYMENT_REQUEST_PAY(requestId),
        {},
        false
      );
    },
    onSuccess: () => {
      // Invalidate pending requests to refresh the list
      queryClient.invalidateQueries({ queryKey: paymentRequestKeys.pending() });
      queryClient.invalidateQueries({
        queryKey: paymentRequestKeys.userRequests(),
      });
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
};


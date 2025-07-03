import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../api";
import { AUTH } from "../../api/endpoints";
import { ApiResponse, CryptoAsset } from "../../api/types";
import { queryStaleTime } from "query/queryConfigs";

// Query keys
export const cryptoKeys = {
  all: ["crypto"] as const,
  cryptoBalance: () => [...cryptoKeys.all, "cryptoBalance"] as const,
  trades: () => [...cryptoKeys.all, "trades"] as const,
  prices: () => [...cryptoKeys.all, "prices"] as const,
};

/**
 * Hook to get crypto balances
 */
export const useCryptoBalance = () => {
  return useQuery<ApiResponse<any>>({
    queryKey: cryptoKeys.cryptoBalance(),
    queryFn: async () => {
      return await apiClient.get<ApiResponse<any>>(
        AUTH.BANKACCOUNT_CRYPTO_BALANCE
      );
    },
    staleTime: queryStaleTime.INSTANT_STALE_TIME,
  });
};

/**
 * Hook to get crypto trade history
 */
export const useCryptoTrades = () => {
  return useQuery<ApiResponse<any>>({
    queryKey: cryptoKeys.trades(),
    queryFn: async () => {
      return await apiClient.get<ApiResponse<any>>(AUTH.TRADES_HISTORY);
    },
  });
};

/**
 * Hook to get crypto prices
 */
export const useCryptoPrices = () => {
  return useQuery<ApiResponse<any>>({
    queryKey: cryptoKeys.prices(),
    queryFn: async () => {
      return await apiClient.get<ApiResponse<any>>(AUTH.CRYPTO_PRICE_LIST);
    },
    // Price data changes frequently, use shorter stale time
    staleTime: queryStaleTime.INSTANT_STALE_TIME, // 1 minute
  });
};

// Interfaces for crypto transfer
interface CryptoTransferPayload {
  asset_type: string;
  to_address: string;
  amount: number;
}

/**
 * Hook to transfer crypto
 */
export const useCryptoTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<any>, Error, CryptoTransferPayload>({
    mutationFn: async (payload) => {
      return await apiClient.post<ApiResponse<any>>(
        AUTH.CRYPTO_TRANSFER,
        payload,
        false
      );
    },
    onSuccess: () => {
      // Invalidate relevant queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: cryptoKeys.cryptoBalance() });
      queryClient.invalidateQueries({ queryKey: cryptoKeys.trades() });
    },
  });
};

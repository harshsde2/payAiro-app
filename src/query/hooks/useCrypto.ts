import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../api";
import { AUTH } from "../../api/endpoints";
import { ApiResponse, CryptoAsset } from "../../api/types";
import { queryStaleTime } from "query/queryConfigs";
import useSelectorAction from "hooks/useSelectorAction";

// Query keys
export const cryptoKeys = {
  all: ["crypto"] as const,
  cryptoBalance: () => [...cryptoKeys.all, "cryptoBalance"] as const,
  cryptoBalanceFortress: () => [...cryptoKeys.all, "cryptoBalanceFortress"] as const,
  cryptoBalanceByAsset: (asset: string) => [...cryptoKeys.all, "cryptoBalanceByAsset", asset] as const,
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

// fetch crypto
export const useGetCrypto = () => {
  const { walletData } = useSelectorAction() as any;
  const isFortress = walletData?.fortress;
  const url = !isFortress
    ? `${AUTH.COMBINED_CRYPTO_BALANCE}fortress`
    : `${AUTH.COMBINED_CRYPTO_BALANCE}cybrid`;

  return useQuery<ApiResponse<any>>({
    queryKey: cryptoKeys.cryptoBalanceFortress(),
    queryFn: async () => {
      return await apiClient.get<ApiResponse<any>>(url);
    },
    staleTime: queryStaleTime.VERY_VERY_VERY_VERY_SLOW_STALE_TIME,
  });
};

/**
 * Hook to get crypto balance by specific asset
 */
export const useCryptoBalanceByAsset = (asset: string) => {
  return useQuery<ApiResponse<any>>({
    queryKey: cryptoKeys.cryptoBalanceByAsset(asset),
    queryFn: async () => {
      return await apiClient.get<ApiResponse<any>>(
        `${AUTH.CRYPTO_BALANCE_BY_ASSET}?asset=${asset}`
      );
    },
    staleTime: queryStaleTime.INSTANT_STALE_TIME,
    enabled: !!asset, // Only run query if asset is provided
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
        true
      );
    },
    onSuccess: (data) => {
      console.log("data =>", JSON.stringify(data, null, 2));
      // Invalidate relevant queries to trigger refetch
      // queryClient.invalidateQueries({ queryKey: cryptoKeys.cryptoBalance() });
      // queryClient.invalidateQueries({ queryKey: cryptoKeys.trades() });
    },
    onError: (error) => {
      console.log("error =>", JSON.stringify(error, null, 2));
      // Invalidate relevant queries to trigger refetch
      // queryClient.invalidateQueries({ queryKey: cryptoKeys.cryptoBalance() });
      // queryClient.invalidateQueries({ queryKey: cryptoKeys.trades() });
    },
  });
};

/**
 * Hook to transfer crypto
 */
export const useCryptoBuy = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<any>, Error, CryptoTransferPayload>({
    mutationFn: async (payload) => {
      console.log("payload =>", payload);

      return await apiClient.post<ApiResponse<any>>(
        AUTH.CRYPTO_BUY,
        payload,
        false
      );
    },
    onSuccess: (data) => {
      // console.log("data =>", data);
      // // Invalidate   relevant queries to trigger refetch
      // queryClient.invalidateQueries({ queryKey: cryptoKeys.cryptoBalance() });
      // queryClient.invalidateQueries({ queryKey: cryptoKeys.trades() });
    },
    onError: (eror) => {
      console.log("error crypto ====>", JSON.stringify(eror, null, 2));
    },
  });
};

/**
 * Hook to select crypto currency and fetch its balance
 * This triggers a refetch of the crypto balance by asset
 */
export const useSelectCryptoCurrency = () => {
  const queryClient = useQueryClient();

  const selectCurrency = async (asset: string) => {
    try {      
      // Fetch the crypto balance for the selected asset
      const result = await queryClient.fetchQuery({
        queryKey: cryptoKeys.cryptoBalanceByAsset(asset),
        queryFn: async () => {
          return await apiClient.get<ApiResponse<any>>(
            `${AUTH.CRYPTO_BALANCE_BY_ASSET}?asset=${asset}`
          );
        },
        staleTime: queryStaleTime.INSTANT_STALE_TIME,
      });

      return result;
    } catch (error:any) {
      // console.log("Error fetching crypto balance ====>", JSON.stringify(error.response, null, 2));
      throw error;
    }
  };

  return {
    selectCurrency,
    isLoading: false, // We'll handle loading state in the component
  };
};

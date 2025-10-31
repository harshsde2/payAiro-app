import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../api";
import { AUTH } from "../../api/endpoints";
import { ApiResponse, CryptoAsset } from "../../api/types";
import { queryStaleTime } from "query/queryConfigs";
import useSelectorAction from "hooks/useSelectorAction";
import { useDispatch } from "react-redux";
import { setAllCryptoBalances } from "../../redux/slices/authenticationSlice";
import { setItem, getItem, STORAGE_KEYS } from "../../storage/mmkv";

// Query keys
export const cryptoKeys = {
  all: ["crypto"] as const,
  cryptoBalance: () => [...cryptoKeys.all, "cryptoBalance"] as const,
  cryptoBalanceFortress: () => [...cryptoKeys.all, "cryptoBalanceFortress"] as const,
  cryptoBalanceByAsset: (asset: string) => [...cryptoKeys.all, "cryptoBalanceByAsset", asset] as const,
  allCryptoBalances: () => [...cryptoKeys.all, "allCryptoBalances"] as const,
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
  const url = isFortress
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

// Interface for deposit address
interface DepositAddressPayload {
  asset: string;
}

interface DepositAddressResponse {
  status: boolean;
  message: string;
  asset: string;
  address: string;
}

// Interfaces for on-chain withdrawal
interface CryptoWithdrawalPayload {
  asset: string; // e.g. "USDC"
  amount: number; // token amount (not wei)
  usd_amount?: number; // optional, server can compute if omitted
  withdrawal_address: string; // destination wallet address
}

interface CryptoWithdrawalResponse {
  status: boolean;
  message: string;
  data: any; // keep flexible; screen handles response object
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
      // console.log("data =>", JSON.stringify(data, null, 2));
      // Invalidate relevant queries to trigger refetch
      // queryClient.invalidateQueries({ queryKey: cryptoKeys.cryptoBalance() });
      // queryClient.invalidateQueries({ queryKey: cryptoKeys.trades() });
    },
    onError: (error) => {
      // console.log("error =>", JSON.stringify(error, null, 2));
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
  return useMutation<ApiResponse<any>, Error, CryptoTransferPayload>({
    mutationFn: async (payload) => {
      console.log(payload," payload ")
      return await apiClient.post<ApiResponse<any>>(
        AUTH.CRYPTO_BUY,
        payload,
        false
      );
    },
  });
};

/**
 * Hook to initiate on-chain crypto withdrawal to an external wallet
 */
export const useCryptoWithdrawal = () => {
  return useMutation<ApiResponse<CryptoWithdrawalResponse>, any, CryptoWithdrawalPayload>({
    mutationFn: async (payload) => {
      return await apiClient.post<ApiResponse<CryptoWithdrawalResponse>>(
        AUTH.CRYPTO_WITHDRAWAL,
        payload,
        true
      );
    },
    onSuccess: (data) => {
      console.log("Withdrawal initiated =>", JSON.stringify(data, null, 2));
    },
    onError: (error) => {
      console.log("Error initiating withdrawal =>", JSON.stringify(error?.response || error, null, 2));
    },
  });
};

export const useCryptoSell = () => {
  return useMutation<ApiResponse<any>, Error, CryptoTransferPayload>({
    mutationFn: async (payload) => {
      console.log("payload =>", payload);
      return await apiClient.post<ApiResponse<any>>(
        AUTH.CRYPTO_SELL,
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
    // console.log("Assets -> ",asset);
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

/**
 * Hook to get all crypto balances and store in Redux + MMKV
 */
export const useAllCryptoBalances = () => {
  const dispatch = useDispatch();
  
  return useQuery<ApiResponse<any>>({
    queryKey: cryptoKeys.allCryptoBalances(),
    queryFn: async () => {
      try {
        const result = await apiClient.get<ApiResponse<any>>(AUTH.ALL_CRYPTO_BALANCES);
        
        // Store in Redux
        dispatch(setAllCryptoBalances(result?.data?.balances || []));
        
        // console.log("All crypto balances fetched and stored =>", JSON.stringify(result?.data?.balances, null, 2));
        
        return result;
      } catch (error) {
        console.log("Error fetching all crypto balances =>", JSON.stringify(error, null, 2));
        throw error;
      }
    },
    staleTime: queryStaleTime.INSTANT_STALE_TIME,
  });
};

/**
 * Hook to get deposit address for on-chain transactions
 */
export const useDepositAddress = () => {
  return useMutation<ApiResponse<DepositAddressResponse>, Error, DepositAddressPayload>({
    mutationFn: async (payload) => {
      return await apiClient.post<ApiResponse<DepositAddressResponse>>(
        AUTH.DEPOSIT_ADDRESS,
        payload,
        true
      );
    },
    onSuccess: (data) => {
      console.log("Deposit address retrieved =>", JSON.stringify(data, null, 2));
    },
    onError: (error) => {
      console.log("Error getting deposit address =>", JSON.stringify(error, null, 2));
    },
  });
};

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { apiClient } from "../../api";
import { AUTH, KYC, WALLET } from "../../api/endpoints";
import { 
  ApiResponse, 
  BankAccount, 
  PlaidLinkTokenResponse, 
  PlaidAccessTokenRequest, 
  PlaidAccessTokenResponse,
  ExternalWithdrawalRequest,
  ExternalWithdrawalResponse
} from "../../api/types";
import { queryStaleTime } from "query/queryConfigs";
import useSelectorAction from "hooks/useSelectorAction";
import { setBankbalances, setCybridBankbalances } from "redux/slices/authenticationSlice";
import { userKeys } from "./useUser";

// Query keys
export const bankKeys = {
  all: ["bank"] as const,
  accounts: () => [...bankKeys.all, "accounts"] as const,
  allAccounts: () => [...bankKeys.all, "allAccounts"] as const,
  balance: () => [...bankKeys.all, "balance"] as const,
  cybridBalance: () => [...bankKeys.all, "cybridBalance"] as const,
  linkToken: () => [...bankKeys.all, "linkToken"] as const,
  plaidLinkToken: () => [...bankKeys.all, "plaidLinkToken"] as const,
} as any;

/**
 * Hook to get user's bank accounts
 */
export const useBankAccounts = () => {
  return useQuery<ApiResponse<{ accounts: BankAccount[] }>>({
    queryKey: bankKeys.accounts(),
    queryFn: async () => {
      return await apiClient.get<ApiResponse<{ accounts: BankAccount[] }>>(
        AUTH.MY_BANK_ACCOUNTS
      );
    },
  });
};

/**
 * Hook to get all bank accounts including special accounts
 */
export const useAllBankAccounts = () => {
  return useQuery<BankAccount[]>({
    queryKey: bankKeys.allAccounts(),
    queryFn: async () => {
      const response = await apiClient.get<
        ApiResponse<{
          bank_accounts: BankAccount[];
          traditional_ira_accounts: BankAccount[];
          roth_ira_accounts: BankAccount[];
          external_accounts: BankAccount[];
        }>
      >(AUTH.ALL_BANK_ACCOUNTS);

      const payAiroBankAccounts = [
        ...(response?.data?.bank_accounts || []),
        ...(response?.data?.traditional_ira_accounts || []),
        ...(response?.data?.roth_ira_accounts || []),
        ...(response?.data?.external_accounts || []),
      ];
      // console.log('PayAiro Bank Accounts ====>',  JSON.stringify(payAiroBankAccounts,null, 2));
      return payAiroBankAccounts;
    },
    staleTime: queryStaleTime.VERY_FAST_STALE_TIME,
    refetchOnWindowFocus: true,
  });
};
/**
 * Hook to get bank account balances
 */
export const useBankBalances = () => {
  const dispatch = useDispatch();
  const { walletData } = useSelectorAction() as any;
  const isFortress = walletData?.fortress;
  const url = isFortress ? AUTH.ALL_BANKACCOUNT_BALANCE : AUTH.CYBIRD_BALANCE;

  const query = useQuery<ApiResponse<any>>({
    queryKey: bankKeys.balance(),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any>>(url);
      return response.data;
    },
    staleTime: queryStaleTime.VERY_FAST_STALE_TIME, // 5 second
  });

  // Sync essential values into Redux when data changes
  useEffect(() => {
    const data: any = query?.data;
    if (!data) return;

    const payload = {
      bank_account: {
        usd: Number((data as any)?.bank_account?.usd ?? 0),
      },
      platform_balance: Number((data as any)?.platform_balance ?? 0),
      platform_available: Number((data as any)?.platform_available ?? 0),
    };

    // if (isFortress) {
      dispatch(setBankbalances(payload));
    // } else {
    //   dispatch(setCybridBankbalances(payload));
    // }
  }, [dispatch, query?.data]);

  return query;
};

// export const useCybridBankBalances = () => {
//   return useQuery<ApiResponse<any>>({
//     queryKey: bankKeys.cybridBalance(),
//     queryFn: async () => {
//       const response = await apiClient.get<ApiResponse<any>>(
//         AUTH.CYBIRD_BALANCE
//       );
//       return response.data;
//     },
//     staleTime: queryStaleTime.VERY_FAST_STALE_TIME, // 5 second
//   });
// };

/**
 * Hook to get Plaid link token
 */
export const usePlaidLinkToken = () => {
  return useQuery<PlaidLinkTokenResponse>({
    queryKey: bankKeys.plaidLinkToken(),
    queryFn: async () => {
      const response = await apiClient.post<PlaidLinkTokenResponse>(
        AUTH.PLAID_ACCESS_TOKEN,
        {}
      );
      return response;
    },
    staleTime: queryStaleTime.FAST_STALE_TIME,
    retry: 2,
  });
};

/**
 * Hook to exchange Plaid public token for access token
 */
export const usePlaidAccessToken = () => {
  const queryClient = useQueryClient();
  
  return useMutation<PlaidAccessTokenResponse, Error, PlaidAccessTokenRequest>({
    mutationFn: async (data: PlaidAccessTokenRequest) => {
      const response = await apiClient.post<PlaidAccessTokenResponse>(
        AUTH.CREATE_EXTERNAL_BANK_ACCOUNT,
        data
      );
      return response;
    },
    onSuccess: () => {
      // Invalidate and refetch bank accounts after successful connection
      queryClient.invalidateQueries({ queryKey: userKeys.fiatDashboard() });
    },
  });
};

/**
 * Hook to initiate external withdrawal
 */
export const useExternalWithdrawal = () => {
  const queryClient = useQueryClient();
  
  return useMutation<ExternalWithdrawalResponse, Error, ExternalWithdrawalRequest>({
    mutationFn: async (data: ExternalWithdrawalRequest) => {
      const response = await apiClient.post<ExternalWithdrawalResponse>(
        WALLET.EXTERNAL_WITHDRAWAL_CYBRID,
        data
      );
      return response;
    },
    onSuccess: () => {
      // Invalidate and refetch bank accounts and balances after successful withdrawal
      queryClient.invalidateQueries({ queryKey: bankKeys.allAccounts() });
      queryClient.invalidateQueries({ queryKey: bankKeys.balance() });
      queryClient.invalidateQueries({ queryKey: userKeys.fiatDashboard() });
    },
  });
};



import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { AUTH, KYC } from '../../api/endpoints';
import { ApiResponse, BankAccount } from '../../api/types';

// Query keys
export const bankKeys = {
  all: ['bank'] as const,
  accounts: () => [...bankKeys.all, 'accounts'] as const,
  allAccounts: () => [...bankKeys.all, 'allAccounts'] as const,
  balance: () => [...bankKeys.all, 'balance'] as const,
  linkToken: () => [...bankKeys.all, 'linkToken'] as const,
};

/**
 * Hook to get user's bank accounts
 */
export const useBankAccounts = () => {
  return useQuery<ApiResponse<{ accounts: BankAccount[] }>>({
    queryKey: bankKeys.accounts(),
    queryFn: async () => {
      return await apiClient.get<ApiResponse<{ accounts: BankAccount[] }>>(AUTH.MY_BANK_ACCOUNTS);
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
      const response = await apiClient.get<ApiResponse<{
        bank_accounts: BankAccount[],
        traditional_ira_accounts: BankAccount[],
        roth_ira_accounts: BankAccount[],
        external_accounts: BankAccount[]
      }>>(AUTH.ALL_BANK_ACCOUNTS);

      const payAiroBankAccounts = [
        ...(response?.data?.bank_accounts || []),
        ...(response?.data?.traditional_ira_accounts || []),
        ...(response?.data?.roth_ira_accounts || []),
        ...(response?.data?.external_accounts || [])  
      ];
      // console.log('PayAiro Bank Accounts ====>',  JSON.stringify(payAiroBankAccounts,null, 2));
      return payAiroBankAccounts;
    },
    staleTime: 1000, // ✅ 10 minutes: only refetch if older than this
    // refetchOnWindowFocus: true, // ✅ (default) only refetch if data is stale
  });
};
/**
 * Hook to get bank account balances
 */
export const useBankBalances = () => {
  return useQuery<ApiResponse<any>>({
    queryKey: bankKeys.balance(),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any>>(AUTH.ALL_BANKACCOUNT_BALANCE);
      return response.data;
    },
  });
};





import { useQuery } from '@tanstack/react-query';
import { USER_AUTH } from 'api/endpoints';
import { userApiClient } from 'api/userApiClient';
import type { CoinmeTransactionLimitsResponse } from '@new-ui/screens/TransactionLimits/types';

export const coinmeTransactionLimitsKeys = {
  all: ['coinme', 'transactionLimits'] as const,
};

export function useCoinmeTransactionLimits() {
  return useQuery({
    queryKey: coinmeTransactionLimitsKeys.all,
    queryFn: () =>
      userApiClient.get<CoinmeTransactionLimitsResponse>(
        USER_AUTH.COINME_TRANSACTION_LIMITS
      ),
    staleTime: 60_000,
  });
}

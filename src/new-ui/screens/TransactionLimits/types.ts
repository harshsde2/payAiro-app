export type CoinmeLimitType =
  | 'green_dot_buy'
  | 'debit_buy'
  | 'debit_sell'
  | 'ncr_sell';

export type CoinmeTransactionLimitItem = {
  type: CoinmeLimitType | string;
  label?: string;
  isActive?: boolean;
  perTransactionUsd?: string;
  dailyLimitUsd?: string;
  monthlyLimitUsd?: string;
  usage?: {
    dailyUsd?: string;
    monthlyUsd?: string;
  };
  remaining?: {
    dailyUsd?: string;
    monthlyUsd?: string;
  };
};

export type CoinmeTransactionLimitsData = {
  currency?: string;
  enabled?: boolean;
  limits?: CoinmeTransactionLimitItem[];
};

export type CoinmeTransactionLimitsResponse = {
  ok?: boolean;
  message?: string;
  data?: CoinmeTransactionLimitsData;
};

export type TransactionLimitTab = 'buy' | 'sell';

export type TransactionLimitRow = {
  key: 'cash' | 'debit';
  label: string;
  dailyLimitUsd: string;
  monthlyLimitUsd: string;
};

export type TransactionLimitTabRows = {
  cash: TransactionLimitRow | null;
  debit: TransactionLimitRow | null;
};

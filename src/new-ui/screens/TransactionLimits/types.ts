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

/** Sell-side rules that apply across both sell rails (debit_sell + ncr_sell). */
export type CoinmeSellConfig = {
  isActive?: boolean;
  /** Reserved by the backend on sells. Intentionally unused by the app — fee
   *  math lives server-side and is deliberately not reintroduced on the client. */
  sellFeeReservePercent?: string;
  minimumSellAmountUsd?: string;
};

export type CoinmeTransactionLimitsData = {
  currency?: string;
  enabled?: boolean;
  limits?: CoinmeTransactionLimitItem[];
  sellConfig?: CoinmeSellConfig;
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
  dailyLimitUsd: number;
  monthlyLimitUsd: number;
  dailyUsedUsd: number;
  monthlyUsedUsd: number;
  dailyRemainingUsd: number;
  monthlyRemainingUsd: number;
};

export type TransactionLimitTabRows = {
  cash: TransactionLimitRow | null;
  debit: TransactionLimitRow | null;
};

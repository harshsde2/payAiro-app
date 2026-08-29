import { useMemo } from "react";
import { isAxiosError } from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../api";
import { AUTH, USER_AUTH } from "../../api/endpoints";
import { ApiResponse, CryptoAsset } from "../../api/types";
import { queryStaleTime, CRYPTO_LIST_STALE_TIME_MS, CRYPTO_LIST_GC_TIME_MS } from "query/queryConfigs";
import useSelectorAction from "hooks/useSelectorAction";
import { useDispatch } from "react-redux";
import { setAllCryptoBalances, setTotalDisbursable, setCryptoData, setAggregatedCryptoBalances } from "../../redux/slices/authenticationSlice";
import { setItem, getItem, STORAGE_KEYS } from "../../storage/mmkv";
import { useSelector } from "react-redux";
import { userApiClient } from "api/userApiClient";
import { getDeviceFingerprint } from "utils/getDeviceFingerprint";
import { ICryptoAssetItem } from "new-ui/components/common-components/CryptoAssetsList/types";
import type { SendHistoryResponse } from "new-ui/components/common-components/RecentActivityCard/types";
import {
  mergeCryptoMarketWithBalances,
  type ICryptoFastApiBalanceRow,
} from "query/utils/mergeCryptoMarketWithBalances";

// Query keys
export const cryptoKeys = {
  all: ["crypto"] as const,
  cryptoBalance: () => [...cryptoKeys.all, "cryptoBalance"] as const,
  cryptoBalanceFortress: () => [...cryptoKeys.all, "cryptoBalanceFortress"] as const,
  cryptoBalanceByAsset: (asset: string) => [...cryptoKeys.all, "cryptoBalanceByAsset", asset] as const,
  allCryptoBalances: () => [...cryptoKeys.all, "allCryptoBalances"] as const,
  trades: () => [...cryptoKeys.all, "trades"] as const,
  prices: () => [...cryptoKeys.all, "prices"] as const,
  cryptoMarketData: () => [...cryptoKeys.all, "cryptoMarketData"] as const,
  userCryptoMarket: (fiat: string) => [...cryptoKeys.all, "userCryptoMarket", fiat] as const,
  userCryptoMarketCurrency: (fiat: string, currency: string) =>
    [...cryptoKeys.all, "userCryptoMarket", fiat, currency] as const,
  userCryptoBalance: () => [...cryptoKeys.all, "userCryptoBalance"] as const,
  walletAddresses: () => [...cryptoKeys.all, "walletAddresses"] as const,
  paymentTransactionHistory: (filters: PaymentTransactionHistoryFilters) =>
    [...cryptoKeys.all, "paymentTransactionHistory", filters] as const,
  coinmeTradeQuote: (payload: CoinmeTradeQuotePayload) =>
    [
      ...cryptoKeys.all,
      "coinmeTradeQuote",
      payload.tradeType,
      payload.chain,
      payload.cryptoCurrencyCode,
      payload.fiatCurrencyCode,
      payload.amountValue,
      payload.amountCurrencyCode,
    ] as const,
};

/** FastAPI GET /api/v1/wallets/addresses/ */
export interface IWalletAddressRow {
  walletAddress: string;
  currencyName: string;
  currencySymbol: string;
  assetId: string;
  chain: string;
}

export interface IWalletAddressesResponse {
  walletAddresses?: IWalletAddressRow[];
  errorResponse?: unknown;
}

interface IUserCryptoMarketItem {
  currency?: string;
  /** Full display name when provided by the market API */
  name?: string;
  currency_name?: string;
  price?: string | number;
  usd_price?: string | number;
  high?: string | number;
  low?: string | number;
  change_24h?: string | number;
  icon_url?: string;
  /** false = view-only token (no wallet yet); Buy creates it. Flips true after first buy. */
  tradable?: boolean;
  /** Present only when `tradable` is false — user-facing explanation of the view-only state. */
  view_only_description?: string;
}

interface IUserCryptoMarketResponse {
  ok?: boolean;
  message?: string;
  data?: {
    items?: IUserCryptoMarketItem[];
  };
}

interface IUserCryptoChartItem {
  timestamp: number;
  close?: string | number;
}

interface IUserCryptoChartResponse {
  ok?: boolean;
  message?: string;
  data?: {
    currency?: string;
    fiat?: string;
    range?: string;
    latest_price?: string | number;
    latest_high?: string | number;
    latest_low?: string | number;
    items?: IUserCryptoChartItem[];
  };
}

export type PaymentTransactionSendPayload =
  | {
      type: "external";
      amount: string;
      currency: string;
      chain: string;
      destinationWalletAddress: string;
    }
  | {
      type: "internal";
      amount: string;
      currency: string;
      chain: string;
      recipientUserId: string;
      recipientWalletAddress?: string;
    };

export interface PaymentTransactionSendResponse {
  message?: string;
  ok?: boolean;
  status?: boolean;
  data?: {
    transaction?: {
      partnerTransactionId?: string;
      transactionStatus?: string;
    };
    paymentTransaction?: {
      id?: number;
      type?: string;
      status?: string;
      currency?: string;
      chain?: string;
      amount?: string;
      destinationWalletAddress?: string;
      providerTransactionId?: string;
      providerStatus?: string;
    };
  };
  errorResponse?: unknown;
}

export interface IUserCryptoChartPoint {
  x: number;
  y: number;
  date?: string;
}

/** Matches `PERIODS` order in `CryptoChart.tsx` (1D … All). */
export type ChartPeriodTab = "1D" | "1W" | "1M" | "1Y" | "All";

export const CHART_PERIOD_ORDER: ChartPeriodTab[] = [
  "1D",
  "1W",
  "1M",
  "1Y",
  "All",
];

const MS_DAY = 24 * 60 * 60 * 1000;

/** Builds chart query string for FastAPI: `range=24h` for 1D, else `range=custom` + window. */
export function buildCryptoChartQueryString(
  currency: string,
  fiat: string,
  period: ChartPeriodTab
): string {
  const c = encodeURIComponent(currency);
  const f = encodeURIComponent(fiat);
  if (period === "1D") {
    return `${USER_AUTH.CRYPTO_CHART}?currency=${c}&fiat=${f}&range=24h`;
  }
  const endTs = Date.now();
  let startTs = endTs;
  let interval: "HOURS" | "DAYS" = "DAYS";
  switch (period) {
    case "1W":
      startTs = endTs - 7 * MS_DAY;
      interval = "HOURS";
      break;
    case "1M":
      startTs = endTs - 30 * MS_DAY;
      interval = "DAYS";
      break;
    case "1Y":
      startTs = endTs - 365 * MS_DAY;
      interval = "DAYS";
      break;
    case "All":
      startTs = endTs - 10 * 365 * MS_DAY;
      interval = "DAYS";
      break;
    default:
      startTs = endTs - 24 * MS_DAY;
      interval = "HOURS";
  }
  return `${USER_AUTH.CRYPTO_CHART}?currency=${c}&fiat=${f}&range=custom&interval=${interval}&start_ts=${startTs}&end_ts=${endTs}`;
}

const toFiniteNumber = (value: unknown): number | undefined => {
  const n = Number(value ?? NaN);
  return Number.isFinite(n) ? n : undefined;
};

const mapMarketItemToCryptoListItem = (
  item: IUserCryptoMarketItem
): ICryptoAssetItem => {
  const parsedPrice = toFiniteNumber(item?.price);
  const parsedUsdPrice = toFiniteNumber(item?.usd_price) ?? parsedPrice ?? 0;
  const high = toFiniteNumber(item?.high);
  const low = toFiniteNumber(item?.low);
  const change = toFiniteNumber(item?.change_24h);

  return {
    asset: item?.currency ?? "",
    logo: item?.icon_url ?? "",
    name: item?.name ?? item?.currency_name,
    platform_available: 0,
    platform_total_balance: 0,
    usd_value_total: 0,
    usd_value_available: 0,
    usd_price: parsedUsdPrice,
    high,
    low,
    change_24h: change,
    platform_pending: 0,
    tradable: item?.tradable,
    view_only_description: item?.view_only_description,
  };
};

interface IUserCryptoBalanceApiBody {
  data?: {
    cryptoAssetsBalance?: ICryptoFastApiBalanceRow[];
  };
  errorResponse?: unknown;
}

/**
 * General market list — WARNING: the backend STATE-FILTERS this list per
 * authenticated user (it hides USDC/DAI depending on the user's registered
 * state). Fine for the dashboard/crypto display lists, but flows that need the
 * state stablecoin's row (Add Balance, Send funding source) must NOT rely on it
 * — use {@link useCryptoMarketForCurrency}, which fetches the coin explicitly
 * via `?currencies=` and bypasses the filter.
 */
export const useUserCryptoMarketList = (fiat: string = "USD") => {
  return useQuery<ICryptoAssetItem[]>({
    queryKey: cryptoKeys.userCryptoMarket(fiat),
    queryFn: async () => {
      const response = await userApiClient.get<IUserCryptoMarketResponse>(
        `${USER_AUTH.CRYPTO_MARKET}?fiat=${encodeURIComponent(fiat)}`
      );
      const items = response?.data?.items ?? [];
      return items.map(mapMarketItemToCryptoListItem);
    },
    // Always refetch (staleTime 0) and never restore from disk (excluded from MMKV
    // persistence in query/index.tsx): the per-user filtered list must reflect the
    // backend's CURRENT answer — a cached copy once froze Add Balance / Send.
    staleTime: queryStaleTime.INSTANT_STALE_TIME,
    gcTime: CRYPTO_LIST_GC_TIME_MS,
  });
};

/**
 * Market row for ONE specific currency via `?currencies=SYMBOL`. The backend
 * serves this regardless of the per-user state filtering that can hide the coin
 * from the general list — the sanctioned way to price the state stablecoin
 * (TX → DAI, others → USDC) for Add Balance / Send.
 */
export const useCryptoMarketForCurrency = (
  currency: string | null | undefined,
  fiat: string = "USD"
) => {
  const symbol = String(currency ?? "").trim().toUpperCase();
  return useQuery<ICryptoAssetItem[]>({
    queryKey: cryptoKeys.userCryptoMarketCurrency(fiat, symbol),
    queryFn: async () => {
      const response = await userApiClient.get<IUserCryptoMarketResponse>(
        `${USER_AUTH.CRYPTO_MARKET}?fiat=${encodeURIComponent(fiat)}&currencies=${encodeURIComponent(symbol)}`
      );
      const items = response?.data?.items ?? [];
      return items.map(mapMarketItemToCryptoListItem);
    },
    // Same policy as the general list: always fresh, never persisted (the
    // "userCryptoMarket" key segment is excluded from MMKV in query/index.tsx).
    staleTime: queryStaleTime.INSTANT_STALE_TIME,
    gcTime: CRYPTO_LIST_GC_TIME_MS,
    enabled: symbol.length > 0,
  });
};

const isCoinmeOnboardingBalanceError = (error: unknown): boolean => {
  if (!isAxiosError(error) || error.response?.status !== 400) return false;
  const body = error.response?.data as
    | { errorResponse?: { message?: string } }
    | undefined;
  const msg = String(body?.errorResponse?.message ?? "").toLowerCase();
  return (
    msg.includes("coinme") ||
    msg.includes("caas") ||
    msg.includes("onboarding")
  );
};

export const useUserCryptoBalanceFastApi = () => {
  const isLogin = useSelector(
    (state: any) => state.authenticationSlice?.isLogin === true
  );

  return useQuery<ICryptoFastApiBalanceRow[]>({
    queryKey: cryptoKeys.userCryptoBalance(),
    queryFn: async () => {
      try {
        const response = await userApiClient.get<IUserCryptoBalanceApiBody>(
          USER_AUTH.CRYPTO_BALANCE
        );
        return response?.data?.cryptoAssetsBalance ?? [];
      } catch (e) {
        if (isCoinmeOnboardingBalanceError(e)) {
          return [];
        }
        throw e;
      }
    },
    staleTime: queryStaleTime.INSTANT_STALE_TIME,
    gcTime: CRYPTO_LIST_GC_TIME_MS,
    enabled: isLogin,
  });
};

export const useWalletAddresses = () => {
  const isLogin = useSelector(
    (state: any) => state.authenticationSlice?.isLogin === true
  );

  return useQuery<IWalletAddressesResponse>({
    queryKey: cryptoKeys.walletAddresses(),
    queryFn: () => userApiClient.get<IWalletAddressesResponse>(USER_AUTH.WALLET_ADDRESSES),
    staleTime: queryStaleTime.INSTANT_STALE_TIME,
    gcTime: CRYPTO_LIST_GC_TIME_MS,
    enabled: isLogin,
  });
};

export const useCryptoAssetsListData = (fiat: string = "USD") => {
  const marketQuery = useUserCryptoMarketList(fiat);
  const balanceQuery = useUserCryptoBalanceFastApi();

  const data = useMemo(
    () =>
      mergeCryptoMarketWithBalances(
        marketQuery.data ?? [],
        balanceQuery.data ?? []
      ),
    [marketQuery.data, balanceQuery.data]
  );

  return {
    data,
    isMarketLoading: marketQuery.isLoading,
    isBalanceLoading: balanceQuery.isLoading,
    isBalanceFetching: balanceQuery.isFetching,
    isRefetchingCrypto:
      marketQuery.isRefetching || balanceQuery.isRefetching,
    refetchMarket: marketQuery.refetch,
    refetchBalance: balanceQuery.refetch,
  };
};

const mapChartResponseToState = (response: IUserCryptoChartResponse) => {
  const data = response?.data;
  const items = data?.items ?? [];
  const chartData = items
    .map((item) => {
      const y = Number(item?.close ?? 0);
      return {
        x: item?.timestamp,
        y: Number.isFinite(y) ? y : 0,
        date: new Date(item?.timestamp).toISOString(),
      };
    })
    .sort((a, b) => a.x - b.x);

  const latestPrice = Number(data?.latest_price ?? 0);
  const latestHigh = Number(data?.latest_high ?? 0);
  const latestLow = Number(data?.latest_low ?? 0);

  return {
    latestPrice: Number.isFinite(latestPrice) ? latestPrice : 0,
    latestHigh: Number.isFinite(latestHigh) ? latestHigh : 0,
    latestLow: Number.isFinite(latestLow) ? latestLow : 0,
    chartData,
  };
};

export const useUserCryptoChart = (
  currency: string,
  fiat: string = "USD",
  period: ChartPeriodTab = "1D"
) => {
  return useQuery<{
    latestPrice: number;
    latestHigh: number;
    latestLow: number;
    chartData: IUserCryptoChartPoint[];
  }>({
    queryKey: [...cryptoKeys.all, "userCryptoChart", currency, fiat, period] as const,
    queryFn: async () => {
      const qs = buildCryptoChartQueryString(currency, fiat, period);
      const response = await userApiClient.get<IUserCryptoChartResponse>(qs);
      return mapChartResponseToState(response);
    },
    enabled: !!currency,
    staleTime: queryStaleTime.INSTANT_STALE_TIME,
    gcTime: CRYPTO_LIST_GC_TIME_MS,
  });
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
    queryKey: [...cryptoKeys.cryptoBalanceFortress(), isFortress],
    queryFn: async () => {
      return await apiClient.get<ApiResponse<any>>(url);
    },
    staleTime: CRYPTO_LIST_STALE_TIME_MS,
    gcTime: CRYPTO_LIST_GC_TIME_MS,
  });
};

/**
 * Hook to get asset list from new API
 */
export const useGetAssetList = () => {
  return useQuery<ApiResponse<any>>({
    queryKey: [...cryptoKeys.all, "assetList"] as const,
    queryFn: async () => {
      return await apiClient.get<ApiResponse<any>>(AUTH.ASSET_LIST);
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
  disclaimer: string;
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
  return useMutation<ApiResponse<any>, Error, CryptoTransferPayload>({
    mutationFn: async (payload) => {
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

/**
 * Hook to send crypto withdrawal via FastAPI payment-transactions endpoint.
 */
export const usePaymentTransactionSend = () => {
  return useMutation<
    PaymentTransactionSendResponse,
    any,
    PaymentTransactionSendPayload & { idempotencyKey: string }
  >({
    // Money movement is not idempotent — never auto-retry. Pinned here as well as on
    // the QueryClient so a change to the global default can't silently re-arm it.
    retry: 0,
    mutationFn: async ({ idempotencyKey, ...payload }) => {
      return await userApiClient.post<PaymentTransactionSendResponse>(
        USER_AUTH.PAYMENT_TRANSACTIONS_SEND,
        payload,
        false,
        { "Idempotency-Key": idempotencyKey }
      );
    },
  });
};

export type PaymentTransactionHistoryActivity =
  | "all"
  | "send"
  | "trade"
  | "ramp"
  | "offramp"
  | "request"
  | "receive";
export type PaymentTransactionHistoryType = "internal" | "external";
export type PaymentTransactionHistoryScope = "all" | "sent" | "received";
/** `status`/`sendStatus` — applies to `send` activity only. */
export type PaymentTransactionHistoryStatus = "PENDING" | "SUCCESS" | "FAILED";
export type PaymentTransactionHistoryTradeSide = "buy" | "sell";
/** `requestStatus` — applies to `request` activity only. */
export type PaymentTransactionHistoryRequestStatus =
  | "PENDING"
  | "FULFILLED"
  | "DECLINED"
  | "CANCELLED"
  | "EXPIRED";
/** `receiveStatus` — applies to `receive` activity only. Note: COMPLETED, not SUCCESS. */
export type PaymentTransactionHistoryReceiveStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED";

/**
 * Filters for GET /api/v1/payment-transactions/send/history/.
 *
 * IMPORTANT: the status-ish filters are scoped to a single activity bucket by the
 * backend — `type`/`status` only affect `send`, `tradeSide` only `trade`,
 * `requestStatus` only `request`, `receiveStatus` only `receive`, `rampStatus` only
 * `ramp`. Sending them alongside a different (or `all`) activity silently does
 * nothing, so callers should only set the ones matching the chosen activity.
 */
export interface PaymentTransactionHistoryFilters {
  activity?: PaymentTransactionHistoryActivity;
  /** 1-200, default 50. */
  limit?: number;
  /** send only. */
  type?: PaymentTransactionHistoryType;
  scope?: PaymentTransactionHistoryScope;
  /** send only. */
  status?: PaymentTransactionHistoryStatus;
  /** trade only. */
  tradeSide?: PaymentTransactionHistoryTradeSide;
  /** request only. */
  requestStatus?: PaymentTransactionHistoryRequestStatus;
  /** receive only. */
  receiveStatus?: PaymentTransactionHistoryReceiveStatus;
  /** ramp (cash on-ramp) only. */
  rampStatus?: string;
  /** ISO 8601 datetime. */
  startDate?: string;
  /** ISO 8601 datetime. */
  endDate?: string;
}

export const usePaymentTransactionHistory = (
  filters: PaymentTransactionHistoryFilters = {}
) => {
  const {
    activity = "all",
    limit = 50,
    type,
    scope = "all",
    status,
    tradeSide,
    requestStatus,
    receiveStatus,
    rampStatus,
    startDate,
    endDate,
  } = filters;

  return useQuery<SendHistoryResponse>({
    queryKey: cryptoKeys.paymentTransactionHistory({
      activity,
      limit,
      type,
      scope,
      status,
      tradeSide,
      requestStatus,
      receiveStatus,
      rampStatus,
      startDate,
      endDate,
    }),
    queryFn: () => {
      const params = new URLSearchParams();
      params.set("limit", String(Math.min(Math.max(limit, 1), 200)));
      params.set("scope", scope);
      if (activity && activity !== "all") params.set("activity", activity);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      // Each of these only has an effect on its own activity bucket — send only the
      // one matching the chosen activity so stale/irrelevant params can't leak through.
      if (activity === "send") {
        if (type) params.set("type", type);
        if (status) params.set("status", status);
      }
      if (activity === "trade" && tradeSide) params.set("tradeSide", tradeSide);
      if (activity === "request" && requestStatus) params.set("requestStatus", requestStatus);
      if (activity === "receive" && receiveStatus) params.set("receiveStatus", receiveStatus);
      if (activity === "ramp" && rampStatus) params.set("rampStatus", rampStatus);

      return userApiClient.get<SendHistoryResponse>(
        `${USER_AUTH.PAYMENT_TRANSACTIONS_SEND_HISTORY}?${params.toString()}`
      );
    },
    // History is safe to show briefly stale; 30s freshness with background refresh.
    staleTime: queryStaleTime.FAST_STALE_TIME,
  });
};

// ---------------------------------------------------------------------------
// Coinme trade execute (FastAPI)
// ---------------------------------------------------------------------------

export type CoinmeTradeType = "buy" | "sell";

export interface CoinmeTradeExecutePayload {
  tradeType: CoinmeTradeType;
  /** Wallet chain, e.g. "ETH". */
  chain: string;
  /** Asset symbol, e.g. "BTC". */
  cryptoCurrencyCode: string;
  /** Fiat code, e.g. "USD". */
  fiatCurrencyCode: string;
  /** Amount as string (decimal). */
  amountValue: string;
  /** Either fiatCurrencyCode (for buy) or cryptoCurrencyCode (for sell). */
  amountCurrencyCode: string;
  paymentMethodId: string;
  sourceWalletAddress: string;
  /** From `PayAiroCoinmeRisk.getPartnerSessionTag()` — the one value that must
   *  be regenerated per trade. */
  webSessionId: string;
}

export interface CoinmeTradeExecuteResponse {
  ok?: boolean;
  status?: boolean;
  message?: string;
  data?: any;
  errorResponse?: unknown;
}

/**
 * Execute a Coinme buy / sell trade via the new FastAPI endpoint.
 * Must be called after the Coinme Risk SDK has produced a fresh
 * `webSessionId` for this transaction (see `fetchWebSessionId`).
 */
export const useCoinmeTradeExecute = () => {
  return useMutation<
    CoinmeTradeExecuteResponse,
    Error,
    CoinmeTradeExecutePayload & { idempotencyKey: string }
  >({
    // Money movement is not idempotent — never auto-retry. Pinned here as well as on
    // the QueryClient so a change to the global default can't silently re-arm it.
    retry: 0,
    mutationFn: async ({ idempotencyKey, ...payload }) => {
      const fingerprint = await getDeviceFingerprint();
      return await userApiClient.post<CoinmeTradeExecuteResponse>(
        USER_AUTH.COINME_TRADE_EXECUTE,
        payload,
        false,
        {
          "x-device-fingerprint": fingerprint,
          "Idempotency-Key": idempotencyKey,
        }
      );
    },
  });
};

// ---------------------------------------------------------------------------
// Coinme trade quote (FastAPI) — fee breakdown for pre-transaction disclosure
// ---------------------------------------------------------------------------

export interface CoinmeTradeQuotePayload {
  tradeType: CoinmeTradeType;
  /** Wallet chain, e.g. "ETH". */
  chain: string;
  /** Asset symbol, e.g. "BTC". */
  cryptoCurrencyCode: string;
  /** Fiat code, e.g. "USD". */
  fiatCurrencyCode: string;
  /** Amount as string (decimal). */
  amountValue: string;
  /** Either fiatCurrencyCode (for buy) or cryptoCurrencyCode (for sell). */
  amountCurrencyCode: string;
}

export interface CoinmeFeeField {
  key: string;
  label: string;
  value: string;
}

export interface CoinmeFeeBreakdown {
  tradeType: string;
  quoteId: string;
  youPay: string;
  youReceive: string;
  youReceiveCurrency: string;
  currency: string;
  cardProcessingFee: string;
  transactionFees: string;
  instantWithdrawalFee: string;
  total: string;
  cryptoAsset: string;
  cryptoPrice: string;
  spreadAmount?: string;
  spreadCurrencyCode?: string;
  /** All-in fee incl. spread ("Total Cost (Inc. Spread)"). Returned by the API but
   *  historically missing from this interface. Also present as fields[key==='final_fee']. */
  finalFee?: string;
  fields: CoinmeFeeField[];
}

/**
 * The "expected fee" to surface in pre-trade summaries — the all-in fee incl. spread
 * (`finalFee` / the `final_fee` field). Returns null when unavailable so callers can
 * hide the row rather than show a wrong/zero fee.
 */
export const getExpectedFeeUsd = (
  fb?: CoinmeFeeBreakdown | null
): number | null => {
  if (!fb) return null;
  const direct = Number(fb.finalFee);
  if (Number.isFinite(direct)) return direct;
  const field = fb.fields?.find((f) => f.key === "final_fee")?.value;
  const parsed = Number(String(field ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * Human-readable message from a failed trade-quote request (e.g. the 400
 * "USDC wallet doesn't have enough balance…"). Reads the backend's own message so
 * the user sees why the quote/trade can't proceed instead of a silent no-op.
 */
export const getCoinmeTradeQuoteErrorMessage = (error: unknown): string => {
  const data = (
    error as {
      response?: { data?: { message?: string; error?: { message?: string } } };
    }
  )?.response?.data;
  return data?.message || data?.error?.message || "Unable to load fee details.";
};

export interface CoinmeTradeQuoteResponse {
  ok?: boolean;
  message?: string;
  feeBreakdown?: CoinmeFeeBreakdown;
  quote?: unknown;
  data?: unknown;
  meta?: unknown;
}

/**
 * Fetch a Coinme trade quote (fee breakdown) for the pre-transaction disclosure.
 * Display/acknowledgment only — does not lock or execute the trade.
 */
export const useCoinmeTradeQuote = (
  payload: CoinmeTradeQuotePayload,
  enabled: boolean = true
) => {
  return useQuery<CoinmeTradeQuoteResponse>({
    queryKey: cryptoKeys.coinmeTradeQuote(payload),
    queryFn: () =>
      userApiClient.post<CoinmeTradeQuoteResponse>(USER_AUTH.COINME_TRADE_QUOTE, payload),
    enabled,
    staleTime: 0,
    gcTime: 0,
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
        dispatch(setAggregatedCryptoBalances(result?.data?.aggregated_balance || {}));
        // console.log("result?.data?.aggregated_balance =>", JSON.stringify(result?.data?.aggregated_balance, null, 2));
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
      // Convert payload to FormData
      const formData = new FormData();
      formData.append("asset", payload.asset);
      
      return await apiClient.post<ApiResponse<DepositAddressResponse>>(
        AUTH.DEPOSIT_ADDRESS,
        formData,
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

/**
 * Hook to refresh crypto balance for the currently selected currency
 * This updates Redux state and MMKV storage with the latest balance
 */
export const useRefreshCryptoBalance = () => {
  const dispatch = useDispatch();
  const { selectCurrency } = useSelectCryptoCurrency();
  const selectedCurrency = useSelector((state: any) => state.authenticationSlice.selectedCurrency);

  const refreshBalance = async (currencySymbol?: string) => {
    try {
      // Use provided symbol or fall back to selectedCurrency from Redux
      const symbol = currencySymbol || selectedCurrency?.symbol;
      
      if (!symbol) {
        console.log("No currency symbol provided for balance refresh");
        return null;
      }

      // Fetch the updated balance
      const result = await selectCurrency(symbol);

      if (result?.data) {
        // Update Redux state
        dispatch(setTotalDisbursable(result.data.rounded_balance));
        dispatch(setCryptoData(result.data));

        // Update MMKV storage for persistence
        setItem(STORAGE_KEYS.TOTAL_DISBURSABLE, JSON.stringify(result.data.rounded_balance));
        setItem(STORAGE_KEYS.CRYPTO_DATA, JSON.stringify(result.data));

        return result.data;
      }

      return null;
    } catch (error) {
      console.log("Error refreshing crypto balance:", error);
      throw error;
    }
  };

  return {
    refreshBalance,
  };
};

export const useCryptoMarketData = (vs_currency: string, ids: string) => {
  return useQuery<ApiResponse<any> | any[]>({
    queryKey: [...cryptoKeys.cryptoMarketData(), vs_currency, ids], // Include parameters in query key for unique caching
    queryFn: async () => {
      const response = await apiClient.get<any>(`${AUTH.CRYPTO_MARKET_DATA}?vs_currency=${vs_currency}&ids=${ids}` );
      return response;
    },
    enabled: !!ids && !!vs_currency, // Only run query if both parameters are provided
  });
};


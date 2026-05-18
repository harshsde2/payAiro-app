import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { USER_AUTH } from "api/endpoints";
import { userApiClient } from "api/userApiClient";

/**
 * Coinme cash ramp (order template + cash off-ramp). Same `x-device-fingerprint` header as
 * `useCoinmeTradeExecute`. If APIs return 401/403, consider `fetchWebSessionId` + extra headers per backend contract.
 */
const COINME_POST_HEADERS = {
  "x-device-fingerprint": "F785F8D4-82DB-4D8A-9283-30CF2037469D",
};

function unwrapCoinmeBody<T>(raw: unknown): T {
  if (raw && typeof raw === "object" && "Object" in raw) {
    const inner = (raw as { Object?: T }).Object;
    if (inner && typeof inner === "object") return inner;
  }
  return raw as T;
}

export type CoinmeOrderTemplateRequest = {
  debitCurrencyCode: string;
  creditCurrencyCode: string;
  amountValue: string;
  amountCurrencyCode: string;
  locationReference: string;
};

export type CoinmeOrderTemplateTransaction = {
  transactionSystemRef?: string;
  transactionProviderRef?: string;
  debitCurrencyCode?: string;
  creditCurrencyCode?: string;
  creditCurrencyAmount?: string;
  amountValue?: string;
  amountCurrencyCode?: string;
  feesMap?: Record<string, string>;
  providerExclusiveFees?: {
    retailerCustomerFee?: { amount?: string; currency?: string };
  };
  expiryTimestamp?: string;
  chain?: string;
};

export type CoinmeOrderTemplateResponse = {
  ok?: boolean;
  message?: string;
  data?: {
    transactionTemplate?: CoinmeOrderTemplateTransaction;
  };
};

export type CoinmeCashOfframpExecuteRequest = {
  amountValue: string;
  amountCurrencyCode: string;
  locationReference: string;
  sourceWalletAddress: string;
  debitCurrencyCode: string;
  chain: string;
};

export type CoinmeCashOfframpQuote = {
  quoteId?: string;
  debitCurrencyAmount?: string;
  debitCurrencyCode?: string;
  creditCurrencyAmount?: string;
  creditCurrencyCode?: string;
  totalFees?: string;
  feeCurrency?: string;
  feesMap?: Record<string, string>;
  expirationTime?: string;
  chain?: string;
};

export type CoinmeCashOfframpTransaction = {
  partnerTransactionId?: string;
  debitCurrencyAmount?: string;
  debitCurrencyCode?: string;
  creditCurrencyAmount?: string;
  creditCurrencyCode?: string;
  totalFees?: string;
  feeCurrencyCode?: string;
  feesMap?: Record<string, string>;
};

export type CoinmeCashOfframpExecuteResponse = {
  ok?: boolean;
  message?: string;
  data?: {
    quote?: CoinmeCashOfframpQuote;
    transaction?: CoinmeCashOfframpTransaction;
  };
};

export type CoinmeOrderTemplateStatusData = {
  provider_transaction_ref?: string;
  order_template_id?: string;
  order_template_status?: string;
  provider_transaction_status?: string;
  latest_webhook_order_template_status?: string;
  coinme_last_webhook_at?: string;
  template_updated_at?: string;
};

export type CoinmeOrderTemplateStatusResponse = {
  ok?: boolean;
  message?: string;
  error?: { code?: string; message?: string };
  data?: CoinmeOrderTemplateStatusData;
};

export type CoinmeOrderTemplateStatusResult =
  | { kind: "pending" }
  | { kind: "scanned"; data: CoinmeOrderTemplateStatusData };

const ORDER_TEMPLATE_SCANNED_STATUS = "CONSUMED";
const ORDER_TEMPLATE_STATUS_POLL_MS = 5000;

export const coinmeKeys = {
  orderTemplateStatus: (providerTransactionRef: string) =>
    ["coinme", "orderTemplateStatus", providerTransactionRef] as const,
};

function normalizeOrderTemplateStatus(
  body: CoinmeOrderTemplateStatusResponse
): CoinmeOrderTemplateStatusResult {
  const status = (body.data?.order_template_status ?? "").trim().toUpperCase();
  if (body.ok === true && status === ORDER_TEMPLATE_SCANNED_STATUS && body.data) {
    return { kind: "scanned", data: body.data };
  }
  return { kind: "pending" };
}

function isExpectedNotScannedBody(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const b = body as CoinmeOrderTemplateStatusResponse;
  if (b.ok === false && b.error?.code === "NOT_FOUND") return true;
  if (b.ok === false) return true;
  return false;
}

export async function fetchCoinmeOrderTemplateStatus(
  providerTransactionRef: string
): Promise<CoinmeOrderTemplateStatusResult> {
  const ref = providerTransactionRef.trim();
  if (!ref) return { kind: "pending" };

  const url = `${USER_AUTH.COINME_ORDER_TEMPLATE_STATUS}?provider_transaction_ref=${encodeURIComponent(ref)}`;

  try {
    const raw = await userApiClient.get<CoinmeOrderTemplateStatusResponse>(url);
    const body = unwrapCoinmeBody<CoinmeOrderTemplateStatusResponse>(raw);
    return normalizeOrderTemplateStatus(body);
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.data != null) {
      const body = unwrapCoinmeBody<CoinmeOrderTemplateStatusResponse>(e.response.data);
      if (isExpectedNotScannedBody(body)) return { kind: "pending" };
      return normalizeOrderTemplateStatus(body);
    }
    return { kind: "pending" };
  }
}

export function useCoinmeOrderTemplateStatusPoll(
  providerTransactionRef: string,
  enabled: boolean
) {
  const ref = providerTransactionRef.trim();
  return useQuery({
    queryKey: coinmeKeys.orderTemplateStatus(ref),
    queryFn: () => fetchCoinmeOrderTemplateStatus(ref),
    enabled: enabled && ref.length > 0,
    refetchInterval: (query) =>
      query.state.data?.kind === "scanned" ? false : ORDER_TEMPLATE_STATUS_POLL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 4_000,
    gcTime: 5 * 60_000,
    placeholderData: (previousData) => previousData,
  });
}

export const useCoinmeOrderTemplateMutation = () => {
  return useMutation({
    mutationFn: async (body: CoinmeOrderTemplateRequest) => {
      const raw = await userApiClient.post<CoinmeOrderTemplateResponse>(
        USER_AUTH.COINME_ORDER_TEMPLATE,
        body,
        false,
        COINME_POST_HEADERS
      );
      return unwrapCoinmeBody<CoinmeOrderTemplateResponse>(raw);
    },
  });
};

export const useCoinmeCashOfframpExecuteMutation = () => {
  return useMutation({
    mutationFn: async (body: CoinmeCashOfframpExecuteRequest) => {
      const raw = await userApiClient.post<CoinmeCashOfframpExecuteResponse>(
        USER_AUTH.COINME_CASH_OFFRAMP_EXECUTE,
        body,
        false,
        COINME_POST_HEADERS
      );
      return unwrapCoinmeBody<CoinmeCashOfframpExecuteResponse>(raw);
    },
  });
};

export type CoinmeCashOfframpPickupCodeResponse = {
  ok?: boolean;
  message?: string;
  data?: {
    transactionRecordId?: number;
    partnerTransactionId?: string;
    providerTransactionId?: string;
    providerTransactionRef?: string;
    ready?: boolean;
    savedToDatabase?: boolean;
  };
};

const PICKUP_CODE_POLL_MS = 5000;

export const coinmePickupCodeKeys = {
  pickupCode: (partnerTransactionId: string) =>
    ["coinme", "cashOfframpPickupCode", partnerTransactionId] as const,
};

export async function fetchCashOfframpPickupCode(
  partnerTransactionId: string
): Promise<CoinmeCashOfframpPickupCodeResponse> {
  const id = partnerTransactionId.trim();
  if (!id) {
    return { ok: false, message: "Missing transaction id" };
  }
  const url = `${USER_AUTH.COINME_CASH_OFFRAMP_PICKUP_CODE}?partnerTransactionId=${encodeURIComponent(id)}`;
  const raw = await userApiClient.get<CoinmeCashOfframpPickupCodeResponse>(url);
  return unwrapCoinmeBody<CoinmeCashOfframpPickupCodeResponse>(raw);
}

export function useCashOfframpPickupCodePoll(partnerTransactionId: string, enabled: boolean) {
  const id = partnerTransactionId.trim();
  return useQuery({
    queryKey: coinmePickupCodeKeys.pickupCode(id),
    queryFn: () => fetchCashOfframpPickupCode(id),
    enabled: enabled && id.length > 0,
    refetchInterval: (query) => {
      const ready = query.state.data?.data?.ready === true;
      return ready ? false : PICKUP_CODE_POLL_MS;
    },
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    staleTime: 2_000,
  });
}

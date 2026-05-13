import { useMutation } from "@tanstack/react-query";
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

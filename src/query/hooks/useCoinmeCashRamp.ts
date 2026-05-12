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

export type CoinmeOrderTemplateRequest = {
  debitCurrencyCode: string;
  creditCurrencyCode: string;
  amountValue: string;
  amountCurrencyCode: string;
  locationReference: string;
};

export type CoinmeOrderTemplateTransaction = {
  transactionSystemRef?: string;
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
    mutationFn: (body: CoinmeOrderTemplateRequest) =>
      userApiClient.post<CoinmeOrderTemplateResponse>(
        USER_AUTH.COINME_ORDER_TEMPLATE,
        body,
        false,
        COINME_POST_HEADERS
      ),
  });
};

export const useCoinmeCashOfframpExecuteMutation = () => {
  return useMutation({
    mutationFn: (body: CoinmeCashOfframpExecuteRequest) =>
      userApiClient.post<CoinmeCashOfframpExecuteResponse>(
        USER_AUTH.COINME_CASH_OFFRAMP_EXECUTE,
        body,
        false,
        COINME_POST_HEADERS
      ),
  });
};

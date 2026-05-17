export type SendHistoryDirection = "sent" | "received";
export type SendHistoryStatus = "PENDING" | "COMPLETED" | "FAILED" | "SUCCESS" | string;

export interface SendHistoryParty {
  userId: number | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  customerId: string | null;
  sourceWalletAddress?: string | null;
  destinationWalletAddress?: string | null;
}

/** CaaS trade row from unified activity history. */
export interface ActivityTradeItem {
  activity: "TRADE_BUY" | "TRADE_SELL";
  id: number;
  chain: string;
  createdAt: string;
  source: string;
  providerTransactionId?: string | null;
  amountCurrencyCode: string;
  amountValue: string;
  cryptoCurrencyCode: string;
  fiatCurrencyCode: string;
  tradeType: "buy" | "sell";
  customerId?: string | null;
  paymentMethodId?: string | null;
  quoteId?: string | null;
}

/** Crypto send / receive row from unified activity history. */
export interface ActivitySendItem {
  activity?: "SEND";
  id: number;
  chain?: string | null;
  createdAt: string;
  source?: string;
  amount?: string;
  currency?: string | null;
  direction: SendHistoryDirection;
  sentBy?: SendHistoryParty | null;
  sentTo?: SendHistoryParty | null;
  destinationWalletAddress?: string | null;
  providerTransactionId?: string | null;
  providerStatus?: string | null;
  providerErrorCode?: string | null;
  providerErrorMessage?: string | null;
  status?: SendHistoryStatus;
  type?: string | null;
  sendType?: string | null;
  updatedAt?: string;
}

/** Coinme cash buy (order template) row from unified activity history. */
export interface ActivityCashOnRampQuoteDetails {
  status?: string | null;
  active?: boolean;
  amountValue?: string;
  amountCurrencyCode?: string;
  debitCurrencyCode?: string;
  creditCurrencyCode?: string;
  creditCurrencyAmount?: string;
  debitCurrencyUnitPrice?: string;
  expiryTimestamp?: string;
  feesMap?: Record<string, string>;
  providerExclusiveFees?: {
    retailerCustomerFee?: { amount?: string; currency?: string; assetId?: string };
  };
  transactionProviderRef?: string;
  transactionSystemRef?: string;
}

export interface ActivityCashOnRampItem {
  activity: "CASH_ONRAMP";
  id: number;
  chain: string;
  createdAt: string;
  updatedAt?: string;
  source?: string;
  status?: string | null;
  active?: boolean;
  purpose?: string;
  tradeType?: "buy" | "sell";
  amountValue: string;
  amountCurrencyCode: string;
  debitCurrencyCode: string;
  creditCurrencyCode: string;
  creditCurrencyAmount?: string;
  debitCurrencyUnitPrice?: string;
  locationReference?: string | null;
  transactionProviderRef?: string | null;
  transactionSystemRef?: string | null;
  expiryTimestamp?: string | null;
  feesMap?: Record<string, string>;
  providerExclusiveFees?: {
    retailerCustomerFee?: { amount?: string; currency?: string; assetId?: string };
  };
  providerTransactionStatus?: string | null;
  quote?: {
    details?: ActivityCashOnRampQuoteDetails;
    partnerResponse?: {
      data?: { transactionTemplate?: Record<string, unknown> };
    };
    transactionProviderRef?: string;
    transactionSystemRef?: string;
  };
}

export type RecentActivityItem =
  | ActivityTradeItem
  | ActivitySendItem
  | ActivityCashOnRampItem;

/** @deprecated Use RecentActivityItem */
export type SendHistoryItem = RecentActivityItem;

export interface SendHistoryResponse {
  data: {
    filters: {
      type: string | null;
      scope: string;
      status: string | null;
      limit: number;
    };
    items: RecentActivityItem[];
  };
  errorResponse: unknown;
}

export interface IRecentActivityCardProps {
  item: RecentActivityItem;
  /** USD unit price for the crypto asset (SEND: currency/chain; TRADE_SELL: cryptoCurrencyCode). */
  usdPrice?: number;
  onPress?: (item: RecentActivityItem) => void;
}

export function isTradeActivity(item: RecentActivityItem): item is ActivityTradeItem {
  return item.activity === "TRADE_BUY" || item.activity === "TRADE_SELL";
}

export function isCashOnRampActivity(
  item: RecentActivityItem
): item is ActivityCashOnRampItem {
  return String(item.activity ?? "").toUpperCase() === "CASH_ONRAMP";
}

export function isSendActivity(item: RecentActivityItem): item is ActivitySendItem {
  return !isTradeActivity(item) && !isCashOnRampActivity(item);
}

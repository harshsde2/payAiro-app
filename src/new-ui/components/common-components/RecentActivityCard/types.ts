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

export interface ActivityCashOffRampQuoteDetails {
  chain?: string | null;
  feesMap?: Record<string, string>;
  debitCurrencyCode?: string;
  creditCurrencyCode?: string;
  debitCurrencyAmount?: string;
  creditCurrencyAmount?: string;
  debitCurrencyUnitPrice?: string;
  creditCurrencyUnitPrice?: string;
  totalFees?: string;
}

export interface ActivityCashOffRampItem {
  activity: "CASH_OFFRAMP";
  id: number;
  chain: string;
  createdAt: string;
  updatedAt?: string;
  source?: string;
  status?: string | null;
  orderStatus?: string | null;
  purpose?: string;
  tradeType?: "buy" | "sell";
  customerId?: string | null;
  quoteId?: string | null;
  paymentMethodId?: string | null;
  providerTransactionId?: string | null;
  providerTransactionRef?: string | null;
  cryptoCurrencyCode?: string;
  fiatCurrencyCode?: string;
  amountValue: string;
  amountCurrencyCode: string;
  cashTrackingStatus?: string | null;
  refundStatus?: string | null;
  locationReference?: string | null;
  locationDescription?: string | null;
  locationAddress?: string | null;
  locationHours?: string | null;
  feesMap?: Record<string, string>;
  quote?: {
    details?: ActivityCashOffRampQuoteDetails;
    request?: {
      locationReference?: string | null;
      chain?: string | null;
    };
  };
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
  | ActivityCashOnRampItem
  | ActivityCashOffRampItem;

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

export function isCashOffRampActivity(
  item: RecentActivityItem
): item is ActivityCashOffRampItem {
  return String(item.activity ?? "").toUpperCase() === "CASH_OFFRAMP";
}

export function isSendActivity(item: RecentActivityItem): item is ActivitySendItem {
  return !isTradeActivity(item) && !isCashOnRampActivity(item) && !isCashOffRampActivity(item);
}

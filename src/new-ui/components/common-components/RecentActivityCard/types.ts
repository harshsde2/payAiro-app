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

export interface ActivityTradeQuoteDetails {
  debitCurrencyAmount?: string;
  debitCurrencyCode?: string;
  creditCurrencyAmount?: string;
  creditCurrencyCode?: string;
  debitCurrencyUnitPrice?: string;
  totalFees?: string;
}

/** A single label/value line on a state regulatory receipt. */
export interface RegulatoryReceiptField {
  key: string;
  label: string;
  value: string;
}

/**
 * State-aware regulatory receipt served per trade on the unified history API.
 * The backend builds the correct field set + footer per state (CT/MN/CA), so the
 * app renders it verbatim.
 */
export interface RegulatoryReceipt {
  headerMessage: string | null;
  receiptFields: RegulatoryReceiptField[];
  receiptFooter: string;
  stateCode: string;
  transactionStatus: string;
  transactionType: string;
}

/**
 * Coinme fee breakdown stored on a completed trade. `youPay` is the fiat the user
 * actually paid (buys) — unlike the regulatory receipt's `total`, it does NOT add the
 * fees on top (the fees come out of that amount).
 * NOTE: Coinme reports the crypto side as 0 for sells, so `youPay` can be "0" there —
 * always fall back to the transaction's own amount when it isn't a positive number.
 */
export interface ActivityFeeBreakdown {
  tradeType?: string;
  youPay?: string;
  youReceive?: string;
  youReceiveCurrency?: string;
  currency?: string;
  total?: string;
  transactionFees?: string;
  cardProcessingFee?: string;
  instantWithdrawalFee?: string;
  finalFee?: string;
  cryptoAsset?: string;
  cryptoPrice?: string;
  fields?: { key: string; label: string; value: string }[];
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
  status?: string | null;
  orderStatus?: string | null;
  purpose?: string;
  lastWebhookAt?: string | null;
  customerId?: string | null;
  paymentMethodId?: string | null;
  quoteId?: string | null;
  quote?: {
    tradeType?: "buy" | "sell";
    details?: ActivityTradeQuoteDetails;
  };
  feeBreakdown?: ActivityFeeBreakdown | null;
  regulatoryReceipt?: RegulatoryReceipt | null;
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
  activity?: "CASH_ONRAMP" | string;
  id: number;
  chain: string;
  createdAt: string;
  updatedAt?: string;
  source?: string;
  status?: string | null;
  active?: boolean;
  sealed?: boolean;
  purpose?: string;
  tradeType?: "buy" | "sell";
  latestWebhookOrderTemplateStatus?: string | null;
  latest_webhook_order_template_status?: string | null;
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
  const activity = String(item.activity ?? "").toUpperCase();
  if (activity === "CASH_ONRAMP") return true;
  const row = item as ActivityCashOnRampItem;
  const purpose = String(row.purpose ?? "").toLowerCase();
  if (purpose === "cash_onramp") return true;
  const source = String(row.source ?? "").toLowerCase();
  return source === "coinme_order_template" && row.tradeType === "buy";
}

export function isCashOffRampActivity(
  item: RecentActivityItem
): item is ActivityCashOffRampItem {
  return String(item.activity ?? "").toUpperCase() === "CASH_OFFRAMP";
}

export function isSendActivity(item: RecentActivityItem): item is ActivitySendItem {
  return !isTradeActivity(item) && !isCashOnRampActivity(item) && !isCashOffRampActivity(item);
}

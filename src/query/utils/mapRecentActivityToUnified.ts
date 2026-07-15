import type { RecentActivityItem, SendHistoryParty } from "new-ui/components/common-components/RecentActivityCard/types";
import {
  isCashOffRampActivity,
  isCashOnRampActivity,
  isTradeActivity,
} from "new-ui/components/common-components/RecentActivityCard/types";
import { mapCashOnRampToUnified } from "new-ui/components/common-components/RecentActivityCard/cashOnRampActivity";
import { mapCashOffRampToUnified } from "new-ui/components/common-components/RecentActivityCard/cashOffRampActivity";
import {
  resolveTradeDisplayStatus,
  tradeDisplayStatusToUnified,
} from "new-ui/components/common-components/RecentActivityCard/tradeActivity";
import type {
  IDisplayParty,
  ITransactionParty,
  IUnifiedTransaction,
  UnifiedTransactionStatus,
  UnifiedTransactionType,
} from "screens/TSX-Screens/UnifiedTransactions/types";

const toUnifiedStatus = (status?: string): UnifiedTransactionStatus => {
  const normalized = String(status ?? "").toLowerCase();
  if (normalized === "pending" || normalized === "processing") return normalized;
  if (normalized === "failed" || normalized === "cancelled") return normalized;
  if (normalized === "complete" || normalized === "completed") return "complete";
  if (normalized === "success" || normalized === "succeeded") return "success";
  return "complete";
};

const toTransactionParty = (
  party?: SendHistoryParty | null
): ITransactionParty | null => {
  if (!party) return null;
  const username = party.username ?? null;
  return {
    user_id: String(party.userId ?? ""),
    username,
    email: username ? `${username}@payairo.local` : "",
    profile_photo: null,
    wallet_address:
      party.sourceWalletAddress ?? party.destinationWalletAddress ?? null,
    bank_name: null,
    account_number_masked: null,
  };
};

const getDisplayParty = (
  sender: ITransactionParty | null,
  recipient: ITransactionParty | null,
  isIncoming: boolean
): IDisplayParty => {
  const selected = isIncoming ? sender : recipient;
  return {
    username: selected?.username ?? "Unknown",
    profile_photo: selected?.profile_photo ?? null,
    identifier:
      selected?.username ??
      selected?.wallet_address ??
      selected?.email ??
      "Unknown",
  };
};

const getCurrencySymbol = (currency?: string | null): string => {
  const c = String(currency ?? "").toUpperCase();
  if (c === "USD") return "$";
  return c || "$";
};

export const mapRecentActivityToUnified = (
  item: RecentActivityItem
): IUnifiedTransaction => {
  if (isCashOnRampActivity(item)) {
    return mapCashOnRampToUnified(item);
  }

  if (isCashOffRampActivity(item)) {
    return mapCashOffRampToUnified(item);
  }

  if (isTradeActivity(item)) {
    const isSell = item.activity === "TRADE_SELL" || item.tradeType === "sell";
    const transactionType: UnifiedTransactionType = isSell
      ? "crypto_sell"
      : "crypto_buy";
    const currency = item.amountCurrencyCode || item.fiatCurrencyCode || "USD";
    const spendUpper = String(item.amountCurrencyCode ?? "").toUpperCase();
    const fiatUpper = String(item.fiatCurrencyCode ?? "USD").toUpperCase();
    const cryptoUpper = String(item.cryptoCurrencyCode ?? "").toUpperCase();
    const buyUsdValue =
      !isSell &&
      (spendUpper === "USD" ||
        spendUpper === fiatUpper ||
        (cryptoUpper.length > 0 && spendUpper === cryptoUpper && fiatUpper === "USD"))
        ? String(item.amountValue ?? "0")
        : null;

    const tradeStatus = tradeDisplayStatusToUnified(resolveTradeDisplayStatus(item));

    return {
      transaction_id: item.providerTransactionId || String(item.id),
      transaction_type: transactionType,
      transaction_category: "crypto",
      status: tradeStatus,
      amount: String(item.amountValue ?? "0"),
      final_amount: String(item.amountValue ?? "0"),
      currency,
      currency_symbol: getCurrencySymbol(currency),
      created_at: item.createdAt,
      updated_at: item.createdAt,
      fee: {
        amount: "0",
        percentage: "0",
        currency,
      },
      sender: null,
      recipient: null,
      direction: isSell ? "incoming" : "outgoing",
      display_party: {
        username: "Trade",
        profile_photo: null,
        identifier: item.source || "Trade",
      },
      crypto_details: {
        from_currency: isSell ? item.cryptoCurrencyCode : item.fiatCurrencyCode,
        to_currency: isSell ? item.fiatCurrencyCode : item.cryptoCurrencyCode,
        network: item.chain,
        tx_hash: item.providerTransactionId || null,
        from_address: null,
        to_address: null,
        token: item.cryptoCurrencyCode,
        icon_url: null,
        exchange_rate: null,
        usd_value: buyUsdValue,
      },
      bank_details: null,
      merchant_details: null,
      card_details: null,
      note: null,
      category: null,
      tags: [],
      refund_details: null,
      regulatory_receipt: item.regulatoryReceipt ?? null,
      fee_breakdown: item.feeBreakdown ?? null,
    };
  }

  const isIncoming = item.direction === "received";
  const sender = toTransactionParty(item.sentBy);
  const recipient = toTransactionParty(item.sentTo);
  const currency = item.currency ?? item.chain ?? "USD";
  const token = item.currency ?? item.chain ?? null;
  const mappedStatus = toUnifiedStatus(item.status);

  return {
    transaction_id: item.providerTransactionId || String(item.id),
    transaction_type: isIncoming ? "crypto_receive" : "crypto_send",
    transaction_category: "crypto",
    status: mappedStatus,
    amount: String(item.amount ?? "0"),
    final_amount: String(item.amount ?? "0"),
    currency,
    currency_symbol: getCurrencySymbol(currency),
    created_at: item.createdAt,
    updated_at: item.updatedAt ?? item.createdAt,
    fee: {
      amount: "0",
      percentage: "0",
      currency,
    },
    sender,
    recipient,
    direction: isIncoming ? "incoming" : "outgoing",
    display_party: getDisplayParty(sender, recipient, isIncoming),
    crypto_details: {
      from_currency: null,
      to_currency: token,
      network: item.chain ?? null,
      tx_hash: item.providerTransactionId ?? null,
      from_address: item.sentBy?.sourceWalletAddress ?? null,
      to_address: item.destinationWalletAddress ?? item.sentTo?.destinationWalletAddress ?? null,
      token,
      icon_url: null,
      exchange_rate: null,
      usd_value: null,
    },
    bank_details: null,
    merchant_details: null,
    card_details: null,
    note: null,
    category: null,
    tags: [],
    refund_details: null,
    regulatory_receipt: null,
  };
};

export default mapRecentActivityToUnified;

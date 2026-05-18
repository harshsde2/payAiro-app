/**
 * CASH_OFFRAMP history status mapping (tune with backend when enums are documented):
 * - EXPIRED → expired (card non-pressable)
 * - ERROR / refund ERROR → error
 * - FAILED → failed
 * - COMPLETED | CONSUMED | PICKED_UP → completed
 * - READY | CONFIRMED + providerTransactionRef → ready
 * - PROCESSING | PENDING | GENERATING | CONFIRMED without ref → processing
 */
import type {
  CashOffRampDisplayKind,
  ICashOffRampDetails,
  IUnifiedTransaction,
  UnifiedTransactionStatus,
} from "screens/TSX-Screens/UnifiedTransactions/types";
import { formatReadyCodeDisplay } from "@new-ui/screens/CashRamp/Sell/sellFlow.utils";
import {
  CASH_OFFRAMP_CARD_TITLE,
  CASH_OFFRAMP_PROCESSING_MESSAGE,
  CASH_OFFRAMP_STATUS_LABEL,
} from "@new-ui/screens/CashRamp/cashOffRampCopy";
import type { ActivityCashOffRampItem } from "./types";
import { isCashOffRampActivity } from "./types";

export type CashOffRampDisplayStatus = {
  kind: CashOffRampDisplayKind;
  label: string;
  colorKey: "warning" | "error" | "success";
};

function normalizeTracking(item: ActivityCashOffRampItem): string {
  return String(
    item.cashTrackingStatus ?? item.orderStatus ?? item.status ?? ""
  )
    .trim()
    .toUpperCase();
}

function normalizeRefund(item: ActivityCashOffRampItem): string {
  return String(item.refundStatus ?? "").trim().toUpperCase();
}

function hasReadyCodeRef(item: ActivityCashOffRampItem): boolean {
  return Boolean(String(item.providerTransactionRef ?? "").trim());
}

export function resolveCashOffRampDisplayStatus(
  item: ActivityCashOffRampItem
): CashOffRampDisplayStatus {
  const tracking = normalizeTracking(item);
  const refund = normalizeRefund(item);

  if (refund === "ERROR" || tracking === "ERROR") {
    return { kind: "error", label: CASH_OFFRAMP_STATUS_LABEL.error, colorKey: "error" };
  }
  if (tracking === "EXPIRED") {
    return { kind: "expired", label: CASH_OFFRAMP_STATUS_LABEL.expired, colorKey: "error" };
  }
  if (tracking === "FAILED") {
    return { kind: "failed", label: CASH_OFFRAMP_STATUS_LABEL.failed, colorKey: "error" };
  }
  if (
    tracking === "COMPLETED" ||
    tracking === "CONSUMED" ||
    tracking === "PICKED_UP"
  ) {
    return { kind: "completed", label: CASH_OFFRAMP_STATUS_LABEL.completed, colorKey: "success" };
  }
  if (tracking === "READY" || (tracking === "CONFIRMED" && hasReadyCodeRef(item))) {
    return { kind: "ready", label: CASH_OFFRAMP_STATUS_LABEL.ready, colorKey: "warning" };
  }
  if (hasReadyCodeRef(item) && tracking !== "PROCESSING" && tracking !== "PENDING") {
    return { kind: "ready", label: CASH_OFFRAMP_STATUS_LABEL.ready, colorKey: "warning" };
  }
  if (
    tracking === "PROCESSING" ||
    tracking === "PENDING" ||
    tracking === "GENERATING" ||
    tracking === "" ||
    (tracking === "CONFIRMED" && !hasReadyCodeRef(item))
  ) {
    return {
      kind: "processing",
      label: CASH_OFFRAMP_STATUS_LABEL.processing,
      colorKey: "warning",
    };
  }

  return {
    kind: "processing",
    label: CASH_OFFRAMP_STATUS_LABEL.processing,
    colorKey: "warning",
  };
}

export function getCashOffRampCardTitle(): string {
  return CASH_OFFRAMP_CARD_TITLE;
}

export function formatCashOffRampFiatAmount(item: ActivityCashOffRampItem): string {
  const amt = Number.parseFloat(item.amountValue ?? "0");
  const code = (item.amountCurrencyCode ?? "USD").toUpperCase();
  const formatted = Number.isFinite(amt) ? amt.toFixed(2) : item.amountValue ?? "0";
  if (code === "USD") return `$${formatted}`;
  return `${formatted} ${code}`;
}

export function formatCashOffRampCryptoAmount(item: ActivityCashOffRampItem): string {
  const details = item.quote?.details;
  const amt = details?.debitCurrencyAmount ?? "0";
  const code = (details?.debitCurrencyCode ?? item.cryptoCurrencyCode ?? "").toUpperCase();
  return code ? `${amt} ${code}` : amt;
}

export function mergeOffRampFeesMap(item: ActivityCashOffRampItem): Record<string, string> {
  const fromItem = item.feesMap ?? {};
  const fromQuote = item.quote?.details?.feesMap ?? {};
  return { ...fromQuote, ...fromItem };
}

function formatUsdValue(value: string | null | undefined): string | null {
  if (!value) return null;
  const n = Number.parseFloat(value);
  if (!Number.isFinite(n)) return null;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function computeTotalSaleUsd(item: ActivityCashOffRampItem): string {
  const base = Number.parseFloat(item.amountValue ?? "0");
  const fm = mergeOffRampFeesMap(item);
  let fees = 0;
  for (const v of Object.values(fm)) {
    const n = Number.parseFloat(v);
    if (Number.isFinite(n)) fees += n;
  }
  const total = (Number.isFinite(base) ? base : 0) + fees;
  return total.toFixed(2);
}

function toUnifiedStatus(kind: CashOffRampDisplayKind): UnifiedTransactionStatus {
  if (kind === "completed" || kind === "ready") return "complete";
  if (kind === "processing") return "processing";
  if (kind === "failed" || kind === "error" || kind === "expired") return "failed";
  return "processing";
}

function buildCashOffRampDetails(item: ActivityCashOffRampItem): ICashOffRampDetails {
  const display = resolveCashOffRampDisplayStatus(item);
  const fm = mergeOffRampFeesMap(item);
  const qd = item.quote?.details;
  const cryptoCode = (qd?.debitCurrencyCode ?? item.cryptoCurrencyCode ?? "").toUpperCase();
  const ref = item.providerTransactionRef ?? null;

  return {
    display_kind: display.kind,
    cash_tracking_status: item.cashTrackingStatus ?? null,
    provider_transaction_ref: ref,
    provider_transaction_id: item.providerTransactionId ?? null,
    location_description: item.locationDescription ?? null,
    location_address: item.locationAddress ?? null,
    location_hours: item.locationHours ?? null,
    sell_method: "ATM",
    ready_code_formatted: ref ? formatReadyCodeDisplay(ref) : null,
    chain_label: item.chain ?? qd?.chain ?? null,
    crypto_code: cryptoCode || null,
    crypto_amount: qd?.debitCurrencyAmount ?? null,
    fiat_code: (item.amountCurrencyCode ?? "USD").toUpperCase(),
    unit_price_usd: qd?.creditCurrencyUnitPrice ?? qd?.debitCurrencyUnitPrice ?? null,
    exchange_fee: fm.exchangeFee ?? fm.exchange_fee ?? null,
    atm_fee: fm.atmFee ?? fm.atm_fee ?? null,
    total_sale_usd: computeTotalSaleUsd(item),
    total_cash_pickup_usd:
      qd?.creditCurrencyAmount ?? item.amountValue ?? null,
    fees_map: fm,
    processing_message: CASH_OFFRAMP_PROCESSING_MESSAGE,
  };
}

export function mapCashOffRampToUnified(item: ActivityCashOffRampItem): IUnifiedTransaction {
  const display = resolveCashOffRampDisplayStatus(item);
  const cashDetails = buildCashOffRampDetails(item);
  const fiat = (item.amountCurrencyCode ?? "USD").toUpperCase();
  const qd = item.quote?.details;
  const crypto = (qd?.debitCurrencyCode ?? item.cryptoCurrencyCode ?? "").toUpperCase();
  const txnId =
    (item.providerTransactionId ?? "").trim() || String(item.id);

  const feeTotal = Object.values(mergeOffRampFeesMap(item)).reduce((sum, v) => {
    const n = Number.parseFloat(v);
    return Number.isFinite(n) ? sum + n : sum;
  }, 0);

  return {
    transaction_id: txnId,
    transaction_type: "cash_offramp",
    transaction_category: "crypto",
    status: toUnifiedStatus(display.kind),
    amount: String(item.amountValue ?? "0"),
    final_amount: cashDetails.total_sale_usd ?? String(item.amountValue ?? "0"),
    currency: fiat,
    currency_symbol: fiat === "USD" ? "$" : fiat,
    created_at: item.createdAt,
    updated_at: item.updatedAt ?? item.createdAt,
    fee: {
      amount: feeTotal > 0 ? feeTotal.toFixed(2) : "0",
      percentage: "0",
      currency: fiat,
    },
    sender: null,
    recipient: null,
    direction: "incoming",
    display_party: {
      username: "ATM Sale",
      profile_photo: null,
      identifier: "ReadyCode ATM",
    },
    crypto_details: {
      from_currency: crypto,
      to_currency: fiat,
      network: item.chain ?? null,
      tx_hash: item.providerTransactionRef ?? null,
      from_address: null,
      to_address: null,
      token: crypto,
      icon_url: null,
      exchange_rate: cashDetails.unit_price_usd ?? null,
      usd_value: String(item.amountValue ?? "0"),
      asset: crypto,
      amount: cashDetails.crypto_amount ?? null,
    },
    bank_details: null,
    merchant_details: null,
    card_details: null,
    note: null,
    category: null,
    tags: [],
    refund_details: null,
    cash_offramp_details: cashDetails,
  };
}

export { isCashOffRampActivity };

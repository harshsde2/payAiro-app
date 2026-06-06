import type { ActivityTradeItem } from "./types";
import type { UnifiedTransactionStatus } from "screens/TSX-Screens/UnifiedTransactions/types";

export type TradeDisplayKind = "completed" | "processing" | "failed" | "cancelled" | "expired";

export type TradeDisplayStatus = {
  kind: TradeDisplayKind;
  label: string;
  colorKey: "warning" | "error" | "success";
};

const TRADE_BUY_TITLE = "Crypto Purchase";
const TRADE_SELL_TITLE = "Crypto Sale";

const TRADE_STATUS_PRIORITY: Record<string, number> = {
  COMPLETED: 100,
  COMPLETE: 100,
  SUCCESS: 100,
  CONFIRMED: 90,
  FAILED: 50,
  ERROR: 50,
  CANCELLED: 45,
  EXPIRED: 45,
  CREATED: 30,
  PROCESSING: 30,
  PENDING: 30,
  GENERATING: 30,
};

const TRADE_COMPLETED_STATUSES = new Set([
  "COMPLETED",
  "COMPLETE",
  "SUCCESS",
  "CONFIRMED",
]);

export function isTradeBuy(item: ActivityTradeItem): boolean {
  if (item.activity === "TRADE_BUY") return true;
  if (item.tradeType === "buy") return true;
  return String(item.purpose ?? "").toLowerCase() === "buy";
}

function collectTradeStatusCandidates(item: ActivityTradeItem): string[] {
  return [item.orderStatus, item.status]
    .map((s) => String(s ?? "").trim().toUpperCase())
    .filter(Boolean);
}

function normalizeTradeStatus(item: ActivityTradeItem): string {
  const statuses = collectTradeStatusCandidates(item);
  if (statuses.length === 0) return "";

  return statuses.reduce((best, current) => {
    const bestP = TRADE_STATUS_PRIORITY[best] ?? 20;
    const currentP = TRADE_STATUS_PRIORITY[current] ?? 20;
    return currentP > bestP ? current : best;
  });
}

export function resolveTradeDisplayStatus(item: ActivityTradeItem): TradeDisplayStatus {
  const status = normalizeTradeStatus(item);

  if (TRADE_COMPLETED_STATUSES.has(status)) {
    return { kind: "completed", label: "Completed", colorKey: "success" };
  }
  if (status === "FAILED" || status === "ERROR") {
    return { kind: "failed", label: "Failed", colorKey: "error" };
  }
  if (status === "CANCELLED") {
    return { kind: "cancelled", label: "Cancelled", colorKey: "error" };
  }
  if (status === "EXPIRED") {
    return { kind: "expired", label: "Expired", colorKey: "error" };
  }
  if (
    status === "CREATED" ||
    status === "PROCESSING" ||
    status === "PENDING" ||
    status === "GENERATING"
  ) {
    return { kind: "processing", label: "Processing", colorKey: "warning" };
  }

  return { kind: "processing", label: "Processing", colorKey: "warning" };
}

export function tradeDisplayStatusToUnified(
  display: TradeDisplayStatus
): UnifiedTransactionStatus {
  if (display.kind === "completed") return "complete";
  if (display.kind === "failed") return "failed";
  if (display.kind === "cancelled" || display.kind === "expired") return "cancelled";
  return "processing";
}

export function getTradeCardTitle(item: ActivityTradeItem): string {
  return isTradeBuy(item) ? TRADE_BUY_TITLE : TRADE_SELL_TITLE;
}

function formatCurrencyAmount(amt: string | undefined, code: string | undefined): string {
  const amount = String(amt ?? "").trim();
  const currency = String(code ?? "").trim().toUpperCase();
  if (!amount) return "";
  const n = Number.parseFloat(amount);
  const formatted = Number.isFinite(n) ? n.toFixed(2) : amount;
  if (currency === "USD") return `$${formatted}`;
  return currency ? `${formatted} ${currency}` : formatted;
}

function formatCryptoAmount(amt: string | undefined, code: string | undefined): string {
  const amount = String(amt ?? "").trim();
  const currency = String(code ?? "").trim().toUpperCase();
  if (!amount) return "";
  const n = Number.parseFloat(amount);
  let formatted = amount;
  if (Number.isFinite(n)) {
    formatted = n.toFixed(8).replace(/\.?0+$/, "");
  }
  return currency ? `${formatted} ${currency}` : formatted;
}

function quoteDetails(item: ActivityTradeItem) {
  return item.quote?.details;
}

function resolveFiatCryptoCodes(item: ActivityTradeItem) {
  const fiat = (item.fiatCurrencyCode ?? "USD").toUpperCase();
  const crypto = (item.cryptoCurrencyCode ?? "").toUpperCase();
  return { fiat, crypto };
}

function resolveAmountPair(item: ActivityTradeItem): {
  fiatAmt?: string;
  fiatCode?: string;
  cryptoAmt?: string;
  cryptoCode?: string;
} {
  const qd = quoteDetails(item);
  const { fiat, crypto } = resolveFiatCryptoCodes(item);
  const buy = isTradeBuy(item);

  if (buy && qd) {
    const debitCode = (qd.debitCurrencyCode ?? "").toUpperCase();
    const creditCode = (qd.creditCurrencyCode ?? "").toUpperCase();
    if (debitCode === fiat || debitCode === "USD") {
      return {
        fiatAmt: qd.debitCurrencyAmount,
        fiatCode: debitCode || fiat,
        cryptoAmt: qd.creditCurrencyAmount,
        cryptoCode: creditCode || crypto,
      };
    }
    if (creditCode === crypto) {
      return {
        fiatAmt: qd.debitCurrencyAmount,
        fiatCode: debitCode || fiat,
        cryptoAmt: qd.creditCurrencyAmount,
        cryptoCode: creditCode || crypto,
      };
    }
  }

  if (!buy && qd) {
    const debitCode = (qd.debitCurrencyCode ?? "").toUpperCase();
    const creditCode = (qd.creditCurrencyCode ?? "").toUpperCase();
    return {
      fiatAmt: qd.creditCurrencyAmount,
      fiatCode: creditCode === fiat ? creditCode : fiat,
      cryptoAmt: qd.debitCurrencyAmount,
      cryptoCode: debitCode === crypto ? debitCode : crypto,
    };
  }

  const amountCode = (item.amountCurrencyCode ?? "").toUpperCase();
  const amountVal = item.amountValue;

  if (buy) {
    const spendIsFiat = amountCode === fiat || amountCode === "USD";
    return {
      fiatAmt: spendIsFiat ? amountVal : undefined,
      fiatCode: spendIsFiat ? amountCode || fiat : fiat,
      cryptoAmt: spendIsFiat ? undefined : amountCode === crypto ? amountVal : undefined,
      cryptoCode: crypto,
    };
  }

  const receiveIsFiat = amountCode === fiat || amountCode === "USD";
  return {
    fiatAmt: receiveIsFiat ? amountVal : undefined,
    fiatCode: receiveIsFiat ? amountCode || fiat : fiat,
    cryptoAmt: receiveIsFiat ? undefined : amountCode === crypto ? amountVal : amountVal,
    cryptoCode: crypto,
  };
}

export function formatTradeFiatAmount(item: ActivityTradeItem): string {
  const pair = resolveAmountPair(item);
  const formatted = formatCurrencyAmount(pair.fiatAmt, pair.fiatCode);
  if (formatted) return formatted;

  const { fiat } = resolveFiatCryptoCodes(item);
  const amt = Number.parseFloat(item.amountValue ?? "0");
  const code = (item.amountCurrencyCode ?? fiat).toUpperCase();
  const value = Number.isFinite(amt) ? amt.toFixed(2) : item.amountValue ?? "0";
  if (code === "USD") return `$${value}`;
  return `${value} ${code}`;
}

export function formatTradeCryptoAmount(
  item: ActivityTradeItem,
  usdPrice?: number
): string {
  const pair = resolveAmountPair(item);
  let formatted = formatCryptoAmount(pair.cryptoAmt, pair.cryptoCode);
  if (formatted) return formatted;

  const buy = isTradeBuy(item);
  const { fiat, crypto } = resolveFiatCryptoCodes(item);
  const amountCode = (item.amountCurrencyCode ?? "").toUpperCase();
  const amt = Number.parseFloat(item.amountValue ?? "0");

  if (
    buy &&
    (amountCode === fiat || amountCode === "USD") &&
    usdPrice != null &&
    Number.isFinite(usdPrice) &&
    usdPrice > 0 &&
    Number.isFinite(amt)
  ) {
    const cryptoAmt = amt / usdPrice;
    return formatCryptoAmount(String(cryptoAmt), crypto);
  }

  if (!buy && amountCode === crypto && Number.isFinite(amt)) {
    return formatCryptoAmount(String(amt), crypto);
  }

  return crypto ? `0 ${crypto}` : "";
}

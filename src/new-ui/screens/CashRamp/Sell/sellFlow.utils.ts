import type { SellCashRampEntryParams } from "./sellFlow.types";

export const SELL_AMOUNT_STEP_USD = 20;
export const SELL_MIN_AMOUNT_USD = 20;
export const SELL_MAX_TRANSACTION_USD = 400;

export function computeAvailableBalanceUsd(entry: SellCashRampEntryParams): number {
  const crypto = Number(entry.platformAvailableCrypto);
  const price = Number(entry.usdUnitPrice);
  if (!Number.isFinite(crypto) || !Number.isFinite(price) || price <= 0) return 0;
  return Math.max(0, crypto * price);
}

/** Number of selectable $20 steps when max is at least $20 (index 0 → $20). */
export function getSellStepCount(maxUsd: number): number {
  const cap = Math.min(Math.max(0, maxUsd), SELL_MAX_TRANSACTION_USD);
  if (cap < SELL_MIN_AMOUNT_USD) return 0;
  return Math.floor(cap / SELL_AMOUNT_STEP_USD);
}

/** Highest amount selectable on the $20-step slider (e.g. $20 when balance is $34.96). */
export function getSellMaxSelectableUsd(maxUsd: number): number {
  const cap = Math.min(Math.max(0, maxUsd), SELL_MAX_TRANSACTION_USD);
  if (cap < SELL_MIN_AMOUNT_USD) return 0;
  return Math.floor(cap / SELL_AMOUNT_STEP_USD) * SELL_AMOUNT_STEP_USD;
}

/** Step index 0 = $20, index 1 = $40, … */
export function usdFromSellStepIndex(index: number): number {
  return (index + 1) * SELL_AMOUNT_STEP_USD;
}

export function sellStepIndexFromUsd(usd: number, maxUsd: number): number {
  const count = getSellStepCount(maxUsd);
  if (count <= 0) return 0;
  const raw = Math.round(usd / SELL_AMOUNT_STEP_USD) - 1;
  return Math.max(0, Math.min(count - 1, raw));
}

export function clampSellAmountUsd(amount: number, maxUsd: number): number {
  const cap = Math.min(maxUsd, SELL_MAX_TRANSACTION_USD);
  if (cap < SELL_MIN_AMOUNT_USD) return 0;
  const stepped = Math.round(amount / SELL_AMOUNT_STEP_USD) * SELL_AMOUNT_STEP_USD;
  const clamped = Math.max(SELL_MIN_AMOUNT_USD, Math.min(stepped, cap));
  if (clamped < SELL_MIN_AMOUNT_USD) return 0;
  return clamped;
}

export function cryptoAmountFromUsd(amountUsd: number, unitPrice: number): number {
  if (!Number.isFinite(unitPrice) || unitPrice <= 0) return 0;
  return amountUsd / unitPrice;
}

export function formatUsd(amount: number): string {
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Format ATM ReadyCode for display (e.g. 89575432 → 895-75-432). */
export function formatReadyCodeDisplay(ref: string | null | undefined): string {
  const digits = String(ref ?? "").replace(/\D/g, "");
  if (digits.length === 8) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 8)}`;
  }
  if (digits.length === 0) return "—";
  return digits;
}

/** Illustrative fees until execute API returns real values (Phase 2). */
export function estimateSellFees(amountUsd: number): {
  exchangeFee: number;
  atmFee: number;
  totalSale: number;
} {
  const exchangeFee = Math.round(amountUsd * 0.0186 * 100) / 100;
  const atmFee = 2.5;
  const totalSale = Math.round((amountUsd + exchangeFee + atmFee) * 100) / 100;
  return { exchangeFee, atmFee, totalSale };
}

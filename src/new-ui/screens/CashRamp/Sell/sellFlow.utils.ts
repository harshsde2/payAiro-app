import type { SellCashRampEntryParams } from "./sellFlow.types";

export const SELL_AMOUNT_STEP_USD = 20;
export const SELL_MAX_TRANSACTION_USD = 400;

export function computeAvailableBalanceUsd(entry: SellCashRampEntryParams): number {
  const crypto = Number(entry.platformAvailableCrypto);
  const price = Number(entry.usdUnitPrice);
  if (!Number.isFinite(crypto) || !Number.isFinite(price) || price <= 0) return 0;
  return Math.max(0, crypto * price);
}

export function clampSellAmountUsd(amount: number, maxUsd: number): number {
  const cap = Math.min(maxUsd, SELL_MAX_TRANSACTION_USD);
  const stepped = Math.round(amount / SELL_AMOUNT_STEP_USD) * SELL_AMOUNT_STEP_USD;
  return Math.max(0, Math.min(stepped, cap));
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

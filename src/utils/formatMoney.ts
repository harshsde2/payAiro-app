/**
 * Formats a balance the user is allowed to SPEND, floored to cents.
 *
 * Rounding to nearest (what `toLocaleString` does by default) can round a balance UP — a real
 * holding of 174.676390 renders as "174.68". That advertises money the user does not have, and
 * the Send / Add Balance screens then reject that exact figure as insufficient, which reads as
 * a bug: "I entered the balance you just showed me."
 *
 * Flooring guarantees the displayed figure is always attainable.
 *
 * Use this ONLY for spendable balances. Amounts of things that already happened (transaction
 * history, receipts, fees, chart labels) must NOT be floored — those should render their true
 * value, so keep using normal rounding there.
 */
export function formatSpendableBalance(amount: number): string {
  const n = Number(amount ?? 0);
  const safe = Number.isFinite(n) ? n : 0;
  // Math.floor (not trunc): for a negative balance, trunc would round toward zero and
  // overstate it. Balances are non-negative in practice, but overstating is the one
  // direction this function exists to prevent.
  const floored = Math.floor(safe * 100) / 100;
  return floored.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

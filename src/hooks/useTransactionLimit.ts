import { useMemo } from 'react';
import { useCoinmeTransactionLimits } from 'query/hooks/useCoinmeTransactionLimits';
import {
  findLimitForRail,
  formatUsd,
  parseUsd,
} from '@new-ui/screens/TransactionLimits/transactionLimits.utils';
import type { TransactionLimitTab } from '@new-ui/screens/TransactionLimits/types';

/** Which Coinme rail the user is paying with. Maps to green_dot_buy/ncr_sell (cash)
 *  or debit_buy/debit_sell (debit) — see findLimitForRail. */
export type TransactionLimitRail = 'debit' | 'cash';
export type TransactionLimitFlow = TransactionLimitTab; // 'buy' | 'sell'

export type TransactionLimit = {
  /**
   * False whenever we can't trust the numbers: still loading, request failed,
   * limits disabled for the account, or this rail has no active entry. Callers
   * MUST render nothing and enforce nothing in that case — a limits outage can
   * never block a transaction, since the backend stays authoritative.
   */
  available: boolean;
  perTransactionUsd: number;
  dailyLimitUsd: number;
  dailyUsedUsd: number;
  dailyRemainingUsd: number;
  monthlyRemainingUsd: number;
  /** Sell-only floor from sellConfig; 0 when absent or on a buy. */
  minimumUsd: number;
  /** Largest amount that would pass every rule. */
  effectiveMaxUsd: number;
  /** Returns a user-facing message, or null when the amount is allowed. */
  validate: (usd: number) => string | null;
};

/** null when the field is absent/unparseable — distinct from a real 0, which means
 *  "nothing left". Callers must not enforce a rule whose value never arrived. */
const toNumberOrNull = (value: string | undefined): number | null => {
  if (value == null) return null;
  const n = parseFloat(String(value));
  return Number.isFinite(n) ? n : null;
};

const toNumber = parseUsd;
const money = formatUsd;

export function useTransactionLimit(
  flow: TransactionLimitFlow,
  rail: TransactionLimitRail
): TransactionLimit {
  const { data, isPending, isError } = useCoinmeTransactionLimits();

  return useMemo(() => {
    const limitsData = data?.data;
    const item = findLimitForRail(limitsData, flow, rail);

    const perTransactionUsd = toNumber(item?.perTransactionUsd);
    const dailyLimitUsd = toNumber(item?.dailyLimitUsd);
    const dailyUsedUsd = toNumber(item?.usage?.dailyUsd);
    // Kept nullable: a missing `remaining` must not be read as "$0 left" and block
    // every amount. Only enforced below when the API actually sent a value.
    const dailyRemaining = toNumberOrNull(item?.remaining?.dailyUsd);
    const monthlyRemaining = toNumberOrNull(item?.remaining?.monthlyUsd);
    const dailyRemainingUsd = dailyRemaining ?? Math.max(0, dailyLimitUsd - dailyUsedUsd);
    const monthlyRemainingUsd = monthlyRemaining ?? 0;

    // sellConfig gates sells on both rails; a buy has no minimum.
    const sellConfig = limitsData?.sellConfig;
    const minimumUsd =
      flow === 'sell' && sellConfig?.isActive !== false
        ? toNumber(sellConfig?.minimumSellAmountUsd)
        : 0;

    // Only the caps the API actually sent should constrain the max — a missing cap
    // means "not specified", not "you can spend nothing". A real 0 remaining is
    // handled by validate() rather than here.
    const caps = [perTransactionUsd, dailyRemaining, monthlyRemaining].filter(
      (n): n is number => n != null && n > 0
    );
    const effectiveMaxUsd = caps.length > 0 ? Math.min(...caps) : 0;

    const available =
      !isPending &&
      !isError &&
      limitsData?.enabled !== false &&
      !!item &&
      dailyLimitUsd > 0;

    const validate = (usd: number): string | null => {
      if (!available) return null;
      if (!Number.isFinite(usd) || usd <= 0) return null;

      if (minimumUsd > 0 && usd < minimumUsd) {
        return `Minimum sell amount is ${money(minimumUsd)}.`;
      }
      if (perTransactionUsd > 0 && usd > perTransactionUsd) {
        return `This exceeds the ${money(perTransactionUsd)} per-transaction limit.`;
      }
      if (dailyRemaining != null && usd > dailyRemaining) {
        return `Over your daily limit. You have ${money(dailyRemaining)} left today.`;
      }
      if (monthlyRemaining != null && usd > monthlyRemaining) {
        return `Over your monthly limit. You have ${money(
          monthlyRemaining
        )} left this month.`;
      }
      return null;
    };

    return {
      available,
      perTransactionUsd,
      dailyLimitUsd,
      dailyUsedUsd,
      dailyRemainingUsd,
      monthlyRemainingUsd,
      minimumUsd,
      effectiveMaxUsd,
      validate,
    };
  }, [data, flow, isError, isPending, rail]);
}

import type {
  CoinmeTransactionLimitItem,
  CoinmeTransactionLimitsData,
  TransactionLimitRow,
  TransactionLimitTab,
  TransactionLimitTabRows,
} from './types';

const BUY_TYPE_MAP: Record<'cash' | 'debit', string> = {
  cash: 'green_dot_buy',
  debit: 'debit_buy',
};

const SELL_TYPE_MAP: Record<'cash' | 'debit', string> = {
  cash: 'ncr_sell',
  debit: 'debit_sell',
};

const ROW_LABELS: Record<'cash' | 'debit', string> = {
  cash: 'Cash',
  debit: 'Debit',
};

/** The one USD formatter for every limits surface. */
export function formatUsd(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatUsdAmount(value: string | undefined): string {
  return formatUsd(parseFloat(String(value ?? '')));
}

export const parseUsd = (value: string | undefined): number => {
  const n = parseFloat(String(value ?? ''));
  return Number.isFinite(n) ? n : 0;
};

function findActiveLimit(
  limits: CoinmeTransactionLimitItem[] | undefined,
  type: string
): CoinmeTransactionLimitItem | undefined {
  return limits?.find(
    (item) => item.type === type && item.isActive !== false
  );
}

function toRow(
  key: 'cash' | 'debit',
  item: CoinmeTransactionLimitItem | undefined
): TransactionLimitRow | null {
  if (!item?.dailyLimitUsd && !item?.monthlyLimitUsd) {
    return null;
  }
  const dailyLimitUsd = parseUsd(item.dailyLimitUsd);
  const monthlyLimitUsd = parseUsd(item.monthlyLimitUsd);
  const dailyUsedUsd = parseUsd(item.usage?.dailyUsd);
  const monthlyUsedUsd = parseUsd(item.usage?.monthlyUsd);
  return {
    key,
    label: ROW_LABELS[key],
    dailyLimitUsd,
    monthlyLimitUsd,
    dailyUsedUsd,
    monthlyUsedUsd,
    // Fall back to limit - used when the API omits `remaining`, so the row still
    // reports something coherent rather than a bare 0.
    dailyRemainingUsd:
      item.remaining?.dailyUsd != null
        ? parseUsd(item.remaining.dailyUsd)
        : Math.max(0, dailyLimitUsd - dailyUsedUsd),
    monthlyRemainingUsd:
      item.remaining?.monthlyUsd != null
        ? parseUsd(item.remaining.monthlyUsd)
        : Math.max(0, monthlyLimitUsd - monthlyUsedUsd),
  };
}

/**
 * The limit entry that applies to one flow + payment rail, e.g. buy on the cash
 * rail → `green_dot_buy`. Kept here so the rail→type mapping lives in exactly one
 * place (shared with the read-only Transaction Limits screen below).
 * Returns undefined when the rail has no active entry — callers must fail open.
 */
export function findLimitForRail(
  data: CoinmeTransactionLimitsData | undefined,
  flow: TransactionLimitTab,
  rail: 'cash' | 'debit'
): CoinmeTransactionLimitItem | undefined {
  const typeMap = flow === 'buy' ? BUY_TYPE_MAP : SELL_TYPE_MAP;
  return findActiveLimit(data?.limits, typeMap[rail]);
}

export function mapLimitsForTab(
  data: CoinmeTransactionLimitsData | undefined,
  tab: TransactionLimitTab
): TransactionLimitTabRows {
  const typeMap = tab === 'buy' ? BUY_TYPE_MAP : SELL_TYPE_MAP;
  const limits = data?.limits;

  return {
    cash: toRow('cash', findActiveLimit(limits, typeMap.cash)),
    debit: toRow('debit', findActiveLimit(limits, typeMap.debit)),
  };
}

export function getActiveRowsForTab(rows: TransactionLimitTabRows): TransactionLimitRow[] {
  return [rows.cash, rows.debit].filter(
    (row): row is TransactionLimitRow => row !== null
  );
}

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

function formatUsdAmount(value: string | undefined): string {
  const n = parseFloat(String(value ?? ''));
  if (!Number.isFinite(n)) return '—';
  return `$${n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatLimitLine(
  usd: string | undefined,
  period: 'day' | 'month'
): string {
  const suffix = period === 'day' ? '/day' : '/month';
  return `${formatUsdAmount(usd)}${suffix}`;
}

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
  return {
    key,
    label: ROW_LABELS[key],
    dailyLimitUsd: item.dailyLimitUsd ?? '0',
    monthlyLimitUsd: item.monthlyLimitUsd ?? '0',
  };
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

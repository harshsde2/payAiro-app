import type { ICryptoAssetItem } from "new-ui/components/common-components/CryptoAssetsList/types";

export interface ICryptoFastApiBalanceRow {
  balance: string;
  currencyName: string;
  currencySymbol: string;
  updatedAt: string | null;
  estimatedBalanceValue: string;
}

export function mergeCryptoMarketWithBalances(
  marketItems: ICryptoAssetItem[],
  balanceRows: ICryptoFastApiBalanceRow[]
): ICryptoAssetItem[] {
  const map = new Map<string, ICryptoFastApiBalanceRow>();
  for (const row of balanceRows) {
    const key = row.currencySymbol || row.currencyName;
    if (key) {
      map.set(key, row);
    }
  }

  return marketItems.map((item) => {
    const sym = item.asset ?? "";
    const b = map.get(sym);
    const qty = Number(b?.balance ?? 0);
    const usd = Number(b?.estimatedBalanceValue ?? 0);

    return {
      ...item,
      platform_available: Number.isFinite(qty) ? qty : 0,
      rounded_balance: Number.isFinite(qty) ? qty : 0,
      usd_value_total: Number.isFinite(usd) ? usd : 0,
      usd_value_available: Number.isFinite(usd) ? usd : 0,
    };
  });
}

export interface ICryptoAssetItem {
  asset?: string;
  name?: string;
  rounded_balance?: number;
  platform_available?: number;
  platform_pending?: number;
  platform_total_balance?: number;
  usd_value_total?: number;
  usd_value_available?: number;
  logo?: string;
  /** Current market unit price in USD (from /crypto/market). */
  usd_price?: number;
  /** 24h high/low unit prices in USD (from /crypto/market). */
  high?: number;
  low?: number;
  /** Optional 24h change percentage, if provided by the backend in the future. */
  change_24h?: number;
  [key: string]: unknown;
}

export interface ICryptoAssetsListProps {
  data?: ICryptoAssetItem[];
  isLoading?: boolean;
}

export interface ICryptoAssetItem {
  asset?: string;
  rounded_balance?: number;
  platform_available?: number;
  platform_pending?: number;
  platform_total_balance?: number;
  usd_value_total?: number;
  usd_value_available?: number;
  logo?: string;
  [key: string]: unknown;
}

export interface ICryptoAssetsListProps {
  data?: ICryptoAssetItem[];
  isLoading?: boolean;
}

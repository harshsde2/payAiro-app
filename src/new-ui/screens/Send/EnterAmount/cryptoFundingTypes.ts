export type CryptoFundingItem = {
  asset: string;
  platform_available?: number;
  platform_pending?: number;
  platform_total_balance?: number;
  rounded_balance?: number;
  usd_value_total?: number;
  usd_value_available?: number;
  usd_price?: number;
  logo?: string;
};


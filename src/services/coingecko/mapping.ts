/**
 * Maps asset symbols to CoinGecko coin IDs
 */
export const ASSET_TO_COINGECKO_ID: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  USDC: 'usd-coin',
  USDT_TRX: 'tether',
  BCH: 'bitcoin-cash',
  SOL: 'solana',
  LTC: 'litecoin',
  USDC_SOL: 'usd-coin',
  USDC_NPL: 'usd-coin',
  USDC_STE: 'usd-coin',
};

/**
 * Gets CoinGecko ID from asset symbol
 */
export const getCoinGeckoId = (asset: string): string | null => {
  // Handle special cases
  if (asset === 'USDT_TRX') {
    return 'tether';
  }
  if (asset.startsWith('USDC_')) {
    return 'usd-coin';
  }
  
  // Direct mapping
  return ASSET_TO_COINGECKO_ID[asset] || null;
};

/**
 * Formats large numbers for display
 */
export const formatLargeNumber = (value: number): string => {
  if (value >= 1e12) {
    return `$${(value / 1e12).toFixed(2)}T`;
  }
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`;
  }
  if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`;
  }
  if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
};

/**
 * Formats supply numbers
 */
export const formatSupply = (value: number): string => {
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(2)}B`;
  }
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M`;
  }
  if (value >= 1e3) {
    return `${(value / 1e3).toFixed(2)}K`;
  }
  return value.toFixed(2);
};


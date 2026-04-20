const KNOWN_CRYPTO_NAMES: Record<string, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  USDT: "Tether",
  USDC: "USD Coin",
  SOL: "Solana",
  XRP: "XRP",
  DOGE: "Dogecoin",
  ADA: "Cardano",
  AVAX: "Avalanche",
  DOT: "Polkadot",
  MATIC: "Polygon",
  POL: "Polygon",
  LTC: "Litecoin",
  LINK: "Chainlink",
  ATOM: "Cosmos",
  UNI: "Uniswap",
  SHIB: "Shiba Inu",
  TRX: "TRON",
  BNB: "BNB",
  XLM: "Stellar",
  NEAR: "NEAR",
  APT: "Aptos",
  ARB: "Arbitrum",
  OP: "Optimism",
};

export function getCryptoDisplayTitle(
  symbol: string | undefined,
  explicitName?: string | null
): string {
  const trimmedName = explicitName?.trim();
  if (trimmedName) {
    return trimmedName;
  }
  const sym = String(symbol || "").trim().toUpperCase();
  if (sym && KNOWN_CRYPTO_NAMES[sym]) {
    return KNOWN_CRYPTO_NAMES[sym];
  }
  return sym || "Crypto";
}

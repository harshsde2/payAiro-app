export type CryptoReceiptDraft = {
  receiver: string;
  symbol: string;
  network: string;
  assetAmount: number; // token units
  usdAmount: number; // USD equivalent
};

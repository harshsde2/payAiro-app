export type FundingSourceType = 'bank' | 'crypto';

export type CryptoMeta = {
  symbol: string;
  network?: string;
  priceUSD: number;
  maxAssetBalance?: number;
  maxUsdBalance?: number;
  logo?: string;
};

export type FundingSource = {
  id: string;
  name: string;
  balance: number;
  type: FundingSourceType;
  cryptoMeta?: CryptoMeta;
  /** Last digits (or full account_number) used for •••• 1234; avoids UUID-based masks. */
  accountMaskHint?: string;
  /** Main PayAiro custodial account — show PayAiro branding. */
  isPayairoFunding?: boolean;
};

export type SendState = {
  inputValue: string;
  amount: number;
  selectedSource: FundingSource | null;
  viewMode: 'fiat' | 'crypto';
  inputMode: 'fiat' | 'asset';
  isValid: boolean;
};

export type SendPayload = {
  recipient: string;
  amount: number;
  sourceId: string;
  currency: 'USD';
};


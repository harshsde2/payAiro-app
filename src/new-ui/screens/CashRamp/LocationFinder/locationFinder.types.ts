import { CashRampNearbyLocation } from "query/hooks/useCashRamp";

export type CashRampLocationFinderParams = {
  amount: number;
  fiatCurrencyCode: string;
  cryptoCurrencyCode: string;
  chain: string;
  /** Required for sell cash-offramp when opening barcode screen from map. */
  sourceWalletAddress?: string;
};

export type CashRampFlow = "buy" | "sell";

export type CashRampBarcodeParams = {
  amount: number;
  fiatCurrencyCode: string;
  cryptoCurrencyCode: string;
  /** Buy: fake barcode strip. Sell: show location code in glass panel. Defaults to buy when omitted. */
  cashRampFlow?: CashRampFlow;
  chain?: string;
  sourceWalletAddress?: string;
  location: {
    id: string;
    provider?: string | null;
    description?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    zipCode?: string | null;
    lineOfSightDistance?: number | null;
    lineOfSightMetric?: string | null;
    locationReference?: string | null;
  };
};

export type LocationCardItem = CashRampNearbyLocation & {
  markerLabel: string;
};

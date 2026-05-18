import type {
  CoinmeCashOfframpQuote,
  CoinmeCashOfframpTransaction,
} from "query/hooks/useCoinmeCashRamp";
import type { LocationCardItem } from "../LocationFinder/locationFinder.types";

/** Passed from Crypto Details when starting sell-for-cash. */
export type SellCashRampEntryParams = {
  cryptoCurrencyCode: string;
  chain: string;
  fiatCurrencyCode: string;
  sourceWalletAddress?: string;
  /** Crypto units available (platform_available). */
  platformAvailableCrypto: number;
  usdUnitPrice: number;
  cryptoDisplayName?: string;
  logo?: string | null;
};

export type SellCashRampLocationSnapshot = {
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
  imageUrl?: string | null;
};

export type SellCashRampSession = SellCashRampEntryParams & {
  location: SellCashRampLocationSnapshot;
  amountUsd: number;
};

/** After POST cash-offramp/execute — `partnerTransactionId` drives pickup-code poll. */
export type SellCashRampPostExecute = {
  partnerTransactionId: string;
  quote?: CoinmeCashOfframpQuote;
  transaction?: CoinmeCashOfframpTransaction;
};

export type SellCashRampWaitingParams = {
  session: SellCashRampSession;
  /** Set when execute completed on OTP screen; otherwise waiting screen runs execute on mount. */
  postExecute?: SellCashRampPostExecute;
};

export function locationItemToSnapshot(item: LocationCardItem): SellCashRampLocationSnapshot {
  return {
    id: item.id,
    provider: item.provider,
    description: item.description,
    address: item.address,
    city: item.city,
    state: item.state,
    zipCode: item.zipCode,
    lineOfSightDistance: item.lineOfSightDistance,
    lineOfSightMetric: item.lineOfSightMetric,
    locationReference: item.locationReference,
    imageUrl: item.imageUrl,
  };
}

export function buildSellSession(
  entry: SellCashRampEntryParams,
  location: SellCashRampLocationSnapshot,
  amountUsd: number
): SellCashRampSession {
  return { ...entry, location, amountUsd };
}

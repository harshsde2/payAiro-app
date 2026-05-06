import { RouteProp } from '@react-navigation/native';
import { ISendScreenRouteParams } from 'screens/Dashboard/types';
import type { FundingSource } from '../EnterAmount/enterAmount.types';
import { ISendContactItem } from 'new-ui/components/common-components/SendContactsList';
import type { IReceivedPendingRequest } from 'query/hooks/types';

export type SendRouteProp = RouteProp<
  { Send: ISendScreenRouteParams },
  'Send'
>;

export interface INewSendProps {
  route: SendRouteProp;
}

/**
 * Crypto asset metadata forwarded from `CryptoDetails` → `EnterAmount` when
 * the screen is in buy/sell mode. Keeping this shape stable lets EnterAmount
 * skip any follow-up fetches.
 */
export interface ICryptoAssetTradeContext {
  /** Asset symbol, e.g. "BTC". */
  asset: string;
  /** Wallet chain, e.g. "ETH". */
  chain: string;
  logo?: string;
  /** Fiat code for the trade pair, e.g. "USD". */
  fiatCurrency: string;
  /** Latest spot price used for the buy/sell preview. */
  currentPrice?: number;
  /** Spendable asset balance for sells (e.g. from `platform_available`). */
  platformAvailable?: number;
  /** Source wallet address for sells (optional for buys). */
  sourceWalletAddress?: string;
}

export interface IEnterAmountRouteParams {
  type?: 'send' | 'request' | 'requested';
  recipient_identifier?: string;
  /** Verified PayAiro username for FastAPI internal send. */
  recipientUserId?: string;
  selectedContact?: ISendContactItem;
  request_data?: IReceivedPendingRequest;

  /** When set, the screen switches into Coinme trade mode. */
  tradeMode?: 'buy' | 'sell';
  /** Required when `tradeMode` is set. */
  cryptoAsset?: ICryptoAssetTradeContext;
}

export type EnterAmountRouteProp = RouteProp<
  { EnterAmount: IEnterAmountRouteParams },
  'EnterAmount'
>;

export interface IEnterAmountProps {
  route: EnterAmountRouteProp;
}



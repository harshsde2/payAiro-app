export interface ICryptoBalance {
  id: string;
  name: string;
  symbol: string;
  availableBalance: number;
  pendingBalance: number;
  quantity: string;
  value: string;
  changePercentage: number;
  icon?: string;
}

export interface ICryptoInfo {
  marketCap: string;
  marketVol: string;
  totalVol: string;
  circulatingSupply: string;
  allTimeHigh: string;
  allTimeLow: string;
  fullyDiluted: string;
  tokenDecimal: string;
}

export interface IRecentActivity {
  id: string;
  type: 'received' | 'transfer' | 'payment';
  description: string;
  date: string;
  time: string;
  amount: string;
  icon?: string;
  isPositive: boolean;
}

export interface ICryptoDetails {
  name: string;
  symbol: string;
  currentPrice: number;
  priceChange: number;
  about: string;
  balances: ICryptoBalance[];
  info: ICryptoInfo;
  recentActivity: IRecentActivity[];
}

export interface ICryptoItem {
  symbol: string;
  type: string;
  buy_price: number;
  sell_price: number;
  buy_price_last_updated_at: string;
  sell_price_last_updated_at: string;
  logo?: string;
}

export interface ITab {
  id: number;
  title: string;
}

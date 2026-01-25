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

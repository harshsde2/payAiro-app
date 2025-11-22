export interface IDashboardStats {
  totalBalance: number;
  cryptoBalance: number;
  fiatBalance: number;
  recentTransactions: ITransaction[];
}

export interface ITransaction {
  id: string;
  type: 'buy' | 'sell' | 'send' | 'receive';
  amount: number;
  currency: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
}


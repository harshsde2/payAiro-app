// Crypto Transaction Types
export interface CryptoTransactionData {
  id: number;
  usd_amount: string;
  trade_id: string;
  account_id: string | null;
  amount: string;
  final_amount: string;
  Transaction_fee_persentage: string;
  from_currency: string;
  to_currency: string;
  network: string;
  status: string;
  created_at: string;
  type: 'buy' | 'sell' | 'send' | 'receive' | 'withdrawal';
  icon: string;
  user: string;
}

export interface CryptoTransactionCardProps {
  item: CryptoTransactionData;
  onPress?: () => void;
}

// Transaction Status Types
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'success' | 'error';

// Transaction Type Types
export type TransactionType = 'buy' | 'sell' | 'send' | 'receive';

// Amount Colors for different transaction types
export interface AmountColors {
  usdColor: string;
  cryptoColor: string;
}
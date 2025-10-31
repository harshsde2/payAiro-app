export interface IFiatTransaction {
  id: number;
  sender_wallet_public_key: string;
  recipient_wallet_public_key: string;
  sender_username: string;
  recipient_username: string;
  transaction_id: string;
  amount: string;
  status: string;
  description?: string;
  note?: string;
  sender_profile_photo?: string;
  recipient_profile_photo?: string;
  final_amount?: string;
  Transaction_fee_persentage?: string;
  created_at: string;
  category: string;
}

export interface ICryptoSendReceiveTransaction {
  tx_hash: string;
  from_address: string;
  to_address: string;
  payairoTag: string;
  value: string;
  timestamp: string;
  usd_value?: string;
  token: string;
  web3: boolean;
  icon: string;
}

export interface ICryptoBuyTransaction {
  id: number;
  trade_id: string;
  account_id: string;
  amount: string;
  final_amount: string;
  Transaction_fee_persentage?: string;
  from_currency: string;
  to_currency: string;
  network: string;
  status: string;
  created_at: string;
  type: string; // "buy" or "sell"
  icon: string;
  user: string;
}

// Covers on-ledger or internal crypto transfers with type "send" | "receive"
export interface ICryptoTransferTransaction {
  id: number;
  usd_amount: string;
  trade_id: string;
  account_id: string | null;
  amount: string; // requested amount (fiat/crypto depending on context)
  final_amount: string; // actual crypto amount sent/received
  Transaction_fee_persentage?: string;
  from_currency: string; // e.g., USDT_TRX
  to_currency: string; // e.g., USDT_TRX
  network: string;
  status: string; // e.g., complete, pending, failed
  created_at: string;
  type: 'send' | 'receive';
  withdrawal_address: string | null;
  recipient_email: string | null;
  recipient_username: string | null;
  sender_email: string | null;
  sender_username: string | null;
  icon: string;
  user: string;
  to_user: string | null;
}

export type TransactionData =
  | IFiatTransaction
  | ICryptoSendReceiveTransaction
  | ICryptoBuyTransaction
  | ICryptoTransferTransaction;

export interface ITransactionDetailsProps {
  route: {
    params: {
      transactionData: TransactionData;
      isCrypto?: boolean;
    };
  };
}

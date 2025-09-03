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
  final_amount?: string;
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

export type TransactionData = IFiatTransaction | ICryptoSendReceiveTransaction | ICryptoBuyTransaction;

export interface ITransactionDetailsProps {
  route: {
    params: {
      transactionData: TransactionData;
      isCrypto?: boolean;
    };
  };
}

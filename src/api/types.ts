// Base API response type
export interface ApiResponse<T> {
  status: boolean;
  data: T;
  message?: string;
}

// User interfaces
export interface User {
  _id?: string;
  id?: string;
  name?: string;
  username?: string;
  email?: string;
  nickname?: string;
  image?: string;
  pending_requests?: PendingRequest[];
}

export interface PendingRequest {
  id: string;
  amount: number;
  timestamp: string;
  status: string;
}

// Wallet interfaces
export interface Wallet {
  name?: string;
  username?: string;
  btc?: CryptoWallet;
  eth?: CryptoWallet;
  matic?: CryptoWallet;
  xrp?: CryptoWallet;
}

export interface CryptoWallet {
  balance: number;
  balance_in_tether: number;
  image: string;
  address: string;
}

// Transaction interfaces
export interface Transaction {
  id: string;
  amount: number;
  status: string;
  timestamp: string;
  sender?: string;
  receiver?: string;
  transactionType?: string;
}

// Auth interfaces
export interface Tokens {
  access: string;
  refresh: string;
}

// Bank interfaces
export interface BankAccount {
  id?: string;
  account_id?: string;
  bank_name?: string;
  bank_address?: string;
  account_number?: string;
  account_type?: string;
  name?: string;
  official_name?: string;
  balances?: {
    available: number;
    current: number;
  };
}

// Balance interfaces
export interface Balance {
  wallet_balance: number;
  bank_account?: {
    usd: number;
  };
  roth_ira_account?: {
    usd: number;
  };
  traditional_ira_account?: {
    usd: number;
  };
}

// Crypto balance interfaces
export interface CryptoAsset {
  assetType: string;
  disbursable: number;
  pending: number;
} 
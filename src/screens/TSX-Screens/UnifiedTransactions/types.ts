// Unified Transaction Types

// Transaction type enum
export type UnifiedTransactionType =
  | "fiat_send"
  | "fiat_receive"
  | "fiat_deposit"
  | "fiat_withdrawal"
  | "fiat_bank_transfer_in"
  | "fiat_bank_transfer_out"
  | "fiat_card_deposit"
  | "fiat_card_purchase"
  | "fiat_merchant_payment"
  | "fiat_merchant_refund"
  | "crypto_buy"
  | "crypto_sell"
  | "crypto_send"
  | "crypto_receive"
  | "crypto_withdrawal"
  | "crypto_deposit"
  | "crypto_swap"
  | "cash_onramp"
  | "cash_offramp";

export type CashOffRampDisplayKind =
  | "processing"
  | "ready"
  | "completed"
  | "error"
  | "failed"
  | "expired";

export interface ICashOnRampDetails {
  order_status?: string | null;
  payment_method?: string | null;
  location_reference?: string | null;
  retailer_label?: string | null;
  transaction_provider_ref?: string | null;
  transaction_system_ref?: string | null;
  credit_currency_amount?: string | null;
  credit_currency_code?: string | null;
  debit_currency_unit_price?: string | null;
  fees_map?: Record<string, string>;
  processing_fee?: string | null;
  network_fee?: string | null;
  exchange_fee?: string | null;
  processing_message?: string | null;
}

export interface ICashOffRampDetails {
  display_kind: CashOffRampDisplayKind;
  cash_tracking_status?: string | null;
  provider_transaction_ref?: string | null;
  provider_transaction_id?: string | null;
  location_description?: string | null;
  location_address?: string | null;
  location_hours?: string | null;
  sell_method: string;
  ready_code_formatted?: string | null;
  chain_label?: string | null;
  crypto_code?: string | null;
  crypto_amount?: string | null;
  fiat_code?: string | null;
  unit_price_usd?: string | null;
  exchange_fee?: string | null;
  atm_fee?: string | null;
  total_sale_usd?: string | null;
  total_cash_pickup_usd?: string | null;
  fees_map?: Record<string, string>;
  processing_message?: string | null;
  error_title?: string | null;
  error_body?: string | null;
}

// Transaction category enum
export type TransactionCategory = "fiat" | "crypto";

// Transaction status enum
export type UnifiedTransactionStatus =
  | "pending"
  | "processing"
  | "success"
  | "complete"
  | "failed"
  | "cancelled";

// Transaction direction enum
export type TransactionDirection = "incoming" | "outgoing";

// Category type for filtering
export type TransactionCategoryType =
  | "family_friends"
  | "self_transfer"
  | "merchant"
  | "miscellaneous";

// Fee interface
export interface ITransactionFee {
  amount: string;
  percentage: string;
  currency: string;
}

// User/Party interface
export interface ITransactionParty {
  user_id: string;
  username: string | null;
  email: string;
  profile_photo: string | null;
  wallet_address: string | null;
  bank_name: string | null;
  account_number_masked: string | null;
}

// Display party interface (for UI)
export interface IDisplayParty {
  username: string;
  profile_photo: string | null;
  identifier: string;
}

// Crypto details interface
export interface ICryptoDetails {
  from_currency: string | null;
  to_currency: string | null;
  network: string | null;
  tx_hash: string | null;
  from_address: string | null;
  to_address: string | null;
  token: string | null;
  icon_url: string | null;
  exchange_rate: string | null;
  usd_value: string | null;
  asset?: string;
  amount?: string;
}

// Bank details interface
export interface IBankDetails {
  bank_name: string | null;
  bank_logo?: string | null;
  account_type?: string | null;
  routing_number_masked?: string | null;
  account_number_masked: string | null;
  transfer_method?: string | null;
}

// Merchant details interface
export interface IMerchantDetails {
  merchant_id: string | null;
  merchant_name?: string | null;
  merchant_logo?: string | null;
  order_id: string | null;
  invoice_number?: string | null;
  description?: string | null;
  project_name?: string;
}

// Card details interface
export interface ICardDetails {
  card_id: string | null;
  card_last_four: string | null;
  card_brand: string | null;
  card_type: string | null;
  authorization_code: string | null;
}

// Refund details interface
export interface IRefundDetails {
  original_transaction_id: string | null;
  refund_reason: string | null;
  refunded_at: string | null;
}

// Main unified transaction interface
export interface IUnifiedTransaction {
  transaction_id: string;
  transaction_type: UnifiedTransactionType;
  transaction_category: TransactionCategory;
  status: UnifiedTransactionStatus;
  amount: string;
  final_amount: string;
  currency: string;
  currency_symbol: string;
  created_at: string;
  updated_at: string;
  fee: ITransactionFee;
  sender: ITransactionParty | null;
  recipient: ITransactionParty | null;
  direction: TransactionDirection;
  display_party: IDisplayParty;
  crypto_details: ICryptoDetails | null;
  bank_details: IBankDetails | null;
  merchant_details: IMerchantDetails | null;
  card_details: ICardDetails | null;
  note: string | null;
  category: TransactionCategoryType | null;
  tags: string[];
  refund_details: IRefundDetails | null;
  cash_onramp_details?: ICashOnRampDetails | null;
  cash_offramp_details?: ICashOffRampDetails | null;
}

// Category percentages interface
export interface ICategoryPercentage {
  percentage: number;
  color: string;
}

export interface ICategoryPercentages {
  merchant: ICategoryPercentage;
  family_friends: ICategoryPercentage;
  miscellaneous: ICategoryPercentage;
  self_transfer: ICategoryPercentage;
}

// API Response interface
export interface IUnifiedTransactionsResponse {
  transactions: IUnifiedTransaction[];
  total_count: number;
  category_percentages: ICategoryPercentages;
  total_transactions: number;
  merchant_count: number;
  family_friends_count: number;
  miscellaneous_count: number;
  self_transfer_count: number;
  merchant_amount_total: number;
  family_friends_amount_total: number;
  miscellaneous_amount_total: number;
  self_transfer_amount_total: number;
  total_amount: number;
}

// Props interfaces
export interface IUnifiedTransactionCardProps {
  transaction: IUnifiedTransaction;
  onPress?: (transaction: IUnifiedTransaction) => void;
}

export interface IUnifiedTransactionScreenProps {
  route?: {
    params?: {
      initialFilter?: string;
    };
  };
}


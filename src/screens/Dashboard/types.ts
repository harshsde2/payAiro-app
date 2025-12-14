export type PeriodOption = "week" | "month" | "custom";

export type TransactionType = "all" | "debit" | "credit";

export interface IPeriodOption {
  key: PeriodOption;
  label: string;
}

export interface ITransactionItem {
  amount: string;
  datetime: string;
  sender: string;
  status: string;
  type: "credit" | "debit";
  option?: string;
  transaction_id?: string;
  order_id?: string;
  account_holder?: string;
  account_number?: string;
  routing_number?: string;
  user_email?: string;
  sender_email?: string;
}

export interface ICybridBankAccount {
  id: number;
  guid: string;
  account_guid: string;
  customer_guid: string;
  bank_guid: string;
  asset: string;
  unique_memo_id: string;
  state: string;
  created_at: string;
  updated_at: string;
  account_number: string;
  routing_number_type: string;
  counterparty_address?: {
    city?: string;
    street?: string;
    street2?: string | null;
    postal_code?: string;
    subdivision?: string;
    country_code?: string;
  };
  user: string;
  bank_name: string;
  account_type: string;
  ref_code?: string;
  account_status: string;
}

export interface IUserDetails {
  email: string;
  id: string;
}

export interface IStatementAPIResponse {
  transactions: ITransactionItem[];
  total_count: number;
  user_details: IUserDetails;
  cybrid_bank_accounts: ICybridBankAccount[];
}

export interface IStatementDetailsRouteParams {
  data: ITransactionItem[];
  statementData?: IStatementAPIResponse;
}


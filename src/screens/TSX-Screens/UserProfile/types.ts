export interface UserProfileDetails {
  user_uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  profile_photo: string | null;
}

export interface TransactionFee {
  amount: string;
  percentage: string;
  currency: string;
}

export interface TransactionParty {
  user_id: string;
  username: string;
  email: string;
  profile_photo: string | null;
  wallet_address: string | null;
  bank_name: string | null;
  account_number_masked: string | null;
}

export interface DisplayParty {
  username: string;
  profile_photo: string | null;
  identifier: string;
}

export interface UserTransaction {
  transaction_id: string;
  status: string;
  amount: string;
  final_amount: string;
  currency: string;
  currency_symbol: string;
  created_at: string;
  updated_at: string;
  fee: TransactionFee;
  sender: TransactionParty;
  recipient: TransactionParty;
  direction: "incoming" | "outgoing";
  display_party: DisplayParty;
  note: string | null;
  category: string;
  tags: string[];
}

export interface UserDetailsData {
  user: UserProfileDetails;
  latest_transactions: UserTransaction[];
}

export interface InnerResponse {
  status: boolean;
  message: string;
  data: UserDetailsData;
}

export interface UserDetailsResponse {
  status: boolean;
  message: string;
  data: InnerResponse;
}

export interface IUserProfileDetails {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
}

export interface IUserProfileEnvelope {
  user: IUserProfileDetails;
  legal_identity?: {
    phone_country_code?: number | null;
    phone_national_number?: string | null;
  } | null;
  profile?: {
    avatar_url: string | null;
  } | null;
}

export interface IUserProfileTransactionParty {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
}

export interface UserTransaction {
  id: number;
  status: string;
  direction: "sent" | "received";
  amount: string;
  currency: string;
  createdAt: string;
  sentBy?: IUserProfileTransactionParty | null;
  sentTo?: IUserProfileTransactionParty | null;
}

export interface UserProfileTransactionsResponse {
  ok: boolean;
  message: string;
  data: {
    user: IUserProfileEnvelope;
    transactions: {
      items: UserTransaction[];
      sent: UserTransaction[];
      received: UserTransaction[];
    };
  };
}

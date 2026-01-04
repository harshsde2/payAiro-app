// Freshchat Types

export interface IFreshchatUser {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  phoneCountryCode?: string;
  externalId?: string;
}

export interface IFreshchatConfig {
  appId: string;
  appKey: string;
  domain?: string;
}

export interface IFreshchatCustomProperty {
  key: string;
  value: string;
}

export interface IFreshchatMessage {
  tag?: string;
  message?: string;
}

// Referral Types
export interface IReferredUser {
  id: string;
  email: string;
  mobile_number: string;
  username: string;
  name: string;
  created_at: string;
  has_completed_first_transaction: boolean;
  referral_amount_earned: number;
  referral_amount_pending: number;
  status: "completed" | "pending";
}

export interface IReferralStatistics {
  total_referred_users: number;
  total_referral_amount: number;
  total_referral_amount_earned: number;
  total_referral_amount_pending: number;
  referral_amount_per_referral: number;
  referral_system_active: boolean;
}

export interface IReferralUser {
  id: string;
  email: string;
  username: string;
  name: string;
}

export interface IReferralData {
  status: boolean;
  user: IReferralUser;
  referral_statistics: IReferralStatistics;
  referred_users_list: IReferredUser[];
}


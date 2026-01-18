import type { ViewStyle } from "react-native";
import type { KycMode } from "types/kyc";

export type KycBadgeStatus = "Pending" | "Verified" | "Rejected";

export interface IWalletData {
  name?: string;
  last_name?: string;
  username?: string;
  created_at?: string;
}

export interface IKycStep {
  selfimage?: string;
}

export interface IProfileHeaderProps {
  walletData?: IWalletData | null;
  kycStep?: IKycStep | null;
  kycBadgeStatus: KycBadgeStatus;
  kycMode: KycMode;
  onStartKyc?: () => void;
  isKycPending?: boolean;
  onProfilePress: () => void;
  onQrPress: () => void;
  /** Optional override for the root container */
  containerStyle?: ViewStyle;
  /** Base URL for KYC selfie image. Default: "https://app.payairo.com" */
  imageBaseUrl?: string;
  /** When false, KYC button is hidden. When undefined/true, shown when kycMode is "not_started". */
  showKycButton?: boolean;
}

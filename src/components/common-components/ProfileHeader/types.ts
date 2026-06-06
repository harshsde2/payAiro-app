import type { ViewStyle } from "react-native";
import type { KycMode } from "types/kyc";
import type { PickedImageFile } from "utils/ImagePicker";

export type KycBadgeStatus = "Pending" | "Verified" | "Rejected";

export type ImagePickerSource = "camera" | "gallery";

export interface IWalletData {
  account_email?: string;
  account_number?: string;
  name?: string;
  last_name?: string;
  username?: string;
  mobile_number?: string | null;
  created_at?: string;
  profile_photo?: string | null;
}

export interface IKycStep {
  selfimage?: string;
}

export interface IProfileImagePayload {
  /** The picked image file */
  file: PickedImageFile;
  /** Base64-encoded image string for API upload (iOS & Android compatible) */
  base64: string;
  /** Source of the image - 'camera' or 'gallery' */
  source: ImagePickerSource;
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
  /** When false, QR button is hidden. Default: true */
  showQrButton?: boolean;
  /** Callback when profile image is selected and ready for API upload */
  onProfileImageSelected?: (payload: IProfileImagePayload) => void;
  /** Callback when image picker encounters an error */
  onImagePickerError?: (error: string) => void;
  /** When true, shows loading state on camera button */
  isUploadingImage?: boolean;
  /** When false, hides camera button. Default: true */
  showCameraButton?: boolean;
  /** When false, hides KYC badge under avatar. Default: true */
  showKycBadge?: boolean;
}

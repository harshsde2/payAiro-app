export type KycMode = "approved" | "pending" | "expired" | "unknown" | "not_started";

export interface IKycStatusPayload {
  status?: boolean;
  kyc_status?: string;
  state?: string;
  toast_message?: string;
  message?: string;
  [key: string]: any;
}

export const toKycMode = (raw?: IKycStatusPayload | null): KycMode => {
  if (!raw) return "unknown";
  const str = (raw.kyc_status || raw.state || "").toLowerCase();
  if (str === "not_started") return "not_started";
  if (str === "pending") return "pending";
  if (str === "expired") return "expired";
  if (str === "approved") return "approved";

  if (raw.status === true) return "approved";
  if (raw.status === false) return "pending";

  return "unknown";
};

export const kycToast = (raw?: IKycStatusPayload | null) =>
  raw?.toast_message || raw?.message || "KYC status updated";



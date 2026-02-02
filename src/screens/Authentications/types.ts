// Re-export types from common validation utils
export type { InputType, IValidationResult } from "utils/validation";

// Signup payload interface
export interface ISignupPayload {
  email?: string;
  phone?: string;
  location: string;
  ref_code?: string;
  hash?: string;
}

// Login payload interface
export interface ILoginPayload {
  email?: string;
  phone?: string;
  location: string;
  hash?: string;
}

// OTP Route params interface
export interface IOTPRouteParams {
  email?: string;
  phone?: string;
  inputType?: "email" | "phone" | "invalid";
}

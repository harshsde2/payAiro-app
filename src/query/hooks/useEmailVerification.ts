import { useMutation } from '@tanstack/react-query';
import { USER_AUTH } from 'api/endpoints';
import { userApiClient } from 'api/userApiClient';

// Mirrors the phone-OTP hooks in useCashRamp.ts, against the email-otp endpoints.

type FastApiOkBody = {
  ok?: boolean;
  message?: string;
  data?: unknown;
};

export type EmailOtpVerifyPayload = {
  otp: string;
};

/** Treat the verify response as success unless it explicitly says otherwise. */
export function isEmailOtpVerifySuccess(data: unknown): boolean {
  if (!data || typeof data !== 'object') return true;
  const body = data as Record<string, unknown>;
  if (body.ok === false || body.success === false || body.verified === false) return false;
  const nested = body.data;
  if (nested && typeof nested === 'object') {
    const inner = nested as Record<string, unknown>;
    if (inner.ok === false || inner.success === false || inner.email_verified === false) {
      return false;
    }
  }
  return true;
}

/** POST /api/v1/users/me/email-otp/request/ — sends a code to the user's registered email. */
export const useUserMeEmailOtpRequest = () => {
  return useMutation<FastApiOkBody, Error, void>({
    mutationFn: async () => {
      return userApiClient.post<FastApiOkBody>(USER_AUTH.EMAIL_OTP_REQUEST, {});
    },
  });
};

/** POST /api/v1/users/me/email-otp/verify/ — verifies the email OTP for the authenticated user. */
export const useUserMeEmailOtpVerify = () => {
  return useMutation<FastApiOkBody, Error, EmailOtpVerifyPayload>({
    mutationFn: async (payload) => {
      return userApiClient.post<FastApiOkBody>(USER_AUTH.EMAIL_OTP_VERIFY, {
        otp: payload.otp,
      });
    },
  });
};

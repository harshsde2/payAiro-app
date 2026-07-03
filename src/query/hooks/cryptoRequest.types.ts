/**
 * Crypto Request (P2P) types + error mapping.
 *
 * Mirrors the "Crypto Request (P2P) — Frontend Integration Guide" backend
 * contract (FastAPI, base URL `USER_API_BASE_URL`). A Payairo user can request
 * crypto from another user; the payer fulfills it with a single API call using
 * just the Request ID.
 */
import { isAxiosError } from "axios";

export type CryptoRequestStatus =
  | "PENDING"
  | "FULFILLED"
  | "DECLINED"
  | "CANCELLED"
  | "EXPIRED";

/** "sent" = I created this request; "received" = someone asked me. */
export type CryptoRequestDirection = "sent" | "received";

/** Scope filter for the request history endpoint. */
export type CryptoRequestScope = "all" | "sent" | "received";

/** The user party on a request (requester or payer). */
export interface ICryptoRequestParty {
  userId: number;
  username: string;
  firstName: string | null;
  lastName: string | null;
}

/** A single crypto request object as returned by every request endpoint. */
export interface ICryptoRequest {
  /** Present on unified-feed rows. */
  activity?: "REQUEST" | string;
  /** Present on unified-feed rows. */
  source?: string;
  id: number;
  status: CryptoRequestStatus;
  direction: CryptoRequestDirection;
  /** Decimal string (10 decimal places). */
  amount: string;
  /** e.g. "BTC", "ETH". */
  currency: string;
  /** e.g. "BITCOIN", "ETHEREUM". */
  chain: string;
  /** Optional message from the requester. */
  note: string | null;
  /** The person who created the request (will receive crypto). */
  requestedBy: ICryptoRequestParty;
  /** The person being asked to pay. */
  requestedFrom: ICryptoRequestParty;
  /** Links to the CryptoSendTransaction that paid it. */
  fulfilledByTransactionId: number | null;
  /** ISO-8601; null = never expires. */
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** POST /request/ body. */
export interface ICreateCryptoRequestPayload {
  /** Recipient identifier: email / phone / PayairoTag / username. */
  recipient: string;
  /** Decimal string. */
  amount: string;
  currency: string;
  chain: string;
  note?: string;
  /** ISO-8601; omit for never-expires. */
  expiresAt?: string;
}

/** Standard FastAPI envelope used by the request endpoints. */
export interface ICryptoRequestEnvelope {
  message?: string;
  data?: {
    request?: ICryptoRequest;
  };
  errorResponse?: unknown;
}

/** POST /request/{id}/pay/ success body. */
export interface IPayCryptoRequestEnvelope {
  message?: string;
  data?: {
    request?: ICryptoRequest;
    transaction?: {
      id?: number;
      status?: string;
      providerTransactionId?: string;
      providerStatus?: string;
    };
    coinmeResponse?: unknown;
  };
  errorResponse?: unknown;
}

/** GET /request/history/ body. */
export interface ICryptoRequestHistoryEnvelope {
  data?: {
    filters?: {
      scope?: string;
      status?: string | null;
      limit?: number;
    };
    total?: number;
    items?: ICryptoRequest[];
  };
  errorResponse?: unknown;
}

/** Parsed, user-facing error. */
export interface ICryptoRequestError {
  errorCode: string | null;
  /** A friendly message safe to show in a toast. */
  message: string;
  /** Optional UI hint for callers (e.g. redirect to onboarding). */
  action?: "onboarding" | "refresh" | "none";
}

/**
 * Map every documented PAYAIRO-* error code (create / pay / cancel) to a
 * friendly message. Falls back to the server message, then a generic string.
 */
const ERROR_CODE_MAP: Record<
  string,
  { message: string; action?: ICryptoRequestError["action"] }
> = {
  // Create
  "PAYAIRO-400-030": { message: "Please enter a recipient." },
  "PAYAIRO-400-031": { message: "You cannot request from yourself." },
  "PAYAIRO-400-032": { message: "Please enter a valid amount." },
  "PAYAIRO-400-033": { message: "Please select a currency." },
  "PAYAIRO-400-034": { message: "Please select a chain." },
  "PAYAIRO-400-035": { message: "Invalid expiry date." },
  "PAYAIRO-400-036": { message: "Expiry must be a future date." },
  "PAYAIRO-404-003": {
    message: "User not found. Check the email, phone, or PayairoTag.",
  },
  // Pay
  "PAYAIRO-403-001": { message: "This request is not meant for you." },
  "PAYAIRO-400-050": {
    message: "This request has already been paid or cancelled.",
    action: "refresh",
  },
  "PAYAIRO-400-051": { message: "This request has expired.", action: "refresh" },
  "PAYAIRO-400-052": {
    message: "Your account is not fully set up. Complete onboarding to continue.",
    action: "onboarding",
  },
  "PAYAIRO-400-053": {
    message: "The requester's account is not fully set up.",
  },
  "PAYAIRO-400-055": { message: "Wallet not available for this currency." },
  "PAYAIRO-502-010": { message: "Server error. Please try again." },
  "PAYAIRO-502-011": { message: "Payment failed. Please try again." },
  // Cancel
  "PAYAIRO-403-002": { message: "You cannot cancel this request." },
  "PAYAIRO-400-060": {
    message: "This request is no longer pending.",
    action: "refresh",
  },
};

/**
 * Extract a friendly error from whatever `userApiClient` / our hooks throw.
 *
 * Handles all shapes:
 *  - Axios error:            `error.response.data.errorResponse.errorData[0]`
 *  - Thrown 200-envelope:    `error.errorResponse.errorData[0]` (see
 *    `throwIfApiError` in useCryptoRequest.ts) or `error.data.errorResponse…`
 *  - Plain envelope object:  `error.errorResponse…`
 *
 * The real backend returns codes like `281-400-352-507` (not the guide's
 * `PAYAIRO-*`), so we **prefer the server `message`** and only fall back to the
 * `PAYAIRO-*` map when a known code is present and no message is given.
 */
export function getCryptoRequestError(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): ICryptoRequestError {
  const e = error as any;
  // Locate the errorResponse object across the possible shapes.
  const errorResponse =
    (isAxiosError(error) ? e?.response?.data?.errorResponse : undefined) ??
    e?.errorResponse ??
    e?.response?.data?.errorResponse ??
    e?.data?.errorResponse;

  const errData = errorResponse?.errorData?.[0];
  const errorCode: string | null = errData?.errorCode ?? null;
  const serverMessage: string | undefined =
    errData?.message ||
    (isAxiosError(error) ? e?.response?.data?.message : undefined) ||
    (typeof e?.message === "string" && e?.message ? e.message : undefined);

  // Prefer the server message; use the mapped copy only as a fallback.
  if (serverMessage) {
    const action = errorCode ? ERROR_CODE_MAP[errorCode]?.action ?? "none" : "none";
    return { errorCode, message: serverMessage, action };
  }

  if (errorCode && ERROR_CODE_MAP[errorCode]) {
    const mapped = ERROR_CODE_MAP[errorCode];
    return { errorCode, message: mapped.message, action: mapped.action ?? "none" };
  }

  return { errorCode, message: fallback, action: "none" };
}

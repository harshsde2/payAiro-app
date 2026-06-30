// Types for the FastAPI Rewards & Referrals API (user-facing only).
// Source of truth: "PayAiro · Rewards & Referrals API" Postman collection.
// Envelope everywhere: { ok, message, data }. Errors: { ok:false, error_code, message }.
// Some field names are best-effort and should be confirmed against a live response.

export type ScratchCardStatus = 'issued' | 'scratched' | 'expired';

/** GET /rewards/referral/me/ → data */
export interface ReferralMe {
  code?: string;
  share_url?: string;
  referred_count?: number;
  referral_bonus_points?: number;
}

export interface ReferralMeResponse {
  ok?: boolean;
  message?: string;
  data?: ReferralMe;
}

/** POST /rewards/referral/validate/ → data */
export interface ReferralValidate {
  valid?: boolean;
  code?: string;
  partner_code?: string;
  partner_name?: string;
}

export interface ReferralValidateResponse {
  ok?: boolean;
  message?: string;
  error_code?: string;
  data?: ReferralValidate;
}

/** A single scratch card row. */
export interface ScratchCardItem {
  id: number;
  status?: ScratchCardStatus | string;
  reward_points?: number;
  reward_usd?: string | number;
  title?: string;
  description?: string;
  created_at?: string;
  scratched_at?: string | null;
  expires_at?: string | null;
}

export interface ScratchCardsResponse {
  ok?: boolean;
  message?: string;
  data?: {
    items?: ScratchCardItem[];
    total?: number;
  };
}

/** POST /rewards/scratch-cards/{id}/scratch/ → data */
export interface ScratchResult {
  id?: number;
  status?: ScratchCardStatus | string;
  reward_points?: number;
  reward_usd?: string | number;
}

export interface ScratchResponse {
  ok?: boolean;
  message?: string;
  error_code?: string;
  data?: ScratchResult;
}

/** GET /rewards/points/ (alias /balance/) → data */
export interface PointsWallet {
  points_balance?: number;
  pending_points?: number;
  claimed_points?: number;
  value_usd?: string | number;
  point_value_usd?: string | number;
  referral_points?: number;
  transaction_points?: number;
}

export interface PointsWalletResponse {
  ok?: boolean;
  message?: string;
  data?: PointsWallet;
}

/** POST /rewards/points/claim/ → data */
export interface ClaimResult {
  claimed_points?: number;
  claimed_usd?: string | number;
  points_balance?: number;
}

export interface ClaimResponse {
  ok?: boolean;
  message?: string;
  error_code?: string;
  data?: ClaimResult;
}

/** Best-effort numeric parse for the string/number money fields above. */
export const toNumber = (v: string | number | undefined | null): number => {
  if (v == null) return 0;
  const n = typeof v === 'number' ? v : parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

/** Pick the first present value among several candidate keys. */
const pick = (obj: any, keys: string[]): any => {
  for (const k of keys) {
    if (obj && obj[k] != null) return obj[k];
  }
  return undefined;
};

/** Normalized points wallet so the UI doesn't depend on exact backend field names. */
export interface NormalizedWallet {
  pointsBalance: number;
  valueUsd: number;
  pointValueUsd: number;
  pendingPoints: number;
  claimedPoints: number;
  referralPoints: number;
  transactionPoints: number;
}

/**
 * Map the (loosely-typed) /rewards/points/ payload into a stable shape.
 * Tries the common field-name variants and derives USD from points * point_value
 * when no explicit USD value is returned.
 */
export const normalizePointsWallet = (
  data?: PointsWallet | Record<string, any>
): NormalizedWallet => {
  const d = (data ?? {}) as Record<string, any>;

  const pointValueUsd = toNumber(
    pick(d, ['point_value_usd', 'pointValueUsd', 'point_value'])
  );
  const pointsBalance = toNumber(
    pick(d, [
      'points_balance',
      'point_balance',
      'balance',
      'points',
      'available_points',
      'total_points',
    ])
  );
  let valueUsd = toNumber(
    pick(d, ['value_usd', 'usd_value', 'balance_usd', 'amount_usd', 'usd', 'value'])
  );
  if (!valueUsd && pointsBalance && pointValueUsd) {
    valueUsd = pointsBalance * pointValueUsd;
  }

  return {
    pointsBalance,
    valueUsd,
    pointValueUsd,
    pendingPoints: toNumber(pick(d, ['pending_points', 'pendingPoints'])),
    claimedPoints: toNumber(pick(d, ['claimed_points', 'claimedPoints'])),
    referralPoints: toNumber(pick(d, ['referral_points', 'referralPoints'])),
    transactionPoints: toNumber(
      pick(d, ['transaction_points', 'transactionPoints', 'txn_points'])
    ),
  };
};

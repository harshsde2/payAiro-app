/**
 * Single source of truth for "has this transaction already been submitted?".
 *
 * This is deliberately a MODULE-LEVEL singleton rather than React state: a screen can
 * unmount and remount mid-flight (navigation, the app-lock modal, a re-render storm
 * after Face ID) and component state would reset with it, re-opening the exact window
 * we are trying to close. Module state outlives all of that and only dies with the JS
 * context.
 *
 * The protection is entirely client-side and assumes the backend does NOT dedupe. The
 * rule it enforces is therefore absolute: for one transaction intent, the app sends at
 * most one POST — no auto-retry, no interceptor replay, no double tap. An
 * `Idempotency-Key` still rides along on every request so that the day the backend
 * starts deduping we get a second, server-side guarantee for free.
 */

import { buildIntentSignature, newIdempotencyKey } from "utils/idempotency";

/** How long a settled intent keeps blocking an identical re-submit. */
export const DUPLICATE_WINDOW_MS = 90 * 1000;

export type SettleOutcome =
  /** Backend confirmed it. Re-submitting would double-charge. */
  | "succeeded"
  /**
   * No HTTP response at all (timeout, connection abort, app backgrounded mid-flight).
   * The transaction may or may not exist. This is the dangerous state: the user must
   * check their activity rather than blindly retry.
   */
  | "unknown"
  /**
   * The backend answered and rejected it (validation, insufficient funds, limits).
   * Nothing was booked, so the user is free to fix the input and try again.
   */
  | "rejected";

export type BeginResult =
  | { ok: true; idempotencyKey: string }
  | { ok: false; reason: "in-flight" | "succeeded" | "unknown"; idempotencyKey: string };

type Outcome = { state: "succeeded" | "unknown"; at: number };

const inFlight = new Set<string>();
const keys = new Map<string, string>();
const outcomes = new Map<string, Outcome>();

const isExpired = (outcome: Outcome, now: number): boolean =>
  now - outcome.at >= DUPLICATE_WINDOW_MS;

/** Drop entries that have aged out so the maps can't grow without bound. */
const prune = (now: number): void => {
  outcomes.forEach((outcome, signature) => {
    if (!isExpired(outcome, now)) return;
    outcomes.delete(signature);
    // The key is only worth keeping while the intent can still be retried.
    if (!inFlight.has(signature)) keys.delete(signature);
  });
};

/**
 * Reuse the key for this intent, minting one on first sight.
 *
 * Reusing it across attempts is the point: a retry of the SAME intent must carry the
 * SAME key so a deduping backend collapses them. A different intent (different amount,
 * different recipient) produces a different signature and therefore a different key.
 */
const keyFor = (signature: string): string => {
  const existing = keys.get(signature);
  if (existing) return existing;
  const minted = newIdempotencyKey();
  keys.set(signature, minted);
  return minted;
};

/**
 * Claim the right to submit this intent.
 *
 * Returns `ok: false` when a submit must NOT go out — either one is already running,
 * or an identical one recently succeeded / ended in an unknown state. Callers should
 * surface that to the user (a duplicate-payment confirmation, or an "unknown outcome"
 * screen) rather than silently dropping it.
 */
export const begin = (signature: string): BeginResult => {
  const now = Date.now();
  prune(now);

  const idempotencyKey = keyFor(signature);

  if (inFlight.has(signature)) {
    return { ok: false, reason: "in-flight", idempotencyKey };
  }

  const outcome = outcomes.get(signature);
  if (outcome && !isExpired(outcome, now)) {
    return { ok: false, reason: outcome.state, idempotencyKey };
  }

  inFlight.add(signature);
  return { ok: true, idempotencyKey };
};

/** Release the in-flight claim and record what happened. */
export const settle = (signature: string, outcome: SettleOutcome): void => {
  inFlight.delete(signature);

  if (outcome === "rejected") {
    // The backend said no and booked nothing — let the user correct and retry freely.
    // The key survives so a retry of the identical intent still dedupes server-side.
    outcomes.delete(signature);
    return;
  }

  outcomes.set(signature, { state: outcome, at: Date.now() });
};

/**
 * The user explicitly confirmed they want to repeat an identical transaction (paying
 * the same person the same amount twice really is legitimate). Clear the block and
 * mint a fresh key so the backend treats it as the distinct transaction it is.
 */
export const forceNewAttempt = (signature: string): void => {
  outcomes.delete(signature);
  keys.set(signature, newIdempotencyKey());
};

/** Whether a submit for this intent is currently running. */
export const isInFlight = (signature: string): boolean => inFlight.has(signature);

/**
 * True when a request never got an answer — timeout, DNS failure, connection abort,
 * app suspended mid-flight. The transaction may or may not exist on the backend.
 *
 * This is the single most dangerous state in the whole flow: it looks like a failure,
 * but offering the user a plain "Retry" here is exactly how one payment becomes two.
 * Callers must send the user to check their activity instead.
 */
export const isOutcomeUnknown = (error: unknown): boolean => {
  const e = error as { response?: unknown; code?: string; message?: string } | undefined;
  if (!e) return false;
  // Any HTTP status means the backend answered, so the outcome is known.
  if (e.response) return false;
  if (e.code === "ECONNABORTED" || e.code === "ETIMEDOUT" || e.code === "ERR_NETWORK") {
    return true;
  }
  return /timeout|network/i.test(e.message || "");
};

/** Copy for the unconfirmed-outcome state, so every flow says the same thing. */
export const UNKNOWN_OUTCOME_MESSAGE =
  "We couldn't confirm whether this transaction went through. Please check your Activity before trying again.";

/** Test-only: wipe all state between cases. */
export const __resetTransactionGuard = (): void => {
  inFlight.clear();
  keys.clear();
  outcomes.clear();
};

export { buildIntentSignature };

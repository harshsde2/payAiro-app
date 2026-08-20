/**
 * The single entry point every money submit must go through.
 *
 * Wraps `transactionGuard` so screens get an `isSubmitting` flag for their buttons
 * while the actual duplicate protection lives in module state that survives remounts.
 *
 *   const { submit, isSubmitting } = useTransactionSubmit();
 *
 *   await submit(
 *     buildIntentSignature(['trade', tradeMode, chain, asset, amount, paymentMethodId]),
 *     async (idempotencyKey) => tradeExecute.mutateAsync({ ...payload, idempotencyKey }),
 *     {
 *       onDuplicate: (retry) => confirmRepeat(retry),
 *       onUnknownOutcome: () => showActivityCheckScreen(),
 *     },
 *   );
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  begin,
  forceNewAttempt,
  isOutcomeUnknown,
  settle,
  type SettleOutcome,
} from "services/transactionGuard";

export type SubmitCallbacks = {
  /**
   * An identical transaction succeeded moments ago, or one is already running.
   * `retry` re-runs the submit with a fresh idempotency key — call it only after the
   * user explicitly confirms they meant to pay twice.
   */
  onDuplicate?: (retry: () => Promise<void>, reason: "in-flight" | "succeeded") => void;
  /** A previous attempt at this intent ended with an unconfirmed outcome. */
  onUnknownOutcome?: () => void;
};

export const useTransactionSubmit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const run = useCallback(
    async (
      signature: string,
      task: (idempotencyKey: string) => Promise<unknown>,
      callbacks: SubmitCallbacks,
    ): Promise<{ claimed: boolean; reason?: "in-flight" | "succeeded" | "unknown" }> => {
      const claim = begin(signature);
      if (!claim.ok) return { claimed: false, reason: claim.reason };

      if (mountedRef.current) setIsSubmitting(true);
      let outcome: SettleOutcome = "rejected";
      try {
        await task(claim.idempotencyKey);
        outcome = "succeeded";
      } catch (error) {
        // The task owns presenting the failure (it already navigated to the result
        // screen). All we do here is classify it for the guard, and escalate the one
        // case the task cannot judge on its own: we never learned whether the
        // transaction happened.
        outcome = isOutcomeUnknown(error) ? "unknown" : "rejected";
        if (outcome === "unknown") callbacks.onUnknownOutcome?.();
      } finally {
        // Deliberately outside any `mountedRef` check: settle() must run even if the
        // screen unmounted mid-flight, or the intent stays locked for the whole session.
        settle(signature, outcome);
        if (mountedRef.current) setIsSubmitting(false);
      }

      return { claimed: true };
    },
    [],
  );

  const submit = useCallback(
    async (
      signature: string,
      task: (idempotencyKey: string) => Promise<unknown>,
      callbacks: SubmitCallbacks = {},
    ) => {
      const result = await run(signature, task, callbacks);
      if (result.claimed) return;

      if (result.reason === "unknown") {
        callbacks.onUnknownOutcome?.();
        return;
      }

      callbacks.onDuplicate?.(async () => {
        forceNewAttempt(signature);
        await run(signature, task, callbacks);
      }, result.reason as "in-flight" | "succeeded");
    },
    [run],
  );

  return { submit, isSubmitting };
};

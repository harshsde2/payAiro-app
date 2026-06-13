let pendingPinContinuation: (() => void) | null = null;
let accepted = false;

export function registerPreTxPinContinuation(fn: () => void) {
  pendingPinContinuation = fn;
}

export function markPreTxDisclosureAccepted() {
  accepted = true;
}

export function clearPreTxDisclosureFlow() {
  pendingPinContinuation = null;
  accepted = false;
}

export function consumePreTxDisclosureAccepted(): (() => void) | null {
  if (!accepted) return null;
  accepted = false;
  const fn = pendingPinContinuation;
  pendingPinContinuation = null;
  return fn;
}
